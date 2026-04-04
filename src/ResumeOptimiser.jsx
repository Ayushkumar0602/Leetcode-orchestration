import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload as S3Upload } from "@aws-sdk/lib-storage";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Menu, X, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import NavProfile from './NavProfile';
import NotificationBell from './components/NotificationBell';
import { Client } from "@gradio/client";
import { pdfjs } from 'react-pdf';
import './index.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const s3Client = new S3Client({
  forcePathStyle: true,
  region: "us-east-1",
  endpoint: "https://vnnkhcqswoeqnghztpvh.storage.supabase.co/storage/v1/s3",
  credentials: { 
    accessKeyId: "b6aae57565cde6c3aa4574fca0f871f2", 
    secretAccessKey: "6136a2c5906ac98f8e89eb175c837423b0f5cddd0ea95a6eea757c921e44a836" 
  },
});

const ResumeOptimiser = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Existing resume state
  const [existingResume, setExistingResume] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(true);

  // Job Description state
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  // Auto-Optimise state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState('');

  const fileInputRef = useRef(null);

  // Utility to extract text from PDF ArrayBuffer
  const extractTextFromPDF = async (arrayBuffer) => {
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let maxPages = pdf.numPages;
    let countPromises = [];
    for (let j = 1; j <= maxPages; j++) {
      var page = pdf.getPage(j);
      countPromises.push(page.then(function(page) {
        return page.getTextContent().then(function(text) {
          return text.items.map(function (s) { return s.str; });
        });
      }));
    }
    const textsArray = await Promise.all(countPromises);
    return textsArray.flat().join(' ');
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim() || isAnalyzing || !existingResume) return;
    setIsAnalyzing(true);
    setAnalysisResult('');
    setStatus({ type: '', message: '' });
    
    try {
      // 1. Fetch file from S3
      const getCommand = new GetObjectCommand({
        Bucket: 'resume',
        Key: existingResume.Key
      });
      const s3Response = await s3Client.send(getCommand);
      const arrayBuffer = await s3Response.Body.transformToByteArray();
      
      // 2. Extract Text from PDF
      const resumeText = await extractTextFromPDF(arrayBuffer);
      
      if (!resumeText || resumeText.length < 50) {
         throw new Error("Could not extract sufficient text from the PDF. Ensure it's a valid text-based PDF.");
      }

      // 3. Send to Gradio Model
      const client = await Client.connect("girishwangikar/ResumeATS");
      const result = await client.predict("/analyze_resume", {
        resume_text: resumeText,
        job_description: jobDescription,
        with_job_description: true,
        temperature: 0.2, // Strict ATS matching
        max_tokens: 1024,
      });
      
      setAnalysisResult(result.data[0]);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Analysis failed. Please try again later.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAutoOptimize = async () => {
    if (!jobDescription.trim() || isOptimizing || !existingResume) return;
    setIsOptimizing(true);
    setOptimizedResult('');
    setStatus({ type: '', message: '' });

    try {
      const getCommand = new GetObjectCommand({
        Bucket: 'resume',
        Key: existingResume.Key
      });
      const s3Response = await s3Client.send(getCommand);
      const arrayBuffer = await s3Response.Body.transformToByteArray();
      
      const resumeText = await extractTextFromPDF(arrayBuffer);
      
      if (!resumeText || resumeText.length < 50) {
         throw new Error("Could not extract sufficient text from the PDF.");
      }

      // Send to local backend Gemini endpoint
      const res = await fetch("http://localhost:5000/api/optimize-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText, jobDescription })
      });
      
      if (!res.ok) throw new Error("Failed to optimize resume on backend");
      
      const data = await res.json();
      setOptimizedResult(data.optimizedContent);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Optimization failed. Please try again later.' });
    } finally {
      setIsOptimizing(false);
    }
  };

  // Fetch existing resume on mount
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchExistingResume = async () => {
      setLoadingExisting(true);
      try {
        const command = new ListObjectsV2Command({
          Bucket: 'resume',
          Prefix: `${currentUser.uid}/`
        });
        const response = await s3Client.send(command);
        if (response.Contents && response.Contents.length > 0) {
          // Sort to get the latest if multiple exist, though we normally overwrite or delete
          const sorted = response.Contents.sort((a,b) => new Date(b.LastModified) - new Date(a.LastModified));
          setExistingResume(sorted[0]);
        } else {
          setExistingResume(null);
        }
      } catch (err) {
        console.error("Failed to fetch existing resume:", err);
      } finally {
        setLoadingExisting(false);
      }
    };
    fetchExistingResume();
  }, [currentUser]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (selectedFile) => {
    if (selectedFile?.type !== 'application/pdf') {
      setStatus({ type: 'error', message: 'Please upload a PDF file.' });
      return false;
    }
    if (selectedFile?.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'File size must be strictly under 5MB.' });
      return false;
    }
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
      setStatus({ type: '', message: '' });
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      setStatus({ type: '', message: '' });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus({ type: 'error', message: 'Please select a file first.' });
      return;
    }

    if (!currentUser) {
      setStatus({ type: 'error', message: 'You must be logged in to upload a resume.' });
      return;
    }

    setUploading(true);
    setStatus({ type: '', message: '' });

    try {
      const filePath = `${currentUser.uid}/${file.name}`;
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const upload = new S3Upload({
        client: s3Client,
        params: {
          Bucket: 'resume', 
          Key: filePath,
          Body: uint8Array,
          ContentType: file.type || 'application/pdf',
        },
      });

      await upload.done();
      setStatus({ type: 'success', message: 'Resume uploaded securely!' });
      
      // Refresh the existing resume view
      setExistingResume({
        Key: filePath,
        Size: file.size,
        LastModified: new Date()
      });
      setFile(null); // clear the staging file
    } catch (error) {
      console.error('Upload Error:', error);
      setStatus({ type: 'error', message: error.message || 'An error occurred during upload.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#050505', 
      backgroundImage: 'radial-gradient(circle at top right, rgba(99,102,241,0.08), transparent 40%), radial-gradient(circle at bottom left, rgba(236,72,153,0.05), transparent 40%)',
      color: '#fff', fontFamily: "'Inter', sans-serif"
    }}>
      {/* ── Top Navigation ── */}
      <nav style={{
          height: '64px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem',
          background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)',
          position: 'sticky', top: 0, zIndex: 100
      }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flex: '1 1 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                  <img src="/logo.jpeg" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                  <span className="nav-logo-text" style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.5px', color: '#fff' }}>Whizan AI</span>
              </div>
          </div>

          <div className="nav-links hidden md:flex" style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1 1 0', justifyContent: 'center' }}>
              <button onClick={() => navigate('/dsaquestion')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--txt2)'}>
                  DSA Practice
              </button>
              <button onClick={() => navigate('/aiinterviewselect')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--txt2)'}>
                  AI Interview
              </button>
              <button onClick={() => navigate('/systemdesign')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--txt2)'}>
                  System Design
              </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 0', justifyContent: 'flex-end' }}>
              <NotificationBell />
              <div className="hidden md:block">
                  <NavProfile />
              </div>
              <button
                  className="md:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  style={{
                      background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', zIndex: 110
                  }}
              >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
          </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      {isMenuOpen && (
          <div style={{
              position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0,
              background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(20px)', zIndex: 99,
              padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease-out'
          }}>
              <button style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: 600, textAlign: 'left', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => { navigate('/dsaquestion'); setIsMenuOpen(false); }}>DSA Practice</button>
              <button style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: 600, textAlign: 'left', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => { navigate('/aiinterviewselect'); setIsMenuOpen(false); }}>AI Interview</button>
              <button style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: 600, textAlign: 'left', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => { navigate('/systemdesign'); setIsMenuOpen(false); }}>System Design</button>
              {currentUser && (
                  <>
                      <button style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: 600, textAlign: 'left', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => { navigate(`/public/${currentUser.uid}`); setIsMenuOpen(false); }}>Public Portfolio</button>
                      <button style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: 600, textAlign: 'left', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}>My Profile</button>
                  </>
              )}
          </div>
      )}

      {/* ── Main Content ── */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Title Section */}
        <div style={{ marginBottom: '3rem', textAlign: 'center', animation: 'fadeIn 0.6s ease-out' }}>
            <div style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '100px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
                ATS Integration
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-1px', background: 'linear-gradient(to right, #fff, #9ca3af)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                Resume Vault
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.5)', margin: '0 auto', maxWidth: '600px', lineHeight: 1.6 }}>
                Securely store your master resume. Our AI models will utilize it to parse your experience and optimize your mock interviews.
            </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: existingResume && !file ? '1fr 1fr' : '1fr', gap: '2rem', width: '100%', maxWidth: existingResume && !file ? '1200px' : '700px', transition: 'all 0.5s ease-in-out' }}>
          
          {/* Left Column / Main Card: Resume Viewer / Upload Card */}
          <div style={{ 
              width: '100%', 
              background: 'rgba(20, 22, 30, 0.4)', backdropFilter: 'blur(12px)', 
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', 
              padding: '3rem', display: 'flex', flexDirection: 'column' 
          }}>
            
            {loadingExisting ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <Loader2 className="animate-spin" size={40} color="#818cf8" style={{ marginBottom: '16px' }} />
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Accessing Vault...</p>
              </div>
            ) : existingResume && !file ? (
              // VIEW EXISTING RESUME STATE
              <div className="flex flex-col items-center">
                <div style={{ width: '100%', background: 'rgba(52, 211, 153, 0.05)', border: '1px solid rgba(52, 211, 153, 0.2)', padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <CheckCircle size={48} color="#34d399" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px', color: '#fff', textAlign: 'center' }}>Master Resume Secured</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', marginBottom: '4px', textAlign: 'center' }}>
                    <FileText size={16} /> <span style={{ wordBreak: 'break-all' }}>{existingResume.Key.split('/').pop()}</span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '24px' }}>
                    Uploaded on {new Date(existingResume.LastModified).toLocaleDateString()} • {(existingResume.Size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                      padding: '10px 20px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    Replace Resume
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    style={{ display: 'none' }}
                  />
                </div>
                
                {status.message && (
                  <div style={{ 
                      marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', width: '100%',
                      background: status.type === 'error' ? 'rgba(248,113,113,0.1)' : 'rgba(16,185,129,0.1)',
                      color: status.type === 'error' ? '#f87171' : '#34d399',
                      border: `1px solid ${status.type === 'error' ? 'rgba(248,113,113,0.2)' : 'rgba(16,185,129,0.2)'}`
                  }}>
                    {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <p style={{ margin: 0 }}>{status.message}</p>
                  </div>
                )}
              </div>
            ) : (
              // UPLOAD STATE
              <>
                {existingResume && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>Uploading replacement for <strong>{existingResume.Key.split('/').pop()}</strong></span>
                    <button onClick={() => { setFile(null); setStatus({ type:'', message:'' }); }} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                  </div>
                )}
                
                <div 
                  className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer ${
                    isDragging ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02] shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 
                    file ? 'border-emerald-400 bg-emerald-500/5' : 'border-gray-600 hover:border-indigo-400 hover:bg-white/5'
                  }`}
                  style={{ minHeight: '300px' }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    style={{ display: 'none' }}
                  />
                  {file ? (
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                       <FileText size={64} color="#34d399" style={{ marginBottom: '16px' }} />
                       <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', margin: '0 0 4px', wordBreak: 'break-all' }}>{file.name}</p>
                       <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to {existingResume ? 'Replace' : 'Upload'}</p>
                     </div>
                  ) : (
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                       <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                          <UploadCloud size={40} color="#818cf8" />
                       </div>
                       <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Drag & Drop your Resume</p>
                       <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>or click to browse local files (PDF only, max 5MB)</p>
                     </div>
                  )}
                </div>

                {status.message && (
                  <div style={{ 
                      marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem',
                      background: status.type === 'error' ? 'rgba(248,113,113,0.1)' : 'rgba(16,185,129,0.1)',
                      color: status.type === 'error' ? '#f87171' : '#34d399',
                      border: `1px solid ${status.type === 'error' ? 'rgba(248,113,113,0.2)' : 'rgba(16,185,129,0.2)'}`
                  }}>
                    {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <p style={{ margin: 0 }}>{status.message}</p>
                  </div>
                )}

                <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    style={{
                      width: '100%',
                      padding: '16px 32px', borderRadius: '14px', fontSize: '1.05rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      transition: 'all 0.2s', border: 'none', cursor: (!file || uploading) ? 'not-allowed' : 'pointer',
                      background: (!file || uploading) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: (!file || uploading) ? 'rgba(255,255,255,0.3)' : '#fff',
                      boxShadow: (!file || uploading) ? 'none' : '0 10px 25px rgba(99,102,241,0.3)'
                    }}
                  >
                    {uploading ? 'Initializing Upload Sequence...' : (
                      <>{existingResume ? 'Replace Document' : 'Upload Document'} <ArrowRight size={20} /></>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Job Description Input (Only visible when a resume exists and we aren't uploading a replacement) */}
          {existingResume && !file && (
            <div style={{ 
              width: '100%', 
              background: 'rgba(20, 22, 30, 0.4)', backdropFilter: 'blur(12px)', 
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', 
              padding: '3rem', display: 'flex', flexDirection: 'column',
              animation: 'fadeIn 0.5s ease-out'
            }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 16px', color: '#fff' }}>Target Job Role</h3>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', marginBottom: '24px', lineHeight: 1.5 }}>
                Paste the specific job description or role requirements you are targeting. Our AI will analyze your master resume against these requirements to test ATS compatibility.
              </p>

              <textarea 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="e.g. Seeking a Senior Frontend Engineer with 5+ years of React experience, strong knowledge of AWS, and a passion for UI/UX..."
                style={{
                  width: '100%', minHeight: '200px',
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px', padding: '1.5rem', color: '#fff', fontSize: '1rem',
                  outline: 'none', resize: 'vertical', fontFamily: "'Inter', sans-serif",
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)', transition: 'border 0.2s'
                }}
                onFocus={(e) => e.target.style.border = '1px solid #818cf8'}
                onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
              />

              <div style={{ marginTop: '2.5rem', display: 'flex', gap: '16px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  disabled={!jobDescription.trim() || isAnalyzing || isOptimizing}
                  style={{
                    padding: '16px 24px', borderRadius: '14px', fontSize: '1rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.1)', cursor: (!jobDescription.trim() || isAnalyzing || isOptimizing) ? 'not-allowed' : 'pointer',
                    background: (!jobDescription.trim() || isAnalyzing || isOptimizing) ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                    color: (!jobDescription.trim() || isAnalyzing || isOptimizing) ? 'rgba(255,255,255,0.3)' : '#fff',
                  }}
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                  onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                  onClick={handleAnalyze}
                >
                  {isAnalyzing ? <><Loader2 className="animate-spin" size={18} /> Analyzing...</> : <>Score Match (ATS)</>}
                </button>

                <button
                  disabled={!jobDescription.trim() || isAnalyzing || isOptimizing}
                  style={{
                    padding: '16px 28px', borderRadius: '14px', fontSize: '1.05rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    transition: 'all 0.2s', border: 'none', cursor: (!jobDescription.trim() || isAnalyzing || isOptimizing) ? 'not-allowed' : 'pointer',
                    background: (!jobDescription.trim() || isAnalyzing || isOptimizing) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #10b981, #059669)',
                    color: (!jobDescription.trim() || isAnalyzing || isOptimizing) ? 'rgba(255,255,255,0.3)' : '#fff',
                    boxShadow: (!jobDescription.trim() || isAnalyzing || isOptimizing) ? 'none' : '0 10px 25px rgba(16,185,129,0.3)'
                  }}
                  onClick={handleAutoOptimize}
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Generating Map...
                    </>
                  ) : (
                    <>Auto-Optimise Resume <ArrowRight size={20} /></>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Full Width Analysis Result Board */}
        {analysisResult && (
          <div style={{ 
            marginTop: '3rem', width: '100%', maxWidth: '1200px', 
            background: 'rgba(20, 22, 30, 0.6)', backdropFilter: 'blur(16px)', 
            border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '24px', 
            padding: '3rem', animation: 'fadeInUp 0.6s ease-out'
          }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px' }}>
                   <CheckCircle size={28} color="#6366f1" />
                </div>
                <div>
                   <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>ATS Score & Analysis</h2>
                   <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>Review the feedback from our intelligent grading engine.</p>
                </div>
             </div>
             <div style={{
                color: '#e2e8f0', fontSize: '1.05rem', lineHeight: 1.8,
                whiteSpace: 'pre-wrap', fontFamily: "'Inter', sans-serif"
             }}>
                {analysisResult}
             </div>
          </div>
        )}

        {/* Full Width Optimization Feature Board */}
        {optimizedResult && (
          <div style={{ 
            marginTop: '3rem', width: '100%', maxWidth: '1200px', 
            background: 'rgba(20, 22, 30, 0.6)', backdropFilter: 'blur(16px)', 
            border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '24px', 
            padding: '3rem', animation: 'fadeInUp 0.6s ease-out',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.05)'
          }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px' }}>
                   <FileText size={28} color="#10b981" />
                </div>
                <div>
                   <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>100% Optimized Content Map</h2>
                   <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                      Copy the rewritten bullet points below and paste them exactly into your existing custom template to preserve its design perfectly.
                   </p>
                </div>
             </div>
             
             {/* Render the markdown block generated by Gemini */}
             <div 
                className="prose prose-invert max-w-none"
                style={{
                  color: '#fff', fontSize: '1.05rem', lineHeight: 1.8,
                  whiteSpace: 'pre-wrap', fontFamily: "'Inter', sans-serif"
                }}
             >
                {optimizedResult}
             </div>
             
             <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-start' }}>
               <button
                  onClick={() => {
                      navigator.clipboard.writeText(optimizedResult);
                      setStatus({ type: 'success', message: 'Optimized content map copied to clipboard!' });
                  }}
                  style={{
                    padding: '12px 24px', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                >
                  <FileText size={18} /> Copy All Content
               </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeOptimiser;

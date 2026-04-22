import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { S3Client, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload as S3Upload } from "@aws-sdk/lib-storage";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Menu, X, ArrowRight, Loader2, Trash2, Clock } from 'lucide-react';
import NavProfile from './NavProfile';
import NotificationBell from './components/NotificationBell';
import { pdfjs } from 'react-pdf';
import ClassicPrintTemplate from './components/ClassicPrintTemplate';
import SingleColumnTemplate from './components/SingleColumnTemplate';
import TwoColumnTemplate from './components/TwoColumnTemplate';
import HeaderFocusedTemplate from './components/HeaderFocusedTemplate';
import SkillsFirstTemplate from './components/SkillsFirstTemplate';
import ProjectCentricTemplate from './components/ProjectCentricTemplate';
import CompactDenseTemplate from './components/CompactDenseTemplate';
import SectionBoxedTemplate from './components/SectionBoxedTemplate';
import TimelineBasedTemplate from './components/TimelineBasedTemplate';
import { useReactToPrint } from 'react-to-print';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';
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

const ResumeOptimiser = ({ injectedJob, hideNav }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const componentRef = useRef(null);
  const autoTriggered = useRef(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Existing resume state
  const [existingResume, setExistingResume] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(true);

  // Job Description state
  const [jobDescription, setJobDescription] = useState(injectedJob || location.state?.targetJob || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  // Auto-Optimise state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedData, setOptimizedData] = useState(null);
  const [optimizationAttempts, setOptimizationAttempts] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('ClassicPrintTemplate');
  const [resumeHistory, setResumeHistory] = useState([]);
  const [isRescanning, setIsRescanning] = useState(false);
  const [rescanScore, setRescanScore] = useState(null);

  // Job Search State
  const [jobQuery, setJobQuery] = useState('');
  const [jobResults, setJobResults] = useState([]);
  const [isSearchingJobs, setIsSearchingJobs] = useState(false);
  const [searchError, setSearchError] = useState('');



  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Optimised_Resume',
  });

  // Utility to extract text from PDF ArrayBuffer
  const extractTextFromPDF = async (arrayBuffer) => {
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let maxPages = pdf.numPages;
    let countPromises = [];
    for (let j = 1; j <= maxPages; j++) {
      var page = pdf.getPage(j);
      countPromises.push(page.then(function (page) {
        return page.getTextContent().then(function (text) {
          return text.items.map(function (s) { return s.str; });
        });
      }));
    }
    const textsArray = await Promise.all(countPromises);
    return textsArray.flat().join(' ');
  };

  const getApiBase = () =>
  (import.meta.env.DEV
    ? 'https://leetcode-orchestration.onrender.com'
    : (import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com'));

  const deriveJobRole = (jd) => {
    const text = String(jd || '').trim();
    if (!text) return '';
    const firstLine = text.split('\n').map(l => l.trim()).find(Boolean) || '';
    if (firstLine.length <= 120) return firstLine;
    return firstLine.slice(0, 120);
  };

  // Auto Analyze Hook
  useEffect(() => {
    // If injectedJob changes (user selected a new job from the JobListing sidebar), update state
    if (injectedJob) {
      setJobDescription(injectedJob);
    }
  }, [injectedJob]);

  useEffect(() => {
    // Trigger analysis if location state has autoAnalyze OR we are injected with an existing resume
    const shouldAutoAnalyze = location.state?.autoAnalyze || !!injectedJob;
    if (shouldAutoAnalyze && jobDescription && existingResume && !isAnalyzing && !isOptimizing && !autoTriggered.current) {
      autoTriggered.current = true;
      window.history.replaceState({}, document.title)
      handleAnalyze();
    }
  }, [jobDescription, existingResume, isAnalyzing, isOptimizing, location.state, injectedJob]);

  const handleSearchJobs = async () => {
    if (!jobQuery.trim()) return;
    setIsSearchingJobs(true);
    setSearchError('');
    setJobResults([]);
    try {
      const API_BASE = 'https://leetcode-orchestration.onrender.com';
      const res = await fetch(`${API_BASE}/api/jobs?role=${encodeURIComponent(jobQuery)}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to fetch jobs via SerpApi");
      setJobResults(data.jobs || []);
    } catch (err) {
      console.error(err);
      setSearchError(err.message || "Failed to fetch jobs. Verify your API configuration.");
    } finally {
      setIsSearchingJobs(false);
    }
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

      // 3. Send to backend Gemini ATS checker
      const API_BASE = getApiBase();
      const res = await fetch(`${API_BASE}/api/resume/ats-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          jobRole: deriveJobRole(jobDescription),
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "ATS check failed");

      setAnalysisResult(data.feedbackText || '');
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
    setOptimizedData(null);
    setOptimizationAttempts([]);
    setStatus({ type: '', message: '' });

    try {
      const getCommand = new GetObjectCommand({
        Bucket: 'resume',
        Key: existingResume.Key
      });
      const s3Response = await s3Client.send(getCommand);
      const arrayBuffer = await s3Response.Body.transformToByteArray();
      const resumeText = await extractTextFromPDF(arrayBuffer);
      if (!resumeText || resumeText.length < 50) throw new Error("Could not extract sufficient text from the PDF.");

      let currentAttempt = "";
      let feedback = "";
      let matchScore = 0;
      let attemptCount = 0;
      const maxAttempts = 5;
      let finalData = null;
      let attemptsLog = [];

      let bestScore = 0;
      let bestData = null;

      while (matchScore < 95 && attemptCount < maxAttempts) {
        attemptCount++;
        attemptsLog.push({ attempt: attemptCount, status: 'Generating AI Resume...', score: null });
        setOptimizationAttempts([...attemptsLog]);

        const API_BASE = getApiBase();
        const res = await fetch(`${API_BASE}/api/optimize-resume`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText, jobDescription, previousAttempt: currentAttempt, feedback })
        });

        if (!res.ok) throw new Error("Failed to optimize resume on backend");
        const data = await res.json();
        if (!data.optimizedData) throw new Error("Invalid format received from AI");
        finalData = data.optimizedData;

        // Convert JSON to text for Gradio's ATS score check
        const candidateText = `Summary:\n${finalData.summary}\n\nExperience:\n${finalData.experience?.map(e => e.points?.join('\n')).join('\n')}\n\nSkills:\n${finalData.skills?.join(', ')}`;

        attemptsLog[attemptsLog.length - 1].status = 'Evaluating ATS Match...';
        setOptimizationAttempts([...attemptsLog]);

        const atsRes = await fetch(`${API_BASE}/api/resume/ats-check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText: candidateText,
            jobDescription,
            jobRole: deriveJobRole(jobDescription),
          })
        });
        const atsData = await atsRes.json();
        if (!atsRes.ok || atsData.error) throw new Error(atsData.error || "ATS check failed");
        matchScore = typeof atsData.atsScore === 'number' ? atsData.atsScore : 100; // break-safe
        const atsText = atsData.feedbackText || '';

        attemptsLog[attemptsLog.length - 1].score = matchScore;

        if (matchScore > bestScore) {
          bestScore = matchScore;
          bestData = finalData;
          currentAttempt = candidateText;
          attemptsLog[attemptsLog.length - 1].status = `Scored ${matchScore}% (New Best!)`;
          feedback = atsText;
        } else {
          // Regression logic: Do NOT update currentAttempt. Revert and use aggressive corrective feedback
          attemptsLog[attemptsLog.length - 1].status = `Scored ${matchScore}% (Regressed)`;
          feedback = `CRITICAL FAILURE: Your last rewrite dropped in score to ${matchScore}%. We are reverting back to the ${bestScore}% version. You MUST strictly preserve all keywords existing in the ${bestScore}% version while satisfying the following missing requirements:\n\n${atsText}`;
        }

        setOptimizationAttempts([...attemptsLog]);
      }

      // If loop exited without hitting 95, fallback to the best iteration found
      if (bestScore > matchScore) {
        finalData = bestData;
        matchScore = bestScore;
        attemptsLog.push({ attempt: 'Fallback', status: `Using highest scoring iteration: ${bestScore}%`, score: bestScore });
        setOptimizationAttempts([...attemptsLog]);
      }

      setOptimizedData(finalData);
      setStatus({ type: 'success', message: `Optimization complete! Final Score: ${matchScore}%` });

      // Save History to Firebase
      if (currentUser && finalData) {
        try {
          await addDoc(collection(db, 'resumeHistory'), {
            userId: currentUser.uid,
            jobDescription,
            optimizedData: finalData,
            score: matchScore,
            createdAt: new Date().toISOString()
          });
          fetchHistory(); // Refresh history UI
        } catch (e) {
          console.error("Failed to save history", e);
        }
      }

    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Optimization failed. Please try again later.' });
    } finally {
      setIsOptimizing(false);
    }
  };

  const fetchHistory = async () => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, 'resumeHistory'), where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const h = [];
      snap.forEach(d => h.push({ id: d.id, ...d.data() }));
      setResumeHistory(h);
    } catch (err) {
      console.error("Fetch history error", err);
    }
  };

  const handleDeleteHistory = async (histId) => {
    if (!window.confirm("Are you sure you want to delete this optimization record?")) return;
    try {
      await deleteDoc(doc(db, 'resumeHistory', histId));
      fetchHistory();
    } catch (e) {
      console.error("Failed to delete history item", e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentUser]);

  const handleRescanATS = async () => {
    if (!optimizedData || !jobDescription) return;
    setIsRescanning(true);
    setRescanScore(null);
    try {
      const textToScan = `Summary:\n${optimizedData.summary}\n\nExperience:\n${optimizedData.experience?.map(e => e.points?.join('\n')).join('\n')}\n\nSkills:\n${optimizedData.skills?.join(', ')}`;

      const API_BASE = getApiBase();
      const res = await fetch(`${API_BASE}/api/resume/ats-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: textToScan,
          jobDescription,
          jobRole: deriveJobRole(jobDescription),
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "ATS check failed");
      setRescanScore(typeof data.atsScore === 'number' ? data.atsScore : 'N/A');
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'ATS Scan failed.' });
    } finally {
      setIsRescanning(false);
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
          const sorted = response.Contents.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));
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
      toast.success('Vault Updated: Master Resume Uploaded Successfully!');

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
      toast.error('Vault Upload Failed: ' + (error.message || 'Unknown error occurred.'));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteUploaded = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your master resume from the vault?")) return;
    setLoadingExisting(true);
    setStatus({ type: '', message: '' });
    try {
      if (existingResume && currentUser) {
        const dCmd = new DeleteObjectCommand({ Bucket: 'resume', Key: existingResume.Key });
        await s3Client.send(dCmd);
        setExistingResume(null);
        setStatus({ type: 'success', message: 'Master resume deleted successfully.' });
        toast.info('Master Resume successfully removed from Vault.');
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to delete master resume.' });
    } finally {
      setLoadingExisting(false);
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
      {!hideNav && (
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
      )}

      {/* ── Mobile Menu Overlay ── */}
      {!hideNav && isMenuOpen && (
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
        {!hideNav && (
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
        )}

        {!currentUser ? (
          <div style={{
            padding: '4rem 2rem', background: 'rgba(20,22,30,0.6)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px', textAlign: 'center', marginTop: '2rem', width: '100%', maxWidth: '600px', backdropFilter: 'blur(10px)'
          }}>
            <AlertCircle size={48} color="#f472b6" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 16px', color: '#fff' }}>Authentication Required</h2>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', marginBottom: '30px', lineHeight: 1.6 }}>
              You must be logged in to upload a resume to the Vault and generate ATS-optimized versions. We securely store your documents for your sessions.
            </p>
            <button
              onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`)}
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #ec4899)', border: 'none', color: '#fff',
                padding: '14px 32px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)', transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              Sign In to Continue
            </button>
          </div>
        ) : (
          <>
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

                      <div style={{ display: 'flex', gap: '12px' }}>
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
                          Replace
                        </button>
                        <button
                          onClick={handleDeleteUploaded}
                          style={{
                            background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171',
                            padding: '10px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          title="Delete Master Resume"
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.05)'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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
                        <button onClick={() => { setFile(null); setStatus({ type: '', message: '' }); }} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    )}

                    <div
                      className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer ${isDragging ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02] shadow-[0_0_30px_rgba(99,102,241,0.2)]' :
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

                  {/* Job Search Area */}
                  <div style={{ marginBottom: '30px', background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Find LinkedIn Jobs (via SerpApi)
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <input
                        value={jobQuery}
                        onChange={e => setJobQuery(e.target.value)}
                        placeholder="e.g. SDE Intern, Frontend Developer"
                        style={{
                          flex: 1, padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none'
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchJobs()}
                      />
                      <button
                        onClick={handleSearchJobs}
                        disabled={isSearchingJobs || !jobQuery.trim()}
                        style={{
                          padding: '0 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          color: '#fff', border: 'none', fontWeight: 600, cursor: (isSearchingJobs || !jobQuery.trim()) ? 'not-allowed' : 'pointer',
                          opacity: (isSearchingJobs || !jobQuery.trim()) ? 0.6 : 1
                        }}
                      >
                        {isSearchingJobs ? <Loader2 size={18} className="animate-spin" /> : 'Search'}
                      </button>
                    </div>

                    {searchError && <div style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '12px' }}>{searchError}</div>}

                    {jobResults.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
                        {jobResults.map(job => (
                          <div key={job.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{job.title}</div>
                                <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>{job.company} • {job.location}</div>
                              </div>
                              {job.time_posted && <div style={{ fontSize: '0.8rem', color: '#6b7280', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>{job.time_posted}</div>}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#d1d5db', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {job.description}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                              <a href={job.apply_links[0] || '#'} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 600 }}>External Link</a>
                              <button
                                onClick={() => setJobDescription(`${job.title} at ${job.company}\n\n${job.description}`)}
                                style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', padding: '6px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
                              >
                                Select & Edit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>


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

            {/* Optimization Dashboard / Agentic Loop Status */}
            {optimizationAttempts.length > 0 && (
              <div style={{ marginTop: '2rem', width: '100%', maxWidth: '1200px', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#fff' }}>Agentic Auto-Optimization Loop</h3>
                {optimizationAttempts.map(att => (
                  <div key={att.attempt} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '12px', fontSize: '0.95rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Iteration {att.attempt}:</span>
                    {att.status.includes('Evaluating') || att.status.includes('Generating') ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8' }}>
                        <Loader2 className="animate-spin" size={16} /> {att.status}
                      </div>
                    ) : (
                      <span style={{ color: att.score >= 90 ? '#34d399' : '#fbbf24', fontWeight: 600 }}>{att.status}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Full Width Optimization Feature Board */}
            {optimizedData && (
              <div style={{
                marginTop: '3rem', width: '100%', maxWidth: '1200px',
                background: 'rgba(20, 22, 30, 0.6)', backdropFilter: 'blur(16px)',
                border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '24px',
                padding: '3rem', animation: 'fadeInUp 0.6s ease-out',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px' }}>
                      <FileText size={28} color="#10b981" />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>Industry Standard Template Ready</h2>
                      <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                        Your resume has achieved ATS perfection. Download your freshly generated PDF below.
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleRescanATS}
                      disabled={isRescanning}
                      style={{
                        padding: '14px 20px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', border: '1px solid rgba(99,102,241,0.5)', cursor: isRescanning ? 'not-allowed' : 'pointer',
                        background: isRescanning ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.1)', color: '#818cf8',
                      }}
                      onMouseEnter={(e) => { if (!isRescanning) e.currentTarget.style.background = 'rgba(99,102,241,0.2)' }}
                      onMouseLeave={(e) => { if (!isRescanning) e.currentTarget.style.background = 'rgba(99,102,241,0.1)' }}
                    >
                      {isRescanning ? <><Loader2 size={18} className="animate-spin" /> Scanning...</> : <><CheckCircle size={18} /> {rescanScore ? `Match: ${rescanScore}%` : 'Verify ATS Score'}</>}
                    </button>
                    <button
                      onClick={handlePrint}
                      style={{
                        padding: '14px 28px', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
                        boxShadow: '0 10px 25px rgba(16,185,129,0.3)'
                      }}
                    >
                      <UploadCloud size={20} /> Download PDF
                    </button>
                  </div>
                </div>

                {/* Template Selector */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { id: 'ClassicPrintTemplate', label: 'Classic Print' },
                    { id: 'SingleColumnTemplate', label: 'Linear ATS' },
                    { id: 'TwoColumnTemplate', label: 'Sidebar Split' },
                    { id: 'HeaderFocusedTemplate', label: 'Header Highlight' },
                    { id: 'SkillsFirstTemplate', label: 'Skills Focus' },
                    { id: 'ProjectCentricTemplate', label: 'Project Highlights' },
                    { id: 'CompactDenseTemplate', label: 'Compact Dense' },
                    { id: 'SectionBoxedTemplate', label: 'Section Boxed' },
                    { id: 'TimelineBasedTemplate', label: 'Chronological' }
                  ].map(tpl => (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      style={{
                        padding: '10px 20px', borderRadius: '8px',
                        background: selectedTemplate === tpl.id ? '#10b981' : 'rgba(255,255,255,0.05)',
                        color: selectedTemplate === tpl.id ? '#fff' : 'rgba(255,255,255,0.6)', border: 'none', cursor: 'pointer', transition: '0.2s',
                        fontSize: '0.95rem', fontWeight: 600,
                        boxShadow: selectedTemplate === tpl.id ? '0 4px 14px rgba(16,185,129,0.3)' : 'none'
                      }}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>

                {/* Print Component (Off-screen render prevents blank pages) */}
                <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '850px' }}>
                  <div ref={componentRef}>
                    {selectedTemplate === 'ClassicPrintTemplate' && <ClassicPrintTemplate data={optimizedData} />}
                    {selectedTemplate === 'SingleColumnTemplate' && <SingleColumnTemplate data={optimizedData} />}
                    {selectedTemplate === 'TwoColumnTemplate' && <TwoColumnTemplate data={optimizedData} />}
                    {selectedTemplate === 'HeaderFocusedTemplate' && <HeaderFocusedTemplate data={optimizedData} />}
                    {selectedTemplate === 'SkillsFirstTemplate' && <SkillsFirstTemplate data={optimizedData} />}
                    {selectedTemplate === 'ProjectCentricTemplate' && <ProjectCentricTemplate data={optimizedData} />}
                    {selectedTemplate === 'CompactDenseTemplate' && <CompactDenseTemplate data={optimizedData} />}
                    {selectedTemplate === 'SectionBoxedTemplate' && <SectionBoxedTemplate data={optimizedData} />}
                    {selectedTemplate === 'TimelineBasedTemplate' && <TimelineBasedTemplate data={optimizedData} />}
                  </div>
                </div>

                {/* UI Preview Shell */}
                <div style={{
                  width: '100%', maxWidth: '850px', background: '#e2e8f0', padding: '20px',
                  borderRadius: '12px', overflow: 'hidden', pointerEvents: 'auto', userSelect: 'auto',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                }}>
                  <div style={{ background: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
                    {selectedTemplate === 'ClassicPrintTemplate' && <ClassicPrintTemplate data={optimizedData} />}
                    {selectedTemplate === 'SingleColumnTemplate' && <SingleColumnTemplate data={optimizedData} />}
                    {selectedTemplate === 'TwoColumnTemplate' && <TwoColumnTemplate data={optimizedData} />}
                    {selectedTemplate === 'HeaderFocusedTemplate' && <HeaderFocusedTemplate data={optimizedData} />}
                    {selectedTemplate === 'SkillsFirstTemplate' && <SkillsFirstTemplate data={optimizedData} />}
                    {selectedTemplate === 'ProjectCentricTemplate' && <ProjectCentricTemplate data={optimizedData} />}
                    {selectedTemplate === 'CompactDenseTemplate' && <CompactDenseTemplate data={optimizedData} />}
                    {selectedTemplate === 'SectionBoxedTemplate' && <SectionBoxedTemplate data={optimizedData} />}
                    {selectedTemplate === 'TimelineBasedTemplate' && <TimelineBasedTemplate data={optimizedData} />}
                  </div>
                </div>
              </div>
            )}

            {/* History Section */}
            {resumeHistory.length > 0 && (
              <div style={{ marginTop: '4rem', width: '100%', maxWidth: '1200px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 24px', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={28} color="#818cf8" /> Optimization History
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  {resumeHistory.map(hist => (
                    <div key={hist.id} style={{ position: 'relative' }}>
                      <div
                        style={{
                          height: '100%', background: 'rgba(20,22,30,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', cursor: 'pointer',
                          transition: 'all 0.2s', position: 'relative'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20,22,30,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                        onClick={() => {
                          setOptimizedData(hist.optimizedData);
                          setJobDescription(hist.jobDescription);
                          setRescanScore(null);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteHistory(hist.id); }}
                          style={{
                            position: 'absolute', top: '16px', right: '16px', background: 'transparent',
                            border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '4px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                          title="Delete record"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center', paddingRight: '24px' }}>
                          <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                            {new Date(hist.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span style={{
                            color: hist.score >= 90 ? '#34d399' : '#facc15',
                            fontWeight: 800, background: hist.score >= 90 ? 'rgba(52,211,153,0.1)' : 'rgba(250,204,21,0.1)',
                            padding: '4px 10px', borderRadius: '100px', fontSize: '0.85rem'
                          }}>
                            {hist.score}% ATS
                          </span>
                        </div>
                        <p style={{
                          fontSize: '0.95rem', color: '#e2e8f0', margin: 0, lineHeight: 1.5,
                          overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'
                        }}>
                          {hist.jobDescription || "No target job description provided."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeOptimiser;

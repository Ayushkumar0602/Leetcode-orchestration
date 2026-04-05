import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Clock, Loader2, FileText, ExternalLink, ArrowRight } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import NavProfile from './NavProfile';
import NotificationBell from './components/NotificationBell';
import ResumeOptimiser from './ResumeOptimiser';

export default function JobListing() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [jobQuery, setJobQuery] = useState('');
  const [jobResults, setJobResults] = useState([]);
  const [isSearchingJobs, setIsSearchingJobs] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedJobDesc, setSelectedJobDesc] = useState('');

  // Load from cache on first mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('lastJobSearchCache_INDIA');
      if (cached) {
        const parsed = JSON.parse(cached);
        const { query, results, timestamp } = parsed;
        const now = new Date().getTime();
        // 20 minutes expiration
        if (now - timestamp < 20 * 60 * 1000) {
          setJobQuery(query);
          setJobResults(results);
        } else {
          localStorage.removeItem('lastJobSearchCache_INDIA');
        }
      }
    } catch (e) {
      console.log('Cache parse err', e);
    }
  }, []);

  const handleSearchJobs = async () => {
    if(!jobQuery.trim()) return;
    setIsSearchingJobs(true);
    setSearchError('');
    setJobResults([]);
    try {
      const res = await fetch(`http://localhost:3001/api/jobs?role=${encodeURIComponent(jobQuery)}`);
      const data = await res.json();
      if(!res.ok || data.error) throw new Error(data.error || "Failed to fetch jobs via SerpApi");
      const fetchedJobs = data.jobs || [];
      setJobResults(fetchedJobs);

      // Save to cache
      localStorage.setItem('lastJobSearchCache_INDIA', JSON.stringify({
        query: jobQuery,
        results: fetchedJobs,
        timestamp: new Date().getTime()
      }));
    } catch(err) {
      console.error(err);
      setSearchError(err.message || "Failed to fetch jobs. Verify your API configuration.");
    } finally {
      setIsSearchingJobs(false);
    }
  };

  const proceedToOptimize = (job) => {
    const combinedDesc = `${job.title} at ${job.company}\n\n${job.description}`;
    setSelectedJobDesc(combinedDesc);
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
              <button onClick={() => navigate('/dsaquestion')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>DSA Practice</button>
              <button onClick={() => navigate('/aiinterviewselect')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>AI Interview</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 0', justifyContent: 'flex-end' }}>
              <NotificationBell />
              <div className="hidden md:block">
                  <NavProfile />
              </div>
          </div>
      </nav>
      {/* ── Main Content : SPLIT LAYOUT ── */}
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem', height: 'calc(100vh - 64px)' }}>
        
        {/* Left Container: Jobs List */}
        <div style={{ 
            background: 'rgba(20, 22, 30, 0.6)', backdropFilter: 'blur(16px)', 
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', 
            padding: '2rem', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            transition: 'all 0.5s ease-in-out', overflowY: 'auto'
        }} className="custom-scrollbar">
           
           <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={20} color="#60a5fa" /> LinkedIn India
           </h2>

           <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
               <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '20px', color: '#9ca3af' }}>
                  <Search size={20} />
               </div>
               <input 
                 value={jobQuery}
                 onChange={e => setJobQuery(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSearchJobs()}
                 placeholder="Search SDE, Frontend..."
                 style={{ 
                   flex: 1, padding: '12px 14px 12px 40px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', 
                   border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '1rem', transition: 'border 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                 }}
                 onFocus={e => e.target.style.border = '1px solid #60a5fa'}
                 onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
               />
               <button
                 onClick={handleSearchJobs}
                 disabled={isSearchingJobs || !jobQuery.trim()}
                 style={{
                   padding: '0 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                   color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.95rem', cursor: (isSearchingJobs || !jobQuery.trim()) ? 'not-allowed' : 'pointer',
                   opacity: (isSearchingJobs || !jobQuery.trim()) ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
                 }}
               >
                 {isSearchingJobs ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
               </button>
           </div>
           
           {searchError && <div style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', border: '1px solid rgba(248,113,113,0.2)' }}>{searchError}</div>}
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '1rem' }}>
              {jobResults.map((job, idx) => (
                <div key={job.id || idx} style={{ 
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', 
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', 
                    transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '16px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                     <div>
                       <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{job.title}</div>
                       <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '0.95rem' }}><Briefcase size={16} color="#94a3b8" /> {job.company}</span>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '0.95rem' }}><MapPin size={16} color="#94a3b8" /> {job.location}</span>
                           {job.time_posted && <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '0.95rem' }}><Clock size={16} color="#94a3b8" /> {job.time_posted}</span>}
                       </div>
                     </div>
                     <div style={{ background: 'rgba(16,185,129,0.1)', padding: '6px 12px', borderRadius: '8px', color: '#34d399', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.2)' }}>
                        ACTIVELY HIRING
                     </div>
                  </div>
                  
                  <div style={{ 
                      fontSize: '1rem', color: '#9ca3af', lineHeight: 1.6, 
                      display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px'
                  }}>
                     {job.description}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                     <a href={job.apply_links?.[0] || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa', fontSize: '0.95rem', textDecoration: 'none', fontWeight: 600 }}>
                         <ExternalLink size={16} /> View External Link
                     </a>
                     
                     <button 
                       onClick={() => proceedToOptimize(job)}
                       style={{ 
                         background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.4)', 
                         padding: '12px 24px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                         display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16,185,129,0.1)'
                       }}
                       onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                       onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.15)'; e.currentTarget.style.transform = 'translateY(0)' }}
                     >
                       <FileText size={18} /> Optimise Resume <ArrowRight size={18} />
                     </button>
                  </div>
                </div>
              ))}
              
               {!isSearchingJobs && jobResults.length === 0 && !searchError && (
                   <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '3rem 0', fontSize: '0.9rem' }}>
                       Press Scan to search live roles.
                   </div>
               )}
            </div>
        </div>

        {/* Right Container: Resume Optimiser Embed */}
        <div style={{ 
            background: 'rgba(5, 5, 5, 0.5)', backdropFilter: 'blur(16px)', 
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', 
            overflowY: 'auto', position: 'relative'
        }} className="custom-scrollbar">
           {!selectedJobDesc ? (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.4)', gap: '16px', padding: '2rem', textAlign: 'center' }}>
                <FileText size={48} color="rgba(255,255,255,0.2)" />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#fff' }}>Select a Role to Validate</h3>
                <p style={{ maxWidth: '400px', lineHeight: 1.5 }}>Find a Job from the Indian pipeline on the left, and push it here to instantly parse and generate an optimized resume.</p>
             </div>
           ) : (
             <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <ResumeOptimiser injectedJob={selectedJobDesc} hideNav={true} compactView={true} />
             </div>
           )}
        </div>

      </div>
    </div>
  );
}

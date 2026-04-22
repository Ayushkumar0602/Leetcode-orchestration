import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, Loader2, FileText, ExternalLink, ArrowRight } from 'lucide-react';
import NavProfile from './NavProfile';
import NotificationBell from './components/NotificationBell';
import ResumeOptimiser from './ResumeOptimiser';

export default function JobListing() {
  const navigate = useNavigate();
  
  const [jobQuery, setJobQuery] = useState('');
  const [jobResults, setJobResults] = useState([]);
  const [isSearchingJobs, setIsSearchingJobs] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedJobDesc, setSelectedJobDesc] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [hoursOld, setHoursOld] = useState('24');
  const [postedAfter, setPostedAfter] = useState('');

  const handleSearchJobs = async () => {
    if(!jobQuery.trim()) return;
    setIsSearchingJobs(true);
    setSearchError('');
    setJobResults([]);
    try {
      const API_BASE = import.meta.env.DEV ? 'https://leetcode-orchestration.onrender.com' : (import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com');
      const res = await fetch(
        `${API_BASE}/api/jobs?role=${encodeURIComponent(jobQuery)}&hours_old=${encodeURIComponent(hoursOld)}`
      );
      const data = await res.json();
      if(!res.ok || data.error) throw new Error(data.error || "Failed to fetch jobs via JobSpy");
      const fetchedJobs = data.jobs || [];
      setJobResults(fetchedJobs);
    } catch(err) {
      console.error(err);
      setSearchError(err.message || "Failed to fetch jobs. Verify Python JobSpy is configured on the backend.");
    } finally {
      setIsSearchingJobs(false);
    }
  };

  const proceedToOptimize = (job) => {
    const combinedDesc = `${job.title} at ${job.company}\n\n${job.description}`;
    setSelectedJobDesc(combinedDesc);
    setSelectedJobId(job.id || '');
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined || amount === '') return '-';
    const n = Number(amount);
    if (!Number.isFinite(n)) return String(amount);
    return n.toLocaleString();
  };

  const displayedJobs = [...jobResults]
    .filter((job) => {
      if (!postedAfter) return true;
      const selectedTs = new Date(postedAfter).getTime();
      const postedTs = job.posted_at_iso ? new Date(job.posted_at_iso).getTime() : NaN;
      if (!Number.isFinite(selectedTs) || !Number.isFinite(postedTs)) return true;
      return postedTs >= selectedTs;
    })
    .sort((a, b) => {
      const tsA = a.posted_at_iso ? new Date(a.posted_at_iso).getTime() : 0;
      const tsB = b.posted_at_iso ? new Date(b.posted_at_iso).getTime() : 0;
      return tsB - tsA;
    });

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
      <div style={{ maxWidth: '1700px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: 'minmax(760px, 1.2fr) minmax(520px, 1fr)', gap: '2rem', height: 'calc(100vh - 64px)' }}>
        
        {/* Left Container: Jobs List */}
        <div style={{ 
            background: 'rgba(20, 22, 30, 0.6)', backdropFilter: 'blur(16px)', 
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', 
            padding: '2rem', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            transition: 'all 0.5s ease-in-out', overflowY: 'auto'
        }} className="custom-scrollbar">
           
           <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={20} color="#60a5fa" /> Multi-board Jobs (JobSpy)
           </h2>
           <div style={{ color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.45 }}>
             Clear detailed cards: source, title, company, city, state, job type, interval, min/max amount, URL, and full description.
           </div>

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
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
             <div>
               <label style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 700 }}>
                 Latest jobs (posted within)
               </label>
               <select
                 value={hoursOld}
                 onChange={(e) => setHoursOld(e.target.value)}
                 style={{
                   width: '100%',
                   padding: '10px',
                   borderRadius: '10px',
                   background: 'rgba(0,0,0,0.3)',
                   border: '1px solid rgba(255,255,255,0.1)',
                   color: '#fff',
                   outline: 'none'
                 }}
               >
                 <option value="6">Last 6 hours</option>
                 <option value="12">Last 12 hours</option>
                 <option value="24">Last 24 hours</option>
                 <option value="48">Last 48 hours</option>
                 <option value="72">Last 72 hours</option>
                 <option value="168">Last 7 days</option>
               </select>
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 700 }}>
                 Filter by post date & time
               </label>
               <input
                 type="datetime-local"
                 value={postedAfter}
                 onChange={(e) => setPostedAfter(e.target.value)}
                 style={{
                   width: '100%',
                   padding: '10px',
                   borderRadius: '10px',
                   background: 'rgba(0,0,0,0.3)',
                   border: '1px solid rgba(255,255,255,0.1)',
                   color: '#fff',
                   outline: 'none'
                 }}
               />
             </div>
           </div>
           
           {searchError && <div style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', border: '1px solid rgba(248,113,113,0.2)' }}>{searchError}</div>}
           
           <div style={{ marginTop: '1rem' }}>
              {displayedJobs.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {displayedJobs.map((job, idx) => (
                    <div
                      key={job.id || idx}
                      style={{
                        border: selectedJobId && selectedJobId === (job.id || '') ? '1px solid rgba(96,165,250,0.7)' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '14px',
                        padding: '14px',
                        background: 'rgba(255,255,255,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ color: '#93c5fd', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                            {job.source || 'unknown'}
                          </div>
                          <div style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.35 }}>{job.title || '-'}</div>
                          <div style={{ color: '#cbd5e1', marginTop: '4px' }}>{job.company || '-'}</div>
                        </div>
                        <button
                          onClick={() => proceedToOptimize(job)}
                          style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.4)', padding: '8px 12px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                        >
                          <FileText size={15} /> Use <ArrowRight size={15} />
                        </button>
                      </div>

                      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px, 1fr))', gap: '10px' }}>
                        {[
                          ['CITY', job.city || '-'],
                          ['STATE', job.state || '-'],
                          ['JOB TYPE', job.job_type || '-'],
                          ['INTERVAL', job.interval || '-'],
                          ['MIN AMOUNT', formatAmount(job.min_amount)],
                          ['MAX AMOUNT', formatAmount(job.max_amount)],
                          ['LOCATION', job.location || '-'],
                          ['POSTED', job.time_posted || '-']
                        ].map(([label, value]) => (
                          <div key={`${job.id || idx}-${label}`} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '8px 10px' }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, marginBottom: '4px' }}>{label}</div>
                            <div style={{ color: '#e5e7eb', fontSize: '0.84rem', lineHeight: 1.35, wordBreak: 'break-word' }}>{value}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: '12px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, marginBottom: '6px' }}>JOB URL</div>
                        <a href={job.apply_links?.[0] || '#'} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '5px', wordBreak: 'break-all' }}>
                          {job.apply_links?.[0] || 'No URL available'} <ExternalLink size={14} />
                        </a>
                      </div>

                      <div style={{ marginTop: '12px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, marginBottom: '6px' }}>DESCRIPTION</div>
                        <div style={{ color: '#d1d5db', fontSize: '0.88rem', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                          {job.description || 'No description available.'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
               {!isSearchingJobs && displayedJobs.length === 0 && !searchError && (
                   <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '3rem 0', fontSize: '0.9rem' }}>
                       {jobResults.length === 0 ? 'Press Scan to search live roles.' : 'No jobs match the selected post date/time filter.'}
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
                <p style={{ maxWidth: '400px', lineHeight: 1.5 }}>Find a role from LinkedIn, Indeed, ZipRecruiter, Google and more, then push it here to instantly parse and generate an optimized resume.</p>
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

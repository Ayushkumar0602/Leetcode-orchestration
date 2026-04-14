import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useSEO } from './hooks/useSEO';
import NavProfile from './NavProfile';
import { Building2, Search, Briefcase, ChevronRight, CheckCircle2, Play, CalendarClock } from 'lucide-react';
import { COMPANIES } from './companywisesheet/companyData';
import { ROLES } from './data/interviewFlows';
import { toast } from 'sonner';

export default function AIInterviewSchedule() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [companyQuery, setCompanyQuery] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);

    useSEO({
        title: 'Schedule Connected AI Interview Flow | Whizan AI',
        description: 'Prepare dynamically by simulating end-to-end interview combinations. Map your targeted role with exact real-world round transitions.',
        canonical: '/aiinterviewschedule'
    });

    const filteredCompanies = COMPANIES.filter(c => 
        c.name.toLowerCase().includes(companyQuery.toLowerCase())
    );

    const handleSchedule = () => {
        if (!selectedCompany || !selectedRole) return;
        toast.success(`End-to-End Interview Flow initialized for ${selectedRole.title} at ${selectedCompany.name}!`, {
            description: 'Your proctored simulation workflow has been created.',
        });
        // In reality, this would navigate to the actual connected interview hub or dashboard,
        // but for now, we drop a success toast.
        setTimeout(() => {
            navigate('/dashboard');
        }, 3000);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#050505', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)', color: '#fff', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            
            {/* Standard App Navbar */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                padding: '0 1.5rem', height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: '1 1 0' }} onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpeg" alt="Logo" style={{ height: '32px', width: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Whizan AI</span>
                </div>
                
                <div style={{ flex: 'auto', display: 'flex', justifyContent: 'center' }}>
                    <div className="pl-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                        {[
                            { label: 'Problems', path: '/dsaquestion' },
                            { label: 'DSA Interview', path: '/aiinterview' },
                            { label: 'System Design', path: '/systemdesign' },
                            { label: 'My Submissions', path: '/submissions' },
                        ].map(item => (
                            <button key={item.label} onClick={() => navigate(item.path)}
                                style={{
                                    padding: '6px 14px', borderRadius: '7px', border: 'none',
                                    background: 'transparent', color: 'var(--txt3)',
                                    fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--txt3)'; e.currentTarget.style.background = 'transparent'; }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', flex: '1 1 0' }}>
                    <NavProfile />
                </div>
            </nav>

            <div style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                
                <div style={{ textAlign: 'center', animation: 'fadeUp 0.4s ease-out' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(168,85,247,0.1))', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 30px rgba(59,130,246,0.15)' }}>
                        <CalendarClock size={32} color="#3b82f6" />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Schedule Connected Flow</h1>
                    <p style={{ color: 'var(--txt2)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>Generate exact phase-by-phase real-world simulation environments based on company mapping and your specific domain profile.</p>
                </div>

                {/* Step 1: Select Company */}
                <section style={{ animation: 'fadeUp 0.5s ease-out' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>1</div>
                        Select Target Company
                    </h2>
                    
                    {!selectedCompany ? (
                        <>
                            <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '2rem' }}>
                                <Search color="var(--txt3)" size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search organizations..." 
                                    value={companyQuery}
                                    onChange={(e) => setCompanyQuery(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff', fontSize: '0.95rem', outline: 'none',
                                        transition: 'all 0.3s'
                                    }}
                                    onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                {filteredCompanies.slice(0, 10).map((company) => (
                                    <div 
                                        key={company.slug} 
                                        onClick={() => setSelectedCompany(company)}
                                        style={{
                                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', 
                                            padding: '16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{company.name}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', padding: '16px 24px', borderRadius: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={selectedCompany.logo} alt={selectedCompany.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div>
                                <span style={{ display: 'block', color: 'var(--txt2)', fontSize: '0.85rem', marginBottom: '2px' }}>Selected Target</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{selectedCompany.name}</span>
                            </div>
                            <button 
                                onClick={() => setSelectedCompany(null)}
                                style={{ marginLeft: '16px', padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            >
                                Change
                            </button>
                        </div>
                    )}
                </section>

                {/* Step 2: Select Role */}
                {selectedCompany && (
                    <section style={{ animation: 'fadeUp 0.5s ease-out' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>2</div>
                            Identify Technical Domain
                        </h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                            {ROLES.map((role) => {
                                const isSelected = selectedRole?.id === role.id;
                                return (
                                    <div 
                                        key={role.id}
                                        onClick={() => setSelectedRole(role)}
                                        style={{
                                            background: isSelected ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.02)', 
                                            border: `1px solid ${isSelected ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.08)'}`, 
                                            padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
                                            cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
                                        }}
                                        onMouseEnter={(e) => { 
                                            if(!isSelected) {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; 
                                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                            }
                                        }}
                                        onMouseLeave={(e) => { 
                                            if(!isSelected) {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; 
                                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                            }
                                        }}
                                    >
                                        {isSelected && (
                                            <div style={{ position: 'absolute', top: '16px', right: '16px', color: '#a855f7' }}>
                                                <CheckCircle2 size={24} />
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ background: isSelected ? '#a855f7' : 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '10px', color: isSelected ? '#fff' : 'var(--txt2)' }}>
                                                <Briefcase size={20} />
                                            </div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: isSelected ? '#fff' : 'var(--txt1)' }}>{role.title}</h3>
                                        </div>
                                        <p style={{ color: 'var(--txt2)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>{role.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Step 3: Flow Timeline */}
                {selectedCompany && selectedRole && (
                    <section style={{ animation: 'fadeUp 0.6s ease-out' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>3</div>
                            Generated Pipeline
                        </h2>
                        
                        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                            <div style={{ content: '""', position: 'absolute', left: '11px', top: '0', bottom: '0', width: '2px', background: 'linear-gradient(to bottom, #3b82f6, #a855f7, #10b981)', opacity: 0.5, borderRadius: '4px' }} />
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {selectedRole.rounds.map((round, index) => {
                                    let nodeColor = '#3b82f6';
                                    if (round.type === 'architecture') nodeColor = '#a855f7';
                                    if (round.type === 'hr') nodeColor = '#10b981';
                                    if (round.type === 'practical') nodeColor = '#f59e0b';

                                    return (
                                        <div key={round.id} style={{ position: 'relative', animation: `fadeUp 0.4s ease-out ${index * 0.15}s both` }}>
                                            {/* Node Marker */}
                                            <div style={{ position: 'absolute', left: '-2rem', top: '8px', width: '24px', height: '24px', borderRadius: '50%', background: '#050505', border: `3px solid ${nodeColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateX(-9px)' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: nodeColor }} />
                                            </div>
                                            
                                            {/* Content Box */}
                                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px', borderRadius: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#fff' }}>{round.title}</h4>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 8px', background: `rgba(${nodeColor === '#3b82f6' ? '59,130,246' : nodeColor === '#a855f7' ? '168,85,247' : nodeColor === '#10b981' ? '16,185,129' : '245,158,11'}, 0.1)`, color: nodeColor, borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        {round.type}
                                                    </span>
                                                </div>
                                                <p style={{ color: 'var(--txt2)', margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>{round.desc}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* CTA */}
                        <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', animation: 'fadeUp 0.6s ease-out 1s both' }}>
                            <button 
                                onClick={handleSchedule}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 36px',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '16px',
                                    color: '#fff', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer',
                                    boxShadow: '0 8px 30px rgba(59,130,246,0.3)', transition: 'all 0.3s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(59,130,246,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(59,130,246,0.3)'; }}
                            >
                                <Play size={20} fill="currentColor" />
                                Launch Full Simulation Hub
                            </button>
                        </div>
                    </section>
                )}
                
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

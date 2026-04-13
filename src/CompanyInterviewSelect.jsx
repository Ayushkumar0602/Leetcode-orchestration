import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useSEO } from './hooks/useSEO';
import NavProfile from './NavProfile';
import { Building2, Search, Clock } from 'lucide-react';
import CompanyGrid from './companywisesheet/CompanyGrid';
import { COMPANIES } from './companywisesheet/companyData';

const UPCOMING_COMPANIES = [
    { name: 'Nvidia', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg', color: '#76B900' },
    { name: 'Intel', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Intel-logo.svg', color: '#0071C5' },
    { name: 'AMD', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Logo.svg', color: '#ED1C24' },
    { name: 'IBM', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg', color: '#0530AD' },
    { name: 'Instagram', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg', color: '#E1306C' },
    { name: 'WhatsApp', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg', color: '#25D366' },
    { name: 'YouTube', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg', color: '#FF0000' },
    { name: 'PayPal', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg', color: '#00457C' },
    { name: 'Shopify', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg', color: '#95BF47' },
    { name: 'GitHub', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg', color: '#181717' },
    { name: 'GitLab', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/GitLab_logo.svg', color: '#FCA121' },
    { name: 'Reddit', logo: 'https://upload.wikimedia.org/wikipedia/en/5/58/Reddit_logo_new.svg', color: '#FF4500' },
    { name: 'Discord', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Discord_logo.svg', color: '#5865F2' },
    { name: 'OpenAI', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg', color: '#10A37F' },
    { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', color: '#1428A0' },
    { name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', color: '#000000' },
    { name: 'LG', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/LG_symbol.svg', color: '#A50034' },
    { name: 'Huawei', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Huawei_Standard_logo.svg', color: '#FF0000' },
    { name: 'Xiaomi', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg', color: '#FF6900' },
    { name: 'Lenovo', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg', color: '#E2231A' },
    { name: 'Dell', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg', color: '#0076CE' },
    { name: 'HP', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg', color: '#0096D6' },
    { name: 'ASUS', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg', color: '#00539B' },
    { name: 'Acer', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Acer_2011.svg', color: '#83B81A' },
    { name: 'MSI', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/13/MSI_logo.svg', color: '#FF0000' },
    { name: 'SAP', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg', color: '#008FD3' },
    { name: 'MongoDB', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg', color: '#47A248' },
    { name: 'Docker', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Docker_%28container_engine%29_logo.svg', color: '#2496ED' },
    { name: 'Cloudflare', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Cloudflare_Logo.svg', color: '#F38020' },
    { name: 'Notion', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png', color: '#000000' },
    { name: 'Figma', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg', color: '#F24E1E' },
    { name: 'Canva', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg', color: '#00C4CC' },
    { name: 'Booking', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Booking.com_logo.svg', color: '#003580' },
    { name: 'Lyft', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Lyft_logo.svg', color: '#FF00BF' },
    { name: 'DoorDash', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Doordash_logo.svg', color: '#FF3008' },
    { name: 'Swiggy', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Swiggy_logo.png', color: '#FC8019' },
    { name: 'Zomato', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png', color: '#CB202D' },
    { name: 'Flipkart', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Flipkart_logo.svg', color: '#2874F0' },
    { name: 'Walmart', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg', color: '#0071CE' },
    { name: 'Ikea', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Ikea_logo.svg', color: '#0051BA' },
    { name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', color: '#000000' },
    { name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg', color: '#000000' },
    { name: 'Puma', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Puma_logo.svg', color: '#000000' },
    { name: 'Visa', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg', color: '#1434CB' },
    { name: 'Mastercard', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg', color: '#EB001B' },
    { name: 'Binance', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Binance_logo.svg', color: '#F3BA2F' },
    { name: 'Robinhood', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Robinhood_logo.svg', color: '#00C805' },
];

export default function CompanyInterviewSelect() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    useSEO({
        title: 'Company Wise Interview Preparation Sheets & FAANG Roadmaps | Whizan AI',
        description: 'Master FAANG interview questions with company wise DSA preparation sheets. Get specific coding queries, LeetCode tags, and system design roadmaps for Google, Amazon, Meta, Microsoft, and 50+ top tech companies.',
        canonical: '/companyinterviewselect',
        keywords: 'company wise interview preparation, FAANG interview questions, company specific DSA sheets, top tech company coding interview, software engineer interview roadmap, Google leetcode questions, Amazon SDE preparation, tech interview roadmaps, system design algorithms',
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "Company Wise Tech Interview Preparation Roadmaps",
            "description": "Comprehensive company-specific coding interview roadmaps featuring frequently asked high-impact DSA and system design questions from FAANG and top tech organizations.",
            "provider": {
                "@type": "Organization",
                "name": "Whizan AI",
                "sameAs": "https://whizan.xyz"
            },
            "url": "https://whizan.xyz/companyinterviewselect"
        }
    });

    const filteredUpcoming = UPCOMING_COMPANIES.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredAvailable = COMPANIES.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const noResults = filteredUpcoming.length === 0 && filteredAvailable.length === 0;

    return (
        <div className="cis-page" style={{ minHeight: '100vh', background: '#050505', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)', color: '#fff', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            
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

            {/* Main Selection Area */}
            <div className="cis-main-container" style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%', animation: 'fadeUp 0.4s ease-out', flex: 1 }}>
                
                <div className="cis-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(168,85,247,0.1))', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 30px rgba(59,130,246,0.15)' }}>
                        <Building2 size={32} color="#3b82f6" />
                    </div>
                    <h1 className="cis-title" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Company Wise Tech Roadmaps</h1>
                    <p className="cis-subtitle" style={{ color: 'var(--txt2)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>Select a target organization to explore their specific FAANG Data Structures and Algorithms interview patterns.</p>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto 3rem auto' }}>
                    <Search color="var(--txt3)" size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" 
                        placeholder="Search top tech companies (e.g. Google, Amazon)..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px',
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff', fontSize: '1rem', outline: 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    />
                </div>

                {noResults && (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(255,255,255,0.015)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)', margin: '2rem 0' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(59,130,246,0.15)' }}>
                            <Search size={32} color="#3b82f6" />
                        </div>
                        <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.5px' }}>No roadmaps found for "{searchQuery}"</h3>
                        <p style={{ color: 'var(--txt2)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>We are engineering new company-specific interview sheets aggressively. Your requested organization will be added to our pipeline soon!</p>
                    </div>
                )}

                {!noResults && filteredAvailable.length > 0 && (
                    <div style={{ marginBottom: '4rem' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 1.5rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '24px', borderRadius: '4px', background: '#3b82f6' }} />
                            Available Interview Sheets
                        </h3>
                        <CompanyGrid searchQuery={searchQuery} />
                    </div>
                )}
                
                {/* Upcoming Companies */}
                {filteredUpcoming.length > 0 && (
                    <div style={{ marginBottom: '4rem' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 1.5rem 0', color: 'var(--txt2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '24px', borderRadius: '4px', background: 'var(--txt3)' }} />
                            Upcoming Coding Roadmaps
                        </h3>
                        
                        <div className="upcoming-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                            {filteredUpcoming.map(company => {
                                const hexToRgb = (hex) => {
                                    const r = parseInt(hex.slice(1, 3), 16);
                                    const g = parseInt(hex.slice(3, 5), 16);
                                    const b = parseInt(hex.slice(5, 7), 16);
                                    return `${r}, ${g}, ${b}`;
                                };

                                return (
                                    <div key={company.name} className="upcoming-card" style={{
                                        background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', transition: 'all 0.3s', cursor: 'pointer', position: 'relative', overflow: 'hidden', '--color-rgb': hexToRgb(company.color)
                                    }}>
                                        <div className="uc-glow" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(100px circle at top right, rgba(var(--color-rgb), 0.1), transparent)', opacity: 0, transition: 'opacity 0.3s' }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8, filter: 'grayscale(0.3)' }}>
                                                <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            </div>
                                            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--txt2)' }}>{company.name}</span>
                                        </div>
                                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt3)', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px', zIndex: 1 }}>
                                            <Clock size={12} /> Coming Soon
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                {/* SEO Description Section */}
                <div className="cis-seo-section" style={{ marginTop: '5rem', paddingTop: '4rem', paddingBottom: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <h2 className="cis-seo-title" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>
                        Master Software Engineer Interviews with Company Specific DSA Sheets
                    </h2>
                    <div className="cis-seo-text" style={{ color: 'var(--txt2)', fontSize: '0.95rem', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <p>
                            Breaking into a <strong>FAANG organization</strong> or top-tier tech startup demands more than generic generalized coding practice. It requires deep, highly targeted preparation mapped identically to the <strong>software engineering technical interview</strong> style of the specific firm you are targeting. Our <strong>Company Wise DSA Preparation Sheets</strong> exist to surgically guide your technical mastery. We have mapped thousands of frequently asked <strong>LeetCode company tags</strong>, algorithmic hurdles, and system design edge-cases into premium, easy-to-follow roadmaps.
                        </p>
                        
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0 0 0.5rem 0' }}>Why Target Company-Specific Coding Questions?</h3>
                            <p>
                                Every tech company assesses distinct patterns. For instance, an <strong>Amazon SDE interview</strong> heavily stresses topological sorting, breadth-first search, and graph traversal algorithms to simulate their high-scale logistics network problems. Conversely, <strong>Google software engineer interviews</strong> often assess dynamic programming and segment-tree abstractions. By filtering our platform's thousands of coding queries into strict <strong>company interview roadmaps</strong>, your problem resolution speed and pattern recognition scale exponentially.
                            </p>
                        </div>
                        
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0 0 0.5rem 0' }}>Optimize Using Whizan AI Proctoring</h3>
                            <p>
                                Combine these exhaustive <strong>Data Structures and Algorithms sheets</strong> natively with the <strong>Whizan AI Mock Interview infrastructure</strong>. Do not just passively code; launch an exact simulation environment. Prove your mastery on real-world <strong>tech company coding interview queries</strong> while our computer vision proctoring and real-time metric analysis score your latency and behavioral flags. Use these world-class company trackers to turn an overwhelming syllabus into a highly methodical path to a premium technical offer.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .upcoming-card:hover {
                    border-color: rgba(var(--color-rgb), 0.3) !important;
                    transform: translateY(-4px);
                }
                .upcoming-card:hover .uc-glow { opacity: 1 !important; }
                .upcoming-card:hover img { filter: none !important; opacity: 1 !important; }
                .upcoming-card:hover span { color: #fff !important; }

                @media (max-width: 768px) {
                    .cis-main-container { padding: 2.5rem 1rem !important; }
                    .cis-title { font-size: 1.8rem !important; }
                    .cis-subtitle { font-size: 0.9rem !important; }
                    .cis-header { margin-bottom: 2rem !important; }
                    .cis-seo-section { margin-top: 3rem !important; paddingTop: 2rem !important; }
                    .cis-seo-title { font-size: 1.25rem !important; }
                    .cis-seo-text { font-size: 0.85rem !important; }
                    .upcoming-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .pl-nav-links { display: none !important; }
                }
                
                @media (max-width: 480px) {
                    .cis-title { font-size: 1.5rem !important; }
                    .cis-subtitle { font-size: 0.85rem !important; }
                    .cis-main-container { padding: 2rem 0.75rem !important; }
                    .upcoming-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}

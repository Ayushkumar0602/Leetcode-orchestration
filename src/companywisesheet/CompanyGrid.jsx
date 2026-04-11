import React from 'react';
import { Link } from 'react-router-dom';
import { COMPANIES } from './companyData';
import { ChevronRight } from 'lucide-react';

export default function CompanyGrid() {
    return (
        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '3rem' }}>
            <div className="company-grid-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h3 className="company-grid-title" style={{ 
                    fontSize: '1.8rem', 
                    fontWeight: 800, 
                    margin: '0 0 12px 0', 
                    color: '#fff',
                    letterSpacing: '-0.8px'
                }}>
                    Explore More Company Roadmaps
                </h3>
                <p className="company-grid-desc" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>
                    Select a target company to master their specific Data Structures and Algorithms interview patterns.
                </p>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .company-grid-title { font-size: 1.5rem !important; }
                    .company-grid-desc { font-size: 0.85rem !important; }
                    .company-grid-header { margin-bottom: 1.5rem !important; }
                }
                .company-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                }
                @media (max-width: 1024px) {
                    .company-grid { grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 768px) {
                    .company-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 480px) {
                    .company-grid { grid-template-columns: 1fr; }
                }
                .company-card {
                    text-decoration: none;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 16px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                .company-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.5);
                }
                .company-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 0;
                }
                .company-logo-wrapper {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    transition: all 0.3s;
                    flex-shrink: 0;
                }
                .company-card:hover .company-logo-wrapper {
                    background: rgba(255,255,255,0.08);
                    border-color: rgba(255,255,255,0.1);
                    transform: scale(1.1);
                }
                .company-logo {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                .fallback-badge {
                    width: 100%;
                    height: 100%;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    color: #fff;
                    font-size: 1rem;
                }
                .company-name {
                    color: #e2e8f0;
                    font-weight: 600;
                    font-size: 0.95rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .company-card:hover .company-name {
                    color: #fff;
                }
                .arrow-icon {
                    color: rgba(255,255,255,0.1);
                    transition: all 0.2s;
                    transform: translateX(-4px);
                    opacity: 0;
                    flex-shrink: 0;
                }
                .company-card:hover .arrow-icon {
                    color: #fff;
                    transform: translateX(0);
                    opacity: 1;
                }
                .glow-btn {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(400px circle at var(--x) var(--y), rgba(var(--color-rgb), 0.15), transparent 40%);
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                }
                .company-card:hover .glow-btn {
                    opacity: 1;
                }
            `}</style>

            <div className="company-grid">
                {COMPANIES.map(company => {
                    const hexToRgb = (hex) => {
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        return `${r}, ${g}, ${b}`;
                    };

                    const cleanColor = company.color.replace('#', '');
                    const logoUrl = `https://cdn.simpleicons.org/${company.icon}/${cleanColor}`;

                    return (
                        <Link 
                            key={company.slug} 
                            to={`/company/${company.slug}`} 
                            className="company-card"
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const y = e.clientY - rect.top;
                                e.currentTarget.style.setProperty('--x', `${x}px`);
                                e.currentTarget.style.setProperty('--y', `${y}px`);
                            }}
                            style={{ '--color-rgb': hexToRgb(company.color) }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = company.color}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                        >
                            <div className="glow-btn"></div>
                            <div className="company-info">
                                <div className="company-logo-wrapper">
                                    <img 
                                        src={logoUrl} 
                                        alt={company.name} 
                                        className="company-logo"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div className="fallback-badge" style={{ background: company.color, display: 'none' }}>
                                        {company.name.charAt(0)}
                                    </div>
                                </div>
                                <span className="company-name">{company.name}</span>
                            </div>
                            <ChevronRight className="arrow-icon" size={16} />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

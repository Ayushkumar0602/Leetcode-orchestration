import React from 'react';
import { Link } from 'react-router-dom';
import { COMPANIES } from './companyData';
import { ChevronRight } from 'lucide-react';

export default function CompanyGrid({ searchQuery = '', basePath = '/company' }) {
    const filteredCompanies = COMPANIES.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ marginTop: '1rem' }}>
            <style>{`
                @media (max-width: 768px) {
                    .cg-company-grid-title { font-size: 1.5rem !important; }
                    .cg-company-grid-desc { font-size: 0.85rem !important; }
                    .cg-company-grid-header { margin-bottom: 1.5rem !important; }
                }
                .cg-company-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 20px;
                }
                @media (max-width: 768px) {
                    .cg-company-grid { gap: 16px; }
                }
                @media (max-width: 480px) {
                    .cg-company-grid { grid-template-columns: repeat(2, 1fr); }
                }
                .cg-company-card {
                    text-decoration: none;
                    background: rgba(255, 255, 255, 0.015);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 20px;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }
                .cg-company-card:before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 20px;
                    padding: 2px;
                    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                    transition: all 0.4s ease;
                }
                .cg-company-card:hover {
                    background: rgba(255, 255, 255, 0.04);
                    transform: translateY(-6px);
                    box-shadow: 0 20px 40px -10px rgba(var(--color-rgb), 0.15), 0 0 40px rgba(var(--color-rgb), 0.1);
                }
                .cg-company-card:hover:before {
                    background: linear-gradient(135deg, rgba(var(--color-rgb), 0.5), rgba(var(--color-rgb), 0));
                }
                .cg-company-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 0;
                    z-index: 2;
                }
                .cg-company-logo-wrapper {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    background: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    flex-shrink: 0;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(0,0,0,0.05);
                }
                .cg-company-card:hover .cg-company-logo-wrapper {
                    transform: scale(1.1) rotate(-4deg);
                    box-shadow: 0 12px 24px rgba(var(--color-rgb), 0.4);
                }
                .cg-company-logo {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                .cg-fallback-badge {
                    width: 100%;
                    height: 100%;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    color: #fff;
                    font-size: 1.1rem;
                }
                .cg-company-name {
                    color: #e2e8f0;
                    font-weight: 700;
                    font-size: 1rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    letter-spacing: -0.01em;
                    transition: color 0.3s;
                }
                .cg-company-card:hover .cg-company-name {
                    color: #fff;
                }
                .cg-card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 14px;
                    padding-top: 14px;
                    border-top: 1px solid rgba(255,255,255,0.06);
                    z-index: 2;
                }
                .cg-sheet-badge {
                    font-size: 0.7rem;
                    font-weight: 600;
                    padding: 4px 8px;
                    border-radius: 99px;
                    background: rgba(255,255,255,0.05);
                    color: var(--txt3);
                    transition: all 0.3s;
                }
                .cg-company-card:hover .cg-sheet-badge {
                    background: rgba(var(--color-rgb), 0.15);
                    color: rgba(var(--color-rgb), 1);
                }
                .cg-arrow-icon {
                    color: rgba(255,255,255,0.15);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    transform: translateX(-6px);
                    opacity: 0;
                }
                .cg-company-card:hover .cg-arrow-icon {
                    color: #fff;
                    transform: translateX(0);
                    opacity: 1;
                }
                .cg-glow-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(400px circle at var(--x) var(--y), rgba(var(--color-rgb), 0.12), transparent 40%);
                    opacity: 0;
                    transition: opacity 0.5s;
                    pointer-events: none;
                    z-index: 1;
                }
                .cg-company-card:hover .cg-glow-bg {
                    opacity: 1;
                }
            `}</style>

            <div className="cg-company-grid">
                {filteredCompanies.map(company => {
                    const hexToRgb = (hex) => {
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        return `${r}, ${g}, ${b}`;
                    };

                    const cleanColor = company.color.replace('#', '');
                    const simpleIconUrl = `https://cdn.simpleicons.org/${company.icon}/${cleanColor}`;

                    return (
                        <Link 
                            key={company.slug} 
                            to={`${basePath}/${company.slug}`} 
                            className="cg-company-card"
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const y = e.clientY - rect.top;
                                e.currentTarget.style.setProperty('--x', `${x}px`);
                                e.currentTarget.style.setProperty('--y', `${y}px`);
                            }}
                            style={{ '--color-rgb': hexToRgb(company.color) }}
                        >
                            <div className="cg-glow-bg"></div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', zIndex: 2 }}>
                                <div className="cg-company-info">
                                    <div className="cg-company-logo-wrapper">
                                        <img 
                                            src={company.logo || simpleIconUrl} 
                                            alt={company.name} 
                                            className="cg-company-logo"
                                            onError={(e) => {
                                                if (!e.target.dataset.triedFallback) {
                                                    e.target.dataset.triedFallback = true;
                                                    e.target.src = simpleIconUrl;
                                                } else {
                                                    e.target.style.display = 'none';
                                                    if(e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                }
                                            }}
                                        />
                                        <div className="cg-fallback-badge" style={{ background: company.color, display: 'none' }}>
                                            {company.name.charAt(0)}
                                        </div>
                                    </div>
                                    <span className="cg-company-name">{company.name}</span>
                                </div>
                                
                                <div className="cg-card-footer">
                                    <span className="cg-sheet-badge">Master Sheet</span>
                                    <ChevronRight className="cg-arrow-icon" size={16} />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

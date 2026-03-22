import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAllCourses, queryKeys } from '../lib/api';
import { Search, Clock, PlayCircle, BookOpen } from 'lucide-react';
import '../Courses.css';

export default function CoursesPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    const { data: courses = [], isLoading } = useQuery({
        queryKey: queryKeys.courses(),
        queryFn: fetchAllCourses,
    });

    const filteredCourses = courses.filter(c => {
        const matchesSearch = (c.name || '').toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' || 
                             (filter === 'Free' && (c.type || 'free') === 'free') || 
                             (filter === 'Paid' && (c.type || 'free') === 'paid');
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="courses-container">
            <header className="courses-header">
                <div>
                    <h1 className="courses-title">Explore Courses</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                        Premium learning paths designed for modern developers.
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="course-search-bar">
                        <Search size={18} color="rgba(255,255,255,0.4)" />
                        <input 
                            placeholder="Search courses..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {['All', 'Free', 'Paid'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: filter === f ? 'rgba(168,85,247,0.2)' : 'transparent',
                                    color: filter === f ? '#a855f7' : '#94a3b8',
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {isLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="course-card" style={{ height: '400px', opacity: 0.5 }}>
                            <div className="course-image" />
                            <div className="course-info">
                                <div style={{ height: '24px', background: 'rgba(255,255,255,0.1)', width: '70%', borderRadius: '4px', marginBottom: '12px' }} />
                                <div style={{ height: '16px', background: 'rgba(255,255,255,0.05)', width: '90%', borderRadius: '4px', marginBottom: '8px' }} />
                                <div style={{ height: '16px', background: 'rgba(255,255,255,0.05)', width: '80%', borderRadius: '4px' }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="course-grid">
                    {filteredCourses.map(course => (
                        <div 
                            key={course.id} 
                            className="course-card"
                            onClick={() => navigate(`/courses/${course.id}`)}
                        >
                            <div className="course-image">
                                <PlayCircle size={48} color="rgba(255,255,255,0.2)" />
                                <span className={`course-badge ${course.type}`}>
                                    {course.type === 'free' ? 'Free' : '🔥 Paid'}
                                </span>
                            </div>
                            
                            <div className="course-info">
                                <h3 className="course-card-title">{course.name || 'Untitled Course'}</h3>
                                <p className="course-card-desc">{course.description || 'No description available for this course.'}</p>
                                
                                <div className="course-card-footer">
                                    <div className="course-duration">
                                        <Clock size={14} />
                                        <span>{course.duration || 'N/A'}</span>
                                    </div>
                                    <div className="course-price">
                                        {(course.type || 'free') === 'free' ? 'Complementary' : `₹${course.price || 499}`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {!isLoading && filteredCourses.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
                    <BookOpen size={48} style={{ marginBottom: '1rem' }} />
                    <h3>No courses matching your search</h3>
                </div>
            )}
        </div>
    );
}

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Cpu, Layers, FileBox, Network, ChevronRight, Code2 } from 'lucide-react';

export const TOPICS = [
  { id: 'introduction', title: 'Introduction to DSA', path: '/dsa/notes/introduction', icon: BookOpen },
  { id: 'big-o', title: 'Big-O Notation', path: '/dsa/notes/big-o-notation', icon: Cpu },
  { id: 'arrays', title: 'Arrays & Strings', path: '/dsa/notes/arrays', icon: Layers },
  { id: 'linked-lists', title: 'Linked Lists', path: '/dsa/notes/linked-lists', icon: FileBox },
  { id: 'trees', title: 'Trees & Graphs', path: '/dsa/notes/trees', icon: Network },
];

const DSANotesSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '88px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
          <BookOpen size={18} color="#a855f7" />
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>DSA Chapters</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {TOPICS.map((topic, index) => {
            const isActive = location.pathname === topic.path;
            return (
              <div key={topic.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <button 
                  onClick={() => navigate(topic.path)}
                  style={{ 
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px', 
                    padding: '10px', borderRadius: '8px', border: 'none', 
                    background: isActive ? 'rgba(168,85,247,0.15)' : 'transparent', 
                    color: isActive ? '#d8b4fe' : 'rgba(255,255,255,0.6)', 
                    cursor: 'pointer', fontSize: '0.87rem', fontWeight: isActive ? 600 : 500, 
                    transition: 'all 0.2s', textAlign: 'left' 
                  }}
                  onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}
                >
                  <topic.icon size={16} />
                  <span style={{flex: 1}}>{topic.title}</span>
                  {isActive && <ChevronRight size={14} />}
                </button>
                {index < TOPICS.length - 1 && (
                  <div style={{ width: '1px', height: '10px', background: 'rgba(255,255,255,0.1)', marginLeft: '17px' }}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: 'linear-gradient(145deg, rgba(168,85,247,0.1), rgba(59,130,246,0.05))', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '16px', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', background: 'rgba(168,85,247,0.2)', filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none' }}></div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#fff' }}>Start Solving</h4>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.2rem', lineHeight: 1.4 }}>
          Ready to code? Jump into our problem set and verify your knowledge.
        </p>
        <button onClick={() => navigate('/dsaquestion')} style={{ width: '100%', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 0', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Code2 size={15} /> Open Problems
        </button>
      </div>
    </div>
  );
};

export default DSANotesSidebar;

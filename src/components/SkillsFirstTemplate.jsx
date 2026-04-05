import React, { forwardRef } from 'react';

const SkillsFirstTemplate = forwardRef(({ data }, ref) => {
  if (!data) return null;

  return (
    <div 
      ref={ref} 
      style={{
        padding: '35px 45px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#fff',
        color: '#1a1a24',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        lineHeight: 1.45,
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '16px', marginBottom: '20px', borderBottom: '3px solid #1a1a24' }}>
        <div>
          <h1 style={{ fontSize: '32px', margin: '0 0 4px 0', fontWeight: '900', color: '#1a1a24', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {data.name || 'Candidate Name'}
          </h1>
          {data.summary && (
            <p style={{ margin: 0, fontSize: '13px', color: '#4a4a5e', maxWidth: '400px', fontStyle: 'italic' }}>
              {data.summary}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right', fontSize: '13px', color: '#1a1a24', fontWeight: 600 }}>
          {(data.contact || 'contact@example.com | 123-456-7890 | linkedin.com').split(' | ').map((line, i) => (
             <div key={i} style={{ marginBottom: '2px' }}>{line}</div>
          ))}
        </div>
      </div>

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 12px 0', color: '#1a1a24', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Core Competencies
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {data.skills.map((skill, idx) => (
              <span key={idx} style={{ 
                 padding: '4px 10px', backgroundColor: '#f1f5f9', color: '#1e293b', 
                 borderRadius: '4px', fontSize: '12.5px', fontWeight: '600', border: '1px solid #cbd5e1'
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 16px 0', color: '#1a1a24', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Professional Experience
          </h2>
          {data.experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <div>
                  <span style={{ fontWeight: '800', fontSize: '14.5px', color: '#1a1a24' }}>{exp.title}</span> 
                  {exp.company && <span style={{ fontSize: '14px', color: '#4a4a5e', fontWeight: 600 }}> at {exp.company}</span>}
                </div>
                {exp.date && <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>{exp.date}</div>}
              </div>
              {exp.points && exp.points.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px', color: '#334155' }}>
                  {exp.points.map((pt, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 16px 0', color: '#1a1a24', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Technical Projects
          </h2>
          {data.projects.map((proj, idx) => (
            <div key={idx} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#1a1a24' }}>{proj.name}</div>
                {proj.date && <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>{proj.date}</div>}
              </div>
              {proj.points && proj.points.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px', color: '#334155' }}>
                  {proj.points.map((pt, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 12px 0', color: '#1a1a24', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Education
          </h2>
          {data.education.map((edu, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <div>
                <span style={{ fontWeight: '800', fontSize: '14px', color: '#1a1a24' }}>{edu.degree}</span>
                {edu.institution && <span style={{ fontSize: '14px', color: '#4a4a5e' }}>, {edu.institution}</span>}
              </div>
              {edu.date && <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>{edu.date}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default SkillsFirstTemplate;

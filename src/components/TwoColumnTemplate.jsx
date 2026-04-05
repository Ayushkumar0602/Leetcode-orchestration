import React, { forwardRef } from 'react';

const TwoColumnTemplate = forwardRef(({ data }, ref) => {
  if (!data) return null;

  return (
    <div 
      ref={ref} 
      style={{
        width: '800px',
        margin: '0 auto',
        backgroundColor: '#fff',
        color: '#111827',
        fontFamily: "'Inter', sans-serif",
        lineHeight: 1.5,
        display: 'flex',
        boxSizing: 'border-box'
      }}
    >
      {/* Left Sidebar */}
      <div style={{ width: '32%', padding: '30px 25px', backgroundColor: '#f3f4f6', borderRight: '1px solid #e5e7eb' }}>
        <h1 style={{ fontSize: '24px', margin: '0 0 16px 0', fontWeight: '800', color: '#1f2937', lineHeight: 1.2 }}>
          {data.name || 'Candidate Name'}
        </h1>
        
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Contact</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#374151', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
            {(data.contact || 'contact@example.com | 123-456-7890').split(' | ').join('\n')}
          </p>
        </div>

        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>Skills</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.skills.map((skill, idx) => (
                <div key={idx} style={{ fontSize: '12.5px', color: '#374151', padding: '4px 0', borderBottom: '1px solid #e5e7eb' }}>
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.education && data.education.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
             <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>Education</h3>
             {data.education.map((edu, idx) => (
               <div key={idx} style={{ marginBottom: '12px' }}>
                 <div style={{ fontWeight: '700', fontSize: '13px', color: '#1f2937' }}>{edu.degree}</div>
                 <div style={{ fontSize: '12.5px', color: '#4b5563' }}>{edu.institution}</div>
                 {edu.date && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{edu.date}</div>}
               </div>
             ))}
          </div>
        )}
      </div>

      {/* Right Content */}
      <div style={{ width: '68%', padding: '30px 40px' }}>
        {data.summary && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '2px solid #111827', paddingBottom: '6px', margin: '0 0 12px 0', color: '#111827' }}>
              PROFILE
            </h2>
             <p style={{ margin: 0, fontSize: '13.5px', color: '#374151', lineHeight: 1.6 }}>{data.summary}</p>
          </div>
        )}

        {data.experience && data.experience.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '2px solid #111827', paddingBottom: '6px', margin: '0 0 16px 0', color: '#111827' }}>
              WORK EXPERIENCE
            </h2>
            {data.experience.map((exp, idx) => (
              <div key={idx} style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <div style={{ fontWeight: '800', fontSize: '15px', color: '#111827' }}>{exp.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4b5563', marginTop: '2px' }}>
                     <span style={{ fontWeight: '600' }}>{exp.company}</span>
                     <span>{exp.date}</span>
                  </div>
                </div>
                {exp.points && exp.points.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#374151' }}>
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
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '2px solid #111827', paddingBottom: '6px', margin: '0 0 16px 0', color: '#111827' }}>
              KEY PROJECTS
            </h2>
            {data.projects.map((proj, idx) => (
               <div key={idx} style={{ marginBottom: '16px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                   <div style={{ fontWeight: '800', fontSize: '14px', color: '#111827' }}>{proj.name}</div>
                   <div style={{ fontSize: '13px', color: '#4b5563' }}>{proj.date}</div>
                 </div>
                 {proj.points && proj.points.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#374151' }}>
                    {proj.points.map((pt, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{pt}</li>
                    ))}
                  </ul>
                 )}
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default TwoColumnTemplate;

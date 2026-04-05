import React, { forwardRef } from 'react';

const SectionBoxedTemplate = forwardRef(({ data }, ref) => {
  if (!data) return null;

  return (
    <div 
      ref={ref} 
      style={{
        padding: '30px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#f8fafc',
        color: '#334155',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        lineHeight: 1.5,
        boxSizing: 'border-box'
      }}
    >
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
        <h1 style={{ fontSize: '26px', margin: '0 0 6px 0', fontWeight: '800', color: '#0f172a' }}>
          {data.name || 'Candidate Name'}
        </h1>
        <p style={{ margin: '0', fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
          {data.contact || 'contact@example.com | 123-456-7890 | linkedin.com/in/example'}
        </p>
      </div>

      {data.summary && (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 8px 0', color: '#0f172a', textTransform: 'uppercase' }}>
            Professional Summary
          </h2>
          <p style={{ margin: 0, fontSize: '13.5px' }}>{data.summary}</p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 12px 0', color: '#0f172a', textTransform: 'uppercase' }}>
            Work Experience
          </h2>
          {data.experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: idx === data.experience.length - 1 ? '0' : '16px', paddingBottom: idx === data.experience.length - 1 ? '0' : '16px', borderBottom: idx === data.experience.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <div>
                  <span style={{ fontWeight: '800', fontSize: '14.5px', color: '#0f172a' }}>{exp.title}</span> 
                  {exp.company && <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 600 }}> | {exp.company}</span>}
                </div>
                {exp.date && <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 700 }}>{exp.date}</div>}
              </div>
              {exp.points && exp.points.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px' }}>
                  {exp.points.map((pt, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px' }}>
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.projects && data.projects.length > 0 && (
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 12px 0', color: '#0f172a', textTransform: 'uppercase' }}>
                  Projects
                </h2>
                {data.projects.map((proj, idx) => (
                  <div key={idx} style={{ marginBottom: idx === data.projects.length - 1 ? '0' : '12px' }}>
                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>{proj.name}</div>
                    {proj.date && <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>{proj.date}</div>}
                    {proj.points && proj.points.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px' }}>
                        {proj.points.map((pt, i) => (
                          <li key={i} style={{ marginBottom: '2px' }}>{pt}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
         </div>

         <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.skills && data.skills.length > 0 && (
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 10px 0', color: '#0f172a', textTransform: 'uppercase' }}>
                  Skills
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                   {data.skills.map((skill, idx) => (
                      <span key={idx} style={{ padding: '4px 8px', backgroundColor: '#f1f5f9', color: '#334155', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                         {skill}
                      </span>
                   ))}
                </div>
              </div>
            )}

            {data.education && data.education.length > 0 && (
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 10px 0', color: '#0f172a', textTransform: 'uppercase' }}>
                  Education
                </h2>
                {data.education.map((edu, idx) => (
                  <div key={idx} style={{ marginBottom: idx === data.education.length - 1 ? '0' : '10px' }}>
                    <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#0f172a' }}>{edu.degree}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{edu.institution}</div>
                    {edu.date && <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>{edu.date}</div>}
                  </div>
                ))}
              </div>
            )}
         </div>
      </div>
    </div>
  );
});

export default SectionBoxedTemplate;

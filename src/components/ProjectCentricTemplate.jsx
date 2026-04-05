import React, { forwardRef } from 'react';

const ProjectCentricTemplate = forwardRef(({ data }, ref) => {
  if (!data) return null;

  return (
    <div 
      ref={ref} 
      style={{
        padding: '40px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#fff',
        color: '#1c1917',
        fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        lineHeight: 1.5,
        boxSizing: 'border-box'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', fontWeight: '800', color: '#1c1917' }}>
          {data.name || 'Candidate Name'}
        </h1>
        <p style={{ margin: '0 0 12px 0', fontSize: '13.5px', color: '#44403c', fontWeight: 500 }}>
          {data.contact || 'contact@example.com | 123-456-7890 | linkedin.com/in/example'}
        </p>
        {data.summary && (
          <p style={{ margin: '0 auto', maxWidth: '650px', fontSize: '13.5px', color: '#57534e', lineHeight: 1.6 }}>
             {data.summary}
          </p>
        )}
      </div>

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#44403c', fontWeight: 600 }}>
             <span style={{ color: '#000', fontWeight: 800 }}>TECH STACK: </span>
             {data.skills.join(' • ')}
          </p>
        </div>
      )}

      {/* Projects First! */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid #d6d3d1', color: '#292524', margin: '0 0 12px 0', paddingBottom: '4px' }}>
            KEY PROJECTS
          </h2>
          {data.projects.map((proj, idx) => (
            <div key={idx} style={{ marginBottom: '16px', paddingLeft: '8px', borderLeft: '2px solid #a8a29e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <div style={{ fontWeight: '800', fontSize: '15px', color: '#292524' }}>{proj.name}</div>
                {proj.date && <div style={{ fontSize: '13px', color: '#78716c', fontWeight: 600 }}>{proj.date}</div>}
              </div>
              {proj.points && proj.points.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: '#44403c' }}>
                  {proj.points.map((pt, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Experience Second */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid #d6d3d1', color: '#292524', margin: '0 0 12px 0', paddingBottom: '4px' }}>
            EXPERIENCE
          </h2>
          {data.experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <div>
                  <span style={{ fontWeight: '800', fontSize: '15px', color: '#292524' }}>{exp.title}</span> 
                  {exp.company && <span style={{ fontSize: '14.5px', color: '#57534e', fontWeight: 600 }}> | {exp.company}</span>}
                </div>
                {exp.date && <div style={{ fontSize: '13px', color: '#78716c', fontWeight: 600 }}>{exp.date}</div>}
              </div>
              {exp.points && exp.points.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: '#44403c' }}>
                  {exp.points.map((pt, i) => (
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
          <h2 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid #d6d3d1', color: '#292524', margin: '0 0 12px 0', paddingBottom: '4px' }}>
            EDUCATION
          </h2>
          {data.education.map((edu, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <div>
                <span style={{ fontWeight: '800', fontSize: '14.5px', color: '#292524' }}>{edu.degree}</span>
                {edu.institution && <span style={{ fontSize: '14px', color: '#57534e' }}> | {edu.institution}</span>}
              </div>
              {edu.date && <div style={{ fontSize: '13px', color: '#78716c', fontWeight: 600 }}>{edu.date}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default ProjectCentricTemplate;

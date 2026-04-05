import React, { forwardRef } from 'react';

const CompactDenseTemplate = forwardRef(({ data }, ref) => {
  if (!data) return null;

  // Ultra-compact styling explicitly designed to jam maximum content into 1 page
  return (
    <div 
      ref={ref} 
      style={{
        padding: '20px 25px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#fff',
        color: '#000',
        fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
        lineHeight: 1.25,
        boxSizing: 'border-box'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h1 style={{ fontSize: '20px', margin: '0 0 2px 0', fontWeight: 'bold' }}>
          {data.name?.toUpperCase() || 'CANDIDATE NAME'}
        </h1>
        <p style={{ margin: '0', fontSize: '11px' }}>
          {data.contact || 'contact@example.com | 123-456-7890 | linkedin.com/in/example'}
        </p>
      </div>

      {data.summary && (
        <div style={{ marginBottom: '8px' }}>
          <p style={{ margin: 0, fontSize: '11px' }}><strong>SUMMARY:</strong> {data.summary}</p>
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <p style={{ margin: 0, fontSize: '11px' }}>
            <strong style={{ borderBottom: '1px solid #000' }}>SKILLS:</strong> {data.skills.join(', ')}
          </p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #000', margin: '0 0 4px 0' }}>
            EXPERIENCE
          </h2>
          {data.experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '11.5px' }}>
                  <span style={{ fontWeight: 'bold' }}>{exp.title}</span> 
                  {exp.company && <span> | {exp.company}</span>}
                </div>
                {exp.date && <div style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{exp.date}</div>}
              </div>
              {exp.points && exp.points.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', marginTop: '1px' }}>
                  {exp.points.map((pt, i) => (
                    <li key={i} style={{ marginBottom: '1px' }}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #000', margin: '0 0 4px 0' }}>
            PROJECTS
          </h2>
          {data.projects.map((proj, idx) => (
            <div key={idx} style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11.5px' }}>{proj.name}</div>
                {proj.date && <div style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{proj.date}</div>}
              </div>
              {proj.points && proj.points.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', marginTop: '1px' }}>
                  {proj.points.map((pt, i) => (
                    <li key={i} style={{ marginBottom: '1px' }}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: '6px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #000', margin: '0 0 4px 0' }}>
            EDUCATION
          </h2>
          {data.education.map((edu, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
              <div style={{ fontSize: '11px' }}>
                <span style={{ fontWeight: 'bold' }}>{edu.degree}</span>
                {edu.institution && <span>, {edu.institution}</span>}
              </div>
              {edu.date && <div style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{edu.date}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default CompactDenseTemplate;

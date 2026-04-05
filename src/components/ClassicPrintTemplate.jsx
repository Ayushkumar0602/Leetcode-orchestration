import React, { forwardRef } from 'react';

const ClassicPrintTemplate = forwardRef(({ data }, ref) => {
  if (!data) return null;

  return (
    <div 
      ref={ref} 
      style={{
        padding: '40px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#fff',
        color: '#000',
        fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        lineHeight: 1.5,
        boxSizing: 'border-box'
      }}
    >
      {/* Header section */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', margin: '0 0 5px 0', fontWeight: 'bold' }}>
          {data.name || 'Candidate Name'}
        </h1>
        <p style={{ margin: '0', fontSize: '13px', color: '#333' }}>
          {data.contact || 'contact@example.com | 123-456-7890 | linkedin.com/in/example'}
        </p>
      </div>

      {/* Summary section */}
      {data.summary && (
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', borderBottom: '1px solid #000', margin: '0 0 6px 0', paddingBottom: '3px' }}>
            PROFESSIONAL SUMMARY
          </h2>
          <p style={{ margin: 0, fontSize: '13px' }}>{data.summary}</p>
        </div>
      )}

      {/* Skills section */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', borderBottom: '1px solid #000', margin: '0 0 6px 0', paddingBottom: '3px' }}>
            TECHNICAL SKILLS
          </h2>
          <p style={{ margin: 0, fontSize: '13px' }}>
            {data.skills.join(' • ')}
          </p>
        </div>
      )}

      {/* Experience section */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', borderBottom: '1px solid #000', margin: '0 0 6px 0', paddingBottom: '3px' }}>
            EXPERIENCE
          </h2>
          {data.experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{exp.title}</span> 
                  {exp.company && <span style={{ fontSize: '13px' }}> | {exp.company}</span>}
                </div>
                {exp.date && <div style={{ fontSize: '13px', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '10px' }}>{exp.date}</div>}
              </div>
              {exp.points && exp.points.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                  {exp.points.map((pt, i) => (
                    <li key={i} style={{ marginBottom: '3px' }}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects section */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', borderBottom: '1px solid #000', margin: '0 0 6px 0', paddingBottom: '3px' }}>
            PROJECTS
          </h2>
          {data.projects.map((proj, idx) => (
            <div key={idx} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{proj.name}</div>
                {proj.date && <div style={{ fontSize: '13px', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '10px' }}>{proj.date}</div>}
              </div>
              {proj.points && proj.points.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                  {proj.points.map((pt, i) => (
                    <li key={i} style={{ marginBottom: '3px' }}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education section */}
      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', borderBottom: '1px solid #000', margin: '0 0 6px 0', paddingBottom: '3px' }}>
            EDUCATION
          </h2>
          {data.education.map((edu, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{edu.institution}</span>
                {edu.degree && <span style={{ fontSize: '13px' }}> | {edu.degree}</span>}
              </div>
              {edu.date && <div style={{ fontSize: '13px', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '10px' }}>{edu.date}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default ClassicPrintTemplate;

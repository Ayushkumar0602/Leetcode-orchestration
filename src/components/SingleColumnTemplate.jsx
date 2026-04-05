import React, { forwardRef } from 'react';

const SingleColumnTemplate = forwardRef(({ data }, ref) => {
  if (!data) return null;

  return (
    <div 
      ref={ref} 
      style={{
        padding: '35px 40px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#fff',
        color: '#1a1a1a',
        fontFamily: "'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        lineHeight: 1.45,
        boxSizing: 'border-box'
      }}
    >
      <div style={{ paddingBottom: '16px', marginBottom: '20px', borderBottom: '2px solid #2d3748' }}>
        <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', fontWeight: '800', color: '#1a202c', letterSpacing: '-0.5px' }}>
          {data.name || 'Candidate Name'}
        </h1>
        <p style={{ margin: '0', fontSize: '14px', color: '#4a5568', fontWeight: 500 }}>
          {data.contact || 'contact@example.com | 123-456-7890 | linkedin.com/in/example'}
        </p>
      </div>

      {data.summary && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 8px 0', color: '#2d3748', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Professional Summary
          </h2>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#2d3748' }}>{data.summary}</p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px 0', color: '#2d3748', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Experience
          </h2>
          {data.experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <div style={{ fontWeight: '700', fontSize: '14.5px', color: '#1a202c' }}>
                  {exp.title} {exp.company && <span style={{ fontWeight: '500', color: '#4a5568' }}>| {exp.company}</span>}
                </div>
                {exp.date && <div style={{ fontSize: '13px', color: '#718096', fontWeight: 500 }}>{exp.date}</div>}
              </div>
              {exp.points && exp.points.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#4a5568' }}>
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
          <h2 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px 0', color: '#2d3748', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Projects
          </h2>
          {data.projects.map((proj, idx) => (
            <div key={idx} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a202c' }}>{proj.name}</div>
                {proj.date && <div style={{ fontSize: '13px', color: '#718096', fontWeight: 500 }}>{proj.date}</div>}
              </div>
              {proj.points && proj.points.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#4a5568' }}>
                  {proj.points.map((pt, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 8px 0', color: '#2d3748', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Technical Skills
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#4a5568', lineHeight: 1.6 }}>
            {data.skills.join(' • ')}
          </p>
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px 0', color: '#2d3748', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Education
          </h2>
          {data.education.map((edu, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <div style={{ fontSize: '14px', color: '#1a202c' }}>
                <span style={{ fontWeight: '700' }}>{edu.institution}</span>
                {edu.degree && <span style={{ color: '#4a5568' }}> | {edu.degree}</span>}
              </div>
              {edu.date && <div style={{ fontSize: '13px', color: '#718096', fontWeight: 500 }}>{edu.date}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default SingleColumnTemplate;

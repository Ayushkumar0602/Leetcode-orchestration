import React, { forwardRef } from 'react';

const TimelineBasedTemplate = forwardRef(({ data }, ref) => {
  if (!data) return null;

  return (
    <div 
      ref={ref} 
      style={{
        padding: '40px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#fff',
        color: '#18181b',
        fontFamily: "'Inter', sans-serif",
        lineHeight: 1.5,
        boxSizing: 'border-box'
      }}
    >
      <div style={{ borderBottom: '1px solid #e4e4e7', paddingBottom: '20px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '30px', margin: '0 0 8px 0', fontWeight: '800', color: '#09090b', letterSpacing: '-0.5px' }}>
          {data.name || 'Candidate Name'}
        </h1>
        <p style={{ margin: '0', fontSize: '13.5px', color: '#52525b', fontWeight: 500 }}>
          {data.contact || 'contact@example.com | 123-456-7890 | linkedin.com/in/example'}
        </p>
      </div>

      {data.summary && (
        <div style={{ marginBottom: '28px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#3f3f46', lineHeight: 1.6 }}>{data.summary}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px' }}>
         <div style={{ flex: '0 0 65%' }}>
            {data.experience && data.experience.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#09090b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                  Experience
                </h2>
                <div style={{ borderLeft: '2px solid #e4e4e7', paddingLeft: '20px', position: 'relative' }}>
                   {data.experience.map((exp, idx) => (
                     <div key={idx} style={{ marginBottom: '20px', position: 'relative' }}>
                       {/* Timeline Dot */}
                       <div style={{ position: 'absolute', left: '-27px', top: '4px', width: '12px', height: '12px', backgroundColor: '#fff', border: '2px solid #09090b', borderRadius: '50%' }}></div>
                       
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                         <div style={{ fontWeight: '700', fontSize: '15px', color: '#09090b' }}>{exp.title}</div>
                         {exp.date && <div style={{ fontSize: '13px', color: '#71717a', fontWeight: 600 }}>{exp.date}</div>}
                       </div>
                       {exp.company && <div style={{ fontSize: '14px', color: '#52525b', fontWeight: 600, marginBottom: '6px' }}>{exp.company}</div>}
                       {exp.points && exp.points.length > 0 && (
                         <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13.5px', color: '#3f3f46' }}>
                           {exp.points.map((pt, i) => (
                             <li key={i} style={{ marginBottom: '4px' }}>{pt}</li>
                           ))}
                         </ul>
                       )}
                     </div>
                   ))}
                </div>
              </div>
            )}

            {data.projects && data.projects.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#09090b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                  Projects
                </h2>
                <div style={{ borderLeft: '2px solid #e4e4e7', paddingLeft: '20px', position: 'relative' }}>
                   {data.projects.map((proj, idx) => (
                     <div key={idx} style={{ marginBottom: '16px', position: 'relative' }}>
                       <div style={{ position: 'absolute', left: '-26px', top: '4px', width: '10px', height: '10px', backgroundColor: '#e4e4e7', borderRadius: '50%' }}></div>
                       
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                         <div style={{ fontWeight: '700', fontSize: '14.5px', color: '#09090b' }}>{proj.name}</div>
                         {proj.date && <div style={{ fontSize: '13px', color: '#71717a', fontWeight: 600 }}>{proj.date}</div>}
                       </div>
                       {proj.points && proj.points.length > 0 && (
                         <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13.5px', color: '#3f3f46' }}>
                           {proj.points.map((pt, i) => (
                             <li key={i} style={{ marginBottom: '4px' }}>{pt}</li>
                           ))}
                         </ul>
                       )}
                     </div>
                   ))}
                </div>
              </div>
            )}
         </div>

         <div style={{ flex: '1' }}>
            {data.skills && data.skills.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#09090b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  Core Skills
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.skills.map((skill, idx) => (
                    <div key={idx} style={{ fontSize: '13.5px', color: '#3f3f46', fontWeight: 500, display: 'flex', alignItems: 'flex-start' }}>
                       <span style={{ color: '#a1a1aa', marginRight: '8px' }}>▹</span> {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.education && data.education.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#09090b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  Education
                </h2>
                {data.education.map((edu, idx) => (
                  <div key={idx} style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#09090b' }}>{edu.degree}</div>
                    <div style={{ fontSize: '13px', color: '#52525b', marginTop: '2px' }}>{edu.institution}</div>
                    {edu.date && <div style={{ fontSize: '12.5px', color: '#a1a1aa', fontWeight: 600, marginTop: '2px' }}>{edu.date}</div>}
                  </div>
                ))}
              </div>
            )}
         </div>
      </div>
    </div>
  );
});

export default TimelineBasedTemplate;

import React, { forwardRef } from 'react';

const HeaderFocusedTemplate = forwardRef(({ data }, ref) => {
  if (!data) return null;

  return (
    <div 
      ref={ref} 
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#fff',
        color: '#222',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        lineHeight: 1.5,
        boxSizing: 'border-box'
      }}
    >
      {/* Heavy Header Background */}
      <div style={{ backgroundColor: '#1e293b', color: '#fff', padding: '35px 40px', boxSizing: 'border-box' }}>
         <h1 style={{ fontSize: '32px', margin: '0 0 10px 0', fontWeight: '800', letterSpacing: '1px' }}>
           {data.name || 'Candidate Name'}
         </h1>
         <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>
           {data.contact || 'contact@example.com | 123-456-7890 | linkedin.com/in/example'}
         </p>
         {data.summary && (
           <p style={{ margin: 0, fontSize: '14px', color: '#f1f5f9', lineHeight: 1.6, maxWidth: '90%' }}>
              {data.summary}
           </p>
         )}
      </div>

      <div style={{ padding: '30px 40px' }}>
        {data.experience && data.experience.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
             <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center' }}>
                <span style={{ backgroundColor: '#0f172a', width: '24px', height: '4px', display: 'inline-block', marginRight: '12px' }}></span>
                PROFESSIONAL EXPERIENCE
             </h2>
             {data.experience.map((exp, idx) => (
                <div key={idx} style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div>
                      <span style={{ fontWeight: '700', fontSize: '15.5px', color: '#0f172a' }}>{exp.title}</span>
                      {exp.company && <span style={{ fontSize: '14.5px', color: '#475569', marginLeft: '6px' }}>| {exp.company}</span>}
                    </div>
                    {exp.date && <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{exp.date}</div>}
                  </div>
                  {exp.points && exp.points.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: '#334155' }}>
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
          <div style={{ marginBottom: '24px' }}>
             <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center' }}>
                <span style={{ backgroundColor: '#0f172a', width: '24px', height: '4px', display: 'inline-block', marginRight: '12px' }}></span>
                PROJECT HIGHLIGHTS
             </h2>
             {data.projects.map((proj, idx) => (
               <div key={idx} style={{ marginBottom: '14px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>{proj.name}</div>
                    {proj.date && <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{proj.date}</div>}
                 </div>
                 {proj.points && proj.points.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: '#334155' }}>
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
          <div style={{ marginBottom: '24px' }}>
             <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center' }}>
                <span style={{ backgroundColor: '#0f172a', width: '24px', height: '4px', display: 'inline-block', marginRight: '12px' }}></span>
                TECHNICAL EXPERTISE
             </h2>
             <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, paddingLeft: '36px' }}>
               {data.skills.join(' • ')}
             </div>
          </div>
        )}

        {data.education && data.education.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
             <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center' }}>
                <span style={{ backgroundColor: '#0f172a', width: '24px', height: '4px', display: 'inline-block', marginRight: '12px' }}></span>
                EDUCATION
             </h2>
             <div style={{ paddingLeft: '36px' }}>
               {data.education.map((edu, idx) => (
                 <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                   <div>
                     <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>{edu.institution}</div>
                     {edu.degree && <div style={{ fontSize: '14px', color: '#475569' }}>{edu.degree}</div>}
                   </div>
                   {edu.date && <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{edu.date}</div>}
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default HeaderFocusedTemplate;

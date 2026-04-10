import { Link } from 'react-router-dom';

export default function ScrapperPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080b14',
        color: 'var(--txt)',
        fontFamily: "'Inter', sans-serif",
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '2rem',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>Scrapper Page</h1>
        <p style={{ marginTop: '0.75rem', color: 'var(--txt3)', lineHeight: 1.6 }}>
          This page is ready at <code>/scrapper</code>. Tell me what you want to build here next.
        </p>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-block',
            marginTop: '1rem',
            color: 'var(--accent)',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

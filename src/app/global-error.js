'use client';

// Last-resort boundary for errors in the root layout itself. Must render its own <html>/<body>.
export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif', background: '#fafafa' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ maxWidth: 420, textAlign: 'center' }}>
            <h1 style={{ fontSize: 24, color: '#222', marginBottom: 12 }}>Kite Brand Pakistan</h1>
            <p style={{ color: '#666', marginBottom: 24 }}>The site hit an unexpected error. Please reload the page.</p>
            <button
              type="button"
              onClick={() => reset()}
              style={{ padding: '10px 20px', borderRadius: 8, border: 0, background: '#00AEEF', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

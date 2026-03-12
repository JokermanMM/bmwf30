export default function Footer() {
  return (
    <footer className="glass" style={{ padding: '2rem 0', marginTop: 'auto', textAlign: 'center', borderTop: '1px solid var(--border-light)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div className="m-stripes" style={{ height: '8px' }}>
            <div className="stripe light-blue"></div>
            <div className="stripe dark-blue"></div>
            <div className="stripe red"></div>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          © {new Date().getFullYear()} BMW F30 Project. Crafted with precision & code.
        </p>
      </div>
    </footer>
  );
}

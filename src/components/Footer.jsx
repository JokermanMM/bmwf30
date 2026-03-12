export default function Footer() {
  return (
    <footer className="glass" style={{ padding: '3rem 0', marginTop: 'auto', textAlign: 'center', borderTop: '1px solid var(--border-light)', background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '1.5rem' }}>
          <div className="m-stripes" style={{ height: '10px' }}>
            <div className="stripe light-blue"></div>
            <div className="stripe dark-blue"></div>
            <div className="stripe red"></div>
          </div>
          <span style={{ fontSize: '1.2rem', cursor: 'help' }} title="Скоро: Секретный раздел для рыбаков 🎣">🎣</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '500' }}>
          © {new Date().getFullYear()} Проект BMW F30. Баварская инженерия, летнее небо и код.
        </p>
      </div>
    </footer>
  );
}

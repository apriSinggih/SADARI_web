export default function Contact() {
  return (
    <div className="card container" style={{ maxWidth: 640, textAlign: 'left', margin: '0 auto', padding: '20px' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Hubungi Kami</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 20 }}>
        Untuk pertanyaan, informasi lebih lanjut, atau bantuan mengenai aplikasi SADARI:
      </p>
      
      <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(232, 122, 144, 0.2)', borderRadius: 16, padding: '20px' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: 1.8 }}>
          {/* Perbaikan pada style li: flexWrap dan wordBreak */}
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', wordBreak: 'break-word', marginBottom: 12 }}>
            <span>✉️</span> 
            <div style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
              <strong>Nama Pengembang 1:</strong> email@example.com
            </div>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', wordBreak: 'break-word' }}>
            <span>✉️</span> 
            <div style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
              <strong>Nama Pengembang 2:</strong> email2@example.com
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
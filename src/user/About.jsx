export default function About() {
  return (
    <div className="card container" style={{ maxWidth: 740, margin: '0 auto', padding: '32px' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: 12, textAlign: 'left' }}>Tentang SADARI</h3>

      {/* Teks Deskripsi Rata Kanan-Kiri */}
      <p style={{ lineHeight: 1.7, fontSize: '1rem', color: 'var(--text-body)', marginBottom: 20, textAlign: 'justify' }}>
        SADARI adalah aplikasi edukasi interaktif modul SADARI (Periksa Payudara Sendiri) yang dirancang untuk meningkatkan
        kesadaran dan kemampuan deteksi dini pada masyarakat secara mandiri dan efektif.
      </p>

      <h4 style={{ color: 'var(--pink-primary-dark)', marginTop: 24, marginBottom: 10, textAlign: 'left' }}>Dosen Pembimbing:</h4>
      <ul style={{ paddingLeft: 20, lineHeight: 1.8, margin: '0 0 24px 0', textAlign: 'left' }}>
        <li>Dr. Finta Isti Kundarti, M.Keb</li>
      </ul>

      <h4 style={{ color: 'var(--pink-primary-dark)', marginTop: 20, marginBottom: 10, textAlign: 'left' }}>Disusun oleh :</h4>
      <ul style={{ paddingLeft: 20, lineHeight: 1.8, margin: 0, textAlign: 'left' }}>
        <li>Linda May Selfisina</li>
        <li>Made Dyah Kun Anjarwati</li>
        <li>Marizzka Mutiara Islami</li>
        <li>Maulida Aprilia Rahma</li>
        <li>Mutiara Kusumaningrum</li>
        <li>Nadhila Nurin Shabrina</li>
        <li>Nanda Sintia Dewi</li>
      </ul>
    </div>
  )
}

import { useEffect, useState } from 'react'
import AdminMaterials from './AdminMaterials'
import AdminQuestions from './AdminQuestions'
import AdminParticipants from './AdminParticipants'
import AdminBioConfig from './AdminBioConfig' // 1. Import komponen AdminBioConfig

export default function AdminDashboard({ supabase, onLogout }) {
  const initialTab = (typeof window !== 'undefined' && localStorage.getItem('admin_tab')) || 'materials'
  const [tab, setTab] = useState(initialTab)

  useEffect(() => {
    try { localStorage.setItem('admin_tab', tab) } catch (e) { /* ignore */ }
  }, [tab])

  return (
    <div>
      <header className="header-bar">
        <h2 className="header-title">
          SADARI — Admin Dashboard
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => window.location.href = '/'} style={{ fontSize: '0.88rem' }}>
            🏠 Web Utama
          </button>
          <button className="btn btn-ghost" onClick={onLogout} style={{ fontSize: '0.88rem' }}>
            🚪 Logout
          </button>
        </div>
      </header>

      <nav className="tabs">
        <button className={`tab-btn ${tab === 'materials' ? 'active' : ''}`} onClick={() => setTab('materials')}>
          📚 Materi
        </button>
        <button className={`tab-btn ${tab === 'questions' ? 'active' : ''}`} onClick={() => setTab('questions')}>
          ❓ Bank Soal
        </button>
        <button className={`tab-btn ${tab === 'participants' ? 'active' : ''}`} onClick={() => setTab('participants')}>
          👥 Peserta
        </button>
        {/* 2. Tambah tombol Tab untuk Config Biodata */}
        <button className={`tab-btn ${tab === 'bioconfig' ? 'active' : ''}`} onClick={() => setTab('bioconfig')}>
          ⚙️ Form Biodata
        </button>
      </nav>

      <main>
        {tab === 'materials' && <AdminMaterials supabase={supabase} />}
        {tab === 'questions' && <AdminQuestions supabase={supabase} />}
        {tab === 'participants' && <AdminParticipants supabase={supabase} />}
        {/* 3. Render komponen AdminBioConfig */}
        {tab === 'bioconfig' && <AdminBioConfig supabase={supabase} />}
      </main>
    </div>
  )
}
import { useEffect, useState } from 'react'
import AdminMaterials from './AdminMaterials'
import AdminQuestions from './AdminQuestions'
import AdminParticipants from './AdminParticipants'
import AdminBioConfig from './AdminBioConfig'

export default function AdminDashboard({ supabase, onLogout }) {
  const initialTab = (typeof window !== 'undefined' && localStorage.getItem('admin_tab')) || 'materials'
  const [tab, setTab] = useState(initialTab)

  useEffect(() => {
    try { localStorage.setItem('admin_tab', tab) } catch (e) { /* ignore */ }
  }, [tab])

  return (
    <div style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Header Bar Responsif */}
      <header className="header-bar" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        gap: '12px'
      }}>
        <h2 className="header-title" style={{ fontSize: '1.1rem', margin: 0 }}>
          SADARI — Admin
        </h2>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost" onClick={() => window.location.href = '/'} style={{ fontSize: '0.8rem', padding: '6px 10px' }}>
            🏠 Web Utama
          </button>
          <button className="btn btn-ghost" onClick={onLogout} style={{ fontSize: '0.8rem', padding: '6px 10px' }}>
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Navigasi Tab dengan Auto Horizontal Scroll untuk Mobile */}
      <nav className="tabs" style={{
        display: 'flex',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        WebkitOverflowScrolling: 'touch',
        padding: '8px 12px',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#fff'
      }}>
        <button 
          className={`tab-btn ${tab === 'materials' ? 'active' : ''}`} 
          onClick={() => setTab('materials')}
          style={{ flexShrink: 0, padding: '8px 14px', fontSize: '0.85rem' }}
        >
          📚 Materi
        </button>
        <button 
          className={`tab-btn ${tab === 'questions' ? 'active' : ''}`} 
          onClick={() => setTab('questions')}
          style={{ flexShrink: 0, padding: '8px 14px', fontSize: '0.85rem' }}
        >
          ❓ Bank Soal
        </button>
        <button 
          className={`tab-btn ${tab === 'participants' ? 'active' : ''}`} 
          onClick={() => setTab('participants')}
          style={{ flexShrink: 0, padding: '8px 14px', fontSize: '0.85rem' }}
        >
          👥 Peserta
        </button>
        <button 
          className={`tab-btn ${tab === 'bioconfig' ? 'active' : ''}`} 
          onClick={() => setTab('bioconfig')}
          style={{ flexShrink: 0, padding: '8px 14px', fontSize: '0.85rem' }}
        >
          ⚙️ Form Biodata
        </button>
      </nav>

      <main style={{ padding: '8px' }}>
        {tab === 'materials' && <AdminMaterials supabase={supabase} />}
        {tab === 'questions' && <AdminQuestions supabase={supabase} />}
        {tab === 'participants' && <AdminParticipants supabase={supabase} />}
        {tab === 'bioconfig' && <AdminBioConfig supabase={supabase} />}
      </main>
    </div>
  )
}
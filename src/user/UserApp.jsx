import { useEffect, useState } from 'react'
import BiodataForm from './BiodataForm'
import PreTest from './PreTest'
import Learning from './Learning'
import PostTest from './PostTest'
import Results from './Results'
import HomeUser from './HomeUser'
import About from './About'
import Contact from './Contact'
import { checkAndValidatePeserta } from '../utils/pesertaUtils'
import NotificationModal from '../components/NotificationModal'

export default function UserApp({ supabase }) {
  const [route, setRoute] = useState(getSubPath())
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', onConfirm: null })

  function showAlert(title, message, type = 'info', onConfirm = null) {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    })
  }

  function handleCloseModal() {
    const cb = modal.onConfirm
    setModal({ isOpen: false, title: '', message: '', type: 'info', onConfirm: null })
    if (cb) cb()
  }

  useEffect(() => {
    const onPop = () => setRoute(getSubPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    validateParticipantSession()
  }, [route])

  async function validateParticipantSession() {
    const hasPid = Boolean(localStorage.getItem('peserta_id'))
    if (hasPid) {
      const isValid = await checkAndValidatePeserta(supabase)
      if (!isValid && route !== '/' && route !== '/about' && route !== '/contact' && route !== '/biodata') {
        showAlert(
          'Data Peserta Di-reset',
          'Data peserta Anda telah di-reset atau dihapus oleh Admin dari database. Silakan isi biodata Anda kembali.',
          'reset',
          () => navigate('/biodata')
        )
      }
    }
  }

  function navigate(path) {
    const full = `/user${path}`
    window.history.pushState({}, '', full)
    setRoute(path)
  }

  function getComponent() {
    if (route === '/') return <HomeUser supabase={supabase} navigate={navigate} showAlert={showAlert} />
    if (route === '/about') return <About />
    if (route === '/contact') return <Contact />
    if (route === '/pretest') return <PreTest supabase={supabase} navigate={navigate} showAlert={showAlert} />
    if (route === '/learning') return <Learning supabase={supabase} navigate={navigate} showAlert={showAlert} />
    if (route === '/posttest') return <PostTest supabase={supabase} navigate={navigate} showAlert={showAlert} />
    if (route === '/results') return <Results supabase={supabase} navigate={navigate} showAlert={showAlert} />
    return <BiodataForm supabase={supabase} navigate={navigate} showAlert={showAlert} />
  }

  return (
    <div>
      <header className="header-bar">
        <h2 className="header-title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          SADARI
        </h2>
        <nav className="nav-links">
          <button className={`nav-btn ${route === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>Beranda</button>
          <button className={`nav-btn ${route === '/about' ? 'active' : ''}`} onClick={() => navigate('/about')}>Tentang</button>
          <button className={`nav-btn ${route === '/contact' ? 'active' : ''}`} onClick={() => navigate('/contact')}>Kontak</button>
        </nav>
      </header>

      {getComponent()}

      <NotificationModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={handleCloseModal}
      />

      <footer style={{ marginTop: 48, padding: '16px 0', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <button
          onClick={() => window.location.href = '/admin'}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem', padding: 0 }}
        >
          Masuk ke Menu Admin ➔
        </button>
      </footer>
    </div>
  )
}

function getSubPath() {
  if (typeof window === 'undefined') return '/'
  const p = window.location.pathname.replace('/user', '')
  return p === '' ? '/' : p
}

import { useEffect, useState } from 'react'
import heroImg from '../assets/hero.png'
import defaultSupabase from '../supabaseClient'
import { calculateKnowledgeIncrease } from '../utils/scoreUtils'
import { checkAndValidatePeserta } from '../utils/pesertaUtils'

export default function HomeUser({ supabase = defaultSupabase, navigate, showAlert }) {
  const [hasHasil, setHasHasil] = useState(false)
  const [skorPre, setSkorPre] = useState(null)
  const [skorPost, setSkorPost] = useState(null)

  useEffect(() => {
    fetchLatestHasil()
  }, [])

  async function fetchLatestHasil() {
    try {
      const isValid = await checkAndValidatePeserta(supabase)
      if (!isValid) {
        setHasHasil(false)
        setSkorPre(null)
        setSkorPost(null)
        return
      }

      const pesertaId = Number(localStorage.getItem('peserta_id'))
      if (!pesertaId) return
      const { data, error } = await supabase.from('hasil_ujian').select('*').eq('peserta_id', pesertaId).order('id', { ascending: false }).limit(1)
      if (error) throw error
      const row = Array.isArray(data) && data.length > 0 ? data[0] : null
      if (row) {
        setSkorPre(row.skor_pretest ?? null)
        setSkorPost(row.skor_posttest ?? null)
        setHasHasil(true)
        localStorage.setItem('hasil_id', row.id)
      } else {
        localStorage.removeItem('hasil_id')
        setHasHasil(false)
      }
    } catch (err) {
      console.error('fetchLatestHasil', err)
    }
  }

  async function handleNavCheck(targetPath, requiresHasil = false) {
    const isValid = await checkAndValidatePeserta(supabase)
    if (!isValid) {
      if (showAlert) {
        showAlert(
          'Data Peserta Di-reset',
          'Data peserta Anda telah di-reset atau dihapus oleh Admin dari database. Silakan isi biodata Anda kembali.',
          'reset',
          () => navigate('/biodata')
        )
      } else {
        alert('Data peserta Anda tidak ditemukan di database. Silakan isi biodata kembali.')
        navigate('/biodata')
      }
      return
    }

    if (requiresHasil) {
      const hid = localStorage.getItem('hasil_id')
      if (!hid) {
        if (showAlert) {
          showAlert(
            'Pre-Test Belum Selesai',
            'Silakan selesaikan Pre-Test terlebih dahulu sebelum membuka modul ini.',
            'info',
            () => navigate('/pretest')
          )
        } else {
          alert('Silakan selesaikan Pre-Test terlebih dahulu.')
          navigate('/pretest')
        }
        return
      }
    }

    navigate(targetPath)
  }

  const increase = calculateKnowledgeIncrease(skorPre, skorPost, 10)

  return (
    <div className="card container" style={{ textAlign: 'center', padding: '36px 28px', maxWidth: 780, margin: '0 auto' }}>
      <div className="hero">
        <img src={heroImg} alt="SADARI Hero" className="base" />
      </div>
      <div className="hero-badge">🌸 Edukasi SADARI Interaktif</div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: 12, color: 'var(--text-heading)' }}>SADARI</h1>
      <p style={{ maxWidth: 580, margin: '0 auto 20px', fontSize: '1.05rem', color: 'var(--text-body)' }}>
        Modul Edukasi Interaktif SADARI (Periksa Payudara Sendiri) untuk mendukung deteksi dini secara mandiri.
      </p>

      {hasHasil ? (
        <div style={{
          background: 'var(--pink-primary-light)',
          border: '1px solid rgba(232, 122, 144, 0.25)',
          borderRadius: 16,
          padding: '14px 20px',
          margin: '16px auto',
          maxWidth: 480,
          color: 'var(--text-heading)',
          fontWeight: 600
        }}>
          <div>✅ Status: Sudah Mengisi Test</div>
          {skorPre != null && <div style={{ marginTop: 4 }}>Skor Pre-Test: <strong style={{ color: 'var(--pink-primary-dark)' }}>{skorPre} / 10</strong></div>}
          {skorPost != null && <div>Skor Post-Test: <strong style={{ color: 'var(--pink-primary-dark)' }}>{skorPost} / 10</strong></div>}
          {increase && (
            <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed rgba(232, 122, 144, 0.3)', color: 'var(--pink-primary-dark)', fontSize: '0.95rem' }}>
              📈 Persentase Peningkatan: <strong>{increase.formatted}</strong>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          background: 'rgba(232, 122, 144, 0.08)',
          border: '1px solid rgba(232, 122, 144, 0.15)',
          borderRadius: 16,
          padding: '12px 20px',
          margin: '16px auto',
          maxWidth: 480,
          color: 'var(--text-muted)',
          fontSize: '0.95rem'
        }}>
          💡 Silakan mulai Pre-Test terlebih dahulu untuk membuka Materi & Post-Test.
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
        <button className="btn btn-primary" onClick={() => handleNavCheck('/pretest')}>
          {hasHasil ? 'Ulangi Pre-Test' : 'Pre-Test'}
        </button>
        <button className="btn" onClick={() => handleNavCheck('/results')}>
          Lihat Hasil
        </button>
        <button className="btn" onClick={() => handleNavCheck('/learning', true)}>
          Materi
        </button>
        <button className="btn" onClick={() => handleNavCheck('/posttest', true)}>
          Post-Test
        </button>
      </div>
    </div>
  )
}

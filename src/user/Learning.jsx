import { useEffect, useState } from 'react'
import defaultSupabase from '../supabaseClient'
import { checkAndValidatePeserta } from '../utils/pesertaUtils'

export default function Learning({ supabase = defaultSupabase, navigate, showAlert }) {
  const [materials, setMaterials] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function init() {
      const isValid = await checkAndValidatePeserta(supabase)
      if (!isValid) {
        if (showAlert) {
          showAlert('Data Peserta Di-reset', 'Data peserta Anda tidak ditemukan di database (telah dihapus/di-reset oleh Admin). Silakan isi biodata kembali.', 'reset', () => navigate('/biodata'))
        } else {
          alert('Data peserta Anda tidak ditemukan di database. Silakan isi biodata kembali.')
          navigate('/biodata')
        }
        return
      }
      const hid = localStorage.getItem('hasil_id')
      if (!hid) {
        if (showAlert) {
          showAlert('Pre-Test Belum Selesai', 'Silakan selesaikan Pre-Test terlebih dahulu sebelum mengakses Materi.', 'info', () => navigate('/pretest'))
        } else {
          alert('Silakan selesaikan Pre-Test terlebih dahulu.')
          navigate('/pretest')
        }
        return
      }
      fetchMaterials()
    }
    init()
  }, [])

  async function fetchMaterials() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('materi').select('*').order('urutan', { ascending: true })
      if (error) throw error
      setMaterials(data || [])
      if (data && data.length) setSelectedIndex(0)
    } catch (err) {
      console.error('fetchMaterials', err)
      setMaterials([])
    } finally { setLoading(false) }
  }

  function gdriveToEmbed(url) {
    try {
      const m = url.match(/\/d\/(.*?)\//)
      const id = m ? m[1] : null
      if (id) return `https://drive.google.com/file/d/${id}/preview`
      return url
    } catch (e) { return url }
  }

  function youtubeToEmbed(url) {
    try {
      if (!url) return null
      if (url.includes('/embed/')) return url
      const m1 = url.match(/[?&]v=([^&]+)/)
      if (m1 && m1[1]) return `https://www.youtube-nocookie.com/embed/${m1[1]}`
      const m2 = url.match(/youtu\.be\/([^?&/]+)/)
      if (m2 && m2[1]) return `https://www.youtube-nocookie.com/embed/${m2[1]}`
      const m3 = url.match(/youtube\.com\/embed\/([^?&/]+)/)
      if (m3 && m3[1]) return `https://www.youtube-nocookie.com/embed/${m3[1]}`
      return null
    } catch (e) { return null }
  }

  if (loading) return <div>Loading materi...</div>

  const selected = materials[selectedIndex]
  const isLast = selectedIndex === materials.length - 1

  return (
    <div className="learning-container">
      <aside className="learning-sidebar">
        <h4 style={{ fontSize: '1.05rem', color: 'var(--text-heading)', marginBottom: 14 }}>📖 Daftar Materi</h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {materials.map((m, idx) => (
            <li key={m.id} style={{ marginBottom: 6 }}>
              <button
                className={`material-item-btn ${selectedIndex === idx ? 'active' : ''}`}
                onClick={() => setSelectedIndex(idx)}
              >
                <span style={{ fontWeight: 700, minWidth: 20 }}>{m.urutan}.</span>
                <span>{m.judul}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="card learning-content" style={{ padding: '28px' }}>
        {selected ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span className="badge" style={{ background: 'var(--pink-primary-light)', color: 'var(--pink-primary-dark)' }}>
                Materi #{selected.urutan}
              </span>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{selected.judul}</h3>
            </div>

            <div style={{ lineHeight: 1.7, color: 'var(--text-body)', marginBottom: 24, whiteSpace: 'pre-wrap' }}>
              {selected.content_type === 'text' && <div dangerouslySetInnerHTML={{ __html: selected.konten }} />}

              {selected.content_type === 'gdrive' && selected.gdrive_link && (
                <div style={{ borderRadius: 16, overflow: 'hidden' }}>
                  <iframe title={selected.judul} src={gdriveToEmbed(selected.gdrive_link)} width="100%" height="540" />
                </div>
              )}

              {selected.content_type === 'youtube' && selected.gdrive_link && (
                <div style={{ borderRadius: 16, overflow: 'hidden' }}>
                  {youtubeToEmbed(selected.gdrive_link) ? (
                    <iframe
                      title={selected.judul}
                      src={youtubeToEmbed(selected.gdrive_link)}
                      width="100%"
                      height="500"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ padding: 20, background: 'var(--pink-primary-light)', borderRadius: 16, textAlign: 'center' }}>
                      <p style={{ marginBottom: 12 }}>Link YouTube tidak dapat di-embed langsung.</p>
                      <a className="btn btn-primary" href={selected.gdrive_link} target="_blank" rel="noreferrer">
                        Buka Video di YouTube ↗
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : <div style={{ color: 'var(--text-muted)' }}>Pilih materi dari daftar di samping untuk membaca.</div>}

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(232, 122, 144, 0.15)', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => setSelectedIndex(i => Math.max(0, i - 1))} disabled={selectedIndex === 0}>
            ← Sebelumnya
          </button>
          {!isLast && (
            <button className="btn" onClick={() => setSelectedIndex(i => Math.min(materials.length - 1, i + 1))}>
              Materi Berikutnya →
            </button>
          )}
          {isLast && (
            <button className="btn btn-primary" onClick={() => navigate('/posttest')}>
              Lanjut ke Post-Test ✓
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

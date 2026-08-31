import { useEffect, useState } from 'react'

export default function AdminMaterials({ supabase }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ judul: '', konten: '', content_type: 'text', gdrive_link: '' })

  useEffect(() => {
    fetchMaterials()
  }, [])

  async function fetchMaterials() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('materi').select('*').order('urutan', { ascending: true })
      if (error) throw error
      setItems(data || [])
    } catch (err) {
      console.error('fetchMaterials', err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  function gdriveToEmbed(url) {
    try {
      const m = url.match(/\/d\/(.*?)\//)
      const id = m ? m[1] : null
      if (id) return `https://drive.google.com/file/d/${id}/preview`
      if (url.includes('preview') || url.includes('/preview')) return url
      return url
    } catch (e) {
      return url
    }
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

      let s = url
      if (s.includes('watch?v=')) s = s.replace('watch?v=', 'embed/')
      if (s.includes('youtu.be/')) s = s.replace('youtu.be/', 'www.youtube-nocookie.com/embed/')
      const part = s.split('embed/')[1]
      if (part) {
        const clean = part.split(/[?&/]/)[0]
        if (clean) return `https://www.youtube-nocookie.com/embed/${clean}`
      }
      return null
    } catch (e) { return null }
  }

  function handleStartEdit(it) {
    setEditingId(it.id)
    setForm({
      judul: it.judul || '',
      konten: it.konten || '',
      content_type: it.content_type || 'text',
      gdrive_link: it.gdrive_link || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setForm({ judul: '', konten: '', content_type: 'text', gdrive_link: '' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = { judul: form.judul, konten: form.konten, content_type: form.content_type }

    if (!editingId) {
      const nextUrutan = (items && items.length) ? Math.max(...items.map(i => Number(i.urutan || 0))) + 1 : 1
      payload.urutan = nextUrutan
    }

    try {
      if (form.content_type === 'gdrive' && form.gdrive_link) {
        payload.gdrive_link = form.gdrive_link
      }
      if (form.content_type === 'youtube' && form.gdrive_link) {
        const embed = youtubeToEmbed(form.gdrive_link)
        if (!embed) return alert('Link YouTube tidak valid untuk embed. Gunakan link video (contoh: https://youtu.be/ID atau https://www.youtube.com/watch?v=ID)')
        payload.gdrive_link = embed
      }

      if (editingId) {
        const { error } = await supabase.from('materi').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('materi').insert([payload])
        if (error) throw error
      }

      setEditingId(null)
      setForm({ judul: '', konten: '', content_type: 'text', gdrive_link: '' })
      fetchMaterials()
    } catch (err) {
      console.error('handleSubmit materi', err)
      alert(`Gagal ${editingId ? 'memperbarui' : 'menambah'} materi: ` + (err.message || err.error_description || 'error'))
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus materi ini?')) return
    const { error } = await supabase.from('materi').delete().eq('id', id)
    if (error) return alert('Gagal menghapus: ' + error.message)
    if (editingId === id) handleCancelEdit()
    fetchMaterials()
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <form className="card" onSubmit={handleSubmit} style={{ marginBottom: 28, padding: '32px', border: editingId ? '2px solid var(--pink-primary)' : undefined }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--text-heading)' }}>
            {editingId ? '✏️ Edit Data Materi' : '➕ Tambah Materi Baru'}
          </h3>
          {editingId && (
            <span className="badge" style={{ background: 'var(--pink-primary-light)', color: 'var(--pink-primary-dark)', fontWeight: 600 }}>
              Mode Edit (ID #{editingId})
            </span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label>Judul Materi</label>
            <input
              placeholder="Judul Materi SADARI"
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Tipe Konten</label>
            <select value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value })}>
              <option value="text">Teks</option>
              <option value="gdrive">GDrive (PDF / Video link)</option>
              <option value="youtube">YouTube (Video link)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          {form.content_type === 'text' && (
            <div>
              <label>Konten Singkat</label>
              <textarea
                rows={4}
                placeholder="Masukkan penjelasan materi..."
                value={form.konten}
                onChange={(e) => setForm({ ...form, konten: e.target.value })}
              />
            </div>
          )}
          {form.content_type === 'gdrive' && (
            <div>
              <label>Link Google Drive</label>
              <input
                placeholder="https://drive.google.com/file/d/.../view"
                value={form.gdrive_link}
                onChange={(e) => setForm({ ...form, gdrive_link: e.target.value })}
              />
            </div>
          )}
          {form.content_type === 'youtube' && (
            <div>
              <label>Link YouTube Video</label>
              <input
                placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                value={form.gdrive_link}
                onChange={(e) => setForm({ ...form, gdrive_link: e.target.value })}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
          {editingId && (
            <button className="btn btn-ghost" type="button" onClick={handleCancelEdit}>
              ❌ Batal Edit
            </button>
          )}
          <button className="btn btn-primary" type="submit">
            {editingId ? '💾 Simpan Perubahan' : '+ Tambah Materi'}
          </button>
        </div>
      </form>

      <h3 style={{ fontSize: '1.25rem', marginBottom: 16 }}>📚 Daftar Materi ({items.length})</h3>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading materi...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map(it => (
            <div key={it.id} className="card" style={{ padding: '20px', border: editingId === it.id ? '2px solid var(--pink-primary)' : undefined }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between', // Fix: ubah 'justify' menjadi 'justifyContent'
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 12
              }}>
                {/* Bagian Kiri: Urutan, Judul, & Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: '1 1 250px' }}>
                  <span className="badge" style={{ background: 'var(--pink-primary-light)', color: 'var(--pink-primary-dark)' }}>
                    #{it.urutan}
                  </span>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', wordBreak: 'break-word' }}>{it.judul}</h4>
                  <span className="badge" style={{ background: 'rgba(232, 122, 144, 0.1)', color: 'var(--text-body)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    {it.content_type}
                  </span>
                </div>

                {/* Bagian Kanan: Tombol Edit & Hapus */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 'auto' }}>
                  <button
                    onClick={() => handleStartEdit(it)}
                    style={{
                      background: 'var(--pink-primary-light)',
                      color: 'var(--pink-primary-dark)',
                      border: '1px solid rgba(232, 122, 144, 0.3)',
                      padding: '6px 14px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(it.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#B91C1C',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      padding: '6px 14px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </div>

              <div>
                {it.content_type === 'text' && (
                  <div
                    style={{
                      fontSize: '0.95rem',
                      color: 'var(--text-body)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      textAlign: 'justify' // <-- DITAMBAHKAN RATA KANAN KIRI DI SINI
                    }}
                  >
                    {it.konten}
                  </div>
                )}
                {it.content_type === 'gdrive' && it.gdrive_link && (
                  <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden' }}>
                    <iframe title={it.judul} src={gdriveToEmbed(it.gdrive_link)} width="100%" height="320" />
                  </div>
                )}
                {it.content_type === 'youtube' && it.gdrive_link && (
                  <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden' }}>
                    <iframe
                      title={it.judul}
                      src={youtubeToEmbed(it.gdrive_link)}
                      width="100%"
                      height="320"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

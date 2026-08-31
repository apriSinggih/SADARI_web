import { useEffect, useState } from 'react'

export default function AdminQuestions({ supabase }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ tipe: 'pretest', pertanyaan: '', pilihan_a: '', pilihan_b: '', pilihan_c: '', pilihan_d: '', jawaban_benar: 'A' })

  useEffect(() => { fetchQuestions() }, [])

  async function fetchQuestions() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('soal').select('*').order('id', { ascending: true })
      if (error) throw error
      setItems(data || [])
    } catch (err) {
      console.error('fetchQuestions', err)
      setItems([])
    } finally { setLoading(false) }
  }

  function handleStartEdit(it) {
    setEditingId(it.id)
    setForm({
      tipe: it.tipe || 'pretest',
      pertanyaan: it.pertanyaan || '',
      pilihan_a: it.pilihan_a || '',
      pilihan_b: it.pilihan_b || '',
      pilihan_c: it.pilihan_c || '',
      pilihan_d: it.pilihan_d || '',
      jawaban_benar: it.jawaban_benar || 'A'
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setForm({ tipe: 'pretest', pertanyaan: '', pilihan_a: '', pilihan_b: '', pilihan_c: '', pilihan_d: '', jawaban_benar: 'A' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      tipe: form.tipe,
      pertanyaan: form.pertanyaan,
      pilihan_a: form.pilihan_a,
      pilihan_b: form.pilihan_b,
      pilihan_c: form.pilihan_c,
      pilihan_d: form.pilihan_d,
      jawaban_benar: form.jawaban_benar
    }

    if (editingId) {
      const { error } = await supabase.from('soal').update(payload).eq('id', editingId)
      if (error) return alert('Gagal memperbarui soal: ' + error.message)
    } else {
      const { error } = await supabase.from('soal').insert([payload])
      if (error) return alert('Gagal menambah soal: ' + error.message)
    }

    setEditingId(null)
    setForm({ tipe: 'pretest', pertanyaan: '', pilihan_a: '', pilihan_b: '', pilihan_c: '', pilihan_d: '', jawaban_benar: 'A' })
    fetchQuestions()
  }

  async function handleDelete(id) {
    if (!confirm('Hapus soal ini?')) return
    const { error } = await supabase.from('soal').delete().eq('id', id)
    if (error) return alert('Gagal menghapus: ' + error.message)
    if (editingId === id) handleCancelEdit()
    fetchQuestions()
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <form className="card" onSubmit={handleSubmit} style={{ marginBottom: 28, padding: '32px', border: editingId ? '2px solid var(--pink-primary)' : undefined }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--text-heading)' }}>
            {editingId ? '✏️ Edit Data Soal' : '➕ Tambah Soal Baru'}
          </h3>
          {editingId && (
            <span className="badge" style={{ background: 'var(--pink-primary-light)', color: 'var(--pink-primary-dark)', fontWeight: 600 }}>
              Mode Edit (ID #{editingId})
            </span>
          )}
        </div>
        
        {/* Tipe Ujian & Kunci Jawaban Benar */}
        <div className="form-grid-2" style={{ marginBottom: 20 }}>
          <div className="form-group">
            <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>Tipe Ujian</label>
            <select
              value={form.tipe}
              onChange={(e) => setForm({ ...form, tipe: e.target.value })}
              style={{ fontSize: '0.95rem' }}
            >
              <option value="pretest">📋 Pre-Test</option>
              <option value="posttest">📝 Post-Test</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>Kunci Jawaban Benar</label>
            <select
              value={form.jawaban_benar}
              onChange={(e) => setForm({ ...form, jawaban_benar: e.target.value })}
              style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--pink-primary-dark)' }}
            >
              <option value="A">Option A</option>
              <option value="B">Option B</option>
              <option value="C">Option C</option>
              <option value="D">Option D</option>
            </select>
          </div>
        </div>

        {/* Teks Pertanyaan (Large Textarea) */}
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>Teks Pertanyaan / Soal</label>
          <textarea
            rows={3}
            placeholder="Tuliskan teks pertanyaan soal SADARI secara lengkap..."
            value={form.pertanyaan}
            onChange={(e) => setForm({ ...form, pertanyaan: e.target.value })}
            style={{ fontSize: '0.95rem', padding: '14px 16px', lineHeight: 1.5 }}
            required
          />
        </div>

        {/* Pilihan Jawaban A, B, C, D */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: '0.95rem', fontWeight: 600, display: 'block', marginBottom: 12, color: 'var(--text-heading)' }}>
            Pilihan Jawaban (A, B, C, D)
          </label>
          
          <div className="form-grid-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label style={{ color: 'var(--pink-primary-dark)', fontWeight: 600 }}>Pilihan Jawaban A</label>
              <input
                placeholder="Masukkan opsi jawaban A..."
                value={form.pilihan_a}
                onChange={(e) => setForm({ ...form, pilihan_a: e.target.value })}
                style={{ fontSize: '0.95rem' }}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ color: 'var(--pink-primary-dark)', fontWeight: 600 }}>Pilihan Jawaban B</label>
              <input
                placeholder="Masukkan opsi jawaban B..."
                value={form.pilihan_b}
                onChange={(e) => setForm({ ...form, pilihan_b: e.target.value })}
                style={{ fontSize: '0.95rem' }}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ color: 'var(--pink-primary-dark)', fontWeight: 600 }}>Pilihan Jawaban C</label>
              <input
                placeholder="Masukkan opsi jawaban C..."
                value={form.pilihan_c}
                onChange={(e) => setForm({ ...form, pilihan_c: e.target.value })}
                style={{ fontSize: '0.95rem' }}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ color: 'var(--pink-primary-dark)', fontWeight: 600 }}>Pilihan Jawaban D</label>
              <input
                placeholder="Masukkan opsi jawaban D..."
                value={form.pilihan_d}
                onChange={(e) => setForm({ ...form, pilihan_d: e.target.value })}
                style={{ fontSize: '0.95rem' }}
                required
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(232, 122, 144, 0.15)' }}>
          {editingId && (
            <button className="btn btn-ghost" type="button" onClick={handleCancelEdit}>
              ❌ Batal Edit
            </button>
          )}
          <button className="btn btn-primary" type="submit" style={{ padding: '12px 28px', fontSize: '0.98rem' }}>
            {editingId ? '💾 Simpan Perubahan' : '+ Simpan Soal Baru'}
          </button>
        </div>
      </form>

      <h3 style={{ fontSize: '1.25rem', marginBottom: 16 }}>❓ Bank Soal ({items.length})</h3>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading soal...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(it => (
            <div key={it.id} className="card" style={{ padding: '18px 20px', border: editingId === it.id ? '2px solid var(--pink-primary)' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="badge" style={{
                    background: it.tipe === 'pretest' ? 'var(--pink-primary-light)' : 'rgba(232, 122, 144, 0.15)',
                    color: 'var(--pink-primary-dark)',
                    textTransform: 'uppercase'
                  }}>
                    {it.tipe}
                  </span>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-heading)' }}>{it.pertanyaan}</strong>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleStartEdit(it)}
                    style={{ background: 'var(--pink-primary-light)', color: 'var(--pink-primary-dark)', border: '1px solid rgba(232, 122, 144, 0.3)', padding: '4px 12px', fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(it.id)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#B91C1C', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '4px 12px', fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.9rem', background: '#FFFFFF', padding: '12px', borderRadius: 12, border: '1px solid rgba(232, 122, 144, 0.15)', marginBottom: 8 }}>
                <div><span style={{ fontWeight: 600, color: 'var(--pink-primary-dark)' }}>A:</span> {it.pilihan_a}</div>
                <div><span style={{ fontWeight: 600, color: 'var(--pink-primary-dark)' }}>B:</span> {it.pilihan_b}</div>
                <div><span style={{ fontWeight: 600, color: 'var(--pink-primary-dark)' }}>C:</span> {it.pilihan_c}</div>
                <div><span style={{ fontWeight: 600, color: 'var(--pink-primary-dark)' }}>D:</span> {it.pilihan_d}</div>
              </div>

              <div style={{ fontSize: '0.85rem' }}>
                Jawaban Benar: <span className="badge success" style={{ padding: '2px 8px' }}>{it.jawaban_benar}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

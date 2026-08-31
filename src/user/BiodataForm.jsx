import { useState } from 'react'
import supabase from '../supabaseClient'

export default function BiodataForm({ navigate, showAlert }) {
  const [form, setForm] = useState({ nama_lengkap: '', usia: '', paritas: '', tanggal_melahirkan: '', nifas_hari_ke: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        nama_lengkap: form.nama_lengkap,
        usia: Number(form.usia) || null,
        paritas: form.paritas,
        tanggal_melahirkan: form.tanggal_melahirkan || null,
        nifas_hari_ke: Number(form.nifas_hari_ke) || null
      }
      const { data, error } = await supabase.from('peserta').insert([payload]).select('id').single()
      if (error) throw error
      const pesertaId = data.id
      localStorage.setItem('peserta_id', pesertaId)
      localStorage.removeItem('hasil_id')
      // navigate to pretest
      navigate('/pretest')
    } catch (err) {
      console.error('biodata submit', err)
      if (showAlert) {
        showAlert('Gagal Menyimpan Biodata', err.message || 'Terjadi kesalahan saat menyimpan data.', 'error')
      } else {
        alert('Gagal menyimpan biodata: ' + (err.message || 'error'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="card container" onSubmit={handleSubmit} style={{ maxWidth: 620, textAlign: 'left', margin: '0 auto', padding: '32px' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Form Biodata Peserta</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: 24 }}>
        Silakan lengkapi data diri di bawah ini untuk memulai sesi Pre-Test SADARI.
      </p>

      <div className="form-group">
        <label>Nama Lengkap</label>
        <input
          required
          placeholder="Masukkan nama lengkap Anda"
          value={form.nama_lengkap}
          onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Usia (Tahun)</label>
          <input
            required
            type="number"
            placeholder="Contoh: 25"
            value={form.usia}
            onChange={(e) => setForm({ ...form, usia: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Paritas</label>
          <input
            placeholder="Contoh: P1A0"
            value={form.paritas}
            onChange={(e) => setForm({ ...form, paritas: e.target.value })}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Tanggal Melahirkan</label>
          <input
            type="date"
            value={form.tanggal_melahirkan}
            onChange={(e) => setForm({ ...form, tanggal_melahirkan: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Nifas Hari Ke</label>
          <input
            type="number"
            placeholder="Contoh: 7"
            value={form.nifas_hari_ke}
            onChange={(e) => setForm({ ...form, nifas_hari_ke: e.target.value })}
          />
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '12px 24px', fontSize: '1rem' }}>
          {loading ? 'Menyimpan...' : 'Simpan & Mulai Pre-Test ➔'}
        </button>
      </div>
    </form>
  )
}

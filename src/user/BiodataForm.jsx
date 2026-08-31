import { useState, useEffect } from 'react'
import supabase from '../supabaseClient'

export default function BiodataForm({ navigate, showAlert }) {
  const [fields, setFields] = useState([])
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Fetch konfigurasi field yang diatur oleh Admin
  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data, error } = await supabase
          .from('bio_config')
          .select('*')
          .eq('is_active', true)
          .order('urutan', { ascending: true })

        if (error) throw error
        setFields(data || [])

        // Init state form kosong
        const initialForm = {}
        data.forEach(f => { initialForm[f.key_name] = '' })
        setForm(initialForm)
      } catch (err) {
        console.error('Error fetching bio config:', err)
      } finally {
        setFetching(false)
      }
    }
    fetchConfig()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      // 1. Ambil kolom standar jika ada
      const payload = {
        nama_lengkap: form.nama_lengkap || null,
        usia: Number(form.usia) || null,
        paritas: form.paritas || null,
        tanggal_melahirkan: form.tanggal_melahirkan || null,
        nifas_hari_ke: Number(form.nifas_hari_ke) || null,
        data_tambahan: form // Simpan seluruh JSON input untuk fleksibilitas
      }

      const { data, error } = await supabase.from('peserta').insert([payload]).select('id').single()
      if (error) throw error

      localStorage.setItem('peserta_id', data.id)
      localStorage.removeItem('hasil_id')
      navigate('/pretest')
    } catch (err) {
      console.error('biodata submit', err)
      if (showAlert) {
        showAlert('Gagal Menyimpan Biodata', err.message || 'Terjadi kesalahan.', 'error')
      } else {
        alert('Gagal menyimpan biodata: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <p style={{ textAlign: 'center', padding: 20 }}>Memuat formulir...</p>

  return (
    <form className="card container" onSubmit={handleSubmit} style={{ maxWidth: 620, textAlign: 'left', margin: '0 auto', padding: '32px' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Form Biodata Peserta</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: 24 }}>
        Silakan lengkapi data diri di bawah ini untuk memulai sesi Pre-Test SADARI.
      </p>

      <div style={{ display: 'grid', gap: '16px' }}>
        {fields.map((field) => (
          <div className="form-group" key={field.id}>
            <label>{field.label} {field.is_required && <span style={{ color: 'red' }}>*</span>}</label>
            <input
              required={field.is_required}
              type={field.field_type}
              placeholder={`Masukkan ${field.label.toLowerCase()}`}
              value={form[field.key_name] || ''}
              onChange={(e) => setForm({ ...form, [field.key_name]: e.target.value })}
            />
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '12px 24px', fontSize: '1rem' }}>
          {loading ? 'Menyimpan...' : 'Simpan & Mulai Pre-Test ➔'}
        </button>
      </div>
    </form>
  )
}
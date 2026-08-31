import { useEffect, useState } from 'react'
import defaultSupabase from '../supabaseClient'
import { calculateKnowledgeIncrease } from '../utils/scoreUtils'
import { checkAndValidatePeserta } from '../utils/pesertaUtils'

export default function Results({ supabase = defaultSupabase, navigate, showAlert }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchResult() }, [])

  async function fetchResult() {
    setLoading(true)
    try {
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

      const pesertaId = Number(localStorage.getItem('peserta_id'))
      if (!pesertaId) return
      // fetch latest hasil for this peserta (order by id desc, take first)
      const { data, error } = await supabase.from('hasil_ujian').select('*').eq('peserta_id', pesertaId).order('id', { ascending: false }).limit(1)
      if (error) throw error
      const row = Array.isArray(data) && data.length > 0 ? data[0] : null
      setResult(row)
    } catch (err) {
      console.error('fetchResult', err)
      setResult(null)
    } finally { setLoading(false) }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading hasil...</div>
  if (!result) return <div className="card container" style={{ textAlign: 'center', padding: 40, margin: '0 auto' }}>Tidak ada hasil ditemukan.</div>

  const increase = calculateKnowledgeIncrease(result.skor_pretest, result.skor_posttest, 10)

  return (
    <div className="card container" style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto', padding: '36px 28px' }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'var(--pink-primary-light)',
        color: 'var(--pink-primary-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        margin: '0 auto 16px'
      }}>
        🏆
      </div>
      <h3 style={{ fontSize: '1.6rem', marginBottom: 8 }}>Hasil Evaluasi SADARI</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 28 }}>
        Berikut adalah ringkasan nilai evaluasi dan persentase peningkatan pemahaman Anda.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid rgba(232, 122, 144, 0.2)',
          borderRadius: 18,
          padding: '20px 16px',
          boxShadow: '0 4px 14px rgba(232, 122, 144, 0.08)'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>SKOR PRE-TEST</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            {result.skor_pretest ?? '-'} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 10</span>
          </div>
        </div>

        <div style={{
          background: 'var(--pink-primary-light)',
          border: '1.5px solid rgba(232, 122, 144, 0.3)',
          borderRadius: 18,
          padding: '20px 16px',
          boxShadow: '0 4px 14px rgba(232, 122, 144, 0.15)'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--pink-primary-dark)', fontWeight: 700, marginBottom: 6 }}>SKOR POST-TEST</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--pink-primary-dark)' }}>
            {result.skor_posttest ?? '-'} <span style={{ fontSize: '1rem', color: 'var(--pink-primary-dark)', fontWeight: 500 }}>/ 10</span>
          </div>
        </div>
      </div>

      {increase && (
        <div style={{
          background: 'linear-gradient(135deg, #FFF0F4 0%, #FDE8ED 100%)',
          border: '1.5px solid rgba(232, 122, 144, 0.3)',
          borderRadius: 18,
          padding: '22px 20px',
          marginBottom: 28,
          boxShadow: '0 6px 18px rgba(232, 122, 144, 0.12)'
        }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-heading)', fontWeight: 700, marginBottom: 6 }}>
            📈 PERSENTASE PENINGKATAN PENGETAHUAN
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: increase.isPositive ? 'var(--pink-primary-dark)' : '#B91C1C' }}>
            {increase.formatted}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginTop: 4 }}>
            (Peningkatan {increase.diff >= 0 ? `+${increase.diff}` : increase.diff} poin dari skor maksimal 10)
          </div>
        </div>
      )}

      <div style={{
        background: 'rgba(255, 255, 255, 0.7)',
        border: '1px solid rgba(232, 122, 144, 0.2)',
        borderRadius: 14,
        padding: '16px 20px',
        textAlign: 'left',
        fontSize: '0.82rem',
        color: 'var(--text-body)',
        marginBottom: 28
      }}>
        <div style={{ fontWeight: 700, color: 'var(--pink-primary-dark)', marginBottom: 6 }}>
          ℹ️ Metode Perhitungan Skor & Referensi Studi:
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Setiap jawaban benar bernilai 1, jawaban salah bernilai 0 (Total skor 0–10).</li>
          <li>Rumus persentase peningkatan: <code>% Peningkatan = ((Skor Post-test − Skor Pre-test) / 10) × 100%</code></li>
          <li style={{ fontStyle: 'italic', marginTop: 4, color: 'var(--text-muted)' }}>
            Pendekatan evaluasi ini merujuk pada studi intervensi edukasi SADARI (Wondmu et al., 2022; Sarker et al., 2022).
          </li>
        </ul>
      </div>

      <div>
        <button className="btn btn-primary" onClick={() => navigate('/')} style={{ padding: '12px 28px' }}>
          ← Kembali ke Beranda
        </button>
      </div>
    </div>
  )
}

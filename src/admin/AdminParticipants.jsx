import { useEffect, useState } from 'react'
import { calculateKnowledgeIncrease } from '../utils/scoreUtils'

export default function AdminParticipants({ supabase }) {
  const [pesertas, setPesertas] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchPesertas() }, [])

  async function fetchPesertas() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('peserta').select('*').order('id', { ascending: true })
      if (error) throw error
      setPesertas(data || [])
    } catch (err) {
      console.error('fetchPesertas', err)
      setPesertas([])
    } finally { setLoading(false) }
  }

  async function showDetail(peserta) {
    try {
      // Always use array select to avoid .single() exceptions
      let { data: hasilData, error: hasilErr } = await supabase.from('hasil_ujian').select('*').eq('peserta_id', peserta.id)
      if (hasilErr) throw hasilErr

      // defensive: coerce types and log for debugging
      console.log('showDetail fetched types', {
        pesertaId: peserta.id,
        hasilDataType: Object.prototype.toString.call(hasilData),
        soalDataType: 'pending'
      })

      // fallback: try string match if empty
      if ((!hasilData || hasilData.length === 0) && peserta.id != null) {
        const { data: hasilData2, error: hasilErr2 } = await supabase.from('hasil_ujian').select('*').eq('peserta_id', String(peserta.id))
        if (hasilErr2) throw hasilErr2
        if (hasilData2 && hasilData2.length > 0) hasilData = hasilData2
      }

      const { data: soalData, error: soalErr } = await supabase.from('soal').select('*')
      if (soalErr) throw soalErr

      const preSoal = []
      const postSoal = []
      const soalArray = Array.isArray(soalData) ? soalData : []
      console.log('showDetail fetched types', { hasilData: Array.isArray(hasilData), soalData: Array.isArray(soalData) })
      for (const s of soalArray) {
        if (s && s.tipe === 'pretest') preSoal.push(s)
        if (s && s.tipe === 'posttest') postSoal.push(s)
      }

      const hasilArray = Array.isArray(hasilData) ? hasilData : (hasilData ? [hasilData] : [])
      const enriched = hasilArray.map(h => {
        // Normalize answers: accept jsonb object or JSON string
        let preAnswersRaw = h.answers_pre || {}
        let postAnswersRaw = h.answers_post || {}
        let preAnswers = {}
        let postAnswers = {}
        try { preAnswers = typeof preAnswersRaw === 'string' ? JSON.parse(preAnswersRaw) : (preAnswersRaw || {}) } catch (e) { preAnswers = {} }
        try { postAnswers = typeof postAnswersRaw === 'string' ? JSON.parse(postAnswersRaw) : (postAnswersRaw || {}) } catch (e) { postAnswers = {} }

        const pre_breakdown = preSoal.map((q, idx) => {
          const chosen = preAnswers[q.id] ?? preAnswers[String(q.id)] ?? null
          const correct = (q.jawaban_benar || '').toString()
          const isCorrect = (chosen || '') === correct
          return { no: idx + 1, questionId: q.id, pertanyaan: q.pertanyaan, chosen, correct, isCorrect }
        })

        const post_breakdown = postSoal.map((q, idx) => {
          const chosen = postAnswers[q.id] ?? postAnswers[String(q.id)] ?? null
          const correct = (q.jawaban_benar || '').toString()
          const isCorrect = (chosen || '') === correct
          return { no: idx + 1, questionId: q.id, pertanyaan: q.pertanyaan, chosen, correct, isCorrect }
        })

        return { ...h, pre_breakdown, post_breakdown }
      })

      console.log('showDetail hasilData', hasilArray)
      setSelected({ peserta, hasil: enriched, rawHasil: hasilArray })
    } catch (err) {
      console.error('showDetail', err)
      setSelected({ peserta, hasil: [] })
    }
  }

  async function deletePeserta(id) {
    if (!confirm('Hapus peserta dan hasilnya?')) return
    try {
      await supabase.from('hasil_ujian').delete().eq('peserta_id', id)
      await supabase.from('peserta').delete().eq('id', id)
      setSelected(null)
      fetchPesertas()
    } catch (err) {
      console.error('deletePeserta', err)
      alert('Gagal menghapus peserta')
    }
  }

  return (
    <div className="learning-container" style={{ textAlign: 'left' }}>
      <aside className="learning-sidebar" style={{ width: 300, padding: '20px 16px' }}>
        <h4 style={{ marginTop: 0, fontSize: '1.05rem', color: 'var(--text-heading)', marginBottom: 14 }}>
          👥 Daftar Peserta ({pesertas.length})
        </h4>
        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <div className="participant-list" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pesertas.map(p => (
              <button
                key={p.id}
                className={`material-item-btn ${selected?.peserta?.id === p.id ? 'active' : ''}`}
                onClick={() => showDetail(p)}
                style={{ justifyContent: 'space-between', padding: '10px 12px' }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{p.nama_lengkap}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Usia: {p.usia ?? '-'}</span>
              </button>
            ))}
          </div>
        )}
      </aside>

      <section className="learning-content">
        {!selected && (
          <div className="card" style={{ padding: '40px 28px', textAlign: 'center', color: 'var(--text-muted)' }}>
            👈 Pilih peserta dari daftar di samping untuk melihat detail biodata & hasil evaluasi.
          </div>
        )}
        {selected && (
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.4rem' }}>{selected.peserta.nama_lengkap}</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Usia: {selected.peserta.usia ?? '-'} tahun • Paritas: {selected.peserta.paritas || '-'}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
                  Tgl Melahirkan: {selected.peserta.tanggal_melahirkan || '-'} • Nifas Hari Ke: {selected.peserta.nifas_hari_ke ?? '-'}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="btn btn-ghost"
                style={{ fontSize: '0.85rem' }}
              >
                ✕ Tutup
              </button>
            </div>

            <h4 style={{ marginTop: 24, marginBottom: 16, fontSize: '1.1rem', color: 'var(--pink-primary-dark)' }}>
              📊 Rekap Hasil Ujian
            </h4>

            {(!selected.hasil || selected.hasil.length === 0) && (
              <div style={{ background: 'var(--pink-primary-light)', padding: 16, borderRadius: 14, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Belum ada hasil ujian tersimpan untuk peserta ini.
              </div>
            )}

            {Array.isArray(selected.hasil) && selected.hasil.map(h => {
              const inc = calculateKnowledgeIncrease(h.skor_pretest, h.skor_posttest, 10)
              return (
                <div key={h.id} style={{ background: '#FFFFFF', border: '1.5px solid rgba(232, 122, 144, 0.2)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                    <div>Skor Pre-Test: <span className="badge success" style={{ marginLeft: 6 }}>{h.skor_pretest ?? '-'} / 10</span></div>
                    <div>Skor Post-Test: <span className="badge success" style={{ marginLeft: 6 }}>{h.skor_posttest ?? '-'} / 10</span></div>
                    {inc && (
                      <div>Peningkatan: <span className="badge" style={{ background: 'var(--pink-primary-light)', color: 'var(--pink-primary-dark)', marginLeft: 6 }}>{inc.formatted}</span></div>
                    )}
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>Waktu: {h.created_at ? new Date(h.created_at).toLocaleString('id-ID') : '-'}</div>
                  </div>

                  {h.pre_breakdown && h.pre_breakdown.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text-heading)', display: 'block', marginBottom: 10 }}>
                        Detail Pre-Test:
                      </strong>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {h.pre_breakdown.map((item) => (
                          <div
                            key={item.questionId}
                            style={{
                              backgroundColor: '#fff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '10px 12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px'
                            }}
                          >
                            {/* Nomor & Pertanyaan */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '0.88rem', color: '#4a5568', minWidth: '20px' }}>
                                {item.no}.
                              </span>
                              <div style={{ fontSize: '0.9rem', color: 'var(--text-heading)', fontWeight: '500', lineHeight: 1.4, flex: 1 }}>
                                {item.pertanyaan}
                              </div>
                            </div>

                            {/* Informasi Jawaban & Status Badge */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '6px',
                              fontSize: '0.82rem',
                              color: '#64748b',
                              backgroundColor: '#f8fafc',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              marginTop: '2px'
                            }}>
                              <div>
                                Pilihan: <strong style={{ color: '#1e293b' }}>{item.chosen ?? '-'}</strong>
                                <span style={{ margin: '0 6px', color: '#cbd5e1' }}>|</span>
                                Kunci: <strong style={{ color: '#1e293b' }}>{item.correct}</strong>
                              </div>

                              <span
                                className={item.isCorrect ? 'badge success' : 'badge danger'}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontWeight: '600',
                                  marginLeft: 'auto'
                                }}
                              >
                                {item.isCorrect ? '✓ Benar' : '✕ Salah'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {h.post_breakdown && h.post_breakdown.length > 0 && (
                    <div style={{ marginTop: 18 }}>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text-heading)', display: 'block', marginBottom: 10 }}>
                        Detail Post-Test:
                      </strong>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {h.post_breakdown.map((item) => (
                          <div
                            key={item.questionId}
                            style={{
                              backgroundColor: '#fff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '10px 12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px'
                            }}
                          >
                            {/* Nomor & Pertanyaan */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '0.88rem', color: '#4a5568', minWidth: '20px' }}>
                                {item.no}.
                              </span>
                              <div style={{ fontSize: '0.9rem', color: 'var(--text-heading)', fontWeight: '500', lineHeight: 1.4, flex: 1 }}>
                                {item.pertanyaan}
                              </div>
                            </div>

                            {/* Informasi Jawaban & Status Badge */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '6px',
                              fontSize: '0.82rem',
                              color: '#64748b',
                              backgroundColor: '#f8fafc',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              marginTop: '2px'
                            }}>
                              <div>
                                Pilihan: <strong style={{ color: '#1e293b' }}>{item.chosen ?? '-'}</strong>
                                <span style={{ margin: '0 6px', color: '#cbd5e1' }}>|</span>
                                Kunci: <strong style={{ color: '#1e293b' }}>{item.correct}</strong>
                              </div>

                              <span
                                className={item.isCorrect ? 'badge success' : 'badge danger'}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontWeight: '600',
                                  marginLeft: 'auto'
                                }}
                              >
                                {item.isCorrect ? '✓ Benar' : '✕ Salah'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(232, 122, 144, 0.15)', textAlign: 'right' }}>
              <button
                onClick={() => deletePeserta(selected.peserta.id)}
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#B91C1C', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '8px 18px' }}
              >
                🗑️ Hapus Data Peserta
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

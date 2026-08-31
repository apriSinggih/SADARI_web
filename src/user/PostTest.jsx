import { useEffect, useState } from 'react'
import defaultSupabase from '../supabaseClient'
import { checkAndValidatePeserta } from '../utils/pesertaUtils'

export default function PostTest({ supabase = defaultSupabase, navigate, showAlert }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)

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
          showAlert('Pre-Test Belum Selesai', 'Silakan selesaikan Pre-Test terlebih dahulu sebelum mengakses Post-Test.', 'info', () => navigate('/pretest'))
        } else {
          alert('Silakan selesaikan Pre-Test terlebih dahulu.')
          navigate('/pretest')
        }
        return
      }
      fetchQuestions()
    }
    init()
  }, [])

  async function fetchQuestions() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('soal').select('*').eq('tipe', 'posttest')
      if (error) throw error
      setQuestions(data || [])
      setCurrent(0)
    } catch (err) {
      console.error('fetchQuestions', err)
      setQuestions([])
    } finally { setLoading(false) }
  }

  function selectAnswer(qid, val) { setAnswers(prev => ({...prev, [qid]: val})) }

  async function handleFinish() {
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
    if (!pesertaId) {
      if (showAlert) {
        showAlert('Biodata Belum Diisi', 'Peserta tidak ditemukan. Silakan isi biodata terlebih dahulu.', 'info', () => navigate('/biodata'))
      } else {
        alert('Peserta tidak ditemukan.')
        navigate('/biodata')
      }
      return
    }
    let score = 0
    questions.forEach(q => { if ((answers[q.id] || '') === (q.jawaban_benar || '').toString()) score += 1 })

    try {
      // update existing hasil_ujian row for this peserta
      const existingHasilId = localStorage.getItem('hasil_id')
      if (existingHasilId) {
        const { error } = await supabase.from('hasil_ujian').update({ skor_posttest: score, answers_post: answers, updated_at: new Date() }).eq('id', Number(existingHasilId))
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('hasil_ujian').insert([{ peserta_id: pesertaId, skor_posttest: score, answers_post: answers }]).select('id').single()
        if (error) throw error
        localStorage.setItem('hasil_id', data.id)
      }
      navigate('/results')
    } catch (err) {
      console.error('save posttest', err)
      if (showAlert) showAlert('Gagal Menyimpan', 'Gagal menyimpan hasil Post-Test. Silakan coba lagi.', 'error')
      else alert('Gagal menyimpan hasil posttest')
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading soal posttest...</div>

  if (questions.length === 0) return (
    <div className="card container" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto', padding: 32 }}>
      <h3>Post-Test SADARI</h3>
      <div>Tidak ada soal post-test yang tersedia saat ini.</div>
    </div>
  )

  const q = questions[current]
  const isLast = current === questions.length - 1

  const progressPct = Math.round(((current + 1) / questions.length) * 100)

  return (
    <div className="card container" style={{ maxWidth: 780, textAlign: 'left', margin: '0 auto', padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Post-Test SADARI</h3>
        <span className="badge" style={{ background: 'var(--pink-primary-light)', color: 'var(--pink-primary-dark)', fontSize: '0.85rem' }}>
          Soal {current + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', height: 6, background: 'rgba(232, 122, 144, 0.15)', borderRadius: 10, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--pink-primary), var(--pink-primary-dark))', transition: 'width 0.3s ease' }} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-heading)', lineHeight: 1.5, marginBottom: 18 }}>
          {current + 1}. {q.pertanyaan}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {['A', 'B', 'C', 'D'].map(opt => (
            <label key={opt} className={`radio-option ${answers[q.id] === opt ? 'selected' : ''}`}>
              <input
                type="radio"
                name={`q_${q.id}`}
                checked={answers[q.id] === opt}
                onChange={() => selectAnswer(q.id, opt)}
              />
              <span style={{ fontWeight: 600, minWidth: 24, color: 'var(--pink-primary-dark)' }}>{opt}.</span>
              <span style={{ color: 'var(--text-body)' }}>{q[`pilihan_${opt.toLowerCase()}`]}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(232, 122, 144, 0.15)' }}>
        <button className="btn btn-ghost" onClick={() => setCurrent(i => Math.max(0, i - 1))} disabled={current === 0}>
          ← Sebelumnya
        </button>
        {!isLast && (
          <button className="btn" onClick={() => {
            if (!answers[q.id]) {
              if (showAlert) showAlert('Pilihan Jawaban', 'Silakan pilih salah satu jawaban sebelum melangkah ke soal berikutnya.', 'info')
              else alert('Silakan pilih jawaban sebelum lanjut')
              return
            }
            setCurrent(i => i + 1)
          }}>
            Berikutnya →
          </button>
        )}
        {isLast && (
          <button className="btn btn-primary" onClick={() => {
            if (!answers[q.id]) {
              if (showAlert) showAlert('Pilihan Jawaban', 'Silakan pilih jawaban untuk soal ini sebelum menyelesaikan Post-Test.', 'info')
              else alert('Silakan pilih jawaban sebelum menyelesaikan')
              return
            }
            handleFinish()
          }}>
            Selesai Post-Test ✓
          </button>
        )}
      </div>
    </div>
  )
}

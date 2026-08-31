/**
 * Helper untuk memvalidasi keberadaan data peserta di Supabase.
 * Jika Admin telah menghapus peserta dari database, maka localStorage peserta_id & hasil_id
 * akan dibersihkan secara otomatis sehingga peserta diwajibkan mengisi biodata ulang.
 */
export async function checkAndValidatePeserta(supabase) {
  if (typeof window === 'undefined') return false
  const pid = localStorage.getItem('peserta_id')
  if (!pid) return false

  try {
    const { data, error } = await supabase
      .from('peserta')
      .select('id')
      .eq('id', Number(pid))
      .maybeSingle()

    if (error || !data) {
      // Data peserta telah dihapus oleh Admin di Supabase!
      console.warn(`Peserta ID ${pid} tidak ditemukan di database. Resetting localStorage...`)
      localStorage.removeItem('peserta_id')
      localStorage.removeItem('hasil_id')
      return false
    }

    // Cek juga apakah hasil_id di localStorage masih valid di Supabase
    const hid = localStorage.getItem('hasil_id')
    if (hid) {
      const { data: hData } = await supabase
        .from('hasil_ujian')
        .select('id')
        .eq('id', Number(hid))
        .maybeSingle()

      if (!hData) {
        localStorage.removeItem('hasil_id')
      }
    }

    return true
  } catch (err) {
    console.error('checkAndValidatePeserta error:', err)
    return false
  }
}

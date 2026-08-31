/**
 * Perhitungan Peningkatan Pengetahuan Studi Intervensi Edukasi SADARI
 * Referensi: Wondmu et al. (2022); Sarker et al. (2022)
 * 
 * Rumus:
 * Total Skor = Jumlah jawaban benar (0–10)
 * % Peningkatan = ((Skor Post-test − Skor Pre-test) / Skor Maksimal) × 100%
 */
export function calculateKnowledgeIncrease(skorPre, skorPost, skorMaksimal = 10) {
  if (skorPre === null || skorPre === undefined || skorPost === null || skorPost === undefined) {
    return null
  }
  
  const pre = Number(skorPre)
  const post = Number(skorPost)
  const max = Number(skorMaksimal) || 10

  const diff = post - pre
  const pct = (diff / max) * 100
  const roundedPct = Math.round(pct * 10) / 10

  return {
    diff,
    pct: roundedPct,
    formatted: `${roundedPct >= 0 ? '+' : ''}${roundedPct}%`,
    isPositive: diff >= 0
  }
}

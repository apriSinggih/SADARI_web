-- Add JSON columns to store per-question answers for pretest and posttest
ALTER TABLE IF EXISTS hasil_ujian
  ADD COLUMN IF NOT EXISTS answers_pre jsonb,
  ADD COLUMN IF NOT EXISTS answers_post jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Optional: create an index for queries on peserta_id
CREATE INDEX IF NOT EXISTS idx_hasil_peserta ON hasil_ujian(peserta_id);

-- Migration: add media support to materi table
-- Adds content_type, media_path, and gdrive_link columns

ALTER TABLE IF EXISTS materi
  ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS media_path text,
  ADD COLUMN IF NOT EXISTS gdrive_link text;

-- Optional: set up created_at/updated_at if not present
ALTER TABLE IF EXISTS materi
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

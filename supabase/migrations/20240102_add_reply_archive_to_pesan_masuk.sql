-- ============================================
-- Migration: Add reply and archive columns to pesan_masuk
-- Run this in Supabase SQL Editor
-- ============================================

-- Add reply tracking columns
ALTER TABLE pesan_masuk 
  ADD COLUMN IF NOT EXISTS is_replied BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reply_text TEXT,
  ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_pesan_masuk_is_read ON pesan_masuk(is_read);
CREATE INDEX IF NOT EXISTS idx_pesan_masuk_is_replied ON pesan_masuk(is_replied);
CREATE INDEX IF NOT EXISTS idx_pesan_masuk_is_archived ON pesan_masuk(is_archived);
CREATE INDEX IF NOT EXISTS idx_pesan_masuk_created_at ON pesan_masuk(created_at);

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'pesan_masuk'
ORDER BY ordinal_position;

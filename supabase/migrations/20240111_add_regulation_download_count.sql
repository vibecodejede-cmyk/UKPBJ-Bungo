-- ============================================
-- Add download_count to regulations table
-- Tracks how many times visitors download each regulation PDF.
-- ============================================

ALTER TABLE regulations ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

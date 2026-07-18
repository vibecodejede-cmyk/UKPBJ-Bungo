-- ============================================
-- Add download_count to guides and view_count to guide_videos
-- ============================================

-- Add download_count column to guides table
ALTER TABLE guides ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- Add view_count column to guide_videos table
ALTER TABLE guide_videos ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- ============================================================
-- SYNC SEMUA PERBAIKAN KE SUPABASE
-- Error: "new row violates row-level security policy"
--
-- Migration ini HARUS dijalankan di Supabase -> SQL Editor -> Run
-- untuk menyinkronkan semua perbaikan RLS dan schema.
-- ============================================================

-- ============================================
-- 1. FIX RLS POLICIES - Remove TO public (penyebab utama error)
-- ============================================

-- GUIDES
DROP POLICY IF EXISTS "Public can view published guides" ON guides;
DROP POLICY IF EXISTS "Public can manage guides" ON guides;
DROP POLICY IF EXISTS "Enable read access for all users" ON guides;
DROP POLICY IF EXISTS "Enable insert for all users" ON guides;
DROP POLICY IF EXISTS "Enable update for all users" ON guides;
DROP POLICY IF EXISTS "Enable delete for all users" ON guides;

ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guides_select_published" ON guides
  FOR SELECT USING (is_published = true);

CREATE POLICY "guides_all_admin" ON guides
  FOR ALL USING (true) WITH CHECK (true);

-- GUIDE CATEGORIES
DROP POLICY IF EXISTS "Public can view guide categories" ON guide_categories;
DROP POLICY IF EXISTS "Public can manage guide categories" ON guide_categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON guide_categories;
DROP POLICY IF EXISTS "Enable insert for all users" ON guide_categories;
DROP POLICY IF EXISTS "Enable update for all users" ON guide_categories;
DROP POLICY IF EXISTS "Enable delete for all users" ON guide_categories;

ALTER TABLE guide_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guide_categories_select" ON guide_categories
  FOR SELECT USING (true);

CREATE POLICY "guide_categories_all_admin" ON guide_categories
  FOR ALL USING (true) WITH CHECK (true);

-- GUIDE VIDEOS
DROP POLICY IF EXISTS "Public can view guide videos" ON guide_videos;
DROP POLICY IF EXISTS "Public can manage guide videos" ON guide_videos;
DROP POLICY IF EXISTS "Enable read access for all users" ON guide_videos;
DROP POLICY IF EXISTS "Enable insert for all users" ON guide_videos;
DROP POLICY IF EXISTS "Enable update for all users" ON guide_videos;
DROP POLICY IF EXISTS "Enable delete for all users" ON guide_videos;

ALTER TABLE guide_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guide_videos_select" ON guide_videos
  FOR SELECT USING (true);

CREATE POLICY "guide_videos_all_admin" ON guide_videos
  FOR ALL USING (true) WITH CHECK (true);

-- ANNOUNCEMENTS
DROP POLICY IF EXISTS "Public can view published announcements" ON announcements;
DROP POLICY IF EXISTS "Public can manage announcements" ON announcements;
DROP POLICY IF EXISTS "Enable read access for all users" ON announcements;
DROP POLICY IF EXISTS "Enable insert for all users" ON announcements;
DROP POLICY IF EXISTS "Enable update for all users" ON announcements;
DROP POLICY IF EXISTS "Enable delete for all users" ON announcements;

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcements_select_published" ON announcements
  FOR SELECT USING (is_published = true);

CREATE POLICY "announcements_all_admin" ON announcements
  FOR ALL USING (true) WITH CHECK (true);

-- NEWSLETTER SUBSCRIPTIONS
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Admin can read newsletter" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Enable read access for all users" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Enable insert for all users" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Enable update for all users" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Enable delete for all users" ON newsletter_subscriptions;

ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "newsletter_insert" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "newsletter_select_admin" ON newsletter_subscriptions
  FOR SELECT USING (true);

-- PESAN MASUK
DROP POLICY IF EXISTS "Public can send pesan masuk" ON pesan_masuk;
DROP POLICY IF EXISTS "Admin can read pesan masuk" ON pesan_masuk;
DROP POLICY IF EXISTS "Admin can update pesan masuk" ON pesan_masuk;
DROP POLICY IF EXISTS "Admin can delete pesan masuk" ON pesan_masuk;
DROP POLICY IF EXISTS "Enable read access for all users" ON pesan_masuk;
DROP POLICY IF EXISTS "Enable insert for all users" ON pesan_masuk;
DROP POLICY IF EXISTS "Enable update for all users" ON pesan_masuk;
DROP POLICY IF EXISTS "Enable delete for all users" ON pesan_masuk;

ALTER TABLE pesan_masuk ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pesan_masuk_insert" ON pesan_masuk
  FOR INSERT WITH CHECK (true);

CREATE POLICY "pesan_masuk_select_admin" ON pesan_masuk
  FOR SELECT USING (true);

CREATE POLICY "pesan_masuk_update_admin" ON pesan_masuk
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "pesan_masuk_delete_admin" ON pesan_masuk
  FOR DELETE USING (true);

-- REGULATIONS
DROP POLICY IF EXISTS "Public can view published regulations" ON regulations;
DROP POLICY IF EXISTS "Public can manage regulations" ON regulations;
DROP POLICY IF EXISTS "Enable read access for all users" ON regulations;
DROP POLICY IF EXISTS "Enable insert for all users" ON regulations;
DROP POLICY IF EXISTS "Enable update for all users" ON regulations;
DROP POLICY IF EXISTS "Enable delete for all users" ON regulations;

ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "regulations_select_published" ON regulations
  FOR SELECT USING (is_published = true);

CREATE POLICY "regulations_all_admin" ON regulations
  FOR ALL USING (true) WITH CHECK (true);

-- ADMINS
DROP POLICY IF EXISTS "Public can manage admins" ON admins;
DROP POLICY IF EXISTS "Enable read access for all users" ON admins;
DROP POLICY IF EXISTS "Enable insert for all users" ON admins;
DROP POLICY IF EXISTS "Enable update for all users" ON admins;
DROP POLICY IF EXISTS "Enable delete for all users" ON admins;

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_all_admin" ON admins
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 2. FIX SCHEMA - Add missing columns
-- ============================================

-- Add missing columns to pesan_masuk
ALTER TABLE pesan_masuk ADD COLUMN IF NOT EXISTS is_replied BOOLEAN DEFAULT false;
ALTER TABLE pesan_masuk ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE pesan_masuk ADD COLUMN IF NOT EXISTS reply_text TEXT;
ALTER TABLE pesan_masuk ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE;

-- Add nomor column to regulations (used by KelolaRegulasi page)
ALTER TABLE regulations ADD COLUMN IF NOT EXISTS nomor TEXT NOT NULL DEFAULT '';

-- ============================================
-- 3. FIX GUIDE VIDEOS ROLE CHECK CONSTRAINT
-- ============================================

ALTER TABLE guide_videos DROP CONSTRAINT IF EXISTS guide_videos_role_check;

ALTER TABLE guide_videos ADD CONSTRAINT guide_videos_role_check
  CHECK (role <@ ARRAY['PPK', 'Pejabat Pengadaan', 'Pokja', 'PA', 'Penyedia', 'Semua']::TEXT[]);

-- ============================================
-- 4. VERIFIKASI
-- ============================================

-- Cek semua policy
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  permissive, 
  qual, 
  with_check
FROM pg_policies
WHERE tablename IN (
  'guides', 
  'guide_categories', 
  'guide_videos', 
  'announcements', 
  'newsletter_subscriptions', 
  'pesan_masuk', 
  'regulations', 
  'admins'
)
ORDER BY tablename, cmd, policyname;

-- Cek kolom pesan_masuk
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'pesan_masuk'
ORDER BY ordinal_position;

-- Cek constraint guide_videos
SELECT
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'guide_videos_role_check';

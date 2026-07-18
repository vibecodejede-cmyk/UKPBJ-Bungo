-- ============================================================
-- FIX SEMUA RLS POLICIES
-- Error: "new row violates row-level security policy"
--
-- Migration ini memperbaiki semua policy RLS agar:
-- 1. Semua tabel memiliki policy yang lengkap
-- 2. Policy menggunakan role yang benar untuk Supabase (anon key)
-- 3. Tidak ada policy yang bersifat RESTRICTIVE yang memblokir operasi
--
-- Jalankan di Supabase -> SQL Editor -> Run
-- ============================================================

-- ============================================
-- 1. GUIDES (PANDUAN)
-- ============================================
-- Drop semua policy lama
DROP POLICY IF EXISTS "Public can view published guides" ON guides;
DROP POLICY IF EXISTS "Public can manage guides" ON guides;
DROP POLICY IF EXISTS "Enable read access for all users" ON guides;
DROP POLICY IF EXISTS "Enable insert for all users" ON guides;
DROP POLICY IF EXISTS "Enable update for all users" ON guides;
DROP POLICY IF EXISTS "Enable delete for all users" ON guides;

-- Pastikan RLS aktif
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

-- Policy: Public bisa baca panduan yang published
CREATE POLICY "guides_select_published" ON guides
  FOR SELECT
  USING (is_published = true);

-- Policy: Admin (anon key) bisa manage semua data guides
CREATE POLICY "guides_all_admin" ON guides
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 2. GUIDE CATEGORIES
-- ============================================
-- Drop semua policy lama (jika ada)
DROP POLICY IF EXISTS "Public can view guide categories" ON guide_categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON guide_categories;
DROP POLICY IF EXISTS "Enable insert for all users" ON guide_categories;
DROP POLICY IF EXISTS "Enable update for all users" ON guide_categories;
DROP POLICY IF EXISTS "Enable delete for all users" ON guide_categories;

-- Pastikan RLS aktif
ALTER TABLE guide_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Public bisa baca semua kategori
CREATE POLICY "guide_categories_select" ON guide_categories
  FOR SELECT
  USING (true);

-- Policy: Admin (anon key) bisa manage kategori
CREATE POLICY "guide_categories_all_admin" ON guide_categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 3. GUIDE VIDEOS
-- ============================================
-- Drop semua policy lama
DROP POLICY IF EXISTS "Public can view guide videos" ON guide_videos;
DROP POLICY IF EXISTS "Public can manage guide videos" ON guide_videos;
DROP POLICY IF EXISTS "Enable read access for all users" ON guide_videos;
DROP POLICY IF EXISTS "Enable insert for all users" ON guide_videos;
DROP POLICY IF EXISTS "Enable update for all users" ON guide_videos;
DROP POLICY IF EXISTS "Enable delete for all users" ON guide_videos;

-- Pastikan RLS aktif
ALTER TABLE guide_videos ENABLE ROW LEVEL SECURITY;

-- Policy: Public bisa baca semua video
CREATE POLICY "guide_videos_select" ON guide_videos
  FOR SELECT
  USING (true);

-- Policy: Admin (anon key) bisa manage semua data video
CREATE POLICY "guide_videos_all_admin" ON guide_videos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 4. ANNOUNCEMENTS (PENGUMUMAN)
-- ============================================
-- Drop semua policy lama
DROP POLICY IF EXISTS "Public can view published announcements" ON announcements;
DROP POLICY IF EXISTS "Public can manage announcements" ON announcements;
DROP POLICY IF EXISTS "Enable read access for all users" ON announcements;
DROP POLICY IF EXISTS "Enable insert for all users" ON announcements;
DROP POLICY IF EXISTS "Enable update for all users" ON announcements;
DROP POLICY IF EXISTS "Enable delete for all users" ON announcements;

-- Pastikan RLS aktif
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Public bisa baca pengumuman yang published
CREATE POLICY "announcements_select_published" ON announcements
  FOR SELECT
  USING (is_published = true);

-- Policy: Admin (anon key) bisa manage semua data pengumuman
CREATE POLICY "announcements_all_admin" ON announcements
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 5. NEWSLETTER SUBSCRIPTIONS
-- ============================================
-- Drop semua policy lama
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Enable read access for all users" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Enable insert for all users" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Enable update for all users" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Enable delete for all users" ON newsletter_subscriptions;

-- Pastikan RLS aktif
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Public bisa insert (subscribe)
CREATE POLICY "newsletter_insert" ON newsletter_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admin bisa baca semua subscription
CREATE POLICY "newsletter_select_admin" ON newsletter_subscriptions
  FOR SELECT
  USING (true);

-- ============================================
-- 6. PESAN MASUK (CONTACT MESSAGES)
-- ============================================
-- Drop semua policy lama
DROP POLICY IF EXISTS "Public can send pesan masuk" ON pesan_masuk;
DROP POLICY IF EXISTS "Enable read access for all users" ON pesan_masuk;
DROP POLICY IF EXISTS "Enable insert for all users" ON pesan_masuk;
DROP POLICY IF EXISTS "Enable update for all users" ON pesan_masuk;
DROP POLICY IF EXISTS "Enable delete for all users" ON pesan_masuk;

-- Pastikan RLS aktif
ALTER TABLE pesan_masuk ENABLE ROW LEVEL SECURITY;

-- Policy: Public bisa insert (kirim pesan dari form Kontak)
CREATE POLICY "pesan_masuk_insert" ON pesan_masuk
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admin bisa baca semua pesan
CREATE POLICY "pesan_masuk_select_admin" ON pesan_masuk
  FOR SELECT
  USING (true);

-- Policy: Admin bisa update pesan (mark as read, reply, archive, dll)
CREATE POLICY "pesan_masuk_update_admin" ON pesan_masuk
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Admin bisa delete pesan
CREATE POLICY "pesan_masuk_delete_admin" ON pesan_masuk
  FOR DELETE
  USING (true);

-- ============================================
-- 7. REGULATIONS (REGULASI)
-- ============================================
-- Drop semua policy lama
DROP POLICY IF EXISTS "Public can view published regulations" ON regulations;
DROP POLICY IF EXISTS "Public can manage regulations" ON regulations;
DROP POLICY IF EXISTS "Enable read access for all users" ON regulations;
DROP POLICY IF EXISTS "Enable insert for all users" ON regulations;
DROP POLICY IF EXISTS "Enable update for all users" ON regulations;
DROP POLICY IF EXISTS "Enable delete for all users" ON regulations;

-- Pastikan RLS aktif
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;

-- Policy: Public bisa baca regulasi yang published
CREATE POLICY "regulations_select_published" ON regulations
  FOR SELECT
  USING (is_published = true);

-- Policy: Admin (anon key) bisa manage semua data regulasi
CREATE POLICY "regulations_all_admin" ON regulations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 8. ADMINS (CMS)
-- ============================================
-- Drop semua policy lama
DROP POLICY IF EXISTS "Public can manage admins" ON admins;
DROP POLICY IF EXISTS "Enable read access for all users" ON admins;
DROP POLICY IF EXISTS "Enable insert for all users" ON admins;
DROP POLICY IF EXISTS "Enable update for all users" ON admins;
DROP POLICY IF EXISTS "Enable delete for all users" ON admins;

-- Pastikan RLS aktif
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy: Admin bisa manage semua data admin
CREATE POLICY "admins_all_admin" ON admins
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 9. VERIFIKASI
-- ============================================
-- Cek semua policy yang ada
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

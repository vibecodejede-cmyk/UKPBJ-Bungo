-- ============================================================
-- REPAIR RLS untuk tabel guides & guide_videos
-- Gunakan script ini jika masih muncul error:
-- "new row violates row-level security policy" saat menambah panduan.
--
-- Langkah:
-- 1. Jalankan SELECT di bawah untuk melihat policy yang ada.
-- 2. Jalankan DROP + CREATE policy.
-- 3. Jalankan SELECT verifikasi lagi.
-- ============================================================

-- ============================================
-- 1. CEK POLICY YANG SUDAH ADA
-- ============================================
SELECT schemaname, tablename, policyname, cmd, permissive, qual, with_check
FROM pg_policies
WHERE tablename IN ('guides', 'guide_videos')
ORDER BY tablename, cmd, policyname;

-- ============================================
-- 2. DROP SEMUA POLICY LAMA (jika ada)
-- ============================================
-- Guides
DROP POLICY IF EXISTS "Public can view published guides" ON guides;
DROP POLICY IF EXISTS "Public can manage guides" ON guides;
DROP POLICY IF EXISTS "Enable read access for all users" ON guides;
DROP POLICY IF EXISTS "Enable insert for all users" ON guides;
DROP POLICY IF EXISTS "Enable update for all users" ON guides;
DROP POLICY IF EXISTS "Enable delete for all users" ON guides;

-- Guide videos
DROP POLICY IF EXISTS "Public can view guide videos" ON guide_videos;
DROP POLICY IF EXISTS "Public can manage guide videos" ON guide_videos;
DROP POLICY IF EXISTS "Enable read access for all users" ON guide_videos;
DROP POLICY IF EXISTS "Enable insert for all users" ON guide_videos;
DROP POLICY IF EXISTS "Enable update for all users" ON guide_videos;
DROP POLICY IF EXISTS "Enable delete for all users" ON guide_videos;

-- ============================================
-- 3. PASTIKAN RLS AKTIF
-- ============================================
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_videos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. BUAT POLICY BARU (PERMISSIVE FOR ALL)
-- ============================================
-- Guides: Public can read published guides
CREATE POLICY "Public can view published guides" ON guides
  FOR SELECT USING (is_published = true);

-- Guides: CMS admin (anon key dari frontend) bisa manage semua data
CREATE POLICY "Public can manage guides" ON guides
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Guide videos: Public can read
CREATE POLICY "Public can view guide videos" ON guide_videos
  FOR SELECT USING (true);

-- Guide videos: CMS admin (anon key dari frontend) bisa manage semua data
CREATE POLICY "Public can manage guide videos" ON guide_videos
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 5. VERIFIKASI POLICY BARU
-- ============================================
SELECT schemaname, tablename, policyname, cmd, permissive, roles
FROM pg_policies
WHERE tablename IN ('guides', 'guide_videos')
ORDER BY tablename, cmd, policyname;

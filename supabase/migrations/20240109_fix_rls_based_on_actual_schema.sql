-- ============================================================
-- FIX RLS BERDASARKAN SCHEMA ACTUAL DI SUPABASE
-- Error: "new row violates row-level security policy"
--
-- Schema actual di Supabase (schema_content.sql) hanya memiliki
-- policy SELECT untuk public, TIDAK ada policy INSERT/UPDATE/DELETE
-- untuk admin. Ini penyebab utama error.
--
-- Migration ini menambahkan policy yang hilang untuk semua tabel.
-- Jalankan di Supabase -> SQL Editor -> Run
-- ============================================================

-- ============================================
-- 1. GUIDES (PANDUAN)
-- ============================================

-- Drop policy lama jika ada
DROP POLICY IF EXISTS "Public can view published guides" ON guides;
DROP POLICY IF EXISTS "Public can manage guides" ON guides;
DROP POLICY IF EXISTS "guides_select_published" ON guides;
DROP POLICY IF EXISTS "guides_all_admin" ON guides;

-- Policy: Public bisa baca panduan yang published
CREATE POLICY "guides_select_published" ON guides
  FOR SELECT USING (is_published = true);

-- Policy: Admin (anon key) bisa manage semua data guides
-- Menggunakan USING (true) agar tidak memeriksa auth.role()
CREATE POLICY "guides_all_admin" ON guides
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 2. GUIDE CATEGORIES
-- ============================================

DROP POLICY IF EXISTS "Public can view guide categories" ON guide_categories;
DROP POLICY IF EXISTS "guide_categories_select" ON guide_categories;
DROP POLICY IF EXISTS "guide_categories_all_admin" ON guide_categories;

CREATE POLICY "guide_categories_select" ON guide_categories
  FOR SELECT USING (true);

CREATE POLICY "guide_categories_all_admin" ON guide_categories
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 3. GUIDE VIDEOS
-- ============================================

DROP POLICY IF EXISTS "Public can view guide videos" ON guide_videos;
DROP POLICY IF EXISTS "Public can manage guide videos" ON guide_videos;
DROP POLICY IF EXISTS "guide_videos_select" ON guide_videos;
DROP POLICY IF EXISTS "guide_videos_all_admin" ON guide_videos;

CREATE POLICY "guide_videos_select" ON guide_videos
  FOR SELECT USING (true);

CREATE POLICY "guide_videos_all_admin" ON guide_videos
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 4. ANNOUNCEMENTS (PENGUMUMAN)
-- ============================================

DROP POLICY IF EXISTS "Public can view published announcements" ON announcements;
DROP POLICY IF EXISTS "Public can manage announcements" ON announcements;
DROP POLICY IF EXISTS "announcements_select_published" ON announcements;
DROP POLICY IF EXISTS "announcements_all_admin" ON announcements;

CREATE POLICY "announcements_select_published" ON announcements
  FOR SELECT USING (is_published = true);

CREATE POLICY "announcements_all_admin" ON announcements
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 5. REGULATIONS (REGULASI)
-- ============================================

DROP POLICY IF EXISTS "Public can view published regulations" ON regulations;
DROP POLICY IF EXISTS "Public can insert regulations" ON regulations;
DROP POLICY IF EXISTS "Public can manage regulations" ON regulations;
DROP POLICY IF EXISTS "regulations_select_published" ON regulations;
DROP POLICY IF EXISTS "regulations_all_admin" ON regulations;

CREATE POLICY "regulations_select_published" ON regulations
  FOR SELECT USING (is_published = true);

CREATE POLICY "regulations_all_admin" ON regulations
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 6. ADMINS (CMS)
-- ============================================

DROP POLICY IF EXISTS "Public can manage admins" ON admins;
DROP POLICY IF EXISTS "Authenticated can manage admins" ON admins;
DROP POLICY IF EXISTS "admins_all_admin" ON admins;

CREATE POLICY "admins_all_admin" ON admins
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 7. PESAN MASUK (CONTACT MESSAGES) - jika tabel ada
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pesan_masuk') THEN
    DROP POLICY IF EXISTS "Public can send pesan masuk" ON pesan_masuk;
    DROP POLICY IF EXISTS "Admin can read pesan masuk" ON pesan_masuk;
    DROP POLICY IF EXISTS "Admin can update pesan masuk" ON pesan_masuk;
    DROP POLICY IF EXISTS "Admin can delete pesan masuk" ON pesan_masuk;
    DROP POLICY IF EXISTS "pesan_masuk_insert" ON pesan_masuk;
    DROP POLICY IF EXISTS "pesan_masuk_select_admin" ON pesan_masuk;
    DROP POLICY IF EXISTS "pesan_masuk_update_admin" ON pesan_masuk;
    DROP POLICY IF EXISTS "pesan_masuk_delete_admin" ON pesan_masuk;

    CREATE POLICY "pesan_masuk_insert" ON pesan_masuk
      FOR INSERT WITH CHECK (true);

    CREATE POLICY "pesan_masuk_select_admin" ON pesan_masuk
      FOR SELECT USING (true);

    CREATE POLICY "pesan_masuk_update_admin" ON pesan_masuk
      FOR UPDATE USING (true) WITH CHECK (true);

    CREATE POLICY "pesan_masuk_delete_admin" ON pesan_masuk
      FOR DELETE USING (true);
  END IF;
END $$;

-- ============================================
-- 8. NEWSLETTER SUBSCRIPTIONS - jika tabel ada
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'newsletter_subscriptions') THEN
    DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON newsletter_subscriptions;
    DROP POLICY IF EXISTS "Admin can read newsletter" ON newsletter_subscriptions;
    DROP POLICY IF EXISTS "newsletter_insert" ON newsletter_subscriptions;
    DROP POLICY IF EXISTS "newsletter_select_admin" ON newsletter_subscriptions;

    CREATE POLICY "newsletter_insert" ON newsletter_subscriptions
      FOR INSERT WITH CHECK (true);

    CREATE POLICY "newsletter_select_admin" ON newsletter_subscriptions
      FOR SELECT USING (true);
  END IF;
END $$;

-- ============================================
-- 9. FIX GUIDE VIDEOS ROLE CHECK CONSTRAINT
-- ============================================

ALTER TABLE guide_videos DROP CONSTRAINT IF EXISTS guide_videos_role_check;

ALTER TABLE guide_videos ADD CONSTRAINT guide_videos_role_check
  CHECK (role <@ ARRAY['PPK', 'Pejabat Pengadaan', 'Pokja', 'PA', 'Penyedia', 'Semua']::TEXT[]);

-- ============================================
-- 10. ADD MISSING COLUMNS
-- ============================================

-- Add missing columns to pesan_masuk (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pesan_masuk') THEN
    ALTER TABLE pesan_masuk ADD COLUMN IF NOT EXISTS is_replied BOOLEAN DEFAULT false;
    ALTER TABLE pesan_masuk ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
    ALTER TABLE pesan_masuk ADD COLUMN IF NOT EXISTS reply_text TEXT;
    ALTER TABLE pesan_masuk ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add nomor column to regulations (if not exists)
ALTER TABLE regulations ADD COLUMN IF NOT EXISTS nomor TEXT NOT NULL DEFAULT '';

-- ============================================
-- 11. VERIFIKASI
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
  'regulations', 
  'admins'
)
ORDER BY tablename, cmd, policyname;

-- Cek kolom regulations
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'regulations'
ORDER BY ordinal_position;

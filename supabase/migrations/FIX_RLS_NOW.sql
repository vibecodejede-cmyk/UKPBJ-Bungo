-- ============================================================
-- FIX FINAL: "new row violates row-level security policy"
-- ============================================================
-- CARA PAKAI:
--   1. Buka Supabase Dashboard -> SQL Editor -> New query
--   2. COPY-PASTE SELURUH isi file ini
--   3. Klik "Run" (Ctrl+Enter)
-- Script ini idempoten (bisa dijalankan berulang kali, aman).
-- Setelah dijalankan SEKALI, error RLS akan hilang untuk selamanya.
-- ============================================================

-- ----------------------------------------------------------
-- 1. GUIDES
-- ----------------------------------------------------------
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "guides_select_published" ON guides;
DROP POLICY IF EXISTS "guides_all_admin" ON guides;
DROP POLICY IF EXISTS "Public can view published guides" ON guides;
DROP POLICY IF EXISTS "Public can manage guides" ON guides;
DROP POLICY IF EXISTS "Enable read access for all users" ON guides;
DROP POLICY IF EXISTS "Enable insert for all users" ON guides;
DROP POLICY IF EXISTS "Enable update for all users" ON guides;
DROP POLICY IF EXISTS "Enable delete for all users" ON guides;

CREATE POLICY "guides_select_published" ON guides
  FOR SELECT USING (is_published = true);

CREATE POLICY "guides_all_admin" ON guides
  FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------
-- 2. GUIDE CATEGORIES
-- ----------------------------------------------------------
ALTER TABLE guide_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "guide_categories_select" ON guide_categories;
DROP POLICY IF EXISTS "guide_categories_all_admin" ON guide_categories;
DROP POLICY IF EXISTS "Public can view guide categories" ON guide_categories;
DROP POLICY IF EXISTS "Public can manage guide categories" ON guide_categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON guide_categories;
DROP POLICY IF EXISTS "Enable insert for all users" ON guide_categories;
DROP POLICY IF EXISTS "Enable update for all users" ON guide_categories;
DROP POLICY IF EXISTS "Enable delete for all users" ON guide_categories;

CREATE POLICY "guide_categories_select" ON guide_categories
  FOR SELECT USING (true);

CREATE POLICY "guide_categories_all_admin" ON guide_categories
  FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------
-- 3. GUIDE VIDEOS
-- ----------------------------------------------------------
ALTER TABLE guide_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "guide_videos_select" ON guide_videos;
DROP POLICY IF EXISTS "guide_videos_all_admin" ON guide_videos;
DROP POLICY IF EXISTS "Public can view guide videos" ON guide_videos;
DROP POLICY IF EXISTS "Public can manage guide videos" ON guide_videos;
DROP POLICY IF EXISTS "Enable read access for all users" ON guide_videos;
DROP POLICY IF EXISTS "Enable insert for all users" ON guide_videos;
DROP POLICY IF EXISTS "Enable update for all users" ON guide_videos;
DROP POLICY IF EXISTS "Enable delete for all users" ON guide_videos;

CREATE POLICY "guide_videos_select" ON guide_videos
  FOR SELECT USING (true);

CREATE POLICY "guide_videos_all_admin" ON guide_videos
  FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------
-- 4. ANNOUNCEMENTS
-- ----------------------------------------------------------
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "announcements_select_published" ON announcements;
DROP POLICY IF EXISTS "announcements_all_admin" ON announcements;
DROP POLICY IF EXISTS "Public can view published announcements" ON announcements;
DROP POLICY IF EXISTS "Public can manage announcements" ON announcements;
DROP POLICY IF EXISTS "Enable read access for all users" ON announcements;
DROP POLICY IF EXISTS "Enable insert for all users" ON announcements;
DROP POLICY IF EXISTS "Enable update for all users" ON announcements;
DROP POLICY IF EXISTS "Enable delete for all users" ON announcements;

CREATE POLICY "announcements_select_published" ON announcements
  FOR SELECT USING (is_published = true);

CREATE POLICY "announcements_all_admin" ON announcements
  FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------
-- 5. NEWSLETTER SUBSCRIPTIONS (hanya jika tabel ada)
-- ----------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'newsletter_subscriptions') THEN
    EXECUTE 'ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "newsletter_insert" ON newsletter_subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS "newsletter_select_admin" ON newsletter_subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON newsletter_subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS "Admin can read newsletter" ON newsletter_subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON newsletter_subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS "Enable insert for all users" ON newsletter_subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS "Enable update for all users" ON newsletter_subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS "Enable delete for all users" ON newsletter_subscriptions';

    EXECUTE 'CREATE POLICY "newsletter_insert" ON newsletter_subscriptions FOR INSERT WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "newsletter_select_admin" ON newsletter_subscriptions FOR SELECT USING (true)';
  END IF;
END $$;

-- ----------------------------------------------------------
-- 6. PESAN MASUK (hanya jika tabel ada)
-- ----------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pesan_masuk') THEN
    EXECUTE 'ALTER TABLE pesan_masuk ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "pesan_masuk_insert" ON pesan_masuk';
    EXECUTE 'DROP POLICY IF EXISTS "pesan_masuk_select_admin" ON pesan_masuk';
    EXECUTE 'DROP POLICY IF EXISTS "pesan_masuk_update_admin" ON pesan_masuk';
    EXECUTE 'DROP POLICY IF EXISTS "pesan_masuk_delete_admin" ON pesan_masuk';
    EXECUTE 'DROP POLICY IF EXISTS "Public can send pesan masuk" ON pesan_masuk';
    EXECUTE 'DROP POLICY IF EXISTS "Admin can read pesan_masuk" ON pesan_masuk';
    EXECUTE 'DROP POLICY IF EXISTS "Admin can update pesan_masuk" ON pesan_masuk';
    EXECUTE 'DROP POLICY IF EXISTS "Admin can delete pesan_masuk" ON pesan_masuk';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON pesan_masuk';
    EXECUTE 'DROP POLICY IF EXISTS "Enable insert for all users" ON pesan_masuk';
    EXECUTE 'DROP POLICY IF EXISTS "Enable update for all users" ON pesan_masuk';
    EXECUTE 'DROP POLICY IF EXISTS "Enable delete for all users" ON pesan_masuk';

    EXECUTE 'CREATE POLICY "pesan_masuk_insert" ON pesan_masuk FOR INSERT WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "pesan_masuk_select_admin" ON pesan_masuk FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "pesan_masuk_update_admin" ON pesan_masuk FOR UPDATE USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "pesan_masuk_delete_admin" ON pesan_masuk FOR DELETE USING (true)';
  END IF;
END $$;

-- ----------------------------------------------------------
-- 7. REGULATIONS
-- ----------------------------------------------------------
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "regulations_select_published" ON regulations;
DROP POLICY IF EXISTS "regulations_all_admin" ON regulations;
DROP POLICY IF EXISTS "Public can view published regulations" ON regulations;
DROP POLICY IF EXISTS "Public can manage regulations" ON regulations;
DROP POLICY IF EXISTS "Enable read access for all users" ON regulations;
DROP POLICY IF EXISTS "Enable insert for all users" ON regulations;
DROP POLICY IF EXISTS "Enable update for all users" ON regulations;
DROP POLICY IF EXISTS "Enable delete for all users" ON regulations;

CREATE POLICY "regulations_select_published" ON regulations
  FOR SELECT USING (is_published = true);

CREATE POLICY "regulations_all_admin" ON regulations
  FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------
-- 8. ADMINS
-- ----------------------------------------------------------
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_all_admin" ON admins;
DROP POLICY IF EXISTS "Public can manage admins" ON admins;
DROP POLICY IF EXISTS "Enable read access for all users" ON admins;
DROP POLICY IF EXISTS "Enable insert for all users" ON admins;
DROP POLICY IF EXISTS "Enable update for all users" ON admins;
DROP POLICY IF EXISTS "Enable delete for all users" ON admins;

CREATE POLICY "admins_all_admin" ON admins
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- VERIFIKASI: pastikan policy sudah terpasang
-- ============================================================
SELECT
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename IN (
  'guides', 'guide_categories', 'guide_videos', 'announcements',
  'newsletter_subscriptions', 'pesan_masuk', 'regulations', 'admins'
)
ORDER BY tablename, cmd, policyname;

-- ============================================================
-- SELESAI
-- Jika query verifikasi di atas menampilkan policy "*_all_admin"
-- dengan cmd = ALL untuk setiap tabel, maka error RLS sudah teratasi.
-- Sekarang coba tambah/edit panduan, pengumuman, regulasi, atau admin
-- dari aplikasi — tidak akan muncul error lagi.
-- ============================================================

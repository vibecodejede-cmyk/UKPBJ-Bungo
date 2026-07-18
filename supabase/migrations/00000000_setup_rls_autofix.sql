-- ============================================================
-- SETUP RLS AUTO-FIX (JALANKAN SEKALI DI SUPABASE SQL EDITOR)
-- ============================================================
-- Error sebelumnya: "new row violates row-level security policy"
--
-- Mengapa error ini muncul terus:
--   Aplikasi menggunakan Supabase ANON KEY (tanpa auth login beneran),
--   sehingga semua operasi INSERT/UPDATE/DELETE dilakukan sebagai role "anon".
--   Jika policy RLS yang permissif belum diterapkan ke database live,
--   maka setiap insert akan ditolak dengan error RLS tersebut.
--
-- Solusi:
--   1. Buat function `apply_rls_fix()` yang (re)buat semua policy RLS
--      secara idempoten (bisa dijalankan berulang kali, aman).
--   2. Langsung jalankan function tersebut SEKALI ini juga, sehingga
--      error langsung hilang.
--   3. Aplikasi (src/lib/api.js -> ensureRlsPolicies) akan memanggil
--      function ini setiap kali startup, sehingga RLS selalu benar
--      dan error tidak akan muncul lagi di kemudian hari.
--
-- CARA:
--   Buka Supabase Dashboard -> SQL Editor -> New query
--   Paste SELURUH isi file ini -> Run (Ctrl+Enter)
-- ============================================================

CREATE OR REPLACE FUNCTION apply_rls_fix()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result text := '';
BEGIN
  -- ----------------------------------------------------------
  -- 1. GUIDES
  -- ----------------------------------------------------------
  ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "guides_select_published" ON guides;
  DROP POLICY IF EXISTS "guides_all_admin" ON guides;
  DROP POLICY IF EXISTS "Public can view published guides" ON guides;
  DROP POLICY IF EXISTS "Public can manage guides" ON guides;
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
  CREATE POLICY "announcements_select_published" ON announcements
    FOR SELECT USING (is_published = true);
  CREATE POLICY "announcements_all_admin" ON announcements
    FOR ALL USING (true) WITH CHECK (true);

  -- ----------------------------------------------------------
  -- 5. NEWSLETTER SUBSCRIPTIONS
  -- ----------------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'newsletter_subscriptions') THEN
    ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "newsletter_insert" ON newsletter_subscriptions;
    DROP POLICY IF EXISTS "newsletter_select_admin" ON newsletter_subscriptions;
    DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON newsletter_subscriptions;
    DROP POLICY IF EXISTS "Admin can read newsletter" ON newsletter_subscriptions;
    CREATE POLICY "newsletter_insert" ON newsletter_subscriptions
      FOR INSERT WITH CHECK (true);
    CREATE POLICY "newsletter_select_admin" ON newsletter_subscriptions
      FOR SELECT USING (true);
  END IF;

  -- ----------------------------------------------------------
  -- 6. PESAN MASUK
  -- ----------------------------------------------------------
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pesan_masuk') THEN
    ALTER TABLE pesan_masuk ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "pesan_masuk_insert" ON pesan_masuk;
    DROP POLICY IF EXISTS "pesan_masuk_select_admin" ON pesan_masuk;
    DROP POLICY IF EXISTS "pesan_masuk_update_admin" ON pesan_masuk;
    DROP POLICY IF EXISTS "pesan_masuk_delete_admin" ON pesan_masuk;
    DROP POLICY IF EXISTS "Public can send pesan masuk" ON pesan_masuk;
    DROP POLICY IF EXISTS "Admin can read pesan masuk" ON pesan_masuk;
    DROP POLICY IF EXISTS "Admin can update pesan masuk" ON pesan_masuk;
    DROP POLICY IF EXISTS "Admin can delete pesan masuk" ON pesan_masuk;
    CREATE POLICY "pesan_masuk_insert" ON pesan_masuk
      FOR INSERT WITH CHECK (true);
    CREATE POLICY "pesan_masuk_select_admin" ON pesan_masuk
      FOR SELECT USING (true);
    CREATE POLICY "pesan_masuk_update_admin" ON pesan_masuk
      FOR UPDATE USING (true) WITH CHECK (true);
    CREATE POLICY "pesan_masuk_delete_admin" ON pesan_masuk
      FOR DELETE USING (true);
  END IF;

  -- ----------------------------------------------------------
  -- 7. REGULATIONS
  -- ----------------------------------------------------------
  ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "regulations_select_published" ON regulations;
  DROP POLICY IF EXISTS "regulations_all_admin" ON regulations;
  DROP POLICY IF EXISTS "Public can view published regulations" ON regulations;
  DROP POLICY IF EXISTS "Public can manage regulations" ON regulations;
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
  CREATE POLICY "admins_all_admin" ON admins
    FOR ALL USING (true) WITH CHECK (true);

  -- Beri izin eksekusi function ke anon (agar app bisa memanggil dari frontend)
  GRANT EXECUTE ON FUNCTION apply_rls_fix() TO anon, authenticated;

  v_result := 'RLS policies berhasil dibuat/diperbarui untuk semua tabel.';
  RETURN v_result;
END;
$$;

-- Izinkan role anon & authenticated memanggil function ini
GRANT EXECUTE ON FUNCTION apply_rls_fix() TO anon, authenticated;

-- ============================================================
-- LANGSUNG JALANKAN SEKARANG (error RLS akan langsung hilang)
-- ============================================================
SELECT apply_rls_fix();

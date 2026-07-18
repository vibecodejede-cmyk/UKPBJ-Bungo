-- ============================================================
-- FIX RLS agar CMS admin (anon key dari frontend) bisa
-- INSERT / SELECT / UPDATE / DELETE pada tabel guides & guide_videos.
--
-- Jalankan SELURUH script ini di Supabase -> SQL Editor -> Run.
-- Tanpa policy UPDATE, edit panduan akan menghasilkan
-- "0 baris terpengaruh" (data tidak berubah).
-- ============================================================

-- 1) guides
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can manage guides" ON guides;
CREATE POLICY "Public can manage guides"
  ON guides
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 2) guide_videos
ALTER TABLE guide_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can manage guide videos" ON guide_videos;
CREATE POLICY "Public can manage guide videos"
  ON guide_videos
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Verifikasi (opsional): pastikan kedua policy muncul di bawah ini.
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('guides', 'guide_videos')
ORDER BY tablename, policyname;

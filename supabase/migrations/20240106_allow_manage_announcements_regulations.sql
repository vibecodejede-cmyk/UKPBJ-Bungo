-- ============================================================
-- FIX RLS agar CMS admin (anon key dari frontend) bisa
-- INSERT / SELECT / UPDATE / DELETE pada tabel announcements & regulations.
--
-- Jalankan SELURUH script ini di Supabase -> SQL Editor -> Run.
-- ============================================================

-- 1) announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can manage announcements" ON announcements;
CREATE POLICY "Public can manage announcements"
  ON announcements
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 2) regulations
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can manage regulations" ON regulations;
CREATE POLICY "Public can manage regulations"
  ON regulations
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Verifikasi (opsional): pastikan policy muncul di bawah ini.
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('announcements', 'regulations')
ORDER BY tablename, policyname;

-- ============================================================
-- Fix CHECK constraint pada tabel guide_videos agar nilai
-- 'Semua' bisa disimpan (konsisten dengan dropdown di CMS).
--
-- Jalankan di Supabase -> SQL Editor -> Run.
-- ============================================================

-- Drop constraint lama (jika ada)
ALTER TABLE guide_videos DROP CONSTRAINT IF EXISTS guide_videos_role_check;

-- Buat constraint baru yang termasuk 'Semua'
ALTER TABLE guide_videos ADD CONSTRAINT guide_videos_role_check
  CHECK (role <@ ARRAY['PPK', 'Pejabat Pengadaan', 'Pokja', 'PA', 'Penyedia', 'Semua']::TEXT[]);

-- Verifikasi
SELECT
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'guide_videos_role_check';

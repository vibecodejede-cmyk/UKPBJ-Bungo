-- Izinkan peran 'Editor' (gabungan Editor Panduan/Regulasi/Pengumuman)
-- di tabel admins agar formulir tambah admin tidak melanggar check constraint.
ALTER TABLE admins
  DROP CONSTRAINT IF EXISTS admins_role_check;

ALTER TABLE admins
  ADD CONSTRAINT admins_role_check
  CHECK (role IN ('Super Admin', 'Editor', 'Editor Panduan', 'Editor Regulasi', 'Editor Pengumuman'));

-- Perbarui default agar admin baru menggunakan 'Editor'
ALTER TABLE admins
  ALTER COLUMN role SET DEFAULT 'Editor';

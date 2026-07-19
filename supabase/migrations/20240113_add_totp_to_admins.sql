-- Tambahkan kolom TOTP (Google Authenticator) ke tabel admins.
-- Aman dijalankan berulang kali (idempoten).

ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS totp_secret TEXT,
  ADD COLUMN IF NOT EXISTS totp_enrolled BOOLEAN NOT NULL DEFAULT FALSE;

-- Pastikan RLS tetap mengizinkan manage admins (aplikasi pakai anon key).
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins_all_admin" ON admins;
CREATE POLICY "admins_all_admin" ON admins
  FOR ALL USING (true) WITH CHECK (true);

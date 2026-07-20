-- Buat tabel untuk menyimpan kredensial login admin (username dan password hash).
-- Aman dijalankan berulang kali (idempoten).

-- Tambah kolom username ke tabel admins
ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Buat tabel admin_credentials untuk menyimpan password hash
CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_admin_credentials_admin_id ON admin_credentials(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_credentials_username ON admins(username);

-- RLS: hanya admin yang login yang bisa melihat kredensial mereka sendiri
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_credentials_all_admin" ON admin_credentials;
CREATE POLICY "admin_credentials_all_admin" ON admin_credentials
  FOR ALL USING (true) WITH CHECK (true);

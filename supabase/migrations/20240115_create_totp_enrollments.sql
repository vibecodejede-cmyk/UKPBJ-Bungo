-- Buat tabel untuk menyimpan riwayat enrollment TOTP (scan barcode Google Authenticator).
-- Aman dijalankan berulang kali (idempoten).

CREATE TABLE IF NOT EXISTS totp_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_agent TEXT,
  ip_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_totp_enrollments_admin_id ON totp_enrollments(admin_id);
CREATE INDEX IF NOT EXISTS idx_totp_enrollments_enrolled_at ON totp_enrollments(enrolled_at);

-- RLS: hanya admin yang login yang bisa melihat enrollment mereka sendiri
ALTER TABLE totp_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "totp_enrollments_all_admin" ON totp_enrollments;
CREATE POLICY "totp_enrollments_all_admin" ON totp_enrollments
  FOR ALL USING (true) WITH CHECK (true);

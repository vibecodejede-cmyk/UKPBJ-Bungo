-- Buat tabel untuk menyimpan kode verifikasi WhatsApp.
-- Aman dijalankan berulang kali (idempoten).

CREATE TABLE IF NOT EXISTS whatsapp_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  phone TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_verifications_admin_id ON whatsapp_verifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_verifications_expires_at ON whatsapp_verifications(expires_at);

-- RLS: buka akses untuk sekarang (client-side app).
-- Di production, pertimbangkan untuk membatasi akses sesuai kebutuhan.
ALTER TABLE whatsapp_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_verifications_all_admin" ON whatsapp_verifications;
CREATE POLICY "whatsapp_verifications_all_admin" ON whatsapp_verifications
  FOR ALL USING (true) WITH CHECK (true);

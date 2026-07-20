-- Tambahkan kolom WhatsApp ke tabel admins untuk login OTP.
-- Aman dijalankan berulang kali (idempoten).

ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS whatsapp TEXT;

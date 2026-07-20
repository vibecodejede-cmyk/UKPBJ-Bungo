-- Fix admins role check constraint - remove old editor roles
-- Jalankan di Supabase SQL Editor

-- Drop existing constraint
ALTER TABLE admins DROP CONSTRAINT IF EXISTS admins_role_check;

-- Add updated constraint with only Super Admin and Admin
ALTER TABLE admins ADD CONSTRAINT admins_role_check
  CHECK (role IN ('Super Admin', 'Admin'));

-- Update any existing old editor roles to 'Admin'
UPDATE admins
SET role = 'Admin'
WHERE role IN ('Editor', 'Editor Panduan', 'Editor Regulasi', 'Editor Pengumuman');

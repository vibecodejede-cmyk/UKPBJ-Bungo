-- ============================================
-- Complete Schema for pesan_masuk (Contact Messages)
-- Run this in Supabase SQL Editor to recreate the table
-- ============================================

-- Drop the table if it exists (WARNING: this deletes all data)
DROP TABLE IF EXISTS pesan_masuk CASCADE;

-- Create the table with correct structure
CREATE TABLE pesan_masuk (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE pesan_masuk ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can send pesan masuk" ON pesan_masuk;
DROP POLICY IF EXISTS "Public can insert pesan_masuk" ON pesan_masuk;
DROP POLICY IF EXISTS "Allow public insert" ON pesan_masuk;
DROP POLICY IF EXISTS "Public can view own messages" ON pesan_masuk;
DROP POLICY IF EXISTS "Enable read access for all users" ON pesan_masuk;
DROP POLICY IF EXISTS "Enable insert for all users" ON pesan_masuk;

-- Policy: Allow anyone to INSERT (submit contact form)
CREATE POLICY "Enable insert for all users" ON pesan_masuk
  FOR INSERT WITH CHECK (true);

-- Policy: Allow anyone to SELECT (read messages)
CREATE POLICY "Enable read access for all users" ON pesan_masuk
  FOR SELECT USING (true);

-- Verify the table was created correctly
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'pesan_masuk'
ORDER BY ordinal_position;

-- Verify the policies were created
SELECT 
  policyname, 
  cmd, 
  permissive, 
  roles, 
  with_check
FROM pg_policies 
WHERE tablename = 'pesan_masuk';

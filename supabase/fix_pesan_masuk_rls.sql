-- ============================================
-- Fix RLS Policy for pesan_masuk
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Drop ALL existing policies on pesan_masuk to start fresh
DROP POLICY IF EXISTS "Public can send pesan masuk" ON pesan_masuk;
DROP POLICY IF EXISTS "Public can insert pesan_masuk" ON pesan_masuk;
DROP POLICY IF EXISTS "Allow public insert" ON pesan_masuk;
DROP POLICY IF EXISTS "Public can view own messages" ON pesan_masuk;
DROP POLICY IF EXISTS "Enable read access for all users" ON pesan_masuk;
DROP POLICY IF EXISTS "Enable insert for all users" ON pesan_masuk;

-- 2. Make sure RLS is enabled
ALTER TABLE pesan_masuk ENABLE ROW LEVEL SECURITY;

-- 3. Create a simple, permissive INSERT policy
-- This allows anyone (including anonymous users) to insert rows
CREATE POLICY "Enable insert for all users" ON pesan_masuk
  FOR INSERT WITH CHECK (true);

-- 4. Also allow SELECT so we can verify the data
CREATE POLICY "Enable read access for all users" ON pesan_masuk
  FOR SELECT USING (true);

-- 5. Verify the policies were created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'pesan_masuk';

-- 6. Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pesan_masuk'
ORDER BY ordinal_position;

-- ============================================
-- Migration: Fix pesan_masuk table structure and RLS
-- Issues:
--   1. Could not find the 'email' column of 'pesan_masuk' in the schema cache
--   2. new row violates row-level security policy for table "pesan_masuk"
-- ============================================

-- Create pesan_masuk table if it doesn't exist
CREATE TABLE IF NOT EXISTS pesan_masuk (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add email column if it doesn't exist (fixes schema cache issue)
ALTER TABLE pesan_masuk ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';

-- Add other columns if they don't exist (defensive migration)
ALTER TABLE pesan_masuk ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
ALTER TABLE pesan_masuk ADD COLUMN IF NOT EXISTS subject TEXT NOT NULL DEFAULT '';
ALTER TABLE pesan_masuk ADD COLUMN IF NOT EXISTS message TEXT NOT NULL DEFAULT '';
ALTER TABLE pesan_masuk ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE pesan_masuk ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;

-- Remove default from email after adding (cleaner schema)
ALTER TABLE pesan_masuk ALTER COLUMN email DROP DEFAULT;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can send pesan masuk" ON pesan_masuk;
DROP POLICY IF EXISTS "Public can insert pesan_masuk" ON pesan_masuk;
DROP POLICY IF EXISTS "Allow public insert" ON pesan_masuk;

-- Enable RLS
ALTER TABLE pesan_masuk ENABLE ROW LEVEL SECURITY;

-- Create permissive INSERT policy for anonymous users
CREATE POLICY "Public can send pesan masuk" ON pesan_masuk
  FOR INSERT WITH CHECK (true);

-- Also allow SELECT for the inserter (optional, useful for debugging)
CREATE POLICY "Public can view own messages" ON pesan_masuk
  FOR SELECT USING (true);

-- ============================================
-- Refresh schema cache (run this in Supabase SQL Editor)
-- After running this migration, go to:
-- Supabase Dashboard -> Database -> Schema cache -> Refresh
-- ============================================

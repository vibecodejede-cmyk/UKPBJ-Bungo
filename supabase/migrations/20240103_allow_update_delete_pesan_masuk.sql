-- ============================================
-- Migration: Allow UPDATE and DELETE on pesan_masuk
-- The previous policies only permitted INSERT and SELECT, so marking a
-- message as read (UPDATE) was blocked by RLS. As a result the read status
-- never persisted to the database and the NotificationBell unread badge
-- kept showing stale counts (e.g. "1") on pages like the Dashboard.
-- ============================================

-- Make sure RLS is enabled
ALTER TABLE pesan_masuk ENABLE ROW LEVEL SECURITY;

-- Allow UPDATE so admins can mark messages as read / archive / reply.
DROP POLICY IF EXISTS "Enable update for all users" ON pesan_masuk;
CREATE POLICY "Enable update for all users" ON pesan_masuk
  FOR UPDATE USING (true) WITH CHECK (true);

-- Allow DELETE so admins can remove messages.
DROP POLICY IF EXISTS "Enable delete for all users" ON pesan_masuk;
CREATE POLICY "Enable delete for all users" ON pesan_masuk
  FOR DELETE USING (true);

-- Verify the policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'pesan_masuk'
ORDER BY cmd;

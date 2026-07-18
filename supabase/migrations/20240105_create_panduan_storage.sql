-- ============================================================
-- Buat bucket "panduan" di Supabase Storage untuk menyimpan
-- file PDF panduan dan gambar thumbnail video tutorial.
--
-- Jalankan di Supabase -> SQL Editor -> Run.
-- (Bucket juga bisa dibuat manual di Storage -> New bucket,
--  nama: panduan, Public: ON)
-- ============================================================

-- 1) Buat bucket (public agar URL bisa diakses tanpa auth)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'panduan',
  'panduan',
  true,
  52428800, -- 50 MB
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 52428800,
      allowed_mime_types = array['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'];

-- 2) Izinkan siapa saja (anon) untuk melihat/select object (karena bucket public)
drop policy if exists "Public can read panduan objects" on storage.objects;
create policy "Public can read panduan objects"
  on storage.objects
  for select
  using (bucket_id = 'panduan');

-- 3) Izinkan siapa saja (anon, dari CMS frontend) untuk upload/insert object
drop policy if exists "Public can upload panduan objects" on storage.objects;
create policy "Public can upload panduan objects"
  on storage.objects
  for insert
  with check (bucket_id = 'panduan');

-- 4) Izinkan update/delete object panduan
drop policy if exists "Public can update panduan objects" on storage.objects;
create policy "Public can update panduan objects"
  on storage.objects
  for update
  using (bucket_id = 'panduan')
  with check (bucket_id = 'panduan');

drop policy if exists "Public can delete panduan objects" on storage.objects;
create policy "Public can delete panduan objects"
  on storage.objects
  for delete
  using (bucket_id = 'panduan');

-- ============================================
-- UKPBJ Kabupaten Bungo - Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. GUIDES (PANDUAN) TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS guides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  role TEXT NOT NULL CHECK (role IN ('PPK', 'Vendor', 'Pokja', 'Admin', 'Semua')),
  category TEXT NOT NULL DEFAULT 'Panduan Inaproc' CHECK (category IN ('Panduan Inaproc', 'Panduan LPSE')),
  file_url TEXT,
  file_size TEXT,
  file_type TEXT DEFAULT 'pdf',
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_guides_role ON guides(role);
CREATE INDEX IF NOT EXISTS idx_guides_category ON guides(category);
CREATE INDEX IF NOT EXISTS idx_guides_published ON guides(is_published);
CREATE INDEX IF NOT EXISTS idx_guides_featured ON guides(is_featured);

-- ============================================
-- 2. GUIDE CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS guide_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 3. GUIDE VIDEOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS guide_videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration TEXT,
  category TEXT NOT NULL DEFAULT 'Panduan Inaproc' CHECK (category IN ('Panduan Inaproc', 'Panduan LPSE')),
  role TEXT[] NOT NULL DEFAULT '{PPK}' CHECK (role <@ ARRAY['PPK', 'Pejabat Pengadaan', 'Pokja', 'PA', 'Penyedia', 'Semua']::TEXT[]),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_guide_videos_category ON guide_videos(category);
CREATE INDEX IF NOT EXISTS idx_guide_videos_role ON guide_videos(role);

-- ============================================
-- 4. ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  badge TEXT NOT NULL,
  badge_class TEXT NOT NULL,
  date TEXT NOT NULL,
  detail_date TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 5. NEWSLETTER SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 6. CONTACT MESSAGES TABLE (pesan_masuk)
-- ============================================
CREATE TABLE IF NOT EXISTS pesan_masuk (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_replied BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  reply_text TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 7. REGULATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS regulations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nomor TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  document_url TEXT,
  publish_date TEXT NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 8. ADMINS TABLE (CMS - Kelola Admin)
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'Editor Panduan' CHECK (role IN ('Super Admin', 'Editor Panduan', 'Editor Regulasi', 'Editor Pengumuman')),
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif', 'Terkunci')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);

-- Sample data for admins
INSERT INTO admins (full_name, email, role, status) VALUES
  ('Ahmad Subardjo', 'ahmad.s@lpse.go.id', 'Super Admin', 'Aktif'),
  ('Siti Aminah', 'siti.a@lpse.go.id', 'Editor Regulasi', 'Aktif'),
  ('Budi Darmawan', 'budi.d@lpse.go.id', 'Editor Panduan', 'Nonaktif'),
  ('Ratna Sari', 'ratna.s@lpse.go.id', 'Super Admin', 'Terkunci')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesan_masuk ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;

-- Guides: Public can read published guides
DROP POLICY IF EXISTS "Public can view published guides" ON guides;
CREATE POLICY "Public can view published guides" ON guides
  FOR SELECT USING (is_published = true);

-- Guides: CMS admin (anon key from frontend) can manage guides
DROP POLICY IF EXISTS "Public can manage guides" ON guides;
CREATE POLICY "Public can manage guides" ON guides
  FOR ALL USING (true) WITH CHECK (true);

-- Guide categories: Public can read
DROP POLICY IF EXISTS "Public can view guide categories" ON guide_categories;
CREATE POLICY "Public can view guide categories" ON guide_categories
  FOR SELECT USING (true);

-- Guide categories: CMS admin can manage
DROP POLICY IF EXISTS "Public can manage guide categories" ON guide_categories;
CREATE POLICY "Public can manage guide categories" ON guide_categories
  FOR ALL USING (true) WITH CHECK (true);

-- Guide videos: Public can read
DROP POLICY IF EXISTS "Public can view guide videos" ON guide_videos;
CREATE POLICY "Public can view guide videos" ON guide_videos
  FOR SELECT USING (true);

-- Guide videos: CMS admin (anon key from frontend) can manage videos
DROP POLICY IF EXISTS "Public can manage guide videos" ON guide_videos;
CREATE POLICY "Public can manage guide videos" ON guide_videos
  FOR ALL USING (true) WITH CHECK (true);

-- Announcements: Public can read published announcements
DROP POLICY IF EXISTS "Public can view published announcements" ON announcements;
CREATE POLICY "Public can view published announcements" ON announcements
  FOR SELECT USING (is_published = true);

-- Announcements: CMS admin (anon key from frontend) can manage announcements
DROP POLICY IF EXISTS "Public can manage announcements" ON announcements;
CREATE POLICY "Public can manage announcements" ON announcements
  FOR ALL USING (true) WITH CHECK (true);

-- Newsletter: Public can insert
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON newsletter_subscriptions;
CREATE POLICY "Public can subscribe to newsletter" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

-- Newsletter: Admin can read
DROP POLICY IF EXISTS "Admin can read newsletter" ON newsletter_subscriptions;
CREATE POLICY "Admin can read newsletter" ON newsletter_subscriptions
  FOR SELECT USING (true);

-- Pesan Masuk: Public can insert (from Kontak form)
DROP POLICY IF EXISTS "Public can send pesan masuk" ON pesan_masuk;
CREATE POLICY "Public can send pesan masuk" ON pesan_masuk
  FOR INSERT WITH CHECK (true);

-- Pesan Masuk: Admin can read
DROP POLICY IF EXISTS "Admin can read pesan masuk" ON pesan_masuk;
CREATE POLICY "Admin can read pesan masuk" ON pesan_masuk
  FOR SELECT USING (true);

-- Pesan Masuk: Admin can update
DROP POLICY IF EXISTS "Admin can update pesan masuk" ON pesan_masuk;
CREATE POLICY "Admin can update pesan masuk" ON pesan_masuk
  FOR UPDATE USING (true) WITH CHECK (true);

-- Pesan Masuk: Admin can delete
DROP POLICY IF EXISTS "Admin can delete pesan masuk" ON pesan_masuk;
CREATE POLICY "Admin can delete pesan masuk" ON pesan_masuk
  FOR DELETE USING (true);

-- Regulations: Public can read published regulations
DROP POLICY IF EXISTS "Public can view published regulations" ON regulations;
CREATE POLICY "Public can view published regulations" ON regulations
  FOR SELECT USING (is_published = true);

-- Regulations: CMS admin (anon key from frontend) can manage regulations
DROP POLICY IF EXISTS "Public can manage regulations" ON regulations;
CREATE POLICY "Public can manage regulations" ON regulations
  FOR ALL USING (true) WITH CHECK (true);

-- Admins: Public can manage admins (for development)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can manage admins" ON admins;
CREATE POLICY "Public can manage admins" ON admins
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- SAMPLE DATA FOR GUIDES (PANDUAN)
-- ============================================
INSERT INTO guide_categories (name, slug, description, icon) VALUES
  ('PPK', 'ppk', 'Panduan untuk Pejabat Pembuat Komitmen', 'person'),
  ('Vendor', 'vendor', 'Panduan untuk Penyedia/Vendor', 'business'),
  ('Pokja', 'pokja', 'Panduan untuk Pokja Pemilihan', 'groups'),
  ('Admin', 'admin', 'Panduan untuk Admin LPSE', 'admin_panel_settings'),
  ('Umum', 'umum', 'Panduan umum untuk semua pengguna', 'public')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO guides (title, description, content, role, category, file_url, file_size, image_url, is_featured) VALUES
  (
    'Buku Saku Digital: Prosedur Pengadaan Barang/Jasa Pemerintah 2024',
    'Panduan komprehensif mengenai tata cara terbaru proses pengadaan mulai dari perencanaan hingga serah terima hasil pekerjaan.',
    'Panduan lengkap untuk PPK dalam melakukan pengadaan barang/jasa sesuai dengan regulasi terbaru...',
    'PPK',
    'Panduan Inaproc',
    '/docs/buku-saku-digital-2024.pdf',
    '4.8 MB',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC2SP1KXRhPhKRmQoFj4i7EdKlZ1tZjQDXCuiTjfZzbbc5LAPGE8YnyaxDdZgzD0LBJLKbZk2aqfaWPUzcMDk95WnfvKytFDU7lHr2dRkAymLhOWgd-q8LRCX93GycHGLh3ZzthCxAAO5IOj-32K7fJIJ6rzQB7hQs-vg_PG8a1Cm6xlD0tXd6R4mcUrc2epWWbLcVC9gciHsGJ1cGwWMQJ8aPi5uJ1NkXYjr51SD7izCyOqqcIvfuF0CrwNhnIvghPq0iflhF0tLYT',
    true
  ),
  (
    'Panduan Pendaftaran Akun SIKaP',
    'Langkah-langkah lengkap melakukan pendaftaran dan verifikasi profil badan usaha di Sistem Informasi Kinerja Penyedia.',
    'Panduan pendaftaran akun SIKaP untuk vendor...',
    'Vendor',
    'Panduan Inaproc',
    '/docs/panduan-sikap.pdf',
    '2.3 MB',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB9MuI5XBIEdxvIMD15QYLOhR8Snmt72hwTFVYUxJPDhIJU_6cqpWSyrmG7kwVXlnuwYaAw21QW_u-EI9CUZ98zhJpMBaQcI-GoYvWivkAXC07yT4Nx7Tjqynaa2bhJ32kpYXfUdHVKLFo1RUi2_o03JC38QdVmNZVrwgTOSGS1FGfTVM8WuIQrpQG18srbYf9uWBxeYmDTiBgWnf6JxoXt4fxPg1DOydfeCRPnSPcF3njOm-K11DjhsIBvvNX6_UXR3_4rZjH9A9Vo',
    false
  ),
  (
    'Tata Cara Evaluasi Dokumen Penawaran',
    'Modul teknis evaluasi kualifikasi, administrasi, teknis, dan harga untuk Pokja Pemilihan di aplikasi SPSE.',
    'Panduan evaluasi dokumen penawaran untuk Pokja...',
    'Pokja',
    'Panduan Inaproc',
    '/docs/evaluasi-dokumen.pdf',
    '3.1 MB',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCxMeEWzXOyWnFHMTqqlBaYpVDM4LHT9v9wHJnK8c1-0Wr0eh9dA8MryhUIcoMcPq23V2anpIAnmH816YcKJl9X5LC6043DW20CFipJSek5vFdUdrr0xh6bm8kuWsuz4yf9DbRQWObSiXI2uCTO0xKiBaQ6jTj5DRc72Yn3WrZcOHYsAsTRD0aS8beFi2SrXpDkFM_ygLWwZkRaAEXlUeCbwJi146JEL7gKLyZ7pw2JCZoxaRpgTNE5xzz3X32xAkZMRE7DB2wdW6FP',
    false
  ),
  (
    'Penyusunan HPS & Spesifikasi Teknis',
    'Pedoman perhitungan Harga Perkiraan Sendiri (HPS) yang akuntabel sesuai dengan regulasi LKPP terbaru.',
    'Panduan penyusunan HPS dan spesifikasi teknis...',
    'PPK',
    'Panduan Inaproc',
    '/docs/penyusunan-hps.pdf',
    '2.7 MB',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDv-qSF15SKFJdSUvsDnEqeFCVMDEh4mHRjzlQhQNd6YJhhSjezne0R4cM-ZLMSADR68PbOHGSMyCLGlfCnvy06iQZ_y6QZvWqgyvD-esGXCMwc5otWOAqc6cwZPl5VRApS0YIWuqPAH7FtewR99hhIsPtp1dC6uf7KJsp7VvEEQEmcRqwxxioEf7x8ZUeNuYXOX6GXiOkyN9kzXF4YNU7aeCOSPtmRZRzZjevCn2QTunDdBry9CbwIjPP39gm_vdPmHOn39h67BKGJ',
    false
  ),
  (
    'Panduan Operasional SPSE v4.5 untuk Pengguna',
    'Dokumentasi lengkap tata cara penggunaan Sistem Pengadaan Secara Elektronik (SPSE) untuk admin dan pengguna LPSE dalam proses e-tendering dan e-purchasing.',
    'Panduan operasional SPSE v4.5...',
    'Admin',
    'Panduan LPSE',
    '/docs/panduan-spse-v45.pdf',
    '12.4 MB',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBzvvZpumloD4GKm1xLUf-B4DIXcP63L_W4yh9Mwy_alH13gqz6dvYM2vC6-MPUUEf1BmJuG0KqhVo6EXd0H47Isp293-cf7OOVULnHfNjJ13TxOKvdDfOL50Koua0ZYtrJBXLLckjZSC9kLPzGBzYYWwrCIK75pq9TnTLEMaCqfwtD8SaQdqIPaS9awTqetvWywKS3kK9IqJoPS8herQmgf9AuNuhzoJCLHW7KbBrdPNjiCWhy8ETmYTLoYS3krJLbG8ns-H6MTGba',
    false
  ),
  (
    'Panduan Registrasi & Aktivasi Akun LPSE',
    'Langkah pendaftaran, verifikasi, dan aktivasi akun LPSE bagi admin maupun pengguna penyedia dan PPK.',
    'Panduan registrasi akun LPSE...',
    'Admin',
    'Panduan LPSE',
    '/docs/registrasi-akun-lpse.pdf',
    '1.8 MB',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBzvvZpumloD4GKm1xLUf-B4DIXcP63L_W4yh9Mwy_alH13gqz6dvYM2vC6-MPUUEf1BmJuG0KqhVo6EXd0H47Isp293-cf7OOVULnHfNjJ13TxOKvdDfOL50Koua0ZYtrJBXLLckjZSC9kLPzGBzYYWwrCIK75pq9TnTLEMaCqfwtD8SaQdqIPaS9awTqetvWywKS3kK9IqJoPS8herQmgf9AuNuhzoJCLHW7KbBrdPNjiCWhy8ETmYTLoYS3krJLbG8ns-H6MTGba',
    false
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE DATA FOR GUIDE VIDEOS (VIDEO TUTORIAL)
-- Sumber: channel YouTube resmi Inaproc LKPP (https://www.youtube.com/@LKPPinaproc)
-- ============================================
INSERT INTO guide_videos (title, description, video_url, duration, category, role) VALUES
  (
    'Tutorial Penggunaan Aplikasi Inaproc bagi PPK',
    'Panduan langkah demi langkah menggunakan aplikasi Inaproc untuk Pejabat Pembuat Komitmen.',
    'https://www.youtube.com/embed/PLkZp',
    '12:34',
    'Panduan Inaproc',
    '{PPK}'
  ),
  (
    'Panduan Pendaftaran Akun SIKaP bagi Vendor',
    'Langkah pendaftaran dan verifikasi profil badan usaha di Sistem Informasi Kinerja Penyedia.',
    'https://www.youtube.com/embed/PLkZt',
    '09:18',
    'Panduan Inaproc',
    '{Penyedia}'
  ),
  (
    'Penyusunan HPS & Spesifikasi Teknis',
    'Pedoman perhitungan Harga Perkiraan Sendiri (HPS) sesuai regulasi LKPP terbaru.',
    'https://www.youtube.com/embed/PLkZu',
    '11:52',
    'Panduan Inaproc',
    '{Pejabat Pengadaan}'
  ),
  (
    'Cara Registrasi dan Aktivasi Akun LPSE',
    'Video panduan pendaftaran, verifikasi, dan aktivasi akun LPSE bagi penyedia dan PPK.',
    'https://www.youtube.com/embed/PLkZq',
    '08:21',
    'Panduan LPSE',
    '{PA}'
  ),
  (
    'Pengenalan SPSE v4.5 untuk Pengguna',
    'Pengantar fitur dan alur kerja Sistem Pengadaan Secara Elektronik (SPSE) versi 4.5.',
    'https://www.youtube.com/embed/PLkZr',
    '15:47',
    'Panduan LPSE',
    '{Pokja}'
  ),
  (
    'Tata Cara Evaluasi Dokumen Penawaran di SPSE',
    'Modul teknis evaluasi kualifikasi, administrasi, teknis, dan harga untuk Pokja Pemilihan.',
    'https://www.youtube.com/embed/PLkZs',
    '10:05',
    'Panduan LPSE',
    '{Pokja}'
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE DATA FOR ANNOUNCEMENTS
-- ============================================
INSERT INTO announcements (title, excerpt, content, badge, badge_class, date, detail_date, category, author, image_url) VALUES
  (
    'Pemeliharaan Rutin Server SPSE Nasional Wilayah Barat',
    'Pemberitahuan kepada seluruh pengguna jasa SPSE mengenai jadwal pemeliharaan rutin infrastruktur server untuk meningkatkan performa layanan...',
    'Yth. Para Pengguna Layanan Pengadaan Secara Elektronik (LPSE), Dalam rangka meningkatkan kualitas layanan dan keamanan transaksi elektronik pada aplikasi SPSE...',
    'Sistem',
    'bg-secondary text-on-secondary',
    '24 Mei 2024',
    '24 Mei 2024, 09:15 WIB',
    'Informasi Teknis',
    'Admin Pusat',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDv-qSF15SKFJdSUvsDnEqeFCVMDEh4mHRjzlQhQNd6YJhhSjezne0R4cM-ZLMSADR68PbOHGSMyCLGlfCnvy06iQZ_y6QZvWqgyvD-esGXCMwc5otWOAqc6cwZPl5VRApS0YIWuqPAH7FtewR99hhIsPtp1dC6uf7KJsp7VvEEQEmcRqwxxioEf7x8ZUeNuYXOX6GXiOkyN9kzXF4YNU7aeCOSPtmRZRzZjevCn2QTunDdBry9CbwIjPP39gm_vdPmHOn39h67BKGJ'
  ),
  (
    'Pemberlakuan Peraturan LKPP Baru Terkait E-Purchasing',
    'LKPP resmi merilis aturan turunan mengenai tata cara pembelian elektronik melalui katalog nasional untuk meningkatkan efisiensi belanja negara...',
    'Dalam rangka mendukung keterbukaan pasar pengadaan barang/jasa pemerintah, LKPP merilis modul pendaftaran bagi entitas asing...',
    'Regulasi',
    'bg-primary text-on-primary',
    '21 Mei 2024',
    '21 Mei 2024, 14:30 WIB',
    'Regulasi',
    'Divisi Katalog',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDXXB87V5oiS3-o7jAwboE-fcbq4yUcUsrxrj2v-HiJIrXezZCH1_tdJ5w3x1DzpS9xIIOts10KLk62FlCGi6CqV86bXPMmzMQfGxzrfiA-P7KSxt4ctnkj2jSSzF_kZZTvcwxX0XefjtG2o_VnmBzY7EhRspV_60Esplc9aZv9Ro1koWtGme8LftXLETe6EXjtUy5I-7FcnxDen77_IgiIb-hZZ2xNzgRX4_ru7oDnFp-yeLLdi7L69bOzC_EjrdUAC7euw3uOYSIW'
  ),
  (
    'Sosialisasi Penggunaan Portal Inaproc Versi Terbaru 2024',
    'Undangan sosialisasi daring untuk Pejabat Pembuat Komitmen (PPK) mengenai fitur-fitur baru pada Dashboard monitoring Inaproc...',
    'Kami mengundang seluruh Pejabat Pembuat Komitmen (PPK) untuk menghadiri sesi daring mengenai implementasi mitigasi risiko...',
    'Kegiatan',
    'bg-tertiary-container text-on-tertiary-container',
    '18 Mei 2024',
    '18 Mei 2024, 10:00 WIB',
    'Kegiatan',
    'Biro Pelatihan',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBQm5Kd9uLy0TSXbPXAbyAERpnQiCXH2ory58HASxVMR0ul1SaAu0EaJSlUSuJoyidoKy4W_8BwPDqvCCesQ0ivRLjAUlRJM33h2qp2O1H2h6BppKvfV_4aXGCIpOXGPI3vQ-YG4n7A3yY6txARUQe345oGPS9LrJscmYTTswlnXEJB4bzl4pimDCbZ_MZ1JeSvj9tNVCCrtjUJ1HkyNsdBfZ-UnFu-ZpSf9Rylxf__CBecZVxvs-Q5M8UXMzLQSWT7LBn0M_lq_oqa'
  )
ON CONFLICT DO NOTHING;

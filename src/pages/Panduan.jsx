import { useState } from 'react'
import { Link, NavLink, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import Footer from '../components/Footer'

const roles = [
  { id: 'all', label: 'Semua Peran', checked: true },
  { id: 'ppk', label: 'PPK (Pejabat Pembuat Komitmen)', checked: false },
  { id: 'vendor', label: 'Penyedia / Vendor', checked: false },
  { id: 'pokja', label: 'Pokja Pemilihan', checked: false },
]

const featuredGuide = {
  badge: 'PPK',
  updated: 'Updated 24 Mar 2024',
  title: 'Buku Saku Digital: Prosedur Pengadaan Barang/Jasa Pemerintah 2024',
  description:
    'Panduan komprehensif mengenai tata cara terbaru proses pengadaan mulai dari perencanaan hingga serah terima hasil pekerjaan.',
  size: '4.8 MB',
}

const guides = [
  {
    role: 'Vendor',
    title: 'Panduan Pendaftaran Akun SIKaP',
    description:
      'Langkah-langkah lengkap melakukan pendaftaran dan verifikasi profil badan usaha di Sistem Informasi Kinerja Penyedia.',
  },
  {
    role: 'Pokja',
    title: 'Tata Cara Evaluasi Dokumen Penawaran',
    description:
      'Modul teknis evaluasi kualifikasi, administrasi, teknis, dan harga untuk Pokja Pemilihan di aplikasi SPSE.',
  },
  {
    role: 'PPK',
    title: 'Penyusunan HPS & Spesifikasi Teknis',
    description:
      'Pedoman perhitungan Harga Perkiraan Sendiri (HPS) yang akuntabel sesuai dengan regulasi LKPP terbaru.',
  },
]

const videos = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC2SP1KXRhPhKRmQoFj4i7EdKlZ1tZjQDXCuiTjfZzbbc5LAPGE8YnyaxDdZgzD0LBJLKbZk2aqfaWPUzcMDk95WnfvKytFDU7lHr2dRkAymLhOWgd-q8LRCX93GycHGLh3ZzthCxAAO5IOj-32K7fJIJ6rzQB7hQs-vg_PG8a1Cm6xlD0tXd6R4mcUrc2epWWbLcVC9gciHsGJ1cGwWMQJ8aPi5uJ1NkXYjr51SD7izCyOqqcIvfuF0CrwNhnIvghPq0iflhF0tLYT',
    duration: '12:45',
    title: 'Panduan Pengisian e-Contract bagi PPK',
    description:
      'Tutorial langkah-demi-langkah pengisian kontrak secara elektronik di sistem SPSE versi 4.5.',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB55yitEw1qwEKSj_H7h2Uv4U1Tm7gDeNyKQ9EadfypnTJQ0jh7eOPQZ5W8V4DFO15BVR3zZmcU3Eis4gIYe3VtWey51c_84BSHpdQqGw1yPL0Fzv6hU4A6fR1mgYmTW_kRHtl3Vt7m658i4empQ8OQGqNSDFTlPWJPNy-Ywg2Y49oglPuIHBqA7ckufGPvjINLByormPnKSAXQ0-Bs5Iiw772d8uRhOFWFVNPqGy4AzcLY8qAKZVHkXEimZ4D20ZJ6lAS2mR3kHNJw',
    duration: '08:20',
    title: 'Tips Mengikuti Tender untuk Penyedia Baru',
    description:
      'Strategi dan persiapan dokumen administrasi agar lolos tahap kualifikasi tender pemerintah.',
  },
]

const lpseFeaturedGuide = {
  badge: 'Admin LPSE',
  updated: 'Updated 12 Okt 2023',
  title: 'Panduan Operasional SPSE v4.5 untuk Pengguna',
  description:
    'Dokumentasi lengkap tata cara penggunaan Sistem Pengadaan Secara Elektronik (SPSE) untuk admin dan pengguna LPSE dalam proses e-tendering dan e-purchasing.',
  size: '12.4 MB',
}

const lpseGuides = [
  {
    role: 'Admin',
    title: 'Panduan Registrasi & Aktivasi Akun LPSE',
    description:
      'Langkah pendaftaran, verifikasi, dan aktivasi akun LPSE bagi admin maupun pengguna penyedia dan PPK.',
  },
  {
    role: 'Penyedia',
    title: 'Cara Mengikuti Tender di SPSE',
    description:
      'Panduan mengunggah dokumen penawaran, sanggahan, dan memantau proses evaluasi tender secara elektronik.',
  },
  {
    role: 'PPK',
    title: 'Pengoperasian e-Contract & e-Purchasing',
    description:
      'Modul pembuatan kontrak elektronik dan pembelian langsung melalui katalog elektronik di lingkungan LPSE.',
  },
]

const lpseVideos = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBzvvZpumloD4GKm1xLUf-B4DIXcP63L_W4yh9Mwy_alH13gqz6dvYM2vC6-MPUUEf1BmJuG0KqhVo6EXd0H47Isp293-cf7OOVULnHfNjJ13TxOKvdDfOL50Koua0ZYtrJBXLLckjZSC9kLPzGBzYYWwrCIK75pq9TnTLEMaCqfwtD8SaQdqIPaS9awTqetvWywKS3kK9IqJoPS8herQmgf9AuNuhzoJCLHW7KbBrdPNjiCWhy8ETmYTLoYS3krJLbG8ns-H6MTGba',
    duration: '12:45',
    title: 'Modul 3: Evaluasi Penawaran & Penetapan Pemenang',
    description:
      'Tutorial operasional evaluasi penawaran dan penetapan pemenang tender secara sistem di SPSE v4.5.',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB55yitEw1qwEKSj_H7h2Uv4U1Tm7gDeNyKQ9EadfypnTJQ0jh7eOPQZ5W8V4DFO15BVR3zZmcU3Eis4gIYe3VtWey51c_84BSHpdQqGw1yPL0Fzv6hU4A6fR1mgYmTW_kRHtl3Vt7m658i4empQ8OQGqNSDFTlPWJPNy-Ywg2Y49oglPuIHBqA7ckufGPvjINLByormPnKSAXQ0-Bs5Iiw772d8uRhOFWFVNPqGy4AzcLY8qAKZVHkXEimZ4D20ZJ6lAS2mR3kHNJw',
    duration: '08:20',
    title: 'Persiapan Dokumen Penawaran untuk Penyedia',
    description:
      'Panduan menyusun dan mengunggah dokumen penawaran yang lengkap dan sesuai persyaratan lelang.',
  },
]

export default function Panduan() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'lpse' ? 'lpse' : 'inaproc'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [checkedRoles, setCheckedRoles] = useState(
    roles.reduce((acc, r) => ({ ...acc, [r.id]: r.checked }), {}),
  )

  const switchTab = (tab) => {
    setActiveTab(tab)
    setSearchParams(tab === 'lpse' ? { tab: 'lpse' } : {}, { replace: true })
  }

  const toggleRole = (id) => {
    setCheckedRoles((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const isLpse = activeTab === 'lpse'
  const currentFeatured = isLpse ? lpseFeaturedGuide : featuredGuide
  const currentGuides = isLpse ? lpseGuides : guides
  const currentVideos = isLpse ? lpseVideos : videos

  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* TopNavBar */}
      <header className="bg-surface border-b border-outline-variant fixed top-0 z-50 w-full">
        <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-16">
          <div className="flex items-center gap-md">
            <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
              UKPBJ Kabupaten Bungo
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-lg h-full">
            <Link
              to="/"
              className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              Beranda
            </Link>
            <Link
              to="/panduan"
              className="font-label-md text-label-md text-primary border-b-2 border-primary pb-1 transition-colors duration-200"
            >
              Panduan
            </Link>
            <NavLink
              to="/regulasi"
              className={({ isActive }) =>
                isActive
                  ? 'font-label-md text-label-md text-primary border-b-2 border-primary pb-1 transition-colors duration-200'
                  : 'font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200'
              }
            >
              Regulasi
            </NavLink>
            <NavLink
              to="/pengumuman"
              className={({ isActive }) =>
                isActive
                  ? 'font-label-md text-label-md text-primary border-b-2 border-primary pb-1 transition-colors duration-200'
                  : 'font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200'
              }
            >
              Pengumuman
            </NavLink>
            <NavLink
              to="/kontak"
              className={({ isActive }) =>
                isActive
                  ? 'font-label-md text-label-md text-primary border-b-2 border-primary pb-1 transition-colors duration-200'
                  : 'font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200'
              }
            >
              Kontak
            </NavLink>
          </nav>
          
        </div>
      </header>

      <main className="pt-16 min-h-screen">
        {/* Hero Section */}
        <section className="relative py-xl bg-surface-container overflow-hidden">
          <div className="max-w-container-max mx-auto px-gutter relative z-10">
            <h1 className="font-display-lg text-display-lg text-primary mb-base">Pusat Bantuan & Panduan</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Akses dokumentasi resmi, panduan teknis, dan video tutorial untuk memudahkan penggunaan sistem
              pengadaan nasional.
            </p>
          </div>
        </section>

        {/* Main Content Area with Bento Grid & Sidebar */}
        <section className="max-w-container-max mx-auto px-gutter py-xl">
          <div className="flex flex-col lg:flex-row gap-lg">
            {/* Sidebar Filter */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white border border-outline-variant rounded-xl p-md institutional-shadow sticky top-24">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-md">Filter Peran</h3>
                <div className="space-y-base">
                  {roles.map((role) => (
                    <label
                      key={role.id}
                      className={`flex items-center gap-sm p-sm rounded-lg hover:bg-surface-container transition-colors cursor-pointer group ${
                        checkedRoles[role.id] ? 'bg-surface-container-high' : ''
                      }`}
                    >
                      <input
                        checked={checkedRoles[role.id]}
                        onChange={() => toggleRole(role.id)}
                        className="form-checkbox h-4 w-4 text-primary border-outline rounded transition duration-150 ease-in-out"
                        type="checkbox"
                      />
                      <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-primary">
                        {role.label}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-xl pt-md border-t border-outline-variant">
                  <h3 className="font-label-md text-label-md font-bold text-primary mb-sm">Bantuan Cepat</h3>
                  <div className="flex flex-col gap-sm">
                    <button className="flex items-center gap-sm text-secondary hover:underline font-label-sm text-label-sm">
                      <Icon name="support_agent" className="text-[18px]" /> Call Center 1500 119
                    </button>
                    <button className="flex items-center gap-sm text-secondary hover:underline font-label-sm text-label-sm">
                      <Icon name="mail" className="text-[18px]" /> helpdesk@inaproc.id
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Content Tabs & List */}
            <div className="flex-1">
              {/* Tab Header */}
              <div className="flex items-center gap-lg border-b border-outline-variant mb-lg overflow-x-auto whitespace-nowrap">
                <button
                  className={`font-headline-sm text-headline-sm py-md border-b-4 transition-all ${
                    activeTab === 'inaproc'
                      ? 'text-primary border-primary'
                      : 'text-on-surface-variant border-transparent hover:text-secondary'
                  }`}
                  onClick={() => switchTab('inaproc')}
                >
                  Panduan Inaproc
                </button>
                <button
                  className={`font-headline-sm text-headline-sm py-md border-b-4 transition-all ${
                    activeTab === 'lpse'
                      ? 'text-primary border-primary'
                      : 'text-on-surface-variant border-transparent hover:text-secondary'
                  }`}
                  onClick={() => switchTab('lpse')}
                >
                  Panduan LPSE
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-lg">
                <div className="relative">
                  <input
                    className="w-full pl-xl pr-md py-md bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Cari panduan atau tutorial..."
                    type="text"
                  />
                  <Icon
                    name="search"
                    className="absolute left-md top-1/2 -translate-y-1/2 text-outline"
                  />
                </div>
              </div>

              {/* Panduan Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
                {/* Featured Large Card */}
                <div className="md:col-span-2 xl:col-span-2 bg-white border border-outline-variant rounded-xl p-lg institutional-shadow flex flex-col md:flex-row gap-lg group hover:border-primary transition-colors">
                  <div className="w-full md:w-48 h-48 bg-surface-container rounded-lg flex-shrink-0 flex items-center justify-center">
                    <Icon name="description" className="text-primary text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-sm mb-base">
                        <span className="bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full font-label-sm text-label-sm">
                          {currentFeatured.badge}
                        </span>
                        <span className="text-outline font-label-sm text-label-sm">{currentFeatured.updated}</span>
                      </div>
                      <h2 className="font-headline-md text-headline-md text-primary mb-sm">{currentFeatured.title}</h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-md line-clamp-2">
                        {currentFeatured.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-md">
                      <button className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md flex items-center gap-sm group-hover:bg-primary-container">
                        <Icon name="download" className="text-[18px]" /> Download PDF
                      </button>
                      <span className="font-label-sm text-label-sm text-outline">{currentFeatured.size}</span>
                    </div>
                  </div>
                </div>

                {/* Regular Cards */}
                {currentGuides.map((guide) => (
                  <div
                    key={guide.title}
                    className="bg-white border border-outline-variant rounded-xl p-md institutional-shadow hover:border-secondary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-md">
                      <Icon name="picture_as_pdf" className="text-error text-[32px]" />
                      <span className="bg-surface-variant text-on-surface-variant px-sm py-xs rounded font-label-sm text-label-sm">
                        {guide.role}
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">{guide.title}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg line-clamp-3">
                      {guide.description}
                    </p>
                    <button className="w-full border border-secondary text-secondary py-sm rounded-lg font-label-md text-label-md hover:bg-secondary hover:text-white transition-all flex items-center justify-center gap-sm">
                      <Icon name="download" className="text-[18px]" /> Download
                    </button>
                  </div>
                ))}
              </div>

              {/* Video Tutorial Section */}
              <div className="mt-xl">
                <div className="flex items-center justify-between mb-lg">
                  <div className="flex items-center gap-sm">
                    <Icon name="play_circle" className="text-error text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                    <h2 className="font-headline-lg text-headline-lg text-primary">Video Tutorial</h2>
                  </div>
                  <a className="text-secondary font-label-md text-label-md hover:underline" href="#">
                    Lihat Semua Video
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  {currentVideos.map((video) => (
                    <div
                      key={video.title}
                      className="bg-white border border-outline-variant rounded-xl overflow-hidden institutional-shadow group"
                    >
                      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-500"
                          style={{ backgroundImage: `url('${video.image}')` }}
                        />
                        <button className="relative z-10 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Icon name="play_arrow" className="text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                        </button>
                        <div className="absolute bottom-md right-md bg-black/70 text-white px-sm py-xs rounded font-label-sm text-label-sm">
                          {video.duration}
                        </div>
                      </div>
                      <div className="p-md">
                        <h3 className="font-headline-sm text-headline-sm text-primary mb-base">{video.title}</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{video.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

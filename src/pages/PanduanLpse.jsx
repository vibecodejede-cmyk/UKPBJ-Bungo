import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Icon from '../components/Icon'
import Footer from '../components/Footer'

const roleLinks = [
  { icon: 'person', label: 'Panduan PPK', active: false },
  { icon: 'account_balance', label: 'Panduan PA', active: false },
  { icon: 'contract_edit', label: 'Panduan Pejabat Pengadaan', active: true, fill: true },
  { icon: 'storefront', label: 'Panduan Penyedia', active: false },
]

const relatedGuides = [
  'SOP Verifikasi Penyedia Baru',
  'Integrasi SIRUP ke SPSE',
]

const chapters = [
  {
    number: '01',
    title: 'Persiapan Data Pengadaan',
    desc: 'Sinkronisasi data dari aplikasi SIRUP dan pengaturan jadwal tender.',
    expanded: false,
  },
  {
    number: '02',
    title: 'Pembuatan Paket Tender',
    desc: 'Membuat kriteria kualifikasi dan evaluasi teknis sesuai dokumen lelang.',
    expanded: false,
  },
  {
    number: '03',
    title: 'Proses Evaluasi & Pemenang',
    desc: 'Tata cara pembuktian kualifikasi dan penetapan pemenang tender secara sistem.',
    expanded: true,
    highlight: true,
    steps: [
      'Review Dokumen Penawaran yang masuk melalui portal.',
      'Melakukan Evaluasi Teknis dan Harga secara simultan.',
      'Memberikan sanggahan atau jawaban sanggah melalui sistem (jika ada).',
      'Penerbitan SPPBJ digital.',
    ],
  },
]

const videoPoster =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBzvvZpumloD4GKm1xLUf-B4DIXcP63L_W4yh9Mwy_alH13gqz6dvYM2vC6-MPUUEf1BmJuG0KqhVo6EXd0H47Isp293-cf7OOVULnHfNjJ13TxOKvdDfOL50Koua0ZYtrJBXLLckjZSC9kLPzGBzYYWwrCIK75pq9TnTLEMaCqfwtD8SaQdqIPaS9awTqetvWywKS3kK9IqJoPS8herQmgf9AuNuhzoJCLHW7KbBrdPNjiCWhy8ETmYTLoYS3krJLbG8ns-H6MTGba'

export default function PanduanLpse() {
  const [openChapters, setOpenChapters] = useState(() =>
    chapters.reduce((acc, c) => ({ ...acc, [c.number]: c.expanded }), {}),
  )
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleChapter = (number) => {
    setOpenChapters((prev) => ({ ...prev, [number]: !prev[number] }))
  }

  return (
    <div className="bg-background text-on-surface flex flex-col min-h-screen">
      {/* TopNavBar */}
      <nav className="bg-surface border-b border-outline-variant sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-16">
          <div className="flex items-center gap-md">
            <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
              UKPBJ Kabupaten Bungo
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-xl">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? 'font-label-md text-label-md text-primary border-b-2 border-primary pb-1 transition-colors duration-200'
                  : 'font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200'
              }
            >
              Beranda
            </NavLink>
            <NavLink
              to="/panduan"
              className={({ isActive }) =>
                isActive
                  ? 'font-label-md text-label-md text-primary border-b-2 border-primary pb-1 transition-colors duration-200'
                  : 'font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200'
              }
            >
              Panduan
            </NavLink>
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
          </div>
          <div className="flex items-center gap-md">
            <button className="hidden md:flex items-center justify-center p-sm rounded-full text-on-surface-variant hover:bg-surface-variant">
              <Icon name="search" />
            </button>
            <button
              type="button"
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-on-surface hover:bg-surface-container-low transition-colors"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              <Icon name={mobileOpen ? 'close' : 'menu'} className="text-2xl" />
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-outline-variant bg-surface">
            <nav className="flex flex-col px-gutter py-md gap-sm">
              <NavLink to="/" onClick={() => setMobileOpen(false)} className={({ isActive }) => `font-label-md text-label-md ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-secondary'} py-sm`}>Beranda</NavLink>
              <NavLink to="/panduan" onClick={() => setMobileOpen(false)} className={({ isActive }) => `font-label-md text-label-md ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-secondary'} py-sm`}>Panduan</NavLink>
              <NavLink to="/regulasi" onClick={() => setMobileOpen(false)} className={({ isActive }) => `font-label-md text-label-md ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-secondary'} py-sm`}>Regulasi</NavLink>
              <NavLink to="/pengumuman" onClick={() => setMobileOpen(false)} className={({ isActive }) => `font-label-md text-label-md ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-secondary'} py-sm`}>Pengumuman</NavLink>
              <NavLink to="/kontak" onClick={() => setMobileOpen(false)} className={({ isActive }) => `font-label-md text-label-md ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-secondary'} py-sm`}>Kontak</NavLink>
            </nav>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-xl">
        {/* Breadcrumb */}
        <nav className="flex items-center mb-md font-label-sm text-label-sm">
          <Link className="text-on-surface-variant hover:text-primary transition-colors" to="/">
            Beranda
          </Link>
          <span className="mx-2 text-outline">/</span>
          <Link className="text-on-surface-variant hover:text-primary transition-colors" to="/panduan">
            Panduan
          </Link>
          <span className="mx-2 text-outline">/</span>
          <Link className="text-on-surface-variant hover:text-primary transition-colors" to="/panduan-lpse">
            Panduan LPSE
          </Link>
          <span className="mx-2 text-outline">/</span>
          <span className="text-primary font-bold">Detail</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
          {/* Sidebar */}
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <div className="sticky top-24 space-y-md">
              <h3 className="font-headline-sm text-headline-sm text-on-surface border-l-4 border-primary pl-md mb-md">
                Kategori Peran
              </h3>
              <nav className="flex flex-col gap-sm">
                {roleLinks.map((role) => (
                  <a
                    key={role.label}
                    className={`flex items-center gap-sm p-md rounded-lg border transition-all group ${
                      role.active
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-surface-container-low border-outline-variant text-on-surface hover:bg-primary hover:text-white'
                    }`}
                    href="#"
                  >
                    <Icon name={role.icon} style={role.fill ? { fontVariationSettings: "'FILL' 1" } : undefined} />
                    <span className="font-label-md text-label-md">{role.label}</span>
                  </a>
                ))}
              </nav>
              {/* Related Guides */}
              <div className="mt-xl p-md rounded-xl bg-surface-variant border border-outline-variant">
                <p className="font-label-md text-label-md text-primary mb-sm">Panduan Terkait</p>
                <ul className="space-y-sm">
                  {relatedGuides.map((guide) => (
                    <li key={guide}>
                      <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary hover:underline" href="#">
                        {guide}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Guide Detail Content */}
          <article className="lg:col-span-9 order-1 lg:order-2">
            {/* Content Header */}
            <header className="mb-xl">
              <span className="bg-secondary-container text-on-secondary-container px-md py-xs rounded-full font-label-sm text-label-sm mb-sm inline-block">
                Versi 4.5 Stable
              </span>
              <h1 className="font-headline-lg text-headline-lg text-primary mb-md leading-tight">
                Panduan Operasional SPSE v4.5 untuk Pengguna (Detail Panduan LPSE)
              </h1>
              <div className="flex items-center gap-xl text-on-surface-variant font-label-sm text-label-sm border-y border-outline-variant py-md">
                <div className="flex items-center gap-xs">
                  <Icon name="calendar_today" className="text-[18px]" />
                  <span>Diperbarui: 12 Oktober 2023</span>
                </div>
                <div className="flex items-center gap-xs">
                  <Icon name="visibility" className="text-[18px]" />
                  <span>4,291 Kali Dilihat</span>
                </div>
                <div className="flex items-center gap-xs">
                  <Icon name="verified_user" className="text-[18px]" />
                  <span>Resmi - LKPP</span>
                </div>
              </div>
            </header>

            {/* Intro */}
            <section className="mb-xl bg-white p-lg rounded-xl shadow-sm border border-outline-variant">
              <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
                Dokumen ini merupakan panduan komprehensif mengenai tata cara penggunaan Sistem Pengadaan Secara
                Elektronik (SPSE) versi 4.5. Panduan ini dirancang khusus untuk memudahkan Pejabat Pengadaan dan
                Penyedia dalam melakukan proses e-tendering, e-purchasing, serta manajemen kontrak secara transparan
                dan akuntabel sesuai dengan regulasi terbaru dari LKPP.
              </p>
            </section>

            {/* Chapters */}
            <section className="space-y-md mb-xl">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Daftar Isi & Langkah Operasional</h2>
              <div className="grid gap-md">
                {chapters.map((chapter) => {
                  const isOpen = openChapters[chapter.number]
                  if (chapter.highlight) {
                    return (
                      <div key={chapter.number} className="bg-white rounded-xl border border-primary overflow-hidden shadow-md">
                        <div className="p-lg bg-surface-container-low">
                          <div className="flex items-start gap-md mb-md">
                            <span className="font-headline-sm text-headline-sm text-on-primary bg-primary w-10 h-10 flex items-center justify-center rounded-lg">
                              {chapter.number}
                            </span>
                            <div>
                              <h3 className="font-headline-sm text-headline-sm text-primary">{chapter.title}</h3>
                              <p className="font-body-sm text-body-sm text-on-surface-variant">{chapter.desc}</p>
                            </div>
                          </div>
                          <div className="pl-xl space-y-sm text-on-surface-variant font-body-md text-body-md border-l-2 border-primary-fixed ml-5">
                            {chapter.steps.map((step) => (
                              <p key={step}>• {step}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div key={chapter.number} className="bg-white rounded-xl border border-outline-variant overflow-hidden">
                      <button
                        onClick={() => toggleChapter(chapter.number)}
                        className="w-full flex items-center justify-between p-lg text-left hover:bg-surface-container transition-colors group"
                      >
                        <div className="flex items-start gap-md">
                          <span className="font-headline-sm text-headline-sm text-primary-container bg-primary-fixed w-10 h-10 flex items-center justify-center rounded-lg">
                            {chapter.number}
                          </span>
                          <div>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface">{chapter.title}</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">{chapter.desc}</p>
                          </div>
                        </div>
                        <Icon
                          name="expand_more"
                          className="text-outline group-hover:text-primary transition-transform"
                          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Video Tutorial */}
            <section className="mb-xl">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Video Tutorial Operasional</h2>
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-inverse-surface group cursor-pointer">
                <div className="absolute inset-0 flex items-center justify-center z-10 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl">
                    <Icon name="play_arrow" className="text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                  </div>
                </div>
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-60"
                  style={{ backgroundImage: `url('${videoPoster}')` }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-lg bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-label-md text-label-md">
                    Modul 3: Evaluasi Penawaran & Penetapan Pemenang (Duration: 12:45)
                  </p>
                </div>
              </div>
            </section>

            {/* Download Actions */}
            <section className="flex flex-col md:flex-row items-center gap-md p-lg rounded-2xl bg-[#f0f4ff] border-2 border-dashed border-primary">
              <div className="flex-grow">
                <h4 className="font-headline-sm text-headline-sm text-primary mb-xs">Butuh Akses Luring?</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Unduh panduan lengkap dalam format PDF untuk dipelajari kapan saja tanpa koneksi internet.
                </p>
              </div>
              <button className="w-full md:w-auto bg-primary text-on-primary px-xl py-md rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-md hover:bg-secondary transition-all shadow-lg">
                <Icon name="download" />
                Download PDF (12.4 MB)
              </button>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}

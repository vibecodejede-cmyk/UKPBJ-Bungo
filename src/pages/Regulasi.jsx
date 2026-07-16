import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

const regulations = [
  {
    number: 'Perpres No. 12',
    year: '2021',
    title: 'Perubahan atas Perpres No. 16 Tahun 2018 tentang Pengadaan Barang/Jasa Pemerintah',
    type: 'Peraturan Presiden (PERPRES)',
    status: 'Berlaku',
  },
  {
    number: 'Perpres No. 16',
    year: '2018',
    title: 'Pengadaan Barang/Jasa Pemerintah',
    type: 'Peraturan Presiden (PERPRES)',
    status: 'Dicabut',
  },
  {
    number: 'Perka LKPP No. 12',
    year: '2021',
    title: 'Pedoman Pelaksanaan Pengadaan Barang/Jasa Pemerintah Melalui Penyedia',
    type: 'Peraturan Lembaga Kebijakan Pengadaan (PERKA)',
    status: 'Berlaku',
  },
  {
    number: 'Inpres No. 2',
    year: '2022',
    title: 'Percepatan Peningkatan Penggunaan Produk Dalam Negeri dan Produk Usaha Mikro',
    type: 'Instruksi Presiden (INPRES)',
    status: 'Berlaku',
  },
]

const infoCards = [
  {
    icon: 'gavel',
    iconBg: 'bg-primary text-on-primary',
    title: 'Hierarki Regulasi',
    description: 'Pelajari urutan kekuatan hukum peraturan pengadaan di Indonesia.',
  },
  {
    icon: 'history_edu',
    iconBg: 'bg-secondary text-on-secondary',
    title: 'Draft Terbaru',
    description: 'Ikuti perkembangan penyusunan regulasi baru (R-Perpres / R-Perka).',
  },
  {
    icon: 'help_center',
    iconBg: 'bg-tertiary-container text-on-tertiary-container',
    title: 'Bantuan Hukum',
    description: 'Layanan konsultasi interpretasi hukum terkait pengadaan barang/jasa.',
  },
]

function StatusBadge({ status }) {
  const isActive = status === 'Berlaku'
  return (
    <span
      className={`inline-flex items-center px-sm py-xs rounded-full text-[11px] font-bold uppercase tracking-wider ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isActive ? 'bg-green-600' : 'bg-red-600'}`} />
      {status}
    </span>
  )
}

export default function Regulasi() {
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('')

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-16">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
            UKPBJ Kabupaten Bungo
          </Link>
          <nav className="hidden md:flex items-center space-x-lg">
            <Link
              to="/"
              className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              Beranda
            </Link>
            <Link
              to="/panduan"
              className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              Panduan
            </Link>
            <Link
              to="/regulasi"
              className="font-label-md text-label-md text-primary border-b-2 border-primary pb-1 transition-colors duration-200"
            >
              Regulasi
            </Link>
            <a
              className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
              href="#"
            >
              Pengumuman
            </a>
            <a
              className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
              href="#"
            >
              Kontak
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary py-xl">
          <div className="max-w-container-max mx-auto px-gutter text-center md:text-left">
            <h1 className="font-display-lg text-display-lg text-on-primary mb-base">Pusat Data Regulasi Pengadaan</h1>
            <p className="font-body-lg text-body-lg text-primary-fixed max-w-2xl">
              Akses komprehensif terhadap dokumen peraturan, kebijakan, dan panduan hukum pengadaan barang/jasa
              pemerintah Indonesia.
            </p>
          </div>
        </section>

        {/* Filter & Search Section */}
        <section className="max-w-container-max mx-auto px-gutter -mt-8">
          <div className="bg-surface institutional-shadow border border-outline-variant p-lg rounded-xl grid grid-cols-1 md:grid-cols-12 gap-md items-end">
            <div className="md:col-span-7">
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="search">
                Cari Kata Kunci
              </label>
              <div className="relative">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-md py-sm border border-outline-variant rounded focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                  placeholder="Contoh: Peraturan Presiden No. 12 Tahun 2021"
                  type="text"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="year">
                Filter Tahun
              </label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-md py-sm border border-outline-variant rounded focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all bg-surface"
              >
                <option value="">Semua Tahun</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button className="w-full bg-secondary text-on-secondary px-lg py-sm rounded hover:bg-opacity-90 transition-all font-label-md text-label-md flex items-center justify-center gap-xs h-[42px]">
                <Icon name="filter_list" className="text-[18px]" />
                Terapkan
              </button>
            </div>
          </div>
        </section>

        {/* Regulations Table */}
        <section className="max-w-container-max mx-auto px-gutter py-xl">
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden institutional-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface">Nomor</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface">Tahun</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface">Tentang (Judul Peraturan)</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface">Status</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {regulations.map((reg, idx) => (
                    <tr
                      key={reg.number}
                      className={`transition-colors ${
                        idx % 2 === 1 ? 'bg-surface-container-lowest hover:bg-surface-container' : 'hover:bg-surface-container'
                      }`}
                    >
                      <td className="px-lg py-md font-body-md text-body-md">{reg.number}</td>
                      <td className="px-lg py-md font-body-md text-body-md">{reg.year}</td>
                      <td className="px-lg py-md">
                        <p className="font-body-md text-body-md font-semibold text-primary">{reg.title}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{reg.type}</p>
                      </td>
                      <td className="px-lg py-md">
                        <StatusBadge status={reg.status} />
                      </td>
                      <td className="px-lg py-md text-right">
                        <button className="inline-flex items-center gap-xs px-md py-xs text-secondary border border-secondary rounded hover:bg-secondary hover:text-on-secondary transition-all font-label-sm text-label-sm">
                          <Icon name="download" className="text-[18px]" />
                          Unduh PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="px-lg py-md border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-md">
              <p className="font-label-sm text-label-sm text-on-surface-variant">Menampilkan 1 - 4 dari 128 Regulasi</p>
              <div className="flex items-center space-x-base">
                <button className="p-base rounded hover:bg-surface-container-high transition-colors disabled:opacity-50" disabled>
                  <Icon name="chevron_left" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary font-label-sm text-label-sm">
                  1
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-high transition-colors font-label-sm text-label-sm">
                  2
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-high transition-colors font-label-sm text-label-sm">
                  3
                </button>
                <span className="px-xs text-on-surface-variant">...</span>
                <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-high transition-colors font-label-sm text-label-sm">
                  32
                </button>
                <button className="p-base rounded hover:bg-surface-container-high transition-colors">
                  <Icon name="chevron_right" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Informational Cards */}
        <section className="max-w-container-max mx-auto px-gutter pb-xl grid grid-cols-1 md:grid-cols-3 gap-lg">
          {infoCards.map((card) => (
            <div
              key={card.title}
              className="p-lg bg-surface-container border border-outline-variant rounded-xl flex items-start gap-md"
            >
              <div className={`w-12 h-12 rounded flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                <Icon name={card.icon} />
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-xs">{card.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{card.description}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-dim border-t border-outline-variant">
        <div className="w-full py-xl px-gutter flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto">
          <div className="flex flex-col items-center md:items-start mb-lg md:mb-0">
            <div className="font-label-md text-label-md font-bold text-on-surface mb-sm">
              Portal Informasi Pengadaan Barang dan Jasa
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center md:text-left max-w-xs">
              © 2026 UKPBJ Kabupaten Bungo. All Rights Reserved. Institutional Government Portal.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-md">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity duration-200" href="#">
              Privacy Policy
            </a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity duration-200" href="#">
              Terms of Service
            </a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity duration-200" href="#">
              Contact Us
            </a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity duration-200" href="#">
              FAQ
            </a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity duration-200" href="#">
              Help Center
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Icon from '../components/Icon'
import Footer from '../components/Footer'
import { fetchRegulations } from '../lib/api'

const PAGE_SIZE = 10

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

function getYear(publishDate) {
  if (!publishDate) return ''
  const y = publishDate.slice(0, 4)
  return /^\d{4}$/.test(y) ? y : ''
}

export default function Regulasi() {
  const [allRegulations, setAllRegulations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchInput, setSearchInput] = useState('')
  const [yearInput, setYearInput] = useState('')
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchRegulations()
      .then((data) => {
        if (!active) return
        setAllRegulations(data || [])
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        console.error(err)
        setError('Gagal memuat data regulasi. Silakan coba lagi nanti.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const years = useMemo(() => {
    const set = new Set(allRegulations.map((r) => getYear(r.publish_date)).filter(Boolean))
    return Array.from(set).sort((a, b) => b.localeCompare(a))
  }, [allRegulations])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allRegulations.filter((r) => {
      const matchYear = year ? getYear(r.publish_date) === year : true
      const matchSearch = q
        ? [r.judul, r.description, r.category].filter(Boolean).some((f) => f.toLowerCase().includes(q))
        : true
      return matchYear && matchSearch
    })
  }, [allRegulations, search, year])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIdx = (currentPage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE)

  const handleApply = () => {
    setSearch(searchInput)
    setYear(yearInput)
    setPage(1)
  }

  const handleReset = () => {
    setSearchInput('')
    setYearInput('')
    setSearch('')
    setYear('')
    setPage(1)
  }

  const handleDownload = (reg) => {
    if (reg.document_url) {
      window.open(reg.document_url, '_blank', 'noopener,noreferrer')
    }
  }

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p)
  }

  const pageNumbers = useMemo(() => {
    const range = []
    const maxButtons = 5
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    let end = Math.min(totalPages, start + maxButtons - 1)
    start = Math.max(1, end - maxButtons + 1)
    for (let i = start; i <= end; i++) range.push(i)
    return range
  }, [currentPage, totalPages])

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
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()}
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
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                className="w-full px-md py-sm border border-outline-variant rounded focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all bg-surface"
              >
                <option value="">Semua Tahun</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex flex-col gap-xs">
              <button
                onClick={handleApply}
                className="w-full bg-secondary text-on-secondary px-lg py-sm rounded hover:bg-opacity-90 transition-all font-label-md text-label-md flex items-center justify-center gap-xs h-[42px]"
              >
                <Icon name="filter_list" className="text-[18px]" />
                Terapkan
              </button>
              {(searchInput || yearInput) && (
                <button
                  onClick={handleReset}
                  className="w-full text-on-surface-variant font-label-sm text-label-sm underline hover:text-secondary transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Regulations Table */}
        <section className="max-w-container-max mx-auto px-gutter py-xl">
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden institutional-shadow">
            {loading ? (
              <div className="p-xl flex flex-col items-center justify-center text-on-surface-variant">
                <Icon name="hourglass_empty" className="text-[40px] animate-pulse mb-md" />
                <p className="font-body-md text-body-md">Memuat data regulasi...</p>
              </div>
            ) : error ? (
              <div className="p-xl flex flex-col items-center justify-center text-red-700">
                <Icon name="error_outline" className="text-[40px] mb-md" />
                <p className="font-body-md text-body-md">{error}</p>
              </div>
            ) : (
              <>
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
                      {pageItems.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-lg py-xl text-center text-on-surface-variant font-body-md text-body-md">
                            Tidak ada regulasi yang sesuai dengan pencarian Anda.
                          </td>
                        </tr>
                      ) : (
                        pageItems.map((reg, idx) => {
                          const regYear = getYear(reg.publish_date)
                          return (
                            <tr
                              key={reg.id}
                              className={`transition-colors ${
                                idx % 2 === 1
                                  ? 'bg-surface-container-lowest hover:bg-surface-container'
                                  : 'hover:bg-surface-container'
                              }`}
                            >
                              <td className="px-lg py-md font-body-md text-body-md">{reg.category}</td>
                              <td className="px-lg py-md font-body-md text-body-md">{regYear || '-'}</td>
                              <td className="px-lg py-md">
                                <p className="font-body-md text-body-md font-semibold text-primary">{reg.judul}</p>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{reg.description}</p>
                              </td>
                              <td className="px-lg py-md">
                                <StatusBadge status="Berlaku" />
                              </td>
                              <td className="px-lg py-md text-right">
                                <button
                                  onClick={() => handleDownload(reg)}
                                  disabled={!reg.document_url}
                                  className="inline-flex items-center gap-xs px-md py-xs text-secondary border border-secondary rounded hover:bg-secondary hover:text-on-secondary transition-all font-label-sm text-label-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Icon name="download" className="text-[18px]" />
                                  Unduh PDF
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <div className="px-lg py-md border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-md">
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Menampilkan {filtered.length === 0 ? 0 : startIdx + 1} -{' '}
                    {Math.min(startIdx + PAGE_SIZE, filtered.length)} dari {filtered.length} Regulasi
                  </p>
                  <div className="flex items-center space-x-base">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-base rounded hover:bg-surface-container-high transition-colors disabled:opacity-50"
                    >
                      <Icon name="chevron_left" />
                    </button>
                    {pageNumbers.map((p) => (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded font-label-sm text-label-sm transition-colors ${
                          p === currentPage
                            ? 'bg-primary text-on-primary'
                            : 'hover:bg-surface-container-high'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-base rounded hover:bg-surface-container-high transition-colors disabled:opacity-50"
                    >
                      <Icon name="chevron_right" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Icon from '../components/Icon'
import Footer from '../components/Footer'
import { fetchAnnouncements } from '../lib/api'
import { announcements as fallbackAnnouncements } from '../data/announcements'

const FALLBACK_IMAGE = '/announcements/announcement-new.png'

// Map a DB announcement row to the shape used by the UI.
function normalize(item) {
  return {
    id: item.id,
    badge: item.badge,
    badgeClass: item.badge_class,
    date: item.date,
    detailDate: item.detail_date,
    category: item.category,
    author: item.author,
    title: item.title,
    excerpt: item.excerpt,
    description: item.excerpt || item.content,
    image: item.image_url || FALLBACK_IMAGE,
    content: item.content,
  }
}

function DetailContent({ item }) {
  return (
    <div
      className="space-y-md font-body-md text-body-md text-on-surface prose prose-blue max-w-none"
      dangerouslySetInnerHTML={{ __html: item.content }}
    />
  )
}

export default function Pengumuman() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const shareRef = useRef(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchAnnouncements()
      .then((data) => {
        if (!active) return
        const list = (data || []).map(normalize)
        // Fallback to local static data if the table is empty or unavailable.
        setItems(list.length > 0 ? list : fallbackAnnouncements)
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        console.error(err)
        setItems(fallbackAnnouncements)
        setError(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((it) =>
      [it.title, it.excerpt, it.category, it.badge]
        .filter(Boolean)
        .some((f) => f.toLowerCase().includes(q)),
    )
  }, [items, search])

  const featured = filtered[0] || items[0]

  const getShareUrl = useCallback(
    () => (featured ? `${window.location.origin}/pengumuman/${featured.id}` : window.location.href),
    [featured],
  )

  const shareWhatsApp = useCallback(() => {
    const url = encodeURIComponent(getShareUrl())
    const text = encodeURIComponent(featured ? featured.title : 'Pengumuman UKPBJ')
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank', 'noopener,noreferrer')
    setShareOpen(false)
  }, [getShareUrl, featured])

  const shareEmail = useCallback(() => {
    const url = getShareUrl()
    const subject = encodeURIComponent(featured ? featured.title : 'Pengumuman UKPBJ')
    const body = encodeURIComponent(`Halo,\n\nBerikut informasi pengumuman:\n${featured ? featured.title : ''}\n${url}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    setShareOpen(false)
  }, [getShareUrl, featured])

  useEffect(() => {
    if (!shareOpen) return
    const onClick = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) setShareOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [shareOpen])

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-16">
          <div className="flex items-center gap-md">
            <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
              UKPBJ Kabupaten Bungo
            </Link>
          </div>
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
              className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              Regulasi
            </Link>
            <Link
              to="/pengumuman"
              className="font-label-md text-label-md text-primary border-b-2 border-primary pb-1 transition-colors duration-200"
            >
              Pengumuman
            </Link>
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
          <div className="flex items-center gap-md">
            <div className="relative hidden sm:block">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-body-sm w-64"
                placeholder="Cari pengumuman..."
                type="text"
              />
            </div>
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
              <Link to="/" onClick={() => setMobileOpen(false)} className="font-label-md text-label-md text-on-surface-variant hover:text-secondary py-sm">Beranda</Link>
              <Link to="/panduan" onClick={() => setMobileOpen(false)} className="font-label-md text-label-md text-on-surface-variant hover:text-secondary py-sm">Panduan</Link>
              <Link to="/regulasi" onClick={() => setMobileOpen(false)} className="font-label-md text-label-md text-on-surface-variant hover:text-secondary py-sm">Regulasi</Link>
              <Link to="/pengumuman" onClick={() => setMobileOpen(false)} className="font-label-md text-label-md text-primary py-sm">Pengumuman</Link>
              <NavLink to="/kontak" onClick={() => setMobileOpen(false)} className={({ isActive }) => `font-label-md text-label-md ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-secondary'} py-sm`}>Kontak</NavLink>
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-container-max mx-auto px-gutter py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          {/* Left Column: Announcement Feed */}
          <div className="lg:col-span-7 space-y-md">
            <div className="flex items-center justify-between mb-md">
              <h1 className="font-headline-lg text-headline-lg text-primary">Daftar Pengumuman</h1>
              <div className="flex space-x-sm">
                <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-variant">
                  <Icon name="filter_list" />
                </button>
                <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-variant">
                  <Icon name="sort" />
                </button>
              </div>
            </div>
            <div className="lg:hidden relative mb-md">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-body-sm"
                placeholder="Cari pengumuman..."
                type="text"
              />
            </div>

            {loading ? (
              <div className="p-xl flex flex-col items-center justify-center text-on-surface-variant">
                <Icon name="hourglass_empty" className="text-[40px] animate-pulse mb-md" />
                <p className="font-body-md text-body-md">Memuat pengumuman...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-xl flex flex-col items-center justify-center text-on-surface-variant">
                <Icon name="inbox" className="text-[40px] mb-md" />
                <p className="font-body-md text-body-md">Tidak ada pengumuman yang sesuai.</p>
              </div>
            ) : (
              <div className="space-y-md">
                {filtered.map((item) => (
                  <Link
                    key={item.id}
                    to={`/pengumuman/${item.id}`}
                    className="group block bg-surface-container-lowest p-lg rounded-xl institutional-shadow transition-all hover:translate-y-[-2px] border border-outline-variant hover:border-secondary"
                  >
                    <div className="flex justify-between items-start mb-sm">
                      <span
                        className={`font-label-sm text-label-sm px-2 py-1 rounded-full ${item.badgeClass}`}
                      >
                        {item.badge}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{item.date}</span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                      {item.title}
                    </h2>
                    <p className="mt-sm font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      {item.excerpt}
                    </p>
                    <div className="mt-md flex items-center text-primary font-label-md text-label-md">
                      <span>Lihat Detail</span>
                      <Icon name="arrow_forward" className="ml-1 text-[18px]" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Detail View */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <div className="bg-surface-container-lowest border border-outline-variant institutional-shadow rounded-xl overflow-hidden flex flex-col max-h-[calc(100vh-140px)]">
                {featured ? (
                  <>
                    {/* Header Image */}
                    <div className="h-48 w-full bg-surface-variant relative overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center opacity-80"
                        style={{ backgroundImage: `url('${featured.image || FALLBACK_IMAGE}')` }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-lg bg-gradient-to-t from-black/60 to-transparent">
                        <span className="font-label-sm text-label-sm px-2 py-1 bg-primary text-on-primary rounded uppercase">
                          {featured.category}
                        </span>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-lg overflow-y-auto custom-scrollbar">
                      <div className="flex items-center text-on-surface-variant font-label-sm text-label-sm mb-md">
                        <Icon name="calendar_month" className="text-[16px] mr-1" />
                        <span>{featured.detailDate}</span>
                        <span className="mx-2">•</span>
                        <Icon name="person" className="text-[16px] mr-1" />
                        <span>{featured.author}</span>
                      </div>
                      <h1 className="font-headline-md text-headline-md text-primary mb-md">{featured.title}</h1>
                      <DetailContent item={featured} />
                    </div>
                    {/* Footer Actions */}
                    <div className="p-md bg-surface-container-high flex justify-between items-center">
                      <div className="relative" ref={shareRef}>
                        <button
                          onClick={() => setShareOpen((v) => !v)}
                          className="text-secondary font-label-md text-label-md flex items-center"
                        >
                          <Icon name="share" className="mr-sm" />
                          Bagikan
                        </button>
                        {shareOpen && (
                          <div className="absolute bottom-full left-0 mb-sm w-48 bg-surface border border-outline-variant rounded-lg institutional-shadow overflow-hidden z-10">
                            <button
                              onClick={shareWhatsApp}
                              className="w-full flex items-center gap-md px-md py-sm text-left hover:bg-surface-container-high transition-colors"
                            >
                              <span className="w-6 h-6 flex items-center justify-center rounded bg-[#25D366] text-white">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.544.917 3.41 1.4 5.338 1.401 5.452 0 9.891-4.438 9.893-9.891.001-2.646-1.03-5.134-2.906-7.01-1.875-1.875-4.361-2.903-7.006-2.904-5.453 0-9.891 4.439-9.893 9.891-.001 1.916.498 3.79 1.443 5.421l-.916 3.344 3.425-.898zm11.385-7.391c-.301-.151-1.78-.878-2.056-.978-.275-.1-.476-.151-.675.151-.201.301-.776.978-.951 1.178-.175.2-.351.226-.653.076-.301-.151-1.273-.469-2.426-1.494-.897-.8-1.501-1.787-1.676-2.088-.176-.301-.019-.463.132-.613.136-.135.301-.351.451-.527.151-.176.201-.301.301-.503.1-.2.05-.376-.025-.527-.075-.151-.675-1.632-.925-2.235-.243-.587-.488-.507-.675-.517-.174-.01-.374-.011-.574-.011-.2 0-.526.075-.801.376-.275.301-1.052 1.029-1.052 2.51 0 1.48 1.077 2.912 1.227 3.113.151.2 2.12 3.237 5.136 4.537.717.31 1.277.494 1.714.633.72.228 1.375.196 1.892.119.577-.086 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.076-.125-.276-.201-.577-.352z" />
                                </svg>
                              </span>
                              <span className="font-label-md text-label-md text-on-surface">WhatsApp</span>
                            </button>
                            <button
                              onClick={shareEmail}
                              className="w-full flex items-center gap-md px-md py-sm text-left hover:bg-surface-container-high transition-colors border-t border-outline-variant"
                            >
                              <span className="w-6 h-6 flex items-center justify-center rounded bg-secondary text-on-secondary">
                                <Icon name="mail" className="text-[16px]" />
                              </span>
                              <span className="font-label-md text-label-md text-on-surface">Email</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <Link
                        to={`/pengumuman/${featured.id}`}
                        className="bg-secondary text-on-secondary px-lg py-2 rounded-lg font-label-md text-label-md hover:bg-secondary-container transition-colors"
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="p-xl flex flex-col items-center justify-center text-on-surface-variant">
                    <Icon name="campaign" className="text-[40px] mb-md" />
                    <p className="font-body-md text-body-md">Belum ada pengumuman.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

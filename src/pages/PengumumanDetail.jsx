import { useState, useEffect } from 'react'
import { Link, NavLink, useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import Footer from '../components/Footer'
import { fetchAnnouncementById, fetchAnnouncements, incrementAnnouncementView } from '../lib/api'
import { announcements as fallbackAnnouncements, recentAnnouncements } from '../data/announcements'

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
    image: item.image_url || FALLBACK_IMAGE,
    content: item.content,
  }
}

export default function PengumumanDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [recent, setRecent] = useState(recentAnnouncements)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    fetchAnnouncementById(id)
      .then((row) => {
        if (!active) return
        if (row) {
          setData(normalize(row))
          // Increment the view count for this announcement (fire and forget).
          incrementAnnouncementView(id).catch(() => {})
        } else {
          // Fallback to local static data if not found in DB.
          const local = fallbackAnnouncements.find((a) => a.id === id)
          setData(local || null)
        }
      })
      .catch((err) => {
        if (!active) return
        console.error(err)
        const local = fallbackAnnouncements.find((a) => a.id === id)
        setData(local || null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    // Load recent announcements for the sidebar.
    fetchAnnouncements()
      .then((rows) => {
        if (!active) return
        const list = (rows || []).map(normalize).filter((a) => a.id !== id)
        if (list.length > 0) {
          setRecent(
            list.slice(0, 3).map((a) => ({
              id: a.id,
              tag: a.category,
              title: a.title,
              date: a.date,
              image: a.image,
            })),
          )
        }
      })
      .catch(() => {
        /* keep fallback recent list */
      })

    return () => {
      active = false
    }
  }, [id])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = data ? data.title : 'Pengumuman UKPBJ Kabupaten Bungo'

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        // Fallback for non-secure contexts / older browsers.
        const textarea = document.createElement('textarea')
        textarea.value = shareUrl
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Gagal menyalin link:', err)
    }
  }

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText,
    )}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col overflow-x-hidden">
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

      <main className="flex-1 max-w-container-max mx-auto px-gutter py-md overflow-x-hidden">
        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-xs text-on-surface-variant mb-lg py-sm">
          <Link className="font-label-md text-label-md hover:text-primary transition-colors" to="/">
            Beranda
          </Link>
          <Icon name="chevron_right" className="text-sm" />
          <Link className="font-label-md text-label-md hover:text-primary transition-colors" to="/pengumuman">
            Pengumuman
          </Link>
          {data && (
            <>
              <Icon name="chevron_right" className="text-sm" />
              <span className="font-label-md text-label-md text-primary truncate max-w-[140px] sm:max-w-xs md:max-w-md">
                {data.title}
              </span>
            </>
          )}
        </nav>

        {loading ? (
          <div className="p-xl flex flex-col items-center justify-center text-on-surface-variant min-h-[40vh]">
            <Icon name="hourglass_empty" className="text-[40px] animate-pulse mb-md" />
            <p className="font-body-md text-body-md">Memuat pengumuman...</p>
          </div>
        ) : !data ? (
          <div className="p-xl flex flex-col items-center justify-center text-on-surface-variant min-h-[40vh]">
            <Icon name="error_outline" className="text-[40px] mb-md" />
            <p className="font-body-md text-body-md mb-md">Pengumuman tidak ditemukan.</p>
            <Link
              to="/pengumuman"
              className="bg-secondary text-on-secondary px-lg py-2 rounded-lg font-label-md text-label-md hover:bg-secondary-container transition-colors"
            >
              Kembali ke Daftar Pengumuman
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
            {/* Main Content */}
            <article className="lg:col-span-8">
              <header className="mb-lg">
                <div className="flex flex-wrap items-center gap-md mb-md">
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm">
                    {data.badge}
                  </span>
                  <div className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm">
                    <Icon name="calendar_today" className="text-sm" />
                    <span>{data.date}</span>
                  </div>
                  <div className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm">
                    <Icon name="person" className="text-sm" />
                    <span>{data.author}</span>
                  </div>
                </div>
                <h1 className="text-base md:text-headline-lg text-headline-lg text-primary leading-tight mb-md">{data.title}</h1>
              </header>

              <div className="rounded-xl overflow-hidden mb-xl institutional-shadow border border-outline-variant">
                <img
                  className="w-full h-48 sm:h-64 md:h-80 object-cover"
                  src={data.image}
                  alt={data.title}
                  onError={(e) => {
                    if (e.target.src !== FALLBACK_IMAGE) {
                      e.target.src = FALLBACK_IMAGE
                    }
                  }}
                />
              </div>

              <div
                className="prose prose-blue max-w-full text-on-surface-variant"
                dangerouslySetInnerHTML={{ __html: data.content }}
              />
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-lg mt-lg lg:mt-0">
              {/* Share */}
              <section className="bg-white p-md sm:p-lg rounded-xl institutional-shadow border border-outline-variant">
                <h3 className="font-label-md text-label-md text-on-surface mb-sm sm:mb-md">Bagikan Pengumuman</h3>
                <div className="flex gap-sm sm:gap-md">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 py-2 rounded-lg border border-outline-variant hover:bg-surface-variant transition-all flex items-center justify-center gap-xs"
                  >
                    <Icon name={copied ? 'check' : 'share'} className="text-sm" />
                    <span className="font-label-sm text-label-sm">{copied ? 'Tersalin!' : 'Salin Link'}</span>
                  </button>
                  <button
                    onClick={handleShareTwitter}
                    aria-label="Bagikan ke Twitter"
                    className="p-2 rounded-lg border border-outline-variant hover:bg-[#1DA1F2] hover:text-white transition-all"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    aria-label="Bagikan ke WhatsApp"
                    className="p-2 rounded-lg border border-outline-variant hover:bg-[#25D366] hover:text-white transition-all"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.544.917 3.41 1.4 5.338 1.401 5.452 0 9.891-4.438 9.893-9.891.001-2.646-1.03-5.134-2.906-7.01-1.875-1.875-4.361-2.903-7.006-2.904-5.453 0-9.891 4.439-9.893 9.891-.001 1.916.498 3.79 1.443 5.421l-.916 3.344 3.425-.898zm11.385-7.391c-.301-.151-1.78-.878-2.056-.978-.275-.1-.476-.151-.675.151-.201.301-.776.978-.951 1.178-.175.2-.351.226-.653.076-.301-.151-1.273-.469-2.426-1.494-.897-.8-1.501-1.787-1.676-2.088-.176-.301-.019-.463.132-.613.136-.135.301-.351.451-.527.151-.176.201-.301.301-.503.1-.2.05-.376-.025-.527-.075-.151-.675-1.632-.925-2.235-.243-.587-.488-.507-.675-.517-.174-.01-.374-.011-.574-.011-.2 0-.526.075-.801.376-.275.301-1.052 1.029-1.052 2.51 0 1.48 1.077 2.912 1.227 3.113.151.2 2.12 3.237 5.136 4.537.717.31 1.277.494 1.714.633.72.228 1.375.196 1.892.119.577-.086 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.076-.125-.276-.201-.577-.352z" />
                    </svg>
                  </button>
                </div>
              </section>

              {/* Recent Announcements */}
              <section>
                <div className="flex items-center justify-between mb-md">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Pengumuman Lainnya</h3>
                  <Link className="font-label-sm text-label-sm text-secondary hover:underline" to="/pengumuman">
                    Lihat Semua
                  </Link>
                </div>
                <div className="space-y-md">
                  {recent.map((item) => (
                    <Link
                      key={item.id}
                      to={`/pengumuman/${item.id}`}
                      className="group block bg-white border border-outline-variant rounded-xl overflow-hidden institutional-shadow hover:border-primary transition-all"
                    >
                      <div className="flex gap-md p-md">
                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-dim">
                          <img
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            src={item.image}
                            alt={item.title}
                            onError={(e) => {
                              if (e.target.src !== FALLBACK_IMAGE) {
                                e.target.src = FALLBACK_IMAGE
                              }
                            }}
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="font-label-sm text-[10px] text-secondary uppercase tracking-widest mb-1">
                            {item.tag}
                          </span>
                          <h4 className="font-label-md text-label-md text-on-surface line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          <p className="font-body-sm text-[11px] text-on-surface-variant mt-1">{item.date}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Support Card */}
              <div className="bg-primary-container p-lg rounded-xl text-on-primary-container">
                <h3 className="font-headline-sm text-headline-sm mb-sm">Butuh Bantuan?</h3>
                <p className="font-body-sm text-body-sm mb-lg opacity-90">
                  Hubungi Helpdesk kami jika Anda mengalami kesulitan teknis saat mengakses layanan pengadaan.
                </p>
                <Link
                  to="/kontak"
                  className="inline-flex items-center gap-xs font-label-md text-label-md bg-white text-primary px-lg py-2 rounded-lg hover:bg-surface-bright transition-all"
                >
                  <Icon name="support_agent" className="text-sm" />
                  Hubungi Support
                </Link>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

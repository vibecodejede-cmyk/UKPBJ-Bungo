import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { fetchGuides, fetchGuidesByCategory, fetchFeaturedGuide, fetchGuideVideos, incrementGuideDownload, incrementVideoView } from '../lib/api'

const roles = [
  { id: 'all', label: 'Semua Peran', checked: true },
  { id: 'ppk', label: 'PPK', checked: false },
  { id: 'pejabat_pengadaan', label: 'Pejabat Pengadaan', checked: false },
  { id: 'pokja', label: 'Pokja', checked: false },
  { id: 'pa', label: 'PA', checked: false },
  { id: 'penyedia', label: 'Penyedia', checked: false },
]

export default function Panduan() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'lpse' ? 'lpse' : 'inaproc'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [checkedRoles, setCheckedRoles] = useState(
    roles.reduce((acc, r) => ({ ...acc, [r.id]: r.checked }), {}),
  )
  // contentView: 'panduan' (PDF cards) or 'video' (YouTube tutorials)
  const [contentView, setContentView] = useState('panduan')
  // Search query for filtering guides & videos (initialized from URL ?q=)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  // Data state
  const [guides, setGuides] = useState([])
  const [featuredGuide, setFeaturedGuide] = useState(null)
  const [videos, setVideos] = useState([])
  const [playingVideoId, setPlayingVideoId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isLpse = activeTab === 'lpse'

  // Load the full guide list for the active category from the database.
  // Search filtering is done client-side on this already-loaded DB data
  // (see currentGuides below) so it stays instant and the input keeps focus.
  useEffect(() => {
    let cancelled = false
    async function loadData() {
      setLoading(true)
      setError(null)

      const category = isLpse ? 'Panduan LPSE' : 'Panduan Inaproc'

      // Fetch guides (with fallback if category column not yet migrated)
      try {
        const guidesData = await fetchGuidesByCategory(category)
        if (!cancelled) setGuides(guidesData || [])
      } catch (err) {
        console.warn('fetchGuidesByCategory failed, falling back:', err?.message)
        try {
          const all = await fetchGuides()
          if (!cancelled) {
            setGuides((all || []).filter((g) => g.category === category))
          }
        } catch (err2) {
          console.error('Error fetching guides:', err2)
          if (!cancelled) setError('Gagal memuat data panduan. Silakan coba lagi nanti.')
        }
      }

      // Fetch featured guide (non-blocking)
      try {
        const featuredData = await fetchFeaturedGuide()
        if (!cancelled) setFeaturedGuide(featuredData)
      } catch (err) {
        console.warn('fetchFeaturedGuide failed:', err?.message)
      }

      // Fetch videos (non-blocking, fallback to empty)
      try {
        const videosData = await fetchGuideVideos(category)
        if (!cancelled) setVideos(videosData || [])
      } catch (err) {
        console.warn('fetchGuideVideos failed:', err?.message)
        if (!cancelled) setVideos([])
      }

      if (!cancelled) setLoading(false)
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [isLpse])

  // Sync search query with URL ?q= param (so header search navigates here)
  useEffect(() => {
    const q = searchParams.get('q') || ''
    setSearchQuery(q)
  }, [searchParams])

  const switchTab = (tab) => {
    setActiveTab(tab)
    setSearchParams(tab === 'lpse' ? { tab: 'lpse' } : {}, { replace: true })
  }

  const toggleRole = (id) => {
    setCheckedRoles((prev) => {
      if (id === 'all') {
        const next = !prev.all
        return roles.reduce((acc, r) => ({ ...acc, [r.id]: next }), {})
      }
      const next = { ...prev, [id]: !prev[id] }
      // If any specific role is unchecked, "all" should be off
      next.all = roles
        .filter((r) => r.id !== 'all')
        .every((r) => next[r.id])
      return next
    })
  }

  const handleDownload = async (guide) => {
    if (guide?.file_url) {
      const url = guide.file_url.startsWith('http')
        ? guide.file_url
        : `${window.location.origin}${guide.file_url}`
      window.open(url, '_blank', 'noopener,noreferrer')
      // Track download count
      if (guide.id) {
        incrementGuideDownload(guide.id).catch(() => {
          // Silently fail - download tracking is non-blocking
        })
      }
    } else {
      alert('File panduan belum tersedia untuk diunduh.')
    }
  }

  // Fallback data for the featured card if the database has no featured guide
  const fallbackFeatured = {
    badge: 'PPK',
    updated: 'Updated 24 Mar 2024',
    title: 'Buku Saku Digital: Prosedur Pengadaan Barang/Jasa Pemerintah 2024',
    description:
      'Panduan komprehensif mengenai tata cara terbaru proses pengadaan mulai dari perencanaan hingga serah terima hasil pekerjaan.',
    size: '4.8 MB',
  }

  // Fallback video data (used when Supabase guide_videos table is empty/unavailable).
  // Uses a real, working YouTube video ID from the official Inaproc/LKPP channel.
  const fallbackVideos = [
    {
      id: 'fb-v1',
      title: 'Tutorial Penggunaan Aplikasi Inaproc bagi PPK',
      description:
        'Panduan langkah demi langkah menggunakan aplikasi Inaproc untuk Pejabat Pembuat Komitmen.',
      video_url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      duration: '12:34',
      category: 'Panduan Inaproc',
      role: ['PPK'],
    },
    {
      id: 'fb-v2',
      title: 'Panduan Pendaftaran Akun SIKaP bagi Vendor',
      description:
        'Langkah pendaftaran dan verifikasi profil badan usaha di Sistem Informasi Kinerja Penyedia.',
      video_url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      duration: '09:18',
      category: 'Panduan Inaproc',
      role: ['Penyedia'],
    },
    {
      id: 'fb-v3',
      title: 'Penyusunan HPS & Spesifikasi Teknis',
      description:
        'Pedoman perhitungan Harga Perkiraan Sendiri (HPS) sesuai regulasi LKPP terbaru.',
      video_url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      duration: '11:52',
      category: 'Panduan Inaproc',
      role: ['Pejabat Pengadaan'],
    },
    {
      id: 'fb-v4',
      title: 'Cara Registrasi dan Aktivasi Akun LPSE',
      description:
        'Video panduan pendaftaran, verifikasi, dan aktivasi akun LPSE bagi penyedia dan PPK.',
      video_url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      duration: '08:21',
      category: 'Panduan LPSE',
      role: ['PA'],
    },
    {
      id: 'fb-v5',
      title: 'Pengenalan SPSE v4.5 untuk Pengguna',
      description:
        'Pengantar fitur dan alur kerja Sistem Pengadaan Secara Elektronik (SPSE) versi 4.5.',
      video_url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      duration: '15:47',
      category: 'Panduan LPSE',
      role: ['Pokja'],
    },
    {
      id: 'fb-v6',
      title: 'Tata Cara Evaluasi Dokumen Penawaran di SPSE',
      description:
        'Modul teknis evaluasi kualifikasi, administrasi, teknis, dan harga untuk Pokja Pemilihan.',
      video_url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      duration: '10:05',
      category: 'Panduan LPSE',
      role: ['Pokja'],
    },
  ]

  // Normalize a YouTube URL (watch / youtu.be / embed / playlist) into an embeddable URL.
  function toEmbedUrl(url) {
    if (!url) return ''
    let id = null
    let playlist = null
    let m = url.match(/youtu\.be\/([A-Za-z0-9_-]+)/)
    if (m) id = m[1]
    if (!id) {
      m = url.match(/[?&]v=([A-Za-z0-9_-]+)/)
      if (m) id = m[1]
    }
    if (!id) {
      m = url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]+)/)
      if (m) id = m[1]
    }
    m = url.match(/[?&]list=([A-Za-z0-9_-]+)/)
    if (m) playlist = m[1]
    if (playlist) return `https://www.youtube.com/embed/videoseries?list=${playlist}`
    if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`
    return url
  }

  // Convert a Google Drive share URL to an embeddable preview URL.
  // Supports formats:
  //   - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  //   - https://drive.google.com/open?id=FILE_ID
  //   - https://drive.google.com/file/d/FILE_ID/preview (already embeddable)
  function toGoogleDriveEmbedUrl(url) {
    if (!url) return ''
    // Already a preview URL
    if (url.includes('/preview')) return url
    // Extract file ID from /d/FILE_ID/ pattern
    let m = url.match(/\/d\/([A-Za-z0-9_-]+)/)
    if (m) return `https://drive.google.com/file/d/${m[1]}/preview`
    // Extract file ID from ?id=FILE_ID pattern
    m = url.match(/[?&]id=([A-Za-z0-9_-]+)/)
    if (m) return `https://drive.google.com/file/d/${m[1]}/preview`
    return ''
  }

  // Tentukan cara memutar video berdasarkan URL-nya.
  // - 'none'    : URL kosong/tidak valid -> tampilkan placeholder
  // - 'file'    : file video langsung (mp4/webm/dll) -> pakai <video>
  // - 'youtube' : YouTube -> iframe embed
  // - 'googledrive' : Google Drive -> iframe embed
  // - 'iframe'  : URL lain yang bisa di-embed -> iframe
  function getVideoSource(url) {
    if (!url || !String(url).trim()) return { type: 'none' }
    // Data URL (base64, hasil upload fallback tanpa Storage) -> mainkan via <video>.
    if (String(url).startsWith('data:')) return { type: 'file', src: url }
    if (/\.(mp4|webm|ogg|mov|m4v|avi)$/i.test(url)) return { type: 'file', src: url }
    // Check Google Drive first
    const gdEmbed = toGoogleDriveEmbedUrl(url)
    if (gdEmbed) return { type: 'googledrive', src: gdEmbed }
    // Then check YouTube
    const embed = toEmbedUrl(url)
    if (embed && embed.includes('youtube.com/embed')) return { type: 'youtube', src: embed }
    if (embed && embed !== url) return { type: 'youtube', src: embed }
    if (embed) return { type: 'iframe', src: embed }
    return { type: 'none' }
  }

  const currentFeatured = featuredGuide || fallbackFeatured
  // Use the guides loaded directly from the Supabase database.
  const allGuides = guides
  const allVideos = videos.length > 0 ? videos : fallbackVideos

  // Map filter ids to actual role values stored in the database (guides & videos)
  const roleMap = {
    ppk: 'PPK',
    pejabat_pengadaan: 'Pejabat Pengadaan',
    pokja: 'Pokja',
    pa: 'PA',
    penyedia: 'Penyedia',
  }
  // Equivalent role labels between guides and videos vocabularies
  const roleEquivalents = {
    Penyedia: 'Vendor',
    Vendor: 'Penyedia',
  }
  const selectedRoles = roles
    .filter((r) => r.id !== 'all' && checkedRoles[r.id])
    .map((r) => roleMap[r.id])

  // Accepted set for guide filtering (includes equivalents like Vendor<->Penyedia)
  const acceptedGuideRoles = new Set(selectedRoles)
  selectedRoles.forEach((r) => {
    if (roleEquivalents[r]) acceptedGuideRoles.add(roleEquivalents[r])
  })

  // Filter guides by selected roles; "Semua Peran" (all) shows everything
  const currentGuides = (checkedRoles.all
    ? allGuides
    : allGuides.filter((g) => acceptedGuideRoles.has(g.role))
  ).filter((g) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      (g.title || '').toLowerCase().includes(q) ||
      (g.description || '').toLowerCase().includes(q) ||
      (g.role || '').toLowerCase().includes(q)
    )
  })

  // Show the featured card only when no search is active or it matches the query
  const showFeatured = (() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return true
    return (
      (currentFeatured.title || '').toLowerCase().includes(q) ||
      (currentFeatured.description || '').toLowerCase().includes(q) ||
      (currentFeatured.role || '').toLowerCase().includes(q)
    )
  })()

  // Filter videos by selected roles (video.role is an array); "Semua Peran" (all) shows everything
  const currentVideos = (checkedRoles.all
    ? allVideos
    : allVideos.filter((v) => {
        const vRoles = Array.isArray(v.role) ? v.role : v.role ? [v.role] : []
        return vRoles.some((r) => selectedRoles.includes(r))
      })
  ).filter((v) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const vRoles = Array.isArray(v.role) ? v.role : v.role ? [v.role] : []
    return (
      (v.title || '').toLowerCase().includes(q) ||
      (v.description || '').toLowerCase().includes(q) ||
      vRoles.some((r) => r.toLowerCase().includes(q))
    )
  })

  return (
    <div className="bg-background text-on-background min-h-screen">
      <Header />

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
                  <h3 className="font-label-md text-label-md font-bold text-primary mb-sm">Pusat Bantuan</h3>
                  <div className="flex flex-col gap-sm">
                    <button className="flex items-center gap-sm text-secondary hover:underline font-label-sm text-label-sm">
                      <Icon name="support_agent" className="text-[18px]" /> <a href="https://bantuan.inaproc.id/hc/id-id">Pusat Bantuan</a>
                    </button>
                    <button className="flex items-center gap-sm text-secondary hover:underline font-label-sm text-label-sm">
                      <Icon name="mail" className="text-[18px]" /> helpdesk.ukpbjbungo@gmail.com
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Content Tabs & List */}
            <div className="flex-1">
              {loading && (
                <div className="flex items-center justify-center py-xl">
                  <div className="flex flex-col items-center gap-md">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Memuat data panduan...</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="bg-error-container text-on-error-container p-lg rounded-xl mb-lg">
                  <p className="font-body-md text-body-md">{error}</p>
                </div>
              )}
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

              {/* Content Type Toggle: Panduan PDF vs Video Tutorial */}
              <div className="flex items-center gap-md mb-lg">
                <button
                  className={`font-label-md text-label-md px-lg py-sm rounded-lg transition-all flex items-center gap-sm ${
                    contentView === 'panduan'
                      ? 'bg-primary text-on-primary'
                      : 'bg-white text-on-surface-variant border border-outline-variant hover:bg-surface-container'
                  }`}
                  onClick={() => setContentView('panduan')}
                >
                  <Icon name="picture_as_pdf" className="text-[18px]" /> Panduan PDF
                </button>
                <button
                  className={`font-label-md text-label-md px-lg py-sm rounded-lg transition-all flex items-center gap-sm ${
                    contentView === 'video'
                      ? 'bg-primary text-on-primary'
                      : 'bg-white text-on-surface-variant border border-outline-variant hover:bg-surface-container'
                  }`}
                  onClick={() => setContentView('video')}
                >
                  <Icon name="play_circle" className="text-[18px]" /> Video Tutorial
                </button>
              </div>

              {/* Panduan Cards List (PDF) */}
              {contentView === 'panduan' && (
                <>
                  {/* Search Bar - Panduan PDF */}
                  <div className="mb-lg">
                    <div className="relative">
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-xl pr-md py-md bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Cari panduan PDF..."
                        type="text"
                      />
                      <Icon
                        name="search"
                        className="absolute left-md top-1/2 -translate-y-1/2 text-outline"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
                    {/* Featured Large Card (hidden when searching and it doesn't match) */}
                    {showFeatured && (
                    <div className="md:col-span-2 xl:col-span-2 bg-white border border-outline-variant rounded-xl p-lg institutional-shadow flex flex-col md:flex-row gap-lg group hover:border-primary transition-colors">
                      <div className="w-full md:w-48 h-48 bg-surface-container rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Icon name="description" className="text-primary text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                      </div>
                      <div className="flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-sm mb-base">
                            
                            {currentFeatured.category && (
                              <span className="bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full font-label-sm text-label-sm">
                                {currentFeatured.category}
                              </span>
                            )}
                            <span className="text-outline font-label-sm text-label-sm">{currentFeatured.updated}</span>
                          </div>
                          <h2 className="font-headline-md text-headline-md text-primary mb-sm">{currentFeatured.title}</h2>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mb-md line-clamp-2">
                            {currentFeatured.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-md">
                          <button
                            onClick={() => handleDownload(currentFeatured)}
                            className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md flex items-center gap-sm group-hover:bg-primary-container"
                          >
                            <Icon name="download" className="text-[18px]" /> Download PDF
                          </button>
                          <span className="font-label-sm text-label-sm text-outline">{currentFeatured.size}</span>
                        </div>
                      </div>
                    </div>
                    )}

                    {/* Regular Cards */}
                    {currentGuides.map((guide) => (
                      <div
                        key={guide.title}
                        className="bg-white border border-outline-variant rounded-xl p-md institutional-shadow hover:border-secondary transition-colors"
                      >
                        <div className="flex items-start justify-between mb-md">
                          <Icon name="picture_as_pdf" className="text-error text-[32px]" />
                          <div className="flex items-center gap-sm">
                            {guide.category && (
                              <span className="bg-secondary-container text-on-secondary-container px-sm py-xs rounded font-label-sm text-label-sm">
                                {guide.category}
                              </span>
                            )}
                            <span className="bg-surface-variant text-on-surface-variant px-sm py-xs rounded font-label-sm text-label-sm">
                              {guide.role}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">{guide.title}</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg line-clamp-3">
                          {guide.description}
                        </p>
                        <button
                          onClick={() => handleDownload(guide)}
                          className="w-full border border-secondary text-secondary py-sm rounded-lg font-label-md text-label-md hover:bg-secondary hover:text-white transition-all flex items-center justify-center gap-sm"
                        >
                          <Icon name="download" className="text-[18px]" /> Download
                        </button>
                      </div>
                    ))}
                  </div>

                  {!loading && currentGuides.length === 0 && (
                    <div className="bg-surface-container text-on-surface-variant p-lg rounded-xl text-center">
                      <p className="font-body-md text-body-md">
                        {searchQuery.trim()
                          ? 'Tidak ada panduan yang cocok dengan kata kunci pencarian Anda.'
                          : 'Belum ada data panduan pada database untuk kategori ini.'}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Video Tutorial Section (YouTube Inaproc LKPP) */}
              {contentView === 'video' && (
                <div>
                  <div className="flex items-center justify-between mb-lg">
                    <div className="flex items-center gap-sm">
                      <Icon name="play_circle" className="text-error text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }} />
                      <h2 className="font-headline-lg text-headline-lg text-primary">Video Tutorial</h2>
                    </div>
                    
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    {currentVideos.map((video) => {
                       const videoSrc = getVideoSource(video.video_url)
                       const isPlaying = playingVideoId === video.id
                       // Extract thumbnail: prefer custom thumbnail_url, then YouTube, then Google Drive icon
                       const ytId = (videoSrc.src || '').match(/embed\/([A-Za-z0-9_-]+)/)?.[1]
                       const gdId = (videoSrc.src || '').match(/\/file\/d\/([A-Za-z0-9_-]+)/)?.[1]
                       return (
                         <div
                           key={video.id}
                           className="bg-white border border-outline-variant rounded-xl overflow-hidden institutional-shadow group"
                         >
                           <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                             {videoSrc.type === 'none' ? (
                               <div className="flex flex-col items-center justify-center text-white/80 gap-sm p-md text-center">
                                 <Icon name="videocam_off" className="text-[40px]" />
                                 <p className="font-label-sm text-label-sm">URL video belum diisi / tidak valid</p>
                               </div>
                             ) : isPlaying ? (
                               videoSrc.type === 'file' ? (
                                 <video
                                   className="absolute inset-0 w-full h-full"
                                   src={videoSrc.src}
                                   controls
                                   autoPlay
                                   playsInline
                                 />
                               ) : (
                                 <iframe
                                   className="absolute inset-0 w-full h-full"
                                   src={videoSrc.src}
                                   title={video.title}
                                   frameBorder="0"
                                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                   allowFullScreen
                                 />
                               )
                             ) : (
                               <>
                                 <div
                                   className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-500"
                                   style={{
                                     backgroundImage: video.thumbnail_url
                                       ? `url('${video.thumbnail_url}')`
                                       : ytId
                                         ? `url('https://i.ytimg.com/vi/${ytId}/hqdefault.jpg')`
                                         : gdId
                                           ? `url('https://drive.google.com/thumbnail?id=${gdId}&sz=w640')`
                                           : undefined,
                                   }}
                                 />
                                 <button
                                   type="button"
                                   onClick={() => {
                                     setPlayingVideoId(video.id)
                                     if (video.id) {
                                       incrementVideoView(video.id).catch(() => {
                                         // Silently fail - view tracking is non-blocking
                                       })
                                     }
                                   }}
                                   className="relative z-10 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"
                                   aria-label={`Putar video ${video.title}`}
                                 >
                                   <Icon
                                     name="play_arrow"
                                     className="text-primary text-[32px]"
                                     style={{ fontVariationSettings: "'FILL' 1" }}
                                   />
                                 </button>
                                 {video.duration && (
                                   <div className="absolute bottom-md right-md bg-black/70 text-white px-sm py-xs rounded font-label-sm text-label-sm z-10">
                                     {video.duration}
                                   </div>
                                 )}
                               </>
                             )}
                           </div>
                          <div className="p-md">
                            <div className="flex items-center justify-between gap-sm mb-base">
                              <h3 className="font-headline-sm text-headline-sm text-primary">{video.title}</h3>
                              {video.duration && (
                                <span className="flex-shrink-0 bg-surface-variant text-on-surface-variant px-sm py-xs rounded font-label-sm text-label-sm">
                                  {video.duration}
                                </span>
                              )}
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">{video.description}</p>
                            {Array.isArray(video.role) && video.role.length > 0 && (
                              <div className="flex flex-wrap gap-sm mt-md">
                                {video.role.map((r) => (
                                  <span
                                    key={r}
                                    className="bg-surface-variant text-on-surface-variant px-sm py-xs rounded font-label-sm text-label-sm"
                                  >
                                    {r}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {!loading && currentVideos.length === 0 && (
                    <div className="bg-surface-container text-on-surface-variant p-lg rounded-xl text-center">
                      <p className="font-body-md text-body-md">
                        Belum ada video tutorial untuk peran yang dipilih.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import SettingsModal from '../components/SettingsModal'
import NotificationBell from '../components/NotificationBell'
import { getAdminSession, getAvatarFallback } from '../lib/session'
import {
  fetchAllGuides,
  fetchGuideVideos,
  createGuide,
  createGuideVideo,
  updateGuide,
  updateGuideVideo,
  deleteGuide,
  deleteGuideVideo,
  toggleGuidePublish,
  incrementGuideDownload,
  incrementVideoView,
} from '../lib/api'

// Generate a deterministic profile photo based on the admin's name/email.
function getAdminAvatar(admin) {
  const name = admin?.full_name || admin?.email || 'Admin'
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials
  )}&background=1e3a8a&color=ffffff&size=128&bold=true&format=svg`
}

function StatBox({ icon, iconBg, iconColor, label, value }) {
  return (
    <div className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm flex items-center gap-md">
      <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center ${iconColor}`}>
        <Icon name={icon} className="text-[28px]" />
      </div>
      <div>
        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</p>
        <h4 className="text-headline-md font-bold">{value}</h4>
      </div>
    </div>
  )
}

function StatusBadge({ published }) {
  if (published) {
    return (
      <span className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-green-100 text-green-700 text-label-sm font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-green-700" />
        Published
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-surface-variant text-on-surface-variant text-label-sm font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant" />
      Draft
    </span>
  )
}

function CategoryBadge({ category }) {
  const isLpse = category === 'Panduan LPSE'
  const cls = isLpse
    ? 'bg-secondary-container/10 text-secondary border border-secondary/20'
    : 'bg-primary-container/10 text-primary border border-primary/20'
  const label = isLpse ? 'LPSE' : 'Inaproc'
  return (
    <span className={`px-md py-xs rounded-full text-label-sm font-bold ${cls}`}>{label}</span>
  )
}

export default function KelolaPanduan() {
  const [guides, setGuides] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const [activeTab, setActiveTab] = useState('pdf-inaproc') // 'pdf-inaproc' | 'video-inaproc' | 'pdf-lpse' | 'video-lpse'
  const [mobileOpen, setMobileOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterRole, setFilterRole] = useState('Semua')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [moreMenuId, setMoreMenuId] = useState(null)
  const [editingItem, setEditingItem] = useState(null) // item being edited (null = create mode)

  // Current logged-in admin (from login session)
  const [admin] = useState(() => getAdminSession())
  const isSuperAdmin = admin?.role === 'Super Admin'
  const adminAvatar = getAdminAvatar(admin)
  const adminName = admin?.full_name || admin?.email || 'Admin'

  // form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    category: 'Panduan Inaproc',
    role: 'Vendor',
    is_published: true,
    file_type: 'pdf',
    file_url: '',
    video_url: '',
    thumbnail_url: '',
    duration: '',
  })

  async function load() {
    try {
      const [g, v] = await Promise.all([fetchAllGuides(), fetchGuideVideos()])
      setGuides(g || [])
      setVideos(v || [])
    } catch (e) {
      setError(e.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Derive the content type and category from the combined active tab
  const [activeType, activeCatKey] = activeTab.split('-')
  const activeCategory = activeCatKey === 'lpse' ? 'Panduan LPSE' : 'Panduan Inaproc'

  const stats = useMemo(() => {
    const total = guides.length
    const videoCount = videos.length
    const published = guides.filter((g) => g.is_published).length
    const pct = total ? Math.round((published / total) * 100) : 0

    // Dynamic stat based on active tab
    if (activeType === 'video') {
      const totalViews = videos.reduce((sum, v) => sum + (v.view_count || 0), 0)
      return { total, videoCount, activeLabel: 'Total View', activeValue: totalViews, pct }
    }
    const totalDownloads = guides.reduce((sum, g) => sum + (g.download_count || 0), 0)
    return { total, videoCount, activeLabel: 'Total Download', activeValue: totalDownloads, pct }
  }, [guides, videos, activeType])

  // Source list depends on the active tab (pdf = guides, video = videos)
  const sourceList = activeType === 'video' ? videos : guides

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return sourceList.filter((item) => {
      const title = (item.title || '').toLowerCase()
      const category = (item.category || '').toLowerCase()
      const role = Array.isArray(item.role) ? item.role.join(' ') : (item.role || '')
      const roleMatch = role.toLowerCase().includes(q)
      const catMatch = category.includes(q)
      const passSearch = !q || title.includes(q) || catMatch || roleMatch

      const passCategory = item.category === activeCategory
      const passRole = filterRole === 'Semua' || (Array.isArray(item.role) ? item.role.includes(filterRole) : item.role === filterRole)

      return passSearch && passCategory && passRole
    })
  }, [sourceList, search, activeCategory, filterRole])

  // Pagination: derive the slice to display and total pages from the filtered list
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedItems = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize]
  )

  // Reset to first page whenever the filtered result set changes
  useEffect(() => {
    setPage(1)
  }, [filtered.length, activeTab])

  function handleExport() {
    const rows = filtered.map((item) => ({
      Judul: item.title,
      Kategori: item.category,
      Peran: Array.isArray(item.role) ? item.role.join(', ') : item.role,
      Status: item.is_published ? 'Published' : 'Draft',
      'Tanggal Update': item.updated_at
        ? new Date(item.updated_at).toLocaleDateString('id-ID')
        : (item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : ''),
    }))
    const header = Object.keys(rows[0] || { Judul: '', Kategori: '', Peran: '', Status: '', 'Tanggal Update': '' })
    const csv = [
      header.join(','),
      ...rows.map((r) => header.map((h) => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `panduan-${activeType === 'video' ? 'video' : 'pdf'}-${activeCatKey}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (selectedType === 'video') {
        // Validasi: video WAJIB punya sumber yang bisa diputar di halaman publik.
        const finalVideoUrl = form.video_url ? form.video_url.trim() : ''
        if (!finalVideoUrl) {
          throw new Error('URL Video wajib diisi agar video bisa diputar di halaman publik.')
        }

        const payload = {
          title: form.title,
          description: form.description || form.title,
          category: form.category,
          role: form.role,
          video_url: finalVideoUrl,
          thumbnail_url: form.thumbnail_url ? form.thumbnail_url.trim() : null,
          duration: form.duration || null,
        }
        if (editingItem) {
          await updateGuideVideo(editingItem.id, payload)
        } else {
          await createGuideVideo(payload)
        }
      } else {
        const payload = {
          title: form.title,
          description: form.description || form.title,
          category: form.category,
          role: form.role,
          is_published: form.is_published,
          is_featured: false,
          file_type: 'pdf',
          content: form.content || null,
          file_url: form.file_url || null,
        }
        if (editingItem) {
          await updateGuide(editingItem.id, payload)
        } else {
          await createGuide(payload)
        }
      }
      setModalOpen(false)
      setSelectedType(null)
      setEditingItem(null)
      setForm({
        title: '',
        description: '',
        content: '',
        category: 'Panduan Inaproc',
        role: 'Vendor',
        is_published: true,
        file_type: 'pdf',
        file_url: '',
        video_url: '',
        thumbnail_url: '',
        duration: '',
      })
      await load()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan panduan')
    } finally {
      setSaving(false)
    }
  }

  // Open the create modal pre-set with the active tab's type and category
  function openCreate(type) {
    setEditingItem(null)
    setSelectedType(type)
    setForm({
      title: '',
      description: '',
      content: '',
      category: activeCategory,
      role: 'Vendor',
      is_published: true,
      file_type: 'pdf',
      file_url: '',
      video_url: '',
      thumbnail_url: '',
        duration: '',
    })
    setModalOpen(true)
  }

  // Open the edit modal pre-filled with the item's data
  function handleEdit(item) {
    setMoreMenuId(null)
    setEditingItem(item)
    setSelectedType(activeType === 'video' ? 'video' : 'pdf')
    setForm({
      title: item.title || '',
      description: item.description || '',
      content: item.content || '',
      category: item.category || 'Panduan Inaproc',
      role: Array.isArray(item.role) ? item.role[0] : (item.role || 'Vendor'),
      is_published: item.is_published ?? true,
      file_type: 'pdf',
      file_url: item.file_url || '',
      video_url: item.video_url || '',
      thumbnail_url: item.thumbnail_url || '',
      duration: item.duration || '',
    })
    setModalOpen(true)
  }

  async function handleDelete(item) {
    if (!confirm('Yakin ingin menghapus item ini?')) return
    try {
      if (activeType === 'video') {
        await deleteGuideVideo(item.id)
      } else {
        await deleteGuide(item.id)
      }
      await load()
    } catch (err) {
      setError(err.message || 'Gagal menghapus item')
    }
  }

  async function handleToggle(item) {
    try {
      if (activeType === 'video') {
        // guide_videos has no publish flag; just reload
        await load()
      } else {
        await toggleGuidePublish(item.id, !item.is_published)
        await load()
      }
    } catch (err) {
      setError(err.message || 'Gagal mengubah status')
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex overflow-hidden">
      {/* Overlay for mobile sidebar */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* SideNavBar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out bg-surface-container md:static md:transform-none md:translate-x-0 md:flex md:flex-col md:h-screen md:py-md md:px-sm md:border-r md:border-outline-variant flex-shrink-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-sm mb-xl flex items-center justify-between">
          <div>
            <h1 className="text-base md:text-headline-sm font-headline-sm font-bold text-primary">Admin Panel</h1>
            <p className="text-[10px] md:text-label-sm font-label-sm text-on-surface-variant">UKPBJ Kabupaten Bungo
</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="md:hidden p-1 rounded-lg hover:bg-surface-variant text-on-surface-variant">
            <Icon name="close" />
          </button>
        </div>
        <nav className="flex-1 space-y-1">
          <a onClick={() => setMobileOpen(false)} className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/dashboard">
            <Icon name="dashboard" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Dashboard</span>
          </a>
          <a onClick={() => setMobileOpen(false)} className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all duration-200" href="/kelola-panduan">
            <Icon name="menu_book" />
            <span className="font-label-md text-label-md">Kelola Panduan</span>
          </a>
          <a onClick={() => setMobileOpen(false)} className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/kelola-regulasi">
            <Icon name="gavel" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Kelola Regulasi</span>
          </a>
          <a onClick={() => setMobileOpen(false)} className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/kelola-pengumuman">
            <Icon name="campaign" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Kelola Pengumuman</span>
          </a>
          <a onClick={() => setMobileOpen(false)} className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/kelola-pesan">
            <Icon name="mail" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Kelola Pesan Masuk</span>
          </a>
          {isSuperAdmin && (
            <a onClick={() => setMobileOpen(false)} className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/kelola-admin">
              <Icon name="admin_panel_settings" className="group-hover:scale-110 transition-transform" />
              <span className="font-label-md text-label-md">Kelola Admin</span>
            </a>
          )}
        </nav>
        <div className="mt-auto space-y-1 pt-md border-t border-outline-variant">
          <button
            className="w-full flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg"
            onClick={() => { setSettingsOpen(true); setMobileOpen(false); }}
          >
            <Icon name="settings" />
            <span className="font-label-md text-label-md">Settings</span>
          </button>
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg" href="/login" onClick={() => { localStorage.removeItem('cms_admin_session'); setMobileOpen(false); }}>
            <Icon name="logout" />
            <span className="font-label-md text-label-md">Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-gutter border-b border-outline-variant bg-surface shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-sm">
              <button onClick={() => setMobileOpen(true)} className="md:hidden p-1 -ml-1 rounded-lg hover:bg-surface-variant text-on-surface-variant">
                <Icon name="menu" />
              </button>
              <h2 className="text-base md:text-headline-sm text-primary truncate max-w-[200px] md:max-w-none">Kelola Panduan & Video Tutorial</h2>
            </div>
            <div className="hidden md:flex items-center gap-base text-label-sm text-on-surface-variant">
              <span>Admin Panel</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span>Kelola Panduan</span>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <NotificationBell />
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant hover:opacity-80 transition-opacity cursor-pointer"
              title="Pengaturan Akun"
            >
              <img
                className="w-full h-full object-cover"
                alt={adminName}
                src={adminAvatar}
                onError={(e) => {
                  e.target.src = getAvatarFallback(adminName)
                }}
              />
            </button>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="flex-1 p-gutter overflow-y-auto bg-surface-container-lowest">
          {error && (
            <div className="bg-error-container text-on-error-container border border-error rounded-xl p-md font-body-sm mb-lg">
              {error}
            </div>
          )}

          {/* Statistics Quick View */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-xl">
            <StatBox icon="description" iconBg="bg-primary-fixed" iconColor="text-primary" label="Total Panduan" value={loading ? '...' : stats.total} />
            <StatBox icon="video_library" iconBg="bg-secondary-fixed" iconColor="text-secondary" label="Video Tutorial" value={loading ? '...' : stats.videoCount} />
            <StatBox
              icon={activeType === 'video' ? 'visibility' : 'download'}
              iconBg="bg-tertiary-fixed"
              iconColor="text-tertiary"
              label={loading ? '...' : stats.activeLabel}
              value={loading ? '...' : (stats.activeValue >= 1000 ? `${(stats.activeValue / 1000).toFixed(1)}k` : stats.activeValue)}
            />
            <StatBox icon="check_circle" iconBg="bg-surface-container-high" iconColor="text-on-surface-variant" label="Published" value={loading ? '...' : `${stats.pct}%`} />
          </div>

          {/* Tabs styled like the public Panduan page: category tabs + content-type toggle */}
          {/* Category Tabs (Inaproc / LPSE) */}
          <div className="flex items-center gap-lg border-b border-outline-variant mb-lg overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setActiveTab(`${activeType}-inaproc`)}
              className={`font-headline-sm text-headline-sm py-md border-b-4 transition-all ${
                activeCatKey === 'inaproc'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-secondary'
              }`}
            >
              Panduan Inaproc
            </button>
            <button
              onClick={() => setActiveTab(`${activeType}-lpse`)}
              className={`font-headline-sm text-headline-sm py-md border-b-4 transition-all ${
                activeCatKey === 'lpse'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-secondary'
              }`}
            >
              Panduan LPSE
            </button>
          </div>

          {/* Content Type Toggle (Panduan PDF / Video Tutorial) */}
          <div className="flex items-center gap-md mb-lg">
            <button
              onClick={() => setActiveTab(`pdf-${activeCatKey}`)}
              className={`font-label-md text-label-md px-lg py-sm rounded-lg transition-all flex items-center gap-sm ${
                activeType === 'pdf'
                  ? 'bg-primary text-on-primary'
                  : 'bg-white text-on-surface-variant border border-outline-variant hover:bg-surface-container'
              }`}
            >
              <Icon name="picture_as_pdf" className="text-[18px]" /> Panduan PDF
            </button>
            <button
              onClick={() => setActiveTab(`video-${activeCatKey}`)}
              className={`font-label-md text-label-md px-lg py-sm rounded-lg transition-all flex items-center gap-sm ${
                activeType === 'video'
                  ? 'bg-primary text-on-primary'
                  : 'bg-white text-on-surface-variant border border-outline-variant hover:bg-surface-container'
              }`}
            >
              <Icon name="play_circle" className="text-[18px]" /> Video Tutorial
            </button>
          </div>

          {/* Management Table Section */}
          <section className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-lg border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-surface-bright">
              <div className="relative w-full md:w-96">
                <Icon name="search" className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  className="w-full pl-xl pr-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary text-body-md font-body-md"
                  placeholder="Cari judul, kategori, atau peran..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-sm w-full sm:w-auto">
                <div className="relative">
                  <button
                    onClick={() => setFilterOpen((o) => !o)}
                    className="flex items-center gap-xs px-md py-sm border border-outline-variant rounded-lg hover:bg-surface-variant transition-colors text-label-md w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <Icon name="filter_list" className="text-[18px]" />
                    Filter
                  </button>
                  {filterOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-md z-20 space-y-md">
                      <div>
                        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Peran</label>
                        <select
                          className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary"
                          value={filterRole}
                          onChange={(e) => setFilterRole(e.target.value)}
                        >
                          <option value="Semua">Semua</option>
                          <option value="PPK">PPK / Pejabat Pengadaan</option>
                          <option value="Vendor">Penyedia Jasa</option>
                          <option value="Pokja">Pokja Pemilihan</option>
                          <option value="Admin">Admin Agency</option>
                          <option value="Semua">Semua</option>
                        </select>
                      </div>
                      <button
                        onClick={() => { setFilterRole('Semua') }}
                        className="w-full px-md py-sm text-label-md text-secondary hover:underline"
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-xs px-md py-sm border border-outline-variant rounded-lg hover:bg-surface-variant transition-colors text-label-md w-full sm:w-auto justify-center sm:justify-start"
                >
                  <Icon name="download" className="text-[18px]" />
                  Export
                </button>
                <button
                  className="flex items-center gap-sm bg-primary text-on-primary px-md py-sm sm:px-lg sm:py-sm rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm"
                  onClick={() => openCreate(activeType)}
                >
                 <Icon name="add_circle" className="text-[20px]" />
                    Tambah 
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-variant/50">
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Judul Panduan</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Kategori</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Peran</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-center">Status</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-center">
                      {activeType === 'video' ? 'Total View' : 'Total Download'}
                    </th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-lg py-md text-center font-body-sm text-on-surface-variant">
                        Memuat panduan...
                      </td>
                    </tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-lg py-md text-center font-body-sm text-on-surface-variant">
                        Tidak ada panduan ditemukan.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    pagedItems.map((item) => {
                       const isVideo = activeType === 'video'
                      const dateValue = item.updated_at || item.created_at
                      const roleLabel = Array.isArray(item.role) ? item.role.join(', ') : item.role
                      const menuOpen = moreMenuId === item.id
                      return (
                        <tr key={item.id} className="hover:bg-surface-container-low transition-colors group">
                          <td className="px-lg py-md">
                            <div className="flex items-center gap-md">
                              <div className={`w-10 h-10 rounded flex items-center justify-center ${isVideo ? 'bg-secondary-container/20 text-secondary' : 'bg-error-container/20 text-error'}`}>
                                <Icon name={isVideo ? 'play_circle' : 'picture_as_pdf'} />
                              </div>
                              <div>
                                <p className="font-body-md text-body-md font-semibold text-on-surface">{item.title}</p>
                                <p className="text-label-sm text-on-surface-variant">
                                  {isVideo ? 'Video' : 'Update'}: {dateValue ? new Date(dateValue).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-lg py-md">
                            <CategoryBadge category={item.category} />
                          </td>
                          <td className="px-lg py-md">
                            <span className="text-body-sm font-body-sm text-on-surface-variant">{roleLabel}</span>
                          </td>
                          <td className="px-lg py-md text-center">
                            {isVideo ? (
                              <span className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-green-100 text-green-700 text-label-sm font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-700" />
                                Active
                              </span>
                            ) : (
                              <button onClick={() => handleToggle(item)} title="Klik untuk ubah status">
                                <StatusBadge published={item.is_published} />
                              </button>
                            )}
                          </td>
                          <td className="px-lg py-md text-center">
                            <span className="font-body-sm font-semibold text-on-surface">
                              {isVideo ? (item.view_count || 0) : (item.download_count || 0)}
                            </span>
                          </td>
                          <td className="px-lg py-md text-right">
                            <div className="flex justify-end gap-base opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-base hover:bg-surface-container-high rounded text-error" title="Delete" onClick={() => handleDelete(item)}>
                                <Icon name="delete" />
                              </button>
                              <div className="relative">
                                <button
                                  className="p-base hover:bg-surface-container-high rounded text-on-surface-variant"
                                  title="More"
                                  onClick={() => setMoreMenuId(menuOpen ? null : item.id)}
                                >
                                  <Icon name="more_vert" />
                                </button>
                                {menuOpen && (
                                  <div className="absolute right-0 mt-2 w-44 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-30 py-xs">
                                    <button
                                      className="w-full flex items-center gap-sm px-md py-sm text-left text-body-sm text-on-surface hover:bg-surface-variant transition-colors"
                                      onClick={() => handleEdit(item)}
                                    >
                                      <Icon name="edit" className="text-[18px]" />
                                      Edit Panduan
                                    </button>
                                    <button
                                      className="w-full flex items-center gap-sm px-md py-sm text-left text-body-sm text-error hover:bg-surface-variant transition-colors"
                                      onClick={() => handleDelete(item)}
                                    >
                                      <Icon name="delete" className="text-[18px]" />
                                      Hapus
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>

            <div className="p-lg flex items-center justify-between border-t border-outline-variant bg-surface-bright">
              <p className="text-label-sm text-on-surface-variant">
                Menampilkan {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length} {activeType === 'video' ? 'video' : 'panduan'}
              </p>
              <div className="flex items-center gap-xs">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-variant disabled:opacity-30"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <Icon name="chevron_left" className="text-[20px]" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-label-md ${
                      p === currentPage
                        ? 'bg-primary text-on-primary'
                        : 'border border-outline-variant hover:bg-surface-variant'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-variant disabled:opacity-30"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <Icon name="chevron_right" className="text-[20px]" />
                </button>
              </div>
            </div>
          </section>
        </div>

        
      </main>

      {/* Form Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingItem(null); }} title={editingItem ? (selectedType === 'video' ? 'Edit Video Panduan' : 'Edit Panduan PDF') : (selectedType === 'video' ? 'Form Input Video Panduan' : 'Form Input Panduan PDF')}>
        <form className="space-y-xl" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div className="col-span-full">
              <label className="block font-label-md text-label-md text-on-surface mb-xs">Judul Panduan <span className="text-error">*</span></label>
              <input
                required
                className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Masukkan judul lengkap panduan..."
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs">Kategori Portal</label>
              <select
                className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="Panduan Inaproc">Inaproc</option>
                <option value="Panduan LPSE">LPSE</option>
              </select>
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs">Peran Target</label>
              <select
                className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="PPK">PPK / Pejabat Pengadaan</option>
                <option value="Vendor">Penyedia Jasa</option>
                <option value="Pokja">Pokja Pemilihan</option>
                <option value="Admin">Admin Agency</option>
                <option value="Semua">Semua</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-xs">Deskripsi</label>
            <textarea
              rows={3}
              className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              placeholder="Deskripsi singkat panduan..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {selectedType === 'video' ? (
            <div className="space-y-lg">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-xs">URL Video <span className="text-error">*</span></label>
                <input
                  required
                  className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="https://www.youtube.com/watch?v=... atau https://drive.google.com/file/d/..."
                  type="url"
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                />
                <p className="text-label-sm text-on-surface-variant mt-xs">Masukkan URL video YouTube, Google Drive (pastikan file bisa diakses publik), atau platform lainnya.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-xs">URL Thumbnail (Opsional)</label>
                  <input
                    className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="https://..."
                    type="url"
                    value={form.thumbnail_url}
                    onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-xs">Durasi</label>
                  <input
                    className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="mis. 10:30"
                    type="text"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-xs">URL File PDF</label>
                <input
                  className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="https://example.com/dokumen.pdf atau URL dari sumber lain"
                  type="url"
                  value={form.file_url}
                  onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                />
                <p className="text-label-sm text-on-surface-variant mt-xs">
                  Masukkan URL PDF dari sumber manapun (Google Drive, website, dll.)
                </p>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-xs">Konten Panduan</label>
                <textarea
                  rows={6}
                  className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  placeholder="Tulis instruksi atau keterangan panduan di sini..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
              </div>
            </>
          )}

          {selectedType !== 'video' && (
            <div className="flex items-center justify-between p-md bg-surface-container rounded-lg">
              <div>
                <p className="font-label-md text-label-md text-on-surface">Langsung Publikasikan?</p>
                <p className="text-label-sm text-on-surface-variant">Jika aktif, panduan akan langsung terlihat oleh pengguna portal.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  className="sr-only peer"
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                />
                <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-md pt-md border-t border-outline-variant">
            <button
              type="button"
              className="px-lg py-sm font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-lg py-sm font-label-md text-label-md bg-secondary text-on-secondary rounded-lg hover:opacity-90 transition-opacity flex items-center gap-sm disabled:opacity-50"
            >
              <Icon name="save" className="text-[18px]" />
              {saving ? 'Menyimpan...' : (editingItem ? 'Perbarui Panduan' : 'Simpan Panduan')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import SettingsModal from '../components/SettingsModal'
import NotificationBell from '../components/NotificationBell'
import { getAdminSession, getAvatarFallback } from '../lib/session'
import {
  fetchAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementPublish,
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
        Publik
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

const BADGE_OPTIONS = [
  { label: 'Sistem', value: 'Sistem', cls: 'bg-secondary text-on-secondary' },
  { label: 'Regulasi', value: 'Regulasi', cls: 'bg-primary text-on-primary' },
  { label: 'Kegiatan', value: 'Kegiatan', cls: 'bg-tertiary-container text-on-tertiary-container' },
  { label: 'Info', value: 'Info', cls: 'bg-surface-variant text-on-surface' },
]

const EMPTY_FORM = {
  id: null,
  title: '',
  excerpt: '',
  content: '',
  badge: 'Info',
  badge_class: 'bg-secondary text-on-secondary',
  category: 'Umum',
  author: 'Admin',
  image_url: '/announcements/announcement-new.png',
  is_published: true,
}

export default function KelolaPengumuman() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingItem, setEditingItem] = useState(null) // item being edited (null = create mode)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [moreMenuId, setMoreMenuId] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Current logged-in admin (from login session)
  const [admin] = useState(() => getAdminSession())
  const isSuperAdmin = admin?.role === 'Super Admin'
  const adminAvatar = getAdminAvatar(admin)
  const adminName = admin?.full_name || admin?.email || 'Admin'

  const [form, setForm] = useState(EMPTY_FORM)

  async function load() {
    try {
      const data = await fetchAllAnnouncements()
      setAnnouncements(data || [])
    } catch (e) {
      setError(e.message || 'Gagal memuat data pengumuman')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const stats = useMemo(() => {
    const total = announcements.length
    const published = announcements.filter((a) => a.is_published).length
    const draft = total - published
    const pct = total ? Math.round((published / total) * 100) : 0
    const totalViews = announcements.reduce((sum, a) => sum + (a.view_count || 0), 0)
    return { total, published, draft, pct, totalViews }
  }, [announcements])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return announcements.filter((a) => {
      const title = (a.title || '').toLowerCase()
      const author = (a.author || '').toLowerCase()
      const category = (a.category || '').toLowerCase()
      const passSearch =
        !q ||
        title.includes(q) ||
        author.includes(q) ||
        category.includes(q)

      const passStatus =
        filterStatus === 'Semua' ||
        (filterStatus === 'Publik' ? a.is_published : !a.is_published)

      return passSearch && passStatus
    })
  }, [announcements, search, filterStatus])

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
  }, [filtered.length])

  function handleExport() {
    const rows = filtered.map((a) => ({
      Judul: a.title,
      Kategori: a.category,
      Penulis: a.author,
      Status: a.is_published ? 'Publik' : 'Draft',
      'Tanggal Update': a.updated_at
        ? new Date(a.updated_at).toLocaleDateString('id-ID')
        : (a.created_at ? new Date(a.created_at).toLocaleDateString('id-ID') : ''),
    }))
    const header = Object.keys(rows[0] || { Judul: '', Kategori: '', Penulis: '', Status: '', 'Tanggal Update': '' })
    const csv = [
      header.join(','),
      ...rows.map((r) => header.map((h) => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pengumuman-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result
      setForm({ ...form, image_url: base64 })
      setImagePreview(base64)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        badge: form.badge,
        badge_class: form.badge_class,
        category: form.category,
        author: form.author,
        image_url: form.image_url,
        is_published: form.is_published,
      }
      if (editingItem) {
        await updateAnnouncement(form.id, payload)
      } else {
        await createAnnouncement(payload)
      }
      setModalOpen(false)
      setEditingItem(null)
      setForm(EMPTY_FORM)
      setImagePreview(null)
      await load()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan pengumuman')
    } finally {
      setSaving(false)
    }
  }

  // Open the create modal
  function openCreate() {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setImagePreview(null)
    setModalOpen(true)
  }

  // Open the edit modal pre-filled with the item's data
  function handleEdit(item) {
    setMoreMenuId(null)
    setEditingItem(item)
    setForm({
      id: item.id,
      title: item.title || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      badge: item.badge || 'Info',
      badge_class: item.badge_class || 'bg-secondary text-on-secondary',
      category: item.category || 'Umum',
      author: item.author || 'Admin',
      image_url: item.image_url || '',
      is_published: item.is_published ?? true,
    })
    setImagePreview(item.image_url || null)
    setModalOpen(true)
  }

  async function handleDelete(item) {
    if (!confirm('Yakin ingin menghapus pengumuman ini?')) return
    try {
      await deleteAnnouncement(item.id)
      await load()
    } catch (err) {
      setError(err.message || 'Gagal menghapus pengumuman')
    }
  }

  async function handleToggle(item) {
    try {
      await toggleAnnouncementPublish(item.id, !item.is_published)
      await load()
    } catch (err) {
      setError(err.message || 'Gagal mengubah status')
    }
  }

  function onBadgeChange(value) {
    const opt = BADGE_OPTIONS.find((b) => b.value === value)
    setForm({ ...form, badge: value, badge_class: opt ? opt.cls : 'bg-secondary text-on-secondary' })
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex overflow-hidden">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen py-md px-sm border-r border-outline-variant bg-surface-container w-64 flex-shrink-0">
        <div className="px-sm mb-xl">
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Admin Panel</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">UKPBJ Kabupaten Bungo</p>
        </div>
        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/dashboard">
            <Icon name="dashboard" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Dashboard</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/kelola-panduan">
            <Icon name="menu_book" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Kelola Panduan</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/kelola-regulasi">
            <Icon name="gavel" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Kelola Regulasi</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all duration-200" href="/kelola-pengumuman">
            <Icon name="campaign" />
            <span className="font-label-md text-label-md">Kelola Pengumuman</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/kelola-pesan">
            <Icon name="mail" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Kelola Pesan Masuk</span>
          </a>
          {isSuperAdmin && (
            <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/kelola-admin">
              <Icon name="admin_panel_settings" className="group-hover:scale-110 transition-transform" />
              <span className="font-label-md text-label-md">Kelola Admin</span>
            </a>
          )}
        </nav>
        <div className="mt-auto space-y-1 pt-md border-t border-outline-variant">
          <button
            className="w-full flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg"
            onClick={() => setSettingsOpen(true)}
          >
            <Icon name="settings" />
            <span className="font-label-md text-label-md">Settings</span>
          </button>
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg" href="/login" onClick={() => localStorage.removeItem('cms_admin_session')}>
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
            <h2 className="font-headline-sm text-headline-sm text-primary">Kelola Pengumuman</h2>
            <div className="flex items-center gap-base text-label-sm text-on-surface-variant">
              <span>Admin Panel</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span>Kelola Pengumuman</span>
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
            <StatBox icon="campaign" iconBg="bg-primary-fixed" iconColor="text-primary" label="Total Pengumuman" value={loading ? '...' : stats.total} />
            <StatBox icon="check_circle" iconBg="bg-tertiary-fixed" iconColor="text-tertiary" label="Publik" value={loading ? '...' : stats.published} />
            <StatBox icon="edit_note" iconBg="bg-error-container" iconColor="text-error" label="Draft" value={loading ? '...' : stats.draft} />
            <StatBox icon="percent" iconBg="bg-surface-container-high" iconColor="text-on-surface-variant" label="Persentase Publik" value={loading ? '...' : `${stats.pct}%`} />
          </div>

          

          {/* Management Table Section */}
          <section className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            
            <div className="p-lg border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-surface-bright">
              <div className="relative w-full md:w-96">
                <Icon name="search" className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  className="w-full pl-xl pr-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary text-body-md font-body-md"
                  placeholder="Cari judul, kategori, atau penulis..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-sm w-full md:w-auto">
                <div className="relative">
                  <button
                    onClick={() => setFilterOpen((o) => !o)}
                    className="flex items-center gap-xs px-md py-sm border border-outline-variant rounded-lg hover:bg-surface-variant transition-colors text-label-md"
                  >
                    <Icon name="filter_list" className="text-[18px]" />
                    Filter
                  </button>
                  {filterOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-md z-20 space-y-md">
                      <div>
                        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Status</label>
                        <select
                          className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="Semua">Semua</option>
                          <option value="Publik">Publik</option>
                          <option value="Draft">Draft</option>
                        </select>
                      </div>
                      <button
                        onClick={() => { setFilterStatus('Semua') }}
                        className="w-full px-md py-sm text-label-md text-secondary hover:underline"
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-xs px-md py-sm border border-outline-variant rounded-lg hover:bg-surface-variant transition-colors text-label-md"
                >
                  <Icon name="download" className="text-[18px]" />
                  Export
                </button>
                <button
                  className="flex items-center gap-sm bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm"
                  onClick={openCreate}
                >
                  <Icon name="add_circle" className="text-[20px]" />
                  Tambah Pengumuman Baru
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-variant/50">
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Judul Pengumuman</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Kategori</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-center">Status</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-center">Update</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-center">Total View</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-lg py-md text-center font-body-sm text-on-surface-variant">
                        Memuat pengumuman...
                      </td>
                    </tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-lg py-md text-center font-body-sm text-on-surface-variant">
                        Tidak ada pengumuman ditemukan.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    pagedItems.map((item) => {
                      const dateValue = item.updated_at || item.created_at
                      const menuOpen = moreMenuId === item.id
                      return (
                        <tr key={item.id} className="hover:bg-surface-container-low transition-colors group">
                          <td className="px-lg py-md">
                            <div className="flex items-center gap-md">
                              <div className="w-10 h-10 rounded flex items-center justify-center bg-primary-container/20 text-primary">
                                <Icon name="campaign" />
                              </div>
                              <div>
                                <p className="font-body-md text-body-md font-semibold text-on-surface">{item.title}</p>
                                {item.excerpt && (
                                  <p className="text-label-sm text-on-surface-variant line-clamp-1">{item.excerpt}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-lg py-md">
                            <span className="inline-flex items-center px-md py-xs rounded-full bg-surface-variant text-on-surface-variant text-label-sm font-semibold">
                              {item.category || '-'}
                            </span>
                          </td>
                          <td className="px-lg py-md text-center">
                            <button onClick={() => handleToggle(item)} title="Klik untuk ubah status">
                              <StatusBadge published={item.is_published} />
                            </button>
                          </td>
                          <td className="px-lg py-md text-center">
                            <span className="font-body-sm font-semibold text-on-surface">
                              {dateValue ? new Date(dateValue).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                            </span>
                          </td>
                          <td className="px-lg py-md text-center">
                            <span className="inline-flex items-center gap-xs font-body-sm font-semibold text-on-surface">
                              <Icon name="visibility" className="text-[16px] text-on-surface-variant" />
                              {(item.view_count || 0).toLocaleString('id-ID')}
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
                                      Edit Pengumuman
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
                Menampilkan {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length} pengumuman
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
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingItem(null); }} title={editingItem ? 'Edit Pengumuman' : 'Tambah Pengumuman Baru'}>
        <form className="space-y-xl" onSubmit={handleSubmit}>
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-xs">Judul Pengumuman <span className="text-error">*</span></label>
            <input
              required
              className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Masukkan judul pengumuman..."
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs">Kategori</label>
              <input
                className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Mis. Sistem"
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs">Penulis</label>
              <input
                className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Nama penulis"
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-xs">Ringkasan (Excerpt)</label>
            <textarea
              rows={2}
              className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              placeholder="Ringkasan singkat pengumuman..."
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-xs">Isi Konten</label>
            <textarea
              rows={5}
              className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              placeholder="Tulis isi pengumuman di sini..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs">Lencana (Badge)</label>
              <select
                className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                value={form.badge}
                onChange={(e) => onBadgeChange(e.target.value)}
              >
                {BADGE_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs">Gambar Pengumuman</label>
              <input
                className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-md">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-outline-variant"
                  />
                </div>
              )}
              <p className="text-label-sm text-on-surface-variant mt-xs">
                Format: JPG, PNG, GIF. Maksimal 2MB.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-md bg-surface-container rounded-lg">
            <div>
              <p className="font-label-md text-label-md text-on-surface">Langsung Publikasikan?</p>
              <p className="text-label-sm text-on-surface-variant">Jika aktif, pengumuman akan langsung terlihat oleh pengguna portal.</p>
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
              {saving ? 'Menyimpan...' : (editingItem ? 'Perbarui Pengumuman' : 'Simpan Pengumuman')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import SettingsModal from '../components/SettingsModal'
import NotificationBell from '../components/NotificationBell'
import {
  fetchAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementPublish,
} from '../lib/api'

function StatusBadge({ published }) {
  if (published) {
    return (
      <span className="inline-flex items-center px-sm py-xs rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">
        Publik
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-sm py-xs rounded-full bg-outline-variant text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
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
  image_url: '',
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
  const [editing, setEditing] = useState(false)

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
    return { total, published, draft: total - published }
  }, [announcements])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return announcements.filter((a) => {
      if (!q) return true
      return (
        (a.title || '').toLowerCase().includes(q) ||
        (a.author || '').toLowerCase().includes(q) ||
        (a.category || '').toLowerCase().includes(q)
      )
    })
  }, [announcements, search])

  function openCreate() {
    setEditing(false)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(a) {
    setEditing(true)
    setForm({
      id: a.id,
      title: a.title || '',
      excerpt: a.excerpt || '',
      content: a.content || '',
      badge: a.badge || 'Info',
      badge_class: a.badge_class || 'bg-secondary text-on-secondary',
      category: a.category || 'Umum',
      author: a.author || 'Admin',
      image_url: a.image_url || '',
      is_published: a.is_published ?? true,
    })
    setModalOpen(true)
  }

  function onBadgeChange(value) {
    const opt = BADGE_OPTIONS.find((b) => b.value === value)
    setForm({ ...form, badge: value, badge_class: opt ? opt.cls : 'bg-secondary text-on-secondary' })
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
      if (editing) {
        await updateAnnouncement(form.id, payload)
      } else {
        await createAnnouncement(payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan pengumuman')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus pengumuman ini?')) return
    try {
      await deleteAnnouncement(id)
      await load()
    } catch (err) {
      setError(err.message || 'Gagal menghapus pengumuman')
    }
  }

  async function handleToggle(a) {
    try {
      await toggleAnnouncementPublish(a.id, !a.is_published)
      await load()
    } catch (err) {
      setError(err.message || 'Gagal mengubah status')
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex overflow-hidden">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen py-md px-sm border-r border-outline-variant bg-surface-container w-64 flex-shrink-0">
        <div className="px-sm mb-xl">
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Admin Panel</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">System Administrator</p>
        </div>
        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/dashboard">
            <Icon name="dashboard" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Dashboard</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/kelola-panduan">
            <Icon name="menu_book" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Manage Guides</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/kelola-regulasi">
            <Icon name="gavel" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Manage Regulations</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all duration-200" href="/kelola-pengumuman">
            <Icon name="campaign" />
            <span className="font-label-md text-label-md">Manage Announcements</span>
          </a>
        </nav>
        <div className="mt-auto space-y-1 pt-md border-t border-outline-variant">
          <button
            className="w-full flex items-center justify-center gap-sm bg-primary text-on-primary py-sm rounded-lg mb-md font-label-md text-label-md hover:opacity-90 transition-opacity"
            onClick={openCreate}
          >
            <Icon name="add" className="text-[20px]" />
            New Entry
          </button>
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
          <div className="flex items-center gap-md">
            <Icon name="campaign" className="text-primary text-[24px]" />
            <h2 className="font-headline-md text-headline-md text-primary font-bold">Kelola Pengumuman</h2>
          </div>
          <div className="flex items-center gap-md">
            <NotificationBell />
            <button
              className="bg-primary hover:bg-primary-container text-on-primary px-lg py-md rounded-lg font-label-md text-label-md transition-colors flex items-center gap-sm institutional-shadow"
              onClick={openCreate}
            >
              <Icon name="add_circle" className="text-[20px]" />
              Tambah Pengumuman Baru
            </button>
          </div>
        </header>

        <div className="flex-1 p-gutter overflow-y-auto bg-surface-container-lowest space-y-lg">
          {error && (
            <div className="bg-error-container text-on-error-container border border-error rounded-xl p-md font-body-sm">
              {error}
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant institutional-shadow flex items-center gap-md">
              <div className="w-12 h-12 bg-primary-fixed rounded-full flex items-center justify-center text-primary">
                <Icon name="campaign" className="text-[24px]" />
              </div>
              <div>
                <p className="font-label-sm text-on-surface-variant">Total Pengumuman</p>
                <p className="font-headline-sm text-headline-sm text-primary">{loading ? '...' : stats.total}</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant institutional-shadow flex items-center gap-md">
              <div className="w-12 h-12 bg-tertiary-fixed rounded-full flex items-center justify-center text-tertiary-container">
                <Icon name="check_circle" className="text-[24px]" />
              </div>
              <div>
                <p className="font-label-sm text-on-surface-variant">Publik</p>
                <p className="font-headline-sm text-headline-sm text-primary">{loading ? '...' : stats.published}</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant institutional-shadow flex items-center gap-md">
              <div className="w-12 h-12 bg-error-container rounded-full flex items-center justify-center text-error">
                <Icon name="edit_note" className="text-[24px]" />
              </div>
              <div>
                <p className="font-label-sm text-on-surface-variant">Draft</p>
                <p className="font-headline-sm text-headline-sm text-primary">{loading ? '...' : stats.draft}</p>
              </div>
            </div>
          </div>

          {/* Management Table */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant institutional-shadow overflow-hidden">
            <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-bright">
              <h3 className="font-label-md text-label-md text-primary">DAFTAR PENGUMUMAN</h3>
              <div className="relative">
                <input
                  className="bg-surface text-body-sm px-lg py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary w-64"
                  placeholder="Cari pengumuman..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Icon name="search" className="absolute right-3 top-2 text-on-surface-variant text-body-sm" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high">
                    <th className="p-md font-label-md text-label-md text-on-surface border-b border-outline-variant">Judul</th>
                    <th className="p-md font-label-md text-label-md text-on-surface border-b border-outline-variant">Kategori</th>
                    <th className="p-md font-label-md text-label-md text-on-surface border-b border-outline-variant">Penulis</th>
                    <th className="p-md font-label-md text-label-md text-on-surface border-b border-outline-variant text-center">Status</th>
                    <th className="p-md font-label-md text-label-md text-on-surface border-b border-outline-variant text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading && (
                    <tr>
                      <td colSpan={5} className="p-md text-center font-body-sm text-on-surface-variant">Memuat pengumuman...</td>
                    </tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-md text-center font-body-sm text-on-surface-variant">Tidak ada pengumuman ditemukan.</td>
                    </tr>
                  )}
                  {!loading &&
                    filtered.map((a) => (
                      <tr key={a.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="p-md font-body-sm text-on-surface leading-snug max-w-xs">{a.title}</td>
                        <td className="p-md font-body-sm text-on-surface-variant">{a.category}</td>
                        <td className="p-md font-body-sm text-on-surface-variant">{a.author}</td>
                        <td className="p-md text-center">
                          <button onClick={() => handleToggle(a)} title="Klik untuk ubah status">
                            <StatusBadge published={a.is_published} />
                          </button>
                        </td>
                        <td className="p-md text-right">
                          <div className="flex justify-end gap-base opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-base hover:bg-surface-container-high rounded text-secondary" title="Edit" onClick={() => openEdit(a)}>
                              <Icon name="edit" />
                            </button>
                            <button className="p-base hover:bg-surface-container-high rounded text-error" title="Delete" onClick={() => handleDelete(a.id)}>
                              <Icon name="delete" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="p-md border-t border-outline-variant flex items-center justify-between">
              <span className="text-body-sm text-on-surface-variant">Menampilkan {filtered.length} dari {announcements.length} pengumuman</span>
            </div>
          </div>
        </div>
      </main>

      {/* Form Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Pengumuman' : 'Tambah Pengumuman Baru'}>
        <form className="space-y-md" onSubmit={handleSubmit}>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Judul Pengumuman</label>
            <input
              required
              className="w-full px-md py-md border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:outline-none font-body-sm"
              placeholder="Masukkan judul pengumuman..."
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Kategori</label>
              <input
                className="w-full px-md py-md border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:outline-none font-body-sm"
                placeholder="Mis. Sistem"
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Penulis</label>
              <input
                className="w-full px-md py-md border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:outline-none font-body-sm"
                placeholder="Nama penulis"
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Ringkasan (Excerpt)</label>
            <textarea
              rows={2}
              className="w-full px-md py-md border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:outline-none font-body-sm resize-none"
              placeholder="Ringkasan singkat pengumuman..."
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Isi Konten</label>
            <textarea
              rows={5}
              className="w-full px-md py-md border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:outline-none font-body-sm resize-none"
              placeholder="Tulis isi pengumuman di sini..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Lencana (Badge)</label>
              <select
                className="w-full px-md py-md border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:outline-none font-body-sm"
                value={form.badge}
                onChange={(e) => onBadgeChange(e.target.value)}
              >
                {BADGE_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">URL Gambar (opsional)</label>
              <input
                className="w-full px-md py-md border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:outline-none font-body-sm"
                placeholder="https://..."
                type="text"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-md">
            <label className="flex items-center gap-sm cursor-pointer group">
              <input
                className="text-primary focus:ring-primary h-4 w-4"
                name="pub"
                type="radio"
                checked={form.is_published === true}
                onChange={() => setForm({ ...form, is_published: true })}
              />
              <span className="font-body-sm text-on-surface group-hover:text-primary">Publikasikan</span>
            </label>
            <label className="flex items-center gap-sm cursor-pointer group">
              <input
                className="text-primary focus:ring-primary h-4 w-4"
                name="pub"
                type="radio"
                checked={form.is_published === false}
                onChange={() => setForm({ ...form, is_published: false })}
              />
              <span className="font-body-sm text-on-surface group-hover:text-primary">Simpan sebagai Draft</span>
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
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

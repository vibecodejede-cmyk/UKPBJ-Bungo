import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import SettingsModal from '../components/SettingsModal'
import NotificationBell from '../components/NotificationBell'
import { getAdminSession, getAvatarFallback } from '../lib/session'
import {
  fetchAllRegulations,
  createRegulation,
  updateRegulation,
  deleteRegulation,
  toggleRegulationPublish,
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
        Berlaku
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-surface-variant text-on-surface-variant text-label-sm font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant" />
      Tidak Berlaku
    </span>
  )
}

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 15 }, (_, i) => (CURRENT_YEAR - i).toString())

const EMPTY_FORM = {
  id: null,
  nomor: '',
  tahun: CURRENT_YEAR.toString(),
  judul: '',
  description: '',
  is_published: true,
  document_url: '',
}

export default function KelolaRegulasi() {
  const [regulations, setRegulations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingItem, setEditingItem] = useState(null) // item being edited (null = create mode)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [filterYear, setFilterYear] = useState('Semua')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [moreMenuId, setMoreMenuId] = useState(null)

  // Current logged-in admin (from login session)
  const [admin] = useState(() => getAdminSession())
  const isSuperAdmin = admin?.role === 'Super Admin'
  const adminAvatar = getAdminAvatar(admin)
  const adminName = admin?.full_name || admin?.email || 'Admin'
  const [mobileOpen, setMobileOpen] = useState(false)

  const [form, setForm] = useState(EMPTY_FORM)

  async function load() {
    try {
      const data = await fetchAllRegulations()
      setRegulations(data || [])
    } catch (e) {
      setError(e.message || 'Gagal memuat data regulasi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const stats = useMemo(() => {
    const total = regulations.length
    const active = regulations.filter((r) => r.is_published).length
    const inactive = total - active
    const pct = total ? Math.round((active / total) * 100) : 0
    return { total, active, inactive, pct }
  }, [regulations])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return regulations.filter((r) => {
      const title = (r.judul || '').toLowerCase()
      const nomor = (r.nomor || '').toLowerCase()
      const year = (r.publish_date || '').slice(0, 4)
      const passSearch =
        !q ||
        title.includes(q) ||
        nomor.includes(q) ||
        year.includes(q)

      const passStatus =
        filterStatus === 'Semua' ||
        (filterStatus === 'Berlaku' ? r.is_published : !r.is_published)
      const passYear = filterYear === 'Semua' || year === filterYear

      return passSearch && passStatus && passYear
    })
  }, [regulations, search, filterStatus, filterYear])

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
    const rows = filtered.map((r) => ({
      Nomor: r.nomor,
      Tahun: (r.publish_date || '').slice(0, 4),
      Judul: r.judul,
      Status: r.is_published ? 'Berlaku' : 'Tidak Berlaku',
      'Tanggal Update': r.updated_at
        ? new Date(r.updated_at).toLocaleDateString('id-ID')
        : (r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : ''),
    }))
    const header = Object.keys(rows[0] || { Nomor: '', Tahun: '', Judul: '', Status: '', 'Tanggal Update': '' })
    const csv = [
      header.join(','),
      ...rows.map((r) => header.map((h) => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `regulasi-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        judul: form.judul,
        description: form.description,
        document_url: form.document_url,
        publish_date: `${form.tahun}-01-01`,
        is_published: form.is_published,
        nomor: form.nomor || `-/${form.tahun}`,
      }
      if (editingItem) {
        await updateRegulation(form.id, payload)
      } else {
        await createRegulation(payload)
      }
      setModalOpen(false)
      setEditingItem(null)
      setForm(EMPTY_FORM)
      await load()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan regulasi')
    } finally {
      setSaving(false)
    }
  }

  // Open the create modal
  function openCreate() {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  // Open the edit modal pre-filled with the item's data
  function handleEdit(item) {
    setMoreMenuId(null)
    setEditingItem(item)
    setForm({
      id: item.id,
      nomor: item.nomor || '',
      tahun: (item.publish_date || '').slice(0, 4) || new Date().getFullYear().toString(),
      judul: item.judul || '',
      description: item.description || '',
      is_published: item.is_published ?? true,
      document_url: item.document_url || '',
    })
    setModalOpen(true)
  }

  async function handleDelete(item) {
    if (!confirm('Yakin ingin menghapus regulasi ini?')) return
    try {
      await deleteRegulation(item.id)
      await load()
    } catch (err) {
      setError(err.message || 'Gagal menghapus regulasi')
    }
  }

  async function handleToggle(item) {
    try {
      await toggleRegulationPublish(item.id, !item.is_published)
      await load()
    } catch (err) {
      setError(err.message || 'Gagal mengubah status')
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex overflow-hidden">
      {/* SideNavBar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:transform-none flex flex-col h-screen py-md px-sm border-r border-outline-variant bg-surface-container`}>
        <div className="px-sm mb-xl flex items-center justify-between">
          <div>
            <h1 className="text-base md:text-headline-sm font-headline-sm font-bold text-primary">Admin Panel</h1>
            <p className="text-[10px] md:text-label-sm font-label-sm text-on-surface-variant">UKPBJ Kabupaten Bungo</p>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-surface-variant transition-colors" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <Icon name="close" className="text-[24px]" />
          </button>
        </div>
        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/dashboard" onClick={() => setMobileOpen(false)}>
            <Icon name="dashboard" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Dashboard</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/kelola-panduan" onClick={() => setMobileOpen(false)}>
            <Icon name="menu_book" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Kelola Panduan</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all duration-200" href="/kelola-regulasi" onClick={() => setMobileOpen(false)}>
            <Icon name="gavel" />
            <span className="font-label-md text-label-md">Kelola Regulasi</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/kelola-pengumuman" onClick={() => setMobileOpen(false)}>
            <Icon name="campaign" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Kelola Pengumuman</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/kelola-pesan" onClick={() => setMobileOpen(false)}>
            <Icon name="mail" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Kelola Pesan Masuk</span>
          </a>
          {isSuperAdmin && (
            <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/kelola-admin" onClick={() => setMobileOpen(false)}>
              <Icon name="admin_panel_settings" className="group-hover:scale-110 transition-transform" />
              <span className="font-label-md text-label-md">Kelola Admin</span>
            </a>
          )}
        </nav>
        <div className="mt-auto space-y-1 pt-md border-t border-outline-variant">
          <button
            className="w-full flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg"
            onClick={() => { setSettingsOpen(true); setMobileOpen(false) }}
          >
            <Icon name="settings" />
            <span className="font-label-md text-label-md">Settings</span>
          </button>
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg" href="/login" onClick={() => { localStorage.removeItem('cms_admin_session'); setMobileOpen(false) }}>
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
              <button className="md:hidden p-2 -ml-2 rounded-lg hover:bg-surface-variant transition-colors" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                <Icon name="menu" className="text-[24px]" />
              </button>
              <h2 className="text-base md:text-headline-sm text-primary truncate max-w-[200px] md:max-w-none">Kelola Regulasi</h2>
            </div>
            <div className="hidden md:flex items-center gap-base text-label-sm text-on-surface-variant">
              <span>Admin Panel</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span>Kelola Regulasi</span>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <NotificationBell />
            <button
            onClick={() => { setSettingsOpen(true); setMobileOpen(false) }}
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
            <StatBox icon="description" iconBg="bg-primary-fixed" iconColor="text-primary" label="Total Regulasi" value={loading ? '...' : stats.total} />
            <StatBox icon="check_circle" iconBg="bg-tertiary-fixed" iconColor="text-tertiary" label="Berlaku" value={loading ? '...' : stats.active} />
            <StatBox icon="cancel" iconBg="bg-error-container" iconColor="text-error" label="Tidak Berlaku" value={loading ? '...' : stats.inactive} />
            <StatBox icon="percent" iconBg="bg-surface-container-high" iconColor="text-on-surface-variant" label="Persentase Berlaku" value={loading ? '...' : `${stats.pct}%`} />
          </div>

          {/* Management Table Section */}
          <section className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-lg border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-surface-bright">
              <div className="relative w-full md:w-96">
                <Icon name="search" className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  className="w-full pl-xl pr-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary text-body-md font-body-md"
                  placeholder="Cari judul, nomor, atau tahun..."
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
                        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Status</label>
                        <select
                          className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="Semua">Semua</option>
                          <option value="Berlaku">Berlaku</option>
                          <option value="Tidak Berlaku">Tidak Berlaku</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Tahun</label>
                          <select
                            className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary"
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                          >
                            <option value="Semua">Semua</option>
                            {YEAR_OPTIONS.map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                      </div>
                      <button
                        onClick={() => { setFilterStatus('Semua'); setFilterYear('Semua') }}
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
                  onClick={openCreate}
                >
                  <Icon name="add_circle" className="text-[20px]" />
                  Tambah Regulasi Baru
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-variant/50">
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Nomor / Tahun</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Judul Regulasi</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-center">Status</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-center">Total Download</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-center">Update</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-lg py-md text-center font-body-sm text-on-surface-variant">
                        Memuat regulasi...
                      </td>
                    </tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-lg py-md text-center font-body-sm text-on-surface-variant">
                        Tidak ada regulasi ditemukan.
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
                                <Icon name="gavel" />
                              </div>
                              <div>
                                <p className="font-body-md text-body-md font-semibold text-on-surface">{item.nomor || '-'}</p>
                                <p className="text-label-sm text-on-surface-variant">
                                  {(item.publish_date || '').slice(0, 4) || '-'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-lg py-md">
                            <p className="font-body-md text-body-md font-semibold text-on-surface">{item.judul}</p>
                            {item.description && (
                              <p className="text-label-sm text-on-surface-variant line-clamp-1">{item.description}</p>
                            )}
                          </td>
                          <td className="px-lg py-md text-center">
                            <button onClick={() => handleToggle(item)} title="Klik untuk ubah status">
                              <StatusBadge published={item.is_published} />
                            </button>
                          </td>
                          <td className="px-lg py-md text-center">
                            <span className="inline-flex items-center gap-xs font-body-sm font-semibold text-on-surface">
                              <Icon name="download" className="text-[16px] text-on-surface-variant" />
                              {item.download_count || 0}
                            </span>
                          </td>
                          <td className="px-lg py-md text-center">
                            <span className="font-body-sm font-semibold text-on-surface">
                              {dateValue ? new Date(dateValue).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
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
                                      Edit Regulasi
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
                Menampilkan {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length} regulasi
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
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingItem(null); }} title={editingItem ? 'Edit Regulasi' : 'Tambah Regulasi Baru'}>
        <form className="space-y-xl" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs">Nomor Peraturan <span className="text-error">*</span></label>
              <input
                required
                className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Contoh: P10/2023"
                type="text"
                value={form.nomor}
                onChange={(e) => setForm({ ...form, nomor: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs">Tahun Terbit</label>
              <select
                className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                value={form.tahun}
                onChange={(e) => setForm({ ...form, tahun: e.target.value })}
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-xs">Judul / Tentang <span className="text-error">*</span></label>
            <textarea
              required
              rows={3}
              className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              placeholder="Masukkan judul lengkap peraturan..."
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-xs">Deskripsi</label>
            <textarea
              rows={3}
              className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              placeholder="Deskripsi singkat regulasi..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-xs">URL Dokumen (PDF)</label>
            <input
              className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="https://..."
              type="url"
              value={form.document_url}
              onChange={(e) => setForm({ ...form, document_url: e.target.value })}
            />
            <p className="text-label-sm text-on-surface-variant mt-xs">
              Masukkan URL PDF dari sumber manapun (Google Drive, website, dll.)
            </p>
          </div>

          <div className="flex items-center justify-between p-md bg-surface-container rounded-lg">
            <div>
              <p className="font-label-md text-label-md text-on-surface">Langsung Publikasikan?</p>
              <p className="text-label-sm text-on-surface-variant">Jika aktif, regulasi akan langsung terlihat oleh pengguna portal.</p>
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
              {saving ? 'Menyimpan...' : (editingItem ? 'Perbarui Regulasi' : 'Simpan Regulasi')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

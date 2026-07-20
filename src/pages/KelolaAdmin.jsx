import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import SettingsModal from '../components/SettingsModal'
import NotificationBell from '../components/NotificationBell'
import { getAdminSession, getAvatarFallback } from '../lib/session'
import {
  fetchAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  createAdminCredentials,
  hasAdminCredentials,
  sendAdminCredentialsEmail,
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

const ROLE_OPTIONS = [
  { value: 'Super Admin', label: 'Super Admin' },
  { value: 'Admin', label: 'Admin' },
]

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

function StatusBadge({ status }) {
  if (status === 'Aktif') {
    return (
      <span className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-green-100 text-green-700 text-label-sm font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-green-700" />
        Aktif
      </span>
    )
  }
  if (status === 'Terkunci') {
    return (
      <span className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-error-container text-error text-label-sm font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-error" />
        Terkunci
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-surface-variant text-on-surface-variant text-label-sm font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant" />
      Nonaktif
    </span>
  )
}

const EMPTY_FORM = {
  id: null,
  full_name: '',
  email: '',
  username: '',
  role: '',
  status: 'Aktif',
  whatsapp: '',
  password: '',
}

export default function KelolaAdmin() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingItem, setEditingItem] = useState(null) // item being edited (null = create mode)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [filterRole, setFilterRole] = useState('Semua')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [moreMenuId, setMoreMenuId] = useState(null)
  const [credModalOpen, setCredModalOpen] = useState(false)
  const [credAdminId, setCredAdminId] = useState(null)
  const [credUsername, setCredUsername] = useState('')
  const [credPassword, setCredPassword] = useState('')
  const [credLoading, setCredLoading] = useState(false)
  const [credError, setCredError] = useState('')
  const [credSuccess, setCredSuccess] = useState('')

  // Current logged-in admin (from login session)
  const [admin] = useState(() => getAdminSession())
  const isSuperAdmin = admin?.role === 'Super Admin'
  const adminAvatar = getAdminAvatar(admin)
  const adminName = admin?.full_name || admin?.email || 'Admin'

  const [form, setForm] = useState(EMPTY_FORM)

  async function load() {
    try {
      const data = await fetchAllAdmins()
      setAdmins(data || [])
    } catch (e) {
      setError(e.message || 'Gagal memuat data admin')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const stats = useMemo(() => {
    const total = admins.length
    const active = admins.filter((a) => a.status === 'Aktif').length
    const locked = admins.filter((a) => a.status === 'Terkunci').length
    const pct = total ? Math.round((active / total) * 100) : 0
    return { total, active, locked, pct }
  }, [admins])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return admins.filter((a) => {
      const name = (a.full_name || '').toLowerCase()
      const email = (a.email || '').toLowerCase()
      const role = (a.role || '').toLowerCase()
      const passSearch = !q || name.includes(q) || email.includes(q) || role.includes(q)

      const passStatus =
        filterStatus === 'Semua' ||
        (filterStatus === 'Aktif' ? a.status === 'Aktif' : a.status !== 'Aktif')
      const displayRole = toDisplayRole(a.role)
      const passRole = filterRole === 'Semua' || displayRole === filterRole

      return passSearch && passStatus && passRole
    })
  }, [admins, search, filterStatus, filterRole])

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
      'Nama Lengkap': a.full_name,
      Email: a.email,
      Peran: a.role,
      Status: a.status,
      'Tanggal Update': a.updated_at
        ? new Date(a.updated_at).toLocaleDateString('id-ID')
        : (a.created_at ? new Date(a.created_at).toLocaleDateString('id-ID') : ''),
    }))
    const header = Object.keys(rows[0] || { 'Nama Lengkap': '', Email: '', Peran: '', Status: '', 'Tanggal Update': '' })
    const csv = [
      header.join(','),
      ...rows.map((r) => header.map((h) => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Konversi peran dari UI ke nilai yang disimpan di database.
  function toStoredRole(role) {
    return role
  }

  // Tampilkan peran sesuai dengan nilai di database.
  function toDisplayRole(role) {
    return role
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.role) {
      setError('Nama lengkap, email, dan peran wajib diisi.')
      return
    }
    if (!form.username || form.username.length < 8) {
      setError('Username wajib diisi dan minimal 8 karakter.')
      return
    }
    if (!form.password || form.password.length < 8) {
      setError('Password wajib diisi dan minimal 8 karakter.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        username: form.username,
        role: toStoredRole(form.role),
        status: form.status,
        whatsapp: form.whatsapp || null,
        password: form.password,
      }
      if (editingItem) {
        await updateAdmin(form.id, payload)
      } else {
        await createAdmin(payload)
        // Kirim kredensial ke email admin baru
        const loginUrl = `${window.location.origin}/login`
        await sendAdminCredentialsEmail({
          to: form.email,
          fullName: form.full_name,
          username: form.username,
          password: form.password,
          loginUrl,
        })
      }
      setModalOpen(false)
      setEditingItem(null)
      setForm(EMPTY_FORM)
      await load()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan admin')
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
      full_name: item.full_name || '',
      email: item.email || '',
      username: item.username || '',
      role: item.role || '',
      status: item.status || 'Aktif',
      whatsapp: item.whatsapp || '',
      password: '', // Don't populate password for security
    })
    setModalOpen(true)
  }

  async function handleDelete(item) {
    if (!confirm('Yakin ingin menghapus admin ini?')) return
    try {
      await deleteAdmin(item.id)
      await load()
    } catch (err) {
      setError(err.message || 'Gagal menghapus admin')
    }
  }

  function openCredModal(item) {
    setMoreMenuId(null)
    setCredAdminId(item.id)
    setCredUsername(item.username || item.email)
    setCredPassword('')
    setCredError('')
    setCredSuccess('')
    setCredModalOpen(true)
  }

  async function handleSetCredentials(e) {
    e.preventDefault()
    if (!credUsername.trim() || !credPassword.trim()) {
      setCredError('Username dan password wajib diisi.')
      return
    }

    setCredLoading(true)
    setCredError('')
    setCredSuccess('')

    try {
      const result = await createAdminCredentials(credAdminId, credUsername, credPassword)
      if (result.success) {
        setCredSuccess('Kredensial login berhasil disimpan!')
        setCredPassword('')
        await load()
        setTimeout(() => {
          setCredModalOpen(false)
          setCredSuccess('')
        }, 1500)
      } else {
        setCredError(result.message)
      }
    } catch (err) {
      setCredError(err.message || 'Gagal menyimpan kredensial')
    } finally {
      setCredLoading(false)
    }
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
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/kelola-pengumuman">
            <Icon name="campaign" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Kelola Pengumuman</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/kelola-pesan">
            <Icon name="mail" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Kelola Pesan Masuk</span>
          </a>
          {isSuperAdmin && (
            <a className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all duration-200" href="/kelola-admin">
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
            <h2 className="font-headline-sm text-headline-sm text-primary">Kelola Admin</h2>
            <div className="flex items-center gap-base text-label-sm text-on-surface-variant">
              <span>Admin Panel</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span>Kelola Admin</span>
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
            <div className="bg-error-container text-on-error-container border border-error rounded-xl p-md font-body-sm mb-lg flex items-start justify-between gap-md">
              <p>{error}</p>
              <button className="underline shrink-0" onClick={() => setError(null)}>Tutup</button>
            </div>
          )}

          {/* Statistics Quick View */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-xl">
            <StatBox icon="group" iconBg="bg-primary-fixed" iconColor="text-primary" label="Total Admin" value={loading ? '...' : stats.total} />
            <StatBox icon="verified_user" iconBg="bg-tertiary-fixed" iconColor="text-tertiary" label="Admin Aktif" value={loading ? '...' : stats.active} />
            <StatBox icon="lock_person" iconBg="bg-error-container" iconColor="text-error" label="Admin Terkunci" value={loading ? '...' : stats.locked} />
            <StatBox icon="percent" iconBg="bg-surface-container-high" iconColor="text-on-surface-variant" label="Persentase Aktif" value={loading ? '...' : `${stats.pct}%`} />
          </div>

          {/* Management Table Section */}
          <section className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-lg border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-surface-bright">
              <div className="relative w-full md:w-96">
                <Icon name="search" className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  className="w-full pl-xl pr-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary text-body-md font-body-md"
                  placeholder="Cari nama, email, atau peran..."
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
                          <option value="Aktif">Aktif</option>
                          <option value="Nonaktif">Nonaktif</option>
                          <option value="Terkunci">Terkunci</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Peran</label>
                        <select
                          className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary"
                          value={filterRole}
                          onChange={(e) => setFilterRole(e.target.value)}
                        >
                          <option value="Semua">Semua</option>
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => { setFilterStatus('Semua'); setFilterRole('Semua') }}
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
                  Tambah Admin Baru
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-variant/50">
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">No</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Nama Lengkap</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Username/Email</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Peran</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-center">Status</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-center">Update</th>
                    <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-lg py-md text-center font-body-sm text-on-surface-variant">
                        Memuat admin...
                      </td>
                    </tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-lg py-md text-center font-body-sm text-on-surface-variant">
                        Tidak ada admin ditemukan.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    pagedItems.map((item, i) => {
                      const dateValue = item.updated_at || item.created_at
                      const menuOpen = moreMenuId === item.id
                      return (
                        <tr key={item.id} className="hover:bg-surface-container-low transition-colors group">
                          <td className="px-lg py-md">
                            <span className="font-body-sm font-semibold text-on-surface">
                              {(currentPage - 1) * pageSize + i + 1}
                            </span>
                          </td>
                          <td className="px-lg py-md">
                            <div className="flex items-center gap-md">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container/20 flex items-center justify-center text-primary">
                                <img
                                  className="w-full h-full object-cover"
                                  alt={item.full_name}
                                  src={getAdminAvatar(item)}
                                  onError={(e) => {
                                    e.target.src = getAvatarFallback(item.full_name || item.email || 'Admin')
                                  }}
                                />
                              </div>
                              <p className="font-body-md text-body-md font-semibold text-on-surface">{item.full_name}</p>
                            </div>
                          </td>
                          <td className="px-lg py-md">
                            <p className="font-body-sm text-body-sm text-on-surface">{item.email}</p>
                          </td>
                          <td className="px-lg py-md">
                            <span className="inline-flex items-center px-md py-xs rounded-full bg-secondary-container text-on-secondary-container text-label-sm font-semibold">
                              {toDisplayRole(item.role)}
                            </span>
                          </td>
                          <td className="px-lg py-md text-center">
                            <StatusBadge status={item.status} />
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
                                      Edit Admin
                                    </button>
                                    <button
                                      className="w-full flex items-center gap-sm px-md py-sm text-left text-body-sm text-primary hover:bg-surface-variant transition-colors"
                                      onClick={() => openCredModal(item)}
                                    >
                                      <Icon name="key" className="text-[18px]" />
                                      Set Password
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
                Menampilkan {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length} admin
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

      {/* Form Modal (Tambah / Edit Admin) */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingItem(null); }} title={editingItem ? 'Edit Admin' : 'Tambah Admin Baru'}>
        <form className="space-y-xl" onSubmit={handleSubmit}>
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-xs">Nama Lengkap <span className="text-error">*</span></label>
            <input
              required
              className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Contoh: Muhammad Yusuf"
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-xs">Email <span className="text-error">*</span></label>
            <input
              required
              className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="yusuf@lpse.go.id"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs">Username <span className="text-error">*</span></label>
              <input
                required
                minLength={8}
                className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="minimal 8 karakter"
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs">Password {editingItem ? '(kosongkan jika tidak diubah)' : <span className="text-error">*</span>}</label>
              <input
                required={!editingItem}
                minLength={8}
                className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder={editingItem ? '••••••••' : 'minimal 8 karakter'}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs">Peran <span className="text-error">*</span></label>
              <select
                required
                className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="">Pilih Peran</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs">Status</label>
              <select
                className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
                <option value="Terkunci">Terkunci</option>
              </select>
            </div>
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
              {saving ? 'Menyimpan...' : (editingItem ? 'Perbarui Admin' : 'Simpan Admin')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Set Credentials Modal */}
      {credModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setCredModalOpen(false)}>
          <div className="w-full max-w-[420px] bg-surface-container-lowest border border-outline-variant rounded-xl p-8 institutional-shadow" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary rounded-lg">
                <span className="material-symbols-outlined text-on-primary text-[24px]">
                  key
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Set Password Login
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
              Buat username dan password untuk admin ini agar dapat login ke sistem.
            </p>

            <form onSubmit={handleSetCredentials} className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={credUsername}
                  onChange={(e) => setCredUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={credPassword}
                  onChange={(e) => setCredPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {credError && (
                <div className="bg-error-container text-on-error-container border border-error rounded-lg p-3 font-body-sm text-body-sm">
                  {credError}
                </div>
              )}

              {credSuccess && (
                <div className="bg-green-100 text-green-700 border border-green-400 rounded-lg p-3 font-body-sm text-body-sm">
                  {credSuccess}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCredModalOpen(false)}
                  disabled={credLoading}
                  className="flex-1 py-3 px-4 border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={credLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary-container text-on-primary-container rounded-lg font-label-md text-label-md hover:opacity-90 transition-all disabled:opacity-70"
                >
                  {credLoading && (
                    <span className="material-symbols-outlined animate-spin text-[20px]">
                      progress_activity
                    </span>
                  )}
                  {credLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

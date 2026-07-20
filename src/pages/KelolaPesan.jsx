import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Icon from '../components/Icon'
import SettingsModal from '../components/SettingsModal'
import NotificationBell from '../components/NotificationBell'
import { useMessages, getReadMessageIds } from '../lib/MessageContext'
import {
  fetchContactMessages,
  replyToMessage,
  archiveMessage,
  unarchiveMessage,
  deleteContactMessage,
  markAsRead,
  markAsUnread,
} from '../lib/api'
import { getAdminSession, getAvatarFallback } from '../lib/session'

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

// Time formatting helper
function formatTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins} mnt lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  if (diffDays < 7) return `${diffDays} hari lalu`

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

function formatDateTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const FILTER_OPTIONS = [
  { key: 'all', label: 'Semua' },
  { key: 'unread', label: 'Belum Dibaca' },
  { key: 'replied', label: 'Sudah Dibalas' },
  { key: 'archived', label: 'Arsip' },
]

const SORT_OPTIONS = [
  { key: 'newest', label: 'Terbaru' },
  { key: 'oldest', label: 'Terlama' },
  { key: 'status', label: 'Status' },
]

export default function KelolaPesan() {
  const navigate = useNavigate()
  const location = useLocation()
  const { markRead, markUnread } = useMessages()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  // Allow opening a specific message directly (e.g. from the NotificationBell).
  const [selectedId, setSelectedId] = useState(location.state?.selectedId || null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Current logged-in admin (from login session)
  const [admin] = useState(() => getAdminSession())
  const isSuperAdmin = admin?.role === 'Super Admin'
  const adminAvatar = getAdminAvatar(admin)
  const adminName = admin?.full_name || admin?.email || 'Admin'

  async function load() {
    try {
      const data = await fetchContactMessages()
      // Apply locally-known read states (persisted in localStorage) so a
      // message the user has already opened does not show "Belum Dibaca"
      // again after a reload, even if the database write was blocked (RLS).
      const readIds = getReadMessageIds()
      setMessages(
        (data || []).map((m) =>
          readIds.has(m.id) ? { ...m, is_read: true } : m
        )
      )
    } catch (e) {
      setError(e.message || 'Gagal memuat pesan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const selectedMessage = useMemo(
    () => messages.find((m) => m.id === selectedId) || null,
    [messages, selectedId]
  )

  const filtered = useMemo(() => {
    let result = [...messages]

    // Apply filter
    if (filter === 'unread') {
      result = result.filter((m) => !m.is_read && !m.is_archived)
    } else if (filter === 'replied') {
      result = result.filter((m) => m.is_replied && !m.is_archived)
    } else if (filter === 'archived') {
      result = result.filter((m) => m.is_archived)
    } else {
      result = result.filter((m) => !m.is_archived)
    }

    // Apply search
    const q = search.toLowerCase().trim()
    if (q) {
      result = result.filter(
        (m) =>
          (m.name || '').toLowerCase().includes(q) ||
          (m.email || '').toLowerCase().includes(q) ||
          (m.subject || '').toLowerCase().includes(q) ||
          (m.message || '').toLowerCase().includes(q)
      )
    }

    // Apply sort
    if (sort === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (sort === 'oldest') {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    } else if (sort === 'status') {
      result.sort((a, b) => {
        if (a.is_read !== b.is_read) return a.is_read ? 1 : -1
        if (a.is_replied !== b.is_replied) return a.is_replied ? 1 : -1
        return new Date(b.created_at) - new Date(a.created_at)
      })
    }

    return result
  }, [messages, filter, search, sort])

  const stats = useMemo(() => {
    const nonArchived = messages.filter((m) => !m.is_archived)
    return {
      total: nonArchived.length,
      unread: nonArchived.filter((m) => !m.is_read).length,
      replied: nonArchived.filter((m) => m.is_replied).length,
      archived: messages.filter((m) => m.is_archived).length,
    }
  }, [messages])

  function selectMessage(msg) {
    setSelectedId(msg.id)
    setReplyText('')
    if (!msg.is_read) {
      markAsRead(msg.id).then(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
        )
      })
      // Keep the shared notification bell unread count in sync.
      markRead(msg.id)
    }
  }

  async function handleReply(e) {
    e.preventDefault()
    if (!replyText.trim() || !selectedId) return
    setSending(true)
    try {
      await replyToMessage(selectedId, replyText.trim())
      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedId
            ? { ...m, is_replied: true, is_read: true, reply_text: replyText.trim(), replied_at: new Date().toISOString() }
            : m
        )
      )
      // Replying also marks as read in the shared notification bell.
      markRead(selectedId)
      setReplyText('')
    } catch (err) {
      setError(err.message || 'Gagal mengirim balasan')
    } finally {
      setSending(false)
    }
  }

  async function handleArchive() {
    if (!selectedId) return
    setActionLoading(true)
    try {
      const msg = messages.find((m) => m.id === selectedId)
      if (msg?.is_archived) {
        await unarchiveMessage(selectedId)
        setMessages((prev) =>
          prev.map((m) => (m.id === selectedId ? { ...m, is_archived: false } : m))
        )
      } else {
        await archiveMessage(selectedId)
        setMessages((prev) =>
          prev.map((m) => (m.id === selectedId ? { ...m, is_archived: true } : m))
        )
      }
    } catch (err) {
      setError(err.message || 'Gagal mengarsipkan pesan')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedId) return
    if (!confirm('Yakin ingin menghapus pesan ini?')) return
    setActionLoading(true)
    try {
      await deleteContactMessage(selectedId)
      setMessages((prev) => prev.filter((m) => m.id !== selectedId))
      setSelectedId(null)
      setReplyText('')
    } catch (err) {
      setError(err.message || 'Gagal menghapus pesan')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleMarkUnread() {
    if (!selectedId) return
    setActionLoading(true)
    try {
      await markAsUnread(selectedId)
      setMessages((prev) =>
        prev.map((m) => (m.id === selectedId ? { ...m, is_read: false } : m))
      )
      // Revert the shared notification bell unread count.
      markUnread(selectedId)
    } catch (err) {
      setError(err.message || 'Gagal menandai belum dibaca')
    } finally {
      setActionLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('cms_admin_session')
    navigate('/login')
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
          <a className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all duration-200" href="/kelola-pesan">
            <Icon name="mail" />
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
            <h2 className="font-headline-sm text-headline-sm text-primary">Kelola Pesan Masuk</h2>
            <div className="flex items-center gap-base text-label-sm text-on-surface-variant">
              <span>Admin Panel</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span>Kelola Pesan Masuk</span>
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
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`text-left bg-surface p-lg rounded-xl border shadow-sm flex items-center gap-md transition-all hover:bg-surface-variant ${
                filter === 'all' ? 'border-primary ring-2 ring-primary' : 'border-outline-variant'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                <Icon name="mail" className="text-[28px]" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Total Pesan</p>
                <h4 className="text-headline-md font-bold">{loading ? '...' : stats.total}</h4>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`text-left bg-surface p-lg rounded-xl border shadow-sm flex items-center gap-md transition-all hover:bg-surface-variant ${
                filter === 'unread' ? 'border-primary ring-2 ring-primary' : 'border-outline-variant'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary">
                <Icon name="mark_as_unread" className="text-[28px]" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Belum Dibaca</p>
                <h4 className="text-headline-md font-bold">{loading ? '...' : stats.unread}</h4>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFilter('replied')}
              className={`text-left bg-surface p-lg rounded-xl border shadow-sm flex items-center gap-md transition-all hover:bg-surface-variant ${
                filter === 'replied' ? 'border-primary ring-2 ring-primary' : 'border-outline-variant'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-error-container flex items-center justify-center text-error">
                <Icon name="reply" className="text-[28px]" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Sudah Dibalas</p>
                <h4 className="text-headline-md font-bold">{loading ? '...' : stats.replied}</h4>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFilter('archived')}
              className={`text-left bg-surface p-lg rounded-xl border shadow-sm flex items-center gap-md transition-all hover:bg-surface-variant ${
                filter === 'archived' ? 'border-primary ring-2 ring-primary' : 'border-outline-variant'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <Icon name="archive" className="text-[28px]" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Arsip</p>
                <h4 className="text-headline-md font-bold">{loading ? '...' : stats.archived}</h4>
              </div>
            </button>
          </div>

          {/* Management Section */}
          <section className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-lg border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-surface-bright">
              <div className="relative w-full md:w-96">
                <Icon name="search" className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  className="w-full pl-xl pr-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary text-body-md font-body-md"
                  placeholder="Cari pesan atau pengirim..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-sm w-full md:w-auto">
                
                <div className="flex items-center gap-sm">
                  <span className="text-label-sm font-label-sm text-on-surface-variant">Urutkan:</span>
                  <select
                    className="bg-surface border border-outline-variant rounded-lg px-sm py-xs text-label-sm font-label-sm focus:ring-1 focus:ring-primary outline-none"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Desktop Split View */}
            <div className="flex-1 flex overflow-hidden">
              {/* Message List */}
              <div className="w-full md:w-[420px] shrink-0 border-r border-outline-variant overflow-y-auto bg-white">
                {loading ? (
                  <div className="p-md text-center text-on-surface-variant">Memuat pesan...</div>
                ) : filtered.length === 0 ? (
                  <div className="p-md text-center text-on-surface-variant">Tidak ada pesan ditemukan.</div>
                ) : (
                  <div className="divide-y divide-outline-variant">
                    {filtered.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-md hover:bg-surface-container-low cursor-pointer transition-colors ${
                          selectedId === msg.id ? 'active-message' : ''
                        }`}
                        onClick={() => selectMessage(msg)}
                      >
                        <div className="flex justify-between items-start mb-xs">
                          <span
                            className={`font-label-md text-label-md ${
                              !msg.is_read ? 'text-primary font-bold' : 'text-on-surface'
                            }`}
                          >
                            {msg.name}
                          </span>
                          <span className="text-label-sm font-label-sm text-on-surface-variant">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                        <h4 className="font-label-md text-label-md text-on-surface line-clamp-1 mb-xs">
                          {msg.subject || '(tanpa subjek)'}
                        </h4>
                        <p className="text-body-sm font-body-sm text-on-surface-variant line-clamp-2 mb-sm">
                          {msg.message}
                        </p>
                        <div className="flex gap-xs">
                          {!msg.is_read && (
                            <span className="px-sm py-px bg-error-container text-on-error-container rounded-full text-[10px] font-bold uppercase tracking-wider">
                              Belum Dibaca
                            </span>
                          )}
                          {msg.is_replied && (
                            <span className="px-sm py-px bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider">
                              Sudah Dibalas
                            </span>
                          )}
                          {msg.is_archived && (
                            <span className="px-sm py-px bg-surface-container-highest text-on-surface-variant rounded-full text-[10px] font-bold uppercase tracking-wider">
                              Arsip
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Detail Panel */}
              <div className="hidden md:flex flex-1 flex-col bg-surface overflow-hidden">
                {selectedMessage ? (
                  <>
                    {/* Toolbar Detail */}
                    <div className="h-14 flex items-center justify-between px-lg border-b border-outline-variant bg-white">
                      <div className="flex gap-sm">
                        <button
                          className="p-sm rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
                          title={selectedMessage.is_archived ? 'Batal Arsip' : 'Arsip'}
                          onClick={handleArchive}
                          disabled={actionLoading}
                        >
                          <Icon name="archive" />
                        </button>
                        <button
                          className="p-sm rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
                          title="Hapus"
                          onClick={handleDelete}
                          disabled={actionLoading}
                        >
                          <Icon name="delete" />
                        </button>
                        <button
                          className="p-sm rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
                          title="Tandai Belum Dibaca"
                          onClick={handleMarkUnread}
                          disabled={actionLoading}
                        >
                          <Icon name="mark_as_unread" />
                        </button>
                      </div>
                      <div className="flex items-center gap-md">
                        <span className="text-label-sm font-label-sm text-on-surface-variant">
                          {filtered.findIndex((m) => m.id === selectedId) + 1} dari {filtered.length} Pesan
                        </span>
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 overflow-y-auto p-xl">
                      <div className="max-w-3xl mx-auto">
                        <div className="mb-lg">
                          <h3 className="font-headline-lg text-headline-lg text-on-surface mb-md">
                            {selectedMessage.subject || '(tanpa subjek)'}
                          </h3>
                          <div className="flex items-center gap-md">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {getInitials(selectedMessage.name)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <p className="font-label-md text-label-md text-on-surface">
                                  {selectedMessage.name}{' '}
                                  <span className="font-normal text-on-surface-variant">
                                    {'<'}{selectedMessage.email}{'>'}
                                  </span>
                                </p>
                                <span className="text-label-sm font-label-sm text-on-surface-variant">
                                  {formatDateTime(selectedMessage.created_at)}
                                </span>
                              </div>
                              <p className="text-label-sm font-label-sm text-on-surface-variant">
                                Kepada: Helpdesk Inaproc
                              </p>
                            </div>
                          </div>
                        </div>
                        <article className="prose max-w-none text-on-surface-variant font-body-md text-body-md space-y-md whitespace-pre-wrap">
                          {selectedMessage.message}
                        </article>

                        {/* Reply History */}
                        {selectedMessage.reply_text && (
                          <div className="mt-xl pt-lg border-t border-outline-variant">
                            <h5 className="font-label-md text-label-md text-on-surface mb-sm">Balasan Admin</h5>
                            <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant">
                              <p className="text-body-sm font-body-sm text-on-surface whitespace-pre-wrap">
                                {selectedMessage.reply_text}
                              </p>
                              <p className="text-label-sm font-label-sm text-on-surface-variant mt-sm">
                                {formatDateTime(selectedMessage.replied_at)}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Reply Action Area */}
                        <div className="mt-xl pt-lg border-t border-outline-variant">
                          <h5 className="font-label-md text-label-md text-on-surface mb-sm">Balas Pesan</h5>
                          <form
                            className="border border-outline-variant rounded-xl focus-within:ring-2 focus-within:ring-primary overflow-hidden transition-all shadow-sm"
                            onSubmit={handleReply}
                          >
                            <div className="flex items-center gap-md px-md py-sm bg-surface-container-low border-b border-outline-variant">
                              <button type="button" className="p-xs hover:bg-surface-variant rounded">
                                <Icon name="format_bold" className="text-[20px]" />
                              </button>
                              <button type="button" className="p-xs hover:bg-surface-variant rounded">
                                <Icon name="format_italic" className="text-[20px]" />
                              </button>
                              <button type="button" className="p-xs hover:bg-surface-variant rounded">
                                <Icon name="format_list_bulleted" className="text-[20px]" />
                              </button>
                              <button type="button" className="p-xs hover:bg-surface-variant rounded">
                                <Icon name="attach_file" className="text-[20px]" />
                              </button>
                              <div className="flex-1"></div>
                              <span className="text-label-sm font-label-sm text-on-surface-variant">
                                Balas ke: {selectedMessage.email}
                              </span>
                            </div>
                            <textarea
                              className="w-full p-md outline-none border-none resize-none font-body-sm text-body-sm"
                              placeholder="Tulis balasan Anda di sini..."
                              rows={4}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            />
                            <div className="flex justify-end p-md bg-white">
                              <button
                                type="submit"
                                disabled={sending || !replyText.trim()}
                                className="flex items-center gap-sm px-lg py-sm bg-primary text-white rounded-lg font-label-md text-label-md hover:bg-opacity-90 shadow-md disabled:opacity-50"
                              >
                                <Icon name="send" className="text-[18px]" />
                                <span>{sending ? 'Mengirim...' : 'Balas'}</span>
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-on-surface-variant">
                    <div className="text-center">
                      <Icon name="mail" className="text-[64px] mb-md block opacity-30" />
                      <p className="font-body-md">Pilih pesan untuk melihat detail</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

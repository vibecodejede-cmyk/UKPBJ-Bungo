import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMessages } from '../lib/MessageContext'
import { markAsRead, markAllAsRead } from '../lib/api'

function timeAgo(iso) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime())
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Baru saja'
  if (m < 60) return `${m} mnt lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  const d = Math.floor(h / 24)
  return `${d} hari lalu`
}

// Notification bell showing contact messages submitted via the public Kontak page.
// Uses the shared MessageContext so the unread count stays in sync on every page.
export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { messages, loading, refresh, markRead, markAllRead } = useMessages()

  // Re-sync with the database on every route change (e.g. returning to the
  // Dashboard after reading messages on another page) so the unread badge
  // always reflects the latest read status and disappears once everything is read.
  useEffect(() => {
    refresh()
  }, [refresh, location.pathname])

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const unread = messages.filter((m) => !m.is_read).length

  // Open the clicked message in the Kelola Pesan page and mark it as read.
  function openMessage(m) {
    setOpen(false)
    if (!m.is_read) {
      // Update local state immediately so the unread count drops right away
      // on the current page's bell before navigating away.
      markRead(m.id)
      // Persist the read status in the database.
      markAsRead(m.id).catch(() => {})
    }
    // Small delay so the decreased unread badge is visible on the current
    // page (e.g. KelolaAdmin) before switching to Kelola Pesan.
    setTimeout(() => {
      navigate('/kelola-pesan', { state: { selectedId: m.id } })
    }, 150)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className="p-2 rounded-full hover:bg-surface-variant relative"
        onClick={() => {
          const willOpen = !open
          setOpen(willOpen)
          // When opening the panel, mark all unread messages as read so the
          // bell badge clears immediately.
          if (willOpen && unread > 0) {
            markAllRead()
            markAllAsRead().catch(() => {})
          }
        }}
        title="Pesan Masuk"
      >
        <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-error rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-surface-container-lowest border border-outline-variant rounded-xl institutional-shadow z-50 custom-scrollbar">
          <div className="p-md border-b border-outline-variant flex items-center justify-between">
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Pesan Masuk</h4>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {unread} belum dibaca
            </span>
          </div>
          {loading ? (
            <p className="p-md font-body-sm text-on-surface-variant">Memuat pesan...</p>
          ) : messages.length === 0 ? (
            <p className="p-md font-body-sm text-on-surface-variant">Belum ada pesan masuk.</p>
          ) : (
            <>
              <ul className="divide-y divide-outline-variant">
                {messages.slice(0, 20).map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      className="w-full text-left p-md hover:bg-surface-container-low transition-colors cursor-pointer"
                      onClick={() => openMessage(m)}
                    >
                      <div className="flex items-center justify-between gap-md">
                        <p className="font-label-md text-label-md text-on-surface truncate">{m.name}</p>
                        <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">
                          {timeAgo(m.created_at)}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        {m.subject || '(tanpa subjek)'}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface mt-xs line-clamp-2">
                        {m.message}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="w-full p-md text-center font-label-md text-label-md text-primary hover:bg-surface-container-low transition-colors"
                onClick={() => {
                  setOpen(false)
                  navigate('/kelola-pesan')
                }}
              >
                Lihat semua pesan
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

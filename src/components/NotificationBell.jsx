import { useEffect, useRef, useState } from 'react'
import { fetchContactMessages } from '../lib/api'

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
export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)

  async function load() {
    try {
      const data = await fetchContactMessages()
      setMessages(data || [])
    } catch {
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const unread = messages.filter((m) => !m.is_read).length

  return (
    <div className="relative" ref={ref}>
      <button
        className="p-2 rounded-full hover:bg-surface-variant relative"
        onClick={() => setOpen((v) => !v)}
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
            <ul className="divide-y divide-outline-variant">
              {messages.slice(0, 20).map((m) => (
                <li key={m.id} className="p-md hover:bg-surface-container-low transition-colors">
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
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

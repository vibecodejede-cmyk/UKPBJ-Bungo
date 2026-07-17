import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from './supabase'
import { fetchContactMessages } from './api'

const MessageContext = createContext(null)

// Key used to persist message IDs the user has already opened, so the
// "unread" state stays cleared across reloads even if the database write
// (e.g. an UPDATE blocked by RLS) has not persisted.
export const READ_IDS_STORAGE_KEY = 'pesan_masuk_read'

// Read the set of message IDs the user has already opened from localStorage.
export function getReadMessageIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_IDS_STORAGE_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

const POLL_INTERVAL = 30000 // refresh every 30s as a fallback

// Provider that loads incoming contact messages once and shares the state
// across every admin page so the notification bell stays in sync everywhere.
export function MessageProvider({ children }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef(null)
  // IDs that the user has marked as read. Persisted to localStorage so the
  // unread badge stays cleared across re-fetches, polls AND full page reloads,
  // even when the database write is delayed or blocked (e.g. by RLS) — which
  // previously caused the badge to re-appear after navigating/reloading.
  const readIdsRef = useRef(
    new Set(
      (() => {
        try {
          return JSON.parse(localStorage.getItem('pesan_masuk_read') || '[]')
        } catch {
          return []
        }
      })()
    )
  )

  const persistReadIds = useCallback(() => {
    try {
      localStorage.setItem(
        'pesan_masuk_read',
        JSON.stringify([...readIdsRef.current])
      )
    } catch {
      /* ignore storage errors */
    }
  }, [])

  const load = useCallback(async () => {
    try {
      const data = await fetchContactMessages()
      const readIds = readIdsRef.current
      // Re-apply locally-known read states on top of the fresh DB data so a
      // message the user already opened does not flip back to "unread".
      setMessages(
        (data || []).map((m) =>
          readIds.has(m.id) ? { ...m, is_read: true } : m
        )
      )
    } catch {
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Optimistically mark a message as read in local state so the unread
  // count in the bell updates immediately without waiting for a refetch.
  const markRead = useCallback((id) => {
    readIdsRef.current.add(id)
    persistReadIds()
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_read: true } : m))
    )
  }, [persistReadIds])

  // Optimistically mark a message as unread in local state so the unread
  // count in the bell increases again when reverted from Kelola Pesan.
  const markUnread = useCallback((id) => {
    readIdsRef.current.delete(id)
    persistReadIds()
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_read: false } : m))
    )
  }, [persistReadIds])

  // Optimistically mark every message as read in local state so the unread
  // count in the bell drops to zero as soon as the bell panel is opened.
  const markAllRead = useCallback(() => {
    setMessages((prev) => {
      const readIds = readIdsRef.current
      prev.forEach((m) => readIds.add(m.id))
      persistReadIds()
      return prev.map((m) => ({ ...m, is_read: true }))
    })
  }, [persistReadIds])

  useEffect(() => {
    load()

    // Polling fallback in case realtime is unavailable.
    const interval = setInterval(load, POLL_INTERVAL)

    // Realtime subscription for instant updates across all pages.
    let channel
    try {
      channel = supabase
        .channel('pesan_masuk_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'pesan_masuk' },
          () => load()
        )
        .subscribe()
      channelRef.current = channel
    } catch {
      channelRef.current = null
    }

    return () => {
      clearInterval(interval)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [load])

  const value = { messages, loading, refresh: load, markRead, markUnread, markAllRead }

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
}

export function useMessages() {
  const ctx = useContext(MessageContext)
  if (!ctx) {
    // Safe fallback so the bell still works outside the provider.
    return { messages: [], loading: true, refresh: async () => {} }
  }
  return ctx
}

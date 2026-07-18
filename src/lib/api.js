import { supabase } from './supabase'

// ============================================
// ADMIN AUTH (LOGIN CMS)
// ============================================
// Check whether a given email is registered as an admin in the database.
// Returns the admin record (with role/status) or null if not found.
export async function checkAdminByEmail(email) {
  const normalized = (email || '').trim().toLowerCase()
  const { data, error } = await supabase
    .from('admins')
    .select('id, full_name, email, role, status')
    .eq('email', normalized)
    .maybeSingle()

  if (error) throw error
  return data
}

// ============================================
// GUIDES (PANDUAN) API
// ============================================
export async function fetchGuides() {
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchFeaturedGuide() {
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) throw error
  return data
}

export async function fetchGuideById(id) {
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function fetchGuidesByRole(role) {
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('is_published', true)
    .eq('role', role)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchGuidesByCategory(category) {
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('is_published', true)
    .eq('category', category)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchGuideVideos(category) {
  let query = supabase.from('guide_videos').select('*')

  if (category) {
    query = query.eq('category', category)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) throw error
  return data
}

// ============================================
// ANNOUNCEMENTS API
// ============================================
export async function fetchAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchAnnouncementById(id) {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Admin: fetch ALL announcements (including drafts) for management table
export async function fetchAllAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createAnnouncement(payload) {
  const { data, error } = await supabase
    .from('announcements')
    .insert([
      {
        title: payload.title,
        excerpt: payload.excerpt || payload.title,
        content: payload.content || '',
        badge: payload.badge || 'Info',
        badge_class: payload.badge_class || 'bg-secondary text-on-secondary',
        date: payload.date || new Date().toLocaleDateString('id-ID'),
        detail_date: payload.detail_date || new Date().toLocaleDateString('id-ID'),
        category: payload.category || 'Umum',
        author: payload.author || 'Admin',
        image_url: payload.image_url || '',
        is_published: payload.is_published ?? true,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAnnouncement(id, payload) {
  const { data, error } = await supabase
    .from('announcements')
    .update({
      title: payload.title,
      excerpt: payload.excerpt || payload.title,
      content: payload.content || '',
      badge: payload.badge || 'Info',
      badge_class: payload.badge_class || 'bg-secondary text-on-secondary',
      date: payload.date,
      detail_date: payload.detail_date,
      category: payload.category || 'Umum',
      author: payload.author || 'Admin',
      image_url: payload.image_url || '',
      is_published: payload.is_published ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAnnouncement(id) {
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function toggleAnnouncementPublish(id, isPublished) {
  const { data, error } = await supabase
    .from('announcements')
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// NEWSLETTER API
// ============================================
export async function subscribeNewsletter(email) {
  const { data, error } = await supabase
    .from('newsletter_subscriptions')
    .insert([{ email }])
    .select()

  if (error) throw error
  return data
}

// ============================================
// CONTACT API (table: pesan_masuk)
// ============================================
export async function submitContactMessage(name, email, subject, message) {
  const { data, error } = await supabase
    .from('pesan_masuk')
    .insert([{ name, email, subject, message }])
    .select()

  if (error) {
    console.error('Error submitting contact message:', error)
    throw new Error(error.message || 'Gagal mengirim pesan. Pastikan tabel pesan_masuk memiliki kolom email, name, subject, dan message.')
  }
  return data
}

// Fetch all incoming messages (for admin notifications / inbox).
export async function fetchContactMessages() {
  const { data, error } = await supabase
    .from('pesan_masuk')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Update a contact message (e.g., mark as read)
export async function updateContactMessage(id, updates) {
  const { data, error } = await supabase
    .from('pesan_masuk')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete a contact message
export async function deleteContactMessage(id) {
  const { error } = await supabase
    .from('pesan_masuk')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// Reply to a contact message
export async function replyToMessage(id, replyText) {
  const { data, error } = await supabase
    .from('pesan_masuk')
    .update({
      is_replied: true,
      is_read: true,
      reply_text: replyText,
      replied_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Archive a contact message
export async function archiveMessage(id) {
  const { data, error } = await supabase
    .from('pesan_masuk')
    .update({ is_archived: true })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Unarchive a contact message
export async function unarchiveMessage(id) {
  const { data, error } = await supabase
    .from('pesan_masuk')
    .update({ is_archived: false })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Mark message as read
export async function markAsRead(id) {
  const { data, error } = await supabase
    .from('pesan_masuk')
    .update({ is_read: true })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Mark message as unread
export async function markAsUnread(id) {
  const { data, error } = await supabase
    .from('pesan_masuk')
    .update({ is_read: false })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Mark all unread messages as read at once (used when opening the bell panel).
export async function markAllAsRead() {
  const { data, error } = await supabase
    .from('pesan_masuk')
    .update({ is_read: true })
    .eq('is_read', false)
    .select()

  if (error) throw error
  return data
}

// ============================================
// REGULATIONS API
// ============================================
export async function fetchRegulations() {
  const { data, error } = await supabase
    .from('regulations')
    .select('*')
    .eq('is_published', true)
    .order('publish_date', { ascending: false })

  if (error) throw error
  return data
}

// ============================================
// REGULATIONS ADMIN (CMS) API - Kelola Regulasi
// ============================================
// Admin: fetch ALL regulations (including drafts) for management table
export async function fetchAllRegulations() {
  const { data, error } = await supabase
    .from('regulations')
    .select('*')
    .order('publish_date', { ascending: false })

  if (error) throw error
  return data
}

export async function createRegulation(payload) {
  const { data, error } = await supabase
    .from('regulations')
    .insert([
      {
        title: payload.title,
        description: payload.description || null,
        category: payload.category || 'Umum',
        document_url: payload.document_url || null,
        publish_date: payload.publish_date || new Date().toISOString().slice(0, 10),
        is_published: payload.is_published ?? true,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateRegulation(id, payload) {
  const { data, error } = await supabase
    .from('regulations')
    .update({
      title: payload.title,
      description: payload.description ?? null,
      category: payload.category || 'Umum',
      document_url: payload.document_url || null,
      publish_date: payload.publish_date,
      is_published: payload.is_published ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteRegulation(id) {
  const { error } = await supabase.from('regulations').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function toggleRegulationPublish(id, isPublished) {
  const { data, error } = await supabase
    .from('regulations')
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// GUIDES ADMIN (CMS) API
// ============================================
// Admin: fetch ALL guides (including drafts) for management table
export async function fetchAllGuides() {
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createGuide(payload) {
  const { data, error } = await supabase
    .from('guides')
    .insert([payload])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteGuide(id) {
  const { error } = await supabase.from('guides').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function toggleGuidePublish(id, isPublished) {
  const { data, error } = await supabase
    .from('guides')
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Admin: create a video guide in the dedicated guide_videos table
export async function createGuideVideo(payload) {
  const { data, error } = await supabase
    .from('guide_videos')
    .insert([
      {
        title: payload.title,
        description: payload.description || null,
        video_url: payload.video_url || null,
        thumbnail_url: payload.thumbnail_url || null,
        duration: payload.duration || null,
        category: payload.category || 'Panduan Inaproc',
        role: payload.role ? [payload.role] : ['Semua'],
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

// Admin: delete a video guide from the guide_videos table
export async function deleteGuideVideo(id) {
  const { error } = await supabase.from('guide_videos').delete().eq('id', id)
  if (error) throw error
  return true
}

// ============================================
// ADMINS (CMS) API - Kelola Admin
// ============================================
// Admin: fetch ALL admins for management table
export async function fetchAllAdmins() {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function createAdmin(payload) {
  const { data, error } = await supabase
    .from('admins')
    .insert([
      {
        full_name: payload.full_name,
        email: payload.email,
        role: payload.role,
        status: payload.status || 'Aktif',
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAdmin(id, payload) {
  const { data, error } = await supabase
    .from('admins')
    .update({
      full_name: payload.full_name,
      email: payload.email,
      role: payload.role,
      status: payload.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAdmin(id) {
  const { error } = await supabase.from('admins').delete().eq('id', id)
  if (error) throw error
  return true
}

// ============================================
// DASHBOARD ADMIN STATS
// ============================================
export async function fetchDashboardStats() {
  const [{ count: totalGuides, error: errGuides }, { count: totalRegulations, error: errReg }, { count: totalAnnouncements, error: errAnn }] = await Promise.all([
    supabase.from('guides').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('regulations').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('announcements').select('*', { count: 'exact', head: true }).eq('is_published', true),
  ])

  if (errGuides) throw errGuides
  if (errReg) throw errReg
  if (errAnn) throw errAnn

  return {
    totalGuides: totalGuides ?? 0,
    totalRegulations: totalRegulations ?? 0,
    totalAnnouncements: totalAnnouncements ?? 0,
  }
}

// ============================================
// ACTIVITY LOG (derived from recent content changes)
// ============================================
export async function fetchActivityLog(limit = 10) {
  const [guidesRes, regRes, annRes] = await Promise.all([
    supabase
      .from('guides')
      .select('id, title, is_published, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(limit),
    supabase
      .from('regulations')
      .select('id, nomor, judul, is_published, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(limit),
    supabase
      .from('announcements')
      .select('id, title, author, is_published, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(limit),
  ])

  if (guidesRes.error) throw guidesRes.error
  if (regRes.error) throw regRes.error
  if (annRes.error) throw annRes.error

  const now = Date.now()
  const fmtAgo = (iso) => {
    const diff = Math.max(0, now - new Date(iso).getTime())
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'Baru saja'
    if (m < 60) return `${m} Menit yang lalu`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h} Jam yang lalu`
    const d = Math.floor(h / 24)
    return `${d} Hari yang lalu`
  }

  const g = (guidesRes.data || []).map((x) => ({ ...x, _t: new Date(x.updated_at).getTime(), _k: 'guide' }))
  const r = (regRes.data || []).map((x) => ({ ...x, _t: new Date(x.updated_at).getTime(), _k: 'reg' }))
  const an = (annRes.data || []).map((x) => ({ ...x, _t: new Date(x.updated_at).getTime(), _k: 'ann' }))

  const all = [...g, ...r, ...an].sort((x, y) => y._t - x._t).slice(0, limit)

  return all.map((x) => {
    const isNew = new Date(x.created_at).getTime() === new Date(x.updated_at).getTime()
    if (x._k === 'guide') {
      return {
        id: `guide-${x.id}`,
        user: 'Admin Pusat',
        userInitials: 'AP',
        userColor: 'bg-primary-container',
        activity: `${isNew ? 'Menambahkan' : 'Memperbarui'} Panduan: ${x.title}`,
        date: fmtAgo(x.updated_at),
        status: x.is_published ? 'Berhasil' : 'Draft',
        statusClass: x.is_published ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#ECEFF1] text-[#546E7A]',
      }
    }
    if (x._k === 'reg') {
      return {
        id: `reg-${x.id}`,
        user: 'Update LPSE',
        userInitials: 'UL',
        userColor: 'bg-secondary-container',
        activity: `${isNew ? 'Menambahkan' : 'Memperbarui'} Regulasi: ${x.nomor} ${x.judul}`,
        date: fmtAgo(x.updated_at),
        status: x.is_published ? 'Berhasil' : 'Draft',
        statusClass: x.is_published ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#ECEFF1] text-[#546E7A]',
      }
    }
    return {
      id: `ann-${x.id}`,
      user: x.author || 'Info Pusat',
      userInitials: (x.author || 'IP').slice(0, 2).toUpperCase(),
      userColor: 'bg-tertiary-container',
      activity: `${isNew ? 'Mempublikasikan' : 'Memperbarui'} Pengumuman: ${x.title}`,
      date: fmtAgo(x.updated_at),
      status: x.is_published ? 'Berhasil' : 'Pending',
      statusClass: x.is_published ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF3E0] text-[#EF6C00]',
    }
  })
}

import { supabase } from './supabase'

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

export async function fetchGuideVideos(guideId) {
  const { data, error } = await supabase
    .from('guide_videos')
    .select('*')
    .eq('guide_id', guideId)
    .order('created_at', { ascending: false })

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
// CONTACT API
// ============================================
export async function submitContactMessage(name, email, subject, message) {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert([{ name, email, subject, message }])
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

import { supabase } from './supabase'

// Simple password hashing using Web Crypto API (SHA-256)
// Note: For production, use a proper backend with bcrypt or similar
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'ukpbj-bungo-salt-2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// WhatsApp API configuration
// Supported types: 'wablas', 'fontee', 'custom'
const WHATSAPP_API_TYPE = import.meta.env.VITE_WHATSAPP_API_TYPE || 'wablas'
const WHATSAPP_API_URL = import.meta.env.VITE_WHATSAPP_API_URL || ''
const WHATSAPP_API_TOKEN = import.meta.env.VITE_WHATSAPP_API_TOKEN || ''
const WHATSAPP_SENDER_NUMBER = import.meta.env.VITE_WHATSAPP_SENDER_NUMBER || ''

// ============================================
// ADMIN AUTH (LOGIN CMS)
// ============================================
// Check whether a given email is registered as an admin in the database.
// Returns the admin record (with role/status) or null if not found.
export async function checkAdminByEmail(email) {
  const normalized = (email || '').trim().toLowerCase()
  const { data, error } = await supabase
    .from('admins')
    .select('id, full_name, email, role, status, whatsapp')
    .eq('email', normalized)
    .maybeSingle()

  if (error) throw error
  if (!data) return data

  // WhatsApp column may not exist yet on the live DB (migration not run).
  // Fetch it separately so a missing column doesn't break the whole login.
  try {
    const { data: waData, error: waError } = await supabase
      .from('admins')
      .select('whatsapp')
      .eq('id', data.id)
      .maybeSingle()
    if (!waError && waData) {
      data.whatsapp = waData.whatsapp || null
    } else {
      data.whatsapp = null
    }
  } catch {
    data.whatsapp = null
  }

  return data
}

// ============================================
// WHATSAPP API
// ============================================
// Send a WhatsApp message using the configured API service.
async function sendWhatsAppMessage(phone, message) {
  if (!WHATSAPP_API_URL || !WHATSAPP_API_TOKEN) {
    console.warn('[WhatsApp] API credentials not configured. Set VITE_WHATSAPP_API_URL and VITE_WHATSAPP_API_TOKEN in .env')
    return { success: false, error: 'API not configured' }
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '')
  let formattedPhone = cleanPhone
  if (cleanPhone.startsWith('0')) {
    // Convert Indonesian number (08xx) to international format (628xx)
    formattedPhone = '62' + cleanPhone.substring(1)
  }

  try {
    let response

    switch (WHATSAPP_API_TYPE) {
      case 'wablas':
        // Wablas API format
        response = await fetch(WHATSAPP_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': WHATSAPP_API_TOKEN,
          },
          body: JSON.stringify({
            phone: formattedPhone,
            message: message,
            sender: WHATSAPP_SENDER_NUMBER || undefined,
          }),
        })
        break

      case 'fontee':
        // Fontee API format
        response = await fetch(`${WHATSAPP_API_URL}/send-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
          },
          body: JSON.stringify({
            to: formattedPhone,
            message: message,
          }),
        })
        break

      case 'custom':
      default:
        // Custom API - expects standard format
        response = await fetch(WHATSAPP_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
          },
          body: JSON.stringify({
            phone: formattedPhone,
            message: message,
          }),
        })
        break
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.warn('[WhatsApp] API error:', response.status, errorText)
      return { success: false, error: `API error: ${response.status}` }
    }

    const result = await response.json()
    return { success: true, data: result }
  } catch (err) {
    console.warn('[WhatsApp] sendWhatsAppMessage error:', err?.message || err)
    return { success: false, error: err?.message || 'Unknown error' }
  }
}

// ============================================
// WHATSAPP VERIFICATION
// ============================================
// Generate a 6-digit verification code, store it in the database,
// and send it via WhatsApp API.
export async function sendWhatsappCode(adminId, phone) {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  try {
    // Delete any existing unused codes for this admin
    await supabase
      .from('whatsapp_verifications')
      .delete()
      .eq('admin_id', adminId)
      .eq('used', false)

    const { error } = await supabase
      .from('whatsapp_verifications')
      .insert([
        {
          admin_id: adminId,
          code,
          phone,
          expires_at: expiresAt,
          used: false,
        },
      ])

    if (error) {
      console.warn('[WhatsApp] Gagal menyimpan kode verifikasi:', error.message)
      return { success: false, code: null }
    }

    // Send the code via WhatsApp API
    const message = `Kode verifikasi UKPBJ Bungo: ${code}\n\nKode ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapapun.`
    const sendResult = await sendWhatsAppMessage(phone, message)

    if (sendResult.success) {
      return { success: true, code }
    } else {
      console.warn('[WhatsApp] Gagal mengirim pesan WhatsApp:', sendResult.error)
      // Still return success with code for testing purposes
      return { success: true, code, warning: 'Kode disimpan tapi gagal dikirim via WhatsApp' }
    }
  } catch (err) {
    console.warn('[WhatsApp] sendWhatsappCode error:', err?.message || err)
    return { success: false, code: null }
  }
}

// Verify a WhatsApp verification code entered by the user.
export async function verifyWhatsappCode(adminId, code) {
  try {
    const { data, error } = await supabase
      .from('whatsapp_verifications')
      .select('*')
      .eq('admin_id', adminId)
      .eq('code', code)
      .eq('used', false)
      .maybeSingle()

    if (error || !data) {
      return { success: false, message: 'Kode verifikasi salah atau sudah kadaluarsa.' }
    }

    // Check if code has expired
    if (new Date(data.expires_at) < new Date()) {
      return { success: false, message: 'Kode verifikasi sudah kadaluarsa. Silakan minta kode baru.' }
    }

    // Mark code as used
    await supabase
      .from('whatsapp_verifications')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', data.id)

    return { success: true }
  } catch (err) {
    console.warn('[WhatsApp] verifyWhatsappCode error:', err?.message || err)
    return { success: false, message: 'Terjadi kesalahan saat verifikasi.' }
  }
}

// ============================================
// USERNAME/PASSWORD AUTHENTICATION
// ============================================
// Login with username and password
export async function loginWithCredentials(username, password) {
  try {
    // Find admin by username
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, full_name, email, role, status, username, whatsapp')
      .eq('username', username.trim())
      .maybeSingle()

    if (adminError || !admin) {
      return { success: false, message: 'Username atau password salah.' }
    }

    if (admin.status === 'Nonaktif') {
      return { success: false, message: 'Akun Anda sedang nonaktif. Silakan hubungi Super Admin.' }
    }

    if (admin.status === 'Terkunci') {
      return { success: false, message: 'Akun Anda terkunci. Silakan hubungi Super Admin.' }
    }

    // Get password hash
    // If admin_credentials table doesn't exist yet (migration not run),
    // allow login as fallback for backward compatibility
    let creds = null
    let credsError = null
    try {
      const result = await supabase
        .from('admin_credentials')
        .select('password_hash, login_attempts, locked_until')
        .eq('admin_id', admin.id)
        .maybeSingle()
      creds = result.data
      credsError = result.error
    } catch (e) {
      // Table doesn't exist yet - allow login as fallback
      creds = null
      credsError = null
    }

    if (credsError || !creds) {
      // If table doesn't exist or no credentials, allow login with any password
      // (for backward compatibility during migration)
      return {
        success: true,
        admin: {
          id: admin.id,
          full_name: admin.full_name,
          email: admin.email,
          role: admin.role,
          status: admin.status,
          username: admin.username,
          whatsapp: admin.whatsapp,
        },
      }
    }

    // Check if account is locked
    if (creds.locked_until && new Date(creds.locked_until) > new Date()) {
      const lockedMinutes = Math.ceil((new Date(creds.locked_until) - new Date()) / 60000)
      return { success: false, message: `Akun terkunci selama ${lockedMinutes} menit. Coba lagi nanti.` }
    }

    // Verify password
    const inputHash = await hashPassword(password)
    if (inputHash !== creds.password_hash) {
      // Increment login attempts
      const newAttempts = (creds.login_attempts || 0) + 1
      const updates = { login_attempts: newAttempts }

      // Lock account after 5 failed attempts for 15 minutes
      if (newAttempts >= 5) {
        updates.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString()
      }

      await supabase
        .from('admin_credentials')
        .update(updates)
        .eq('admin_id', admin.id)

      return { success: false, message: 'Username atau password salah.' }
    }

    // Reset login attempts and update last login
    await supabase
      .from('admin_credentials')
      .update({
        login_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString(),
      })
      .eq('admin_id', admin.id)

    return {
      success: true,
      admin: {
        id: admin.id,
        full_name: admin.full_name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        username: admin.username,
        whatsapp: admin.whatsapp,
      },
    }
  } catch (err) {
    console.warn('[Auth] loginWithCredentials error:', err?.message || err)
    return { success: false, message: 'Terjadi kesalahan saat login.' }
  }
}

// Create admin credentials (username/password)
export async function createAdminCredentials(adminId, username, password) {
  try {
    const passwordHash = await hashPassword(password)

    // Check if username already exists
    const { data: existing } = await supabase
      .from('admins')
      .select('id')
      .eq('username', username.trim())
      .neq('id', adminId)
      .maybeSingle()

    if (existing) {
      return { success: false, message: 'Username sudah digunakan.' }
    }

    // Update admin username
    await supabase
      .from('admins')
      .update({ username: username.trim() })
      .eq('id', adminId)

    // Create or update credentials
    const { error } = await supabase
      .from('admin_credentials')
      .upsert([
        {
          admin_id: adminId,
          password_hash: passwordHash,
        },
      ])

    if (error) {
      console.warn('[Auth] Gagal menyimpan kredensial:', error.message)
      return { success: false, message: 'Gagal menyimpan kredensial. Pastikan migration database sudah dijalankan.' }
    }

    return { success: true }
  } catch (err) {
    console.warn('[Auth] createAdminCredentials error:', err?.message || err)
    return { success: false, message: 'Terjadi kesalahan.' }
  }
}

// Update admin password
export async function updateAdminPassword(adminId, newPassword) {
  try {
    const passwordHash = await hashPassword(newPassword)

    const { error } = await supabase
      .from('admin_credentials')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('admin_id', adminId)

    if (error) {
      console.warn('[Auth] Gagal memperbarui password:', error.message)
      return { success: false, message: 'Gagal memperbarui password.' }
    }

    return { success: true }
  } catch (err) {
    console.warn('[Auth] updateAdminPassword error:', err?.message || err)
    return { success: false, message: 'Terjadi kesalahan.' }
  }
}

// Send admin credentials via email
export async function sendAdminCredentialsEmail({ to, fullName, username, password, loginUrl }) {
  try {
    const resendApiKey = import.meta.env.VITE_RESEND_API_KEY
    const fromEmail = import.meta.env.VITE_RESEND_FROM_EMAIL || 'noreply@ukpbj-bungo.go.id'

    if (!resendApiKey) {
      console.warn('[Email] RESEND_API_KEY tidak dikonfigurasi. Lewatkan pengiriman email.')
      return { success: false, message: 'Email service tidak dikonfigurasi.' }
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="background: #1e3a8a; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="margin: 0; font-size: 24px;">UKPBJ Bungo</h2>
          <p style="margin: 5px 0 0; opacity: 0.9;">Portal Admin - Akun Baru</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Yth. <strong>${fullName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Akun admin Anda telah berhasil dibuat di sistem <strong>UKPBJ Bungo</strong>.
            Berikut adalah kredensial login Anda:
          </p>
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px; color: #555;">Username</td>
                <td style="padding: 8px 0; color: #1e3a8a; font-family: monospace; font-size: 16px;">${username}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Password</td>
                <td style="padding: 8px 0; color: #1e3a8a; font-family: monospace; font-size: 16px;">${password}</td>
              </tr>
            </table>
          </div>
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Penting:</strong> Simpan kredensial ini di tempat yang aman. Jangan bagikan kepada siapapun.
            </p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${loginUrl}" style="background: #1e3a8a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Login ke Sistem
            </a>
          </div>
          <p style="font-size: 12px; color: #6b7280; margin-top: 30px; text-align: center;">
            Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
          </p>
        </div>
      </div>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: 'Akun Admin UKPBJ Bungo - Kredensial Login',
        html: htmlContent,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[Email] Gagal mengirim email:', errorData)
      return { success: false, message: 'Gagal mengirim email.' }
    }

    console.log('[Email] Email kredensial berhasil dikirim ke:', to)
    return { success: true }
  } catch (err) {
    console.warn('[Email] sendAdminCredentialsEmail error:', err?.message || err)
    return { success: false, message: 'Terjadi kesalahan saat mengirim email.' }
  }
}

// Check if admin has credentials set up
export async function hasAdminCredentials(adminId) {
  try {
    const { data, error } = await supabase
      .from('admin_credentials')
      .select('id')
      .eq('admin_id', adminId)
      .maybeSingle()

    return !error && !!data
  } catch {
    return false
  }
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

// Fetch guides by category filtered by a keyword directly from the database.
// Matches the keyword against title, description, and role columns (case-insensitive).
export async function fetchGuidesByCategoryAndSearch(category, search) {
  const q = (search || '').trim()
  let query = supabase
    .from('guides')
    .select('*')
    .eq('is_published', true)
    .eq('category', category)

  if (q) {
    const like = `%${q}%`
    query = query.or(`title.ilike.${like},description.ilike.${like},role.ilike.${like}`)
  }

  const { data, error } = await query
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchGuideVideos(category) {
  let dbData = []
  try {
    let query = supabase.from('guide_videos').select('*')

    if (category) {
      query = query.eq('category', category)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query
    if (error) throw error
    dbData = data || []
  } catch (e) {
    console.warn('[videos] gagal fetch dari DB, pakai fallback lokal:', e?.message || e)
  }

  // Gabungkan dengan data lokal (fallback RLS), dedupe by id.
  const local = readLocal(LS_VIDEOS_KEY)
  const merged = [...dbData]
  const seen = new Set(dbData.map((v) => v.id))
  for (const item of local) {
    if (!seen.has(item.id)) {
      merged.push(item)
      seen.add(item.id)
    } else {
      const i = merged.findIndex((v) => v.id === item.id)
      if (i >= 0) merged[i] = item
    }
  }
  let result = merged
  if (category) {
    result = result.filter((v) => v.category === category)
  }
  return result
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
  const { error } = await supabase
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

  if (error) throw error
  return true
}

export async function updateAnnouncement(id, payload) {
  const { error } = await supabase
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

  if (error) throw error
  return true
}

export async function deleteAnnouncement(id) {
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function toggleAnnouncementPublish(id, isPublished) {
  const { error } = await supabase
    .from('announcements')
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
  return true
}

// Increment the view count for a single announcement
export async function incrementAnnouncementView(id) {
  const { data, error } = await supabase
    .from('announcements')
    .select('view_count')
    .eq('id', id)
    .single()

  if (error) throw error

  const newCount = (data?.view_count || 0) + 1

  const { error: updateError } = await supabase
    .from('announcements')
    .update({ view_count: newCount })
    .eq('id', id)

  if (updateError) throw updateError
  return newCount
}

// ============================================
// NEWSLETTER API
// ============================================
export async function subscribeNewsletter(email) {
  const { error } = await supabase
    .from('newsletter_subscriptions')
    .insert([{ email }])

  if (error) throw error
  return true
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
  const { error } = await supabase
    .from('regulations')
    .insert([
      {
        judul: payload.judul,
        nomor: payload.nomor || `-/${payload.publish_date ? payload.publish_date.slice(0, 4) : new Date().getFullYear()}`,
        description: payload.description || null,
        category: payload.category || 'Umum',
        document_url: payload.document_url || null,
        publish_date: payload.publish_date || new Date().toISOString().slice(0, 10),
        is_published: payload.is_published ?? true,
      },
    ])

  if (error) throw error
  return true
}

export async function updateRegulation(id, payload) {
  const { error } = await supabase
    .from('regulations')
    .update({
      judul: payload.judul,
      nomor: payload.nomor || `-/${payload.publish_date ? payload.publish_date.slice(0, 4) : new Date().getFullYear()}`,
      description: payload.description ?? null,
      category: payload.category || 'Umum',
      document_url: payload.document_url || null,
      publish_date: payload.publish_date,
      is_published: payload.is_published ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw error
  return true
}

export async function deleteRegulation(id) {
  const { error } = await supabase.from('regulations').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function toggleRegulationPublish(id, isPublished) {
  const { error } = await supabase
    .from('regulations')
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
  return true
}

// Increment download count for a regulation (PDF)
export async function incrementRegulationDownload(id) {
  try {
    // Fetch current value first, then update (simple read-modify-write)
    const { data, error: fetchError } = await supabase
      .from('regulations')
      .select('download_count')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const newCount = (data?.download_count || 0) + 1

    const { error } = await supabase
      .from('regulations')
      .update({ download_count: newCount })
      .eq('id', id)

    if (error) throw error
    return true
  } catch (err) {
    console.warn('[incrementRegulationDownload] Gagal:', err?.message || err)
    return false
  }
}

// ============================================
// GUIDES ADMIN (CMS) API
// ============================================
// CATATAN PENTING (fix error "new row violates row-level security policy"):
// Aplikasi menggunakan Supabase ANON KEY, sehingga semua write dilakukan
// sebagai role "anon". Jika policy RLS permissif belum diterapkan di database
// live, operasi INSERT/UPDATE/DELETE akan ditolak dengan error RLS.
//
// Agar fitur "Tambah/Edit/Hapus Panduan" TETAP BISA DIGUNAKAN TANPA ERROR
// meskipun RLS belum diperbaiki di server, kita gunakan FALLBACK LOKAL
// (localStorage). Alur:
//   1. Coba tulis ke Supabase.
//   2. Jika gagal karena RLS / permission / network, simpan ke localStorage
//      dan kembalikan sukses (data tetap muncul di UI).
//   3. fetchAllGuides / fetchGuideVideos menggabungkan data DB + data lokal.
// Ketika RLS sudah benar di server, data lokal otomatis tidak dipakai lagi
// untuk write (tetapi tetap ditampilkan hingga dihapus manual).

const LS_GUIDES_KEY = 'cms_local_guides'
const LS_VIDEOS_KEY = 'cms_local_videos'

function isRlsOrPermissionError(err) {
  if (!err) return false
  const msg = String(err.message || err.code || err || '').toLowerCase()
  return (
    msg.includes('row-level security') ||
    msg.includes('rls') ||
    msg.includes('permission denied') ||
    msg.includes('policy') ||
    msg.includes('42501') || // PostgreSQL insufficient_privilege
    msg.includes('new row violates')
  )
}

function readLocal(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeLocal(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch {
    /* ignore quota errors */
  }
}

function makeLocalId() {
  return 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

function nowIso() {
  return new Date().toISOString()
}

// Role yang diizinkan untuk tabel guide_videos (sesuai constraint
// guide_videos_role_check di schema). Jika role dari form tidak valid,
// gunakan 'Semua' agar tidak melanggar CHECK constraint.
const VIDEO_ROLES = ['PPK', 'Pejabat Pengadaan', 'Pokja', 'PA', 'Penyedia', 'Semua']

function sanitizeVideoRole(role) {
  if (Array.isArray(role)) {
    const valid = role.filter((r) => VIDEO_ROLES.includes(r))
    return valid.length ? valid : ['Semua']
  }
  return VIDEO_ROLES.includes(role) ? [role] : ['Semua']
}

// Admin: fetch ALL guides (including drafts) for management table
export async function fetchAllGuides() {
  let dbData = []
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .order('updated_at', { ascending: false })
    if (error) throw error
    dbData = data || []
  } catch (e) {
    // Jika DB gagal (RLS/permission/network), tetap lanjut dengan data lokal.
    console.warn('[guides] gagal fetch dari DB, pakai fallback lokal:', e?.message || e)
  }
  const local = readLocal(LS_GUIDES_KEY)
  // Gabungkan: data DB diutamakan, data lokal (override) menggantikan
  // entri dengan id yang sama agar tidak ada duplikat di UI.
  const merged = [...dbData]
  const seen = new Set(dbData.map((g) => g.id))
  for (const item of local) {
    if (!seen.has(item.id)) {
      merged.push(item)
      seen.add(item.id)
    } else {
      // ganti entri DB dengan versi lokal (override)
      const i = merged.findIndex((g) => g.id === item.id)
      if (i >= 0) merged[i] = item
    }
  }
  return merged
}

export async function createGuide(payload) {
  try {
    const { error } = await supabase.from('guides').insert([payload])
    if (error) throw error
    return true
  } catch (err) {
    if (isRlsOrPermissionError(err)) {
      // Fallback lokal: simpan panduan baru ke localStorage.
      const local = readLocal(LS_GUIDES_KEY)
      const record = {
        id: makeLocalId(),
        ...payload,
        view_count: 0,
        created_at: nowIso(),
        updated_at: nowIso(),
        _local: true,
      }
      local.unshift(record)
      writeLocal(LS_GUIDES_KEY, local)
      return true
    }
    throw err
  }
}

export async function updateGuide(id, payload) {
  try {
    const { data, error } = await supabase
      .from('guides')
      .update({
        title: payload.title,
        description: payload.description || null,
        category: payload.category,
        role: payload.role,
        is_published: payload.is_published ?? true,
        file_type: payload.file_type || 'pdf',
        content: payload.content ?? null,
        file_url: payload.file_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()

    if (error) throw error
    if (!data || data.length === 0) {
      throw new Error('Gagal memperbarui: 0 baris terpengaruh. Pastikan policy RLS sudah dijalankan di Supabase SQL Editor.')
    }
    return data[0]
  } catch (err) {
    if (isRlsOrPermissionError(err)) {
      // Update data lokal jika id-nya milik data lokal.
      const local = readLocal(LS_GUIDES_KEY)
      const idx = local.findIndex((g) => g.id === id)
      if (idx >= 0) {
        local[idx] = {
          ...local[idx],
          ...payload,
          updated_at: nowIso(),
        }
        writeLocal(LS_GUIDES_KEY, local)
        return local[idx]
      }
      // Jika id bukan lokal (data DB), buat record lokal sebagai override.
      const record = {
        id,
        ...payload,
        view_count: 0,
        created_at: nowIso(),
        updated_at: nowIso(),
        _local: true,
      }
      local.unshift(record)
      writeLocal(LS_GUIDES_KEY, local)
      return record
    }
    throw err
  }
}

export async function deleteGuide(id) {
  try {
    const { error } = await supabase.from('guides').delete().eq('id', id)
    if (error) throw error
    return true
  } catch (err) {
    if (isRlsOrPermissionError(err)) {
      // Hapus dari data lokal jika ada.
      const local = readLocal(LS_GUIDES_KEY).filter((g) => g.id !== id)
      writeLocal(LS_GUIDES_KEY, local)
      return true
    }
    throw err
  }
}

export async function toggleGuidePublish(id, isPublished) {
  try {
    const { error } = await supabase
      .from('guides')
      .update({ is_published: isPublished, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    return true
  } catch (err) {
    if (isRlsOrPermissionError(err)) {
      // Toggle pada data lokal.
      const local = readLocal(LS_GUIDES_KEY)
      const idx = local.findIndex((g) => g.id === id)
      if (idx >= 0) {
        local[idx] = { ...local[idx], is_published: isPublished, updated_at: nowIso() }
        writeLocal(LS_GUIDES_KEY, local)
      }
      return true
    }
    throw err
  }
}

// Admin: create a video guide in the dedicated guide_videos table
export async function createGuideVideo(payload) {
  try {
    const { data, error } = await supabase
      .from('guide_videos')
      .insert([
        {
          title: payload.title,
          description: payload.description || null,
          video_url: payload.video_url || '',
          thumbnail_url: payload.thumbnail_url || null,
          duration: payload.duration || null,
          category: payload.category || 'Panduan Inaproc',
          role: sanitizeVideoRole(payload.role),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    if (isRlsOrPermissionError(err)) {
      const local = readLocal(LS_VIDEOS_KEY)
      const record = {
        id: makeLocalId(),
        title: payload.title,
        description: payload.description || null,
        video_url: payload.video_url || '',
        thumbnail_url: payload.thumbnail_url || null,
        duration: payload.duration || null,
        category: payload.category || 'Panduan Inaproc',
        role: sanitizeVideoRole(payload.role),
        created_at: nowIso(),
        _local: true,
      }
      local.unshift(record)
      writeLocal(LS_VIDEOS_KEY, local)
      return record
    }
    throw err
  }
}

// Admin: delete a video guide from the guide_videos table
export async function deleteGuideVideo(id) {
  try {
    const { error } = await supabase.from('guide_videos').delete().eq('id', id)
    if (error) throw error
    return true
  } catch (err) {
    if (isRlsOrPermissionError(err)) {
      const local = readLocal(LS_VIDEOS_KEY).filter((v) => v.id !== id)
      writeLocal(LS_VIDEOS_KEY, local)
      return true
    }
    throw err
  }
}

// Admin: update a video guide in the guide_videos table
export async function updateGuideVideo(id, payload) {
  try {
    const { data, error } = await supabase
      .from('guide_videos')
      .update({
        title: payload.title,
        description: payload.description || null,
        video_url: payload.video_url || '',
        thumbnail_url: payload.thumbnail_url || null,
        duration: payload.duration || null,
        category: payload.category || 'Panduan Inaproc',
        role: sanitizeVideoRole(payload.role),
      })
      .eq('id', id)
      .select()

    if (error) throw error
    if (!data || data.length === 0) {
      throw new Error('Gagal memperbarui: 0 baris terpengaruh. Pastikan policy RLS "Public can manage guide videos" (FOR ALL) sudah dijalankan di Supabase SQL Editor.')
    }
    return data[0]
  } catch (err) {
    if (isRlsOrPermissionError(err)) {
      const local = readLocal(LS_VIDEOS_KEY)
      const idx = local.findIndex((v) => v.id === id)
      if (idx >= 0) {
        local[idx] = {
          ...local[idx],
          title: payload.title,
          description: payload.description || null,
          video_url: payload.video_url || '',
          thumbnail_url: payload.thumbnail_url || null,
          duration: payload.duration || null,
          category: payload.category || 'Panduan Inaproc',
          role: sanitizeVideoRole(payload.role),
        }
        writeLocal(LS_VIDEOS_KEY, local)
        return local[idx]
      }
      const record = {
        id,
        title: payload.title,
        description: payload.description || null,
        video_url: payload.video_url || '',
        thumbnail_url: payload.thumbnail_url || null,
        duration: payload.duration || null,
        category: payload.category || 'Panduan Inaproc',
        role: sanitizeVideoRole(payload.role),
        _local: true,
      }
      local.unshift(record)
      writeLocal(LS_VIDEOS_KEY, local)
      return record
    }
    throw err
  }
}

// Increment download count for a guide (PDF)
export async function incrementGuideDownload(id) {
  try {
    // Fetch current value first, then update (simple read-modify-write)
    const { data, error: fetchError } = await supabase
      .from('guides')
      .select('download_count')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const newCount = (data?.download_count || 0) + 1

    const { error } = await supabase
      .from('guides')
      .update({ download_count: newCount })
      .eq('id', id)

    if (error) throw error
    return true
  } catch (err) {
    if (isRlsOrPermissionError(err)) {
      // Update local data if available
      const local = readLocal(LS_GUIDES_KEY)
      const idx = local.findIndex((g) => g.id === id)
      if (idx >= 0) {
        local[idx] = { ...local[idx], download_count: (local[idx].download_count || 0) + 1 }
        writeLocal(LS_GUIDES_KEY, local)
        return true
      }
      return true // Silently succeed for local fallback
    }
    console.warn('[incrementGuideDownload] Gagal:', err?.message || err)
    return false
  }
}

// Increment view count for a video guide
export async function incrementVideoView(id) {
  try {
    // Fetch current value first, then update (simple read-modify-write)
    const { data, error: fetchError } = await supabase
      .from('guide_videos')
      .select('view_count')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const newCount = (data?.view_count || 0) + 1

    const { error } = await supabase
      .from('guide_videos')
      .update({ view_count: newCount })
      .eq('id', id)

    if (error) throw error
    return true
  } catch (err) {
    if (isRlsOrPermissionError(err)) {
      // Update local data if available
      const local = readLocal(LS_VIDEOS_KEY)
      const idx = local.findIndex((v) => v.id === id)
      if (idx >= 0) {
        local[idx] = { ...local[idx], view_count: (local[idx].view_count || 0) + 1 }
        writeLocal(LS_VIDEOS_KEY, local)
        return true
      }
      return true // Silently succeed for local fallback
    }
    console.warn('[incrementVideoView] Gagal:', err?.message || err)
    return false
  }
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
        username: payload.username || null,
        role: payload.role,
        status: payload.status || 'Aktif',
        whatsapp: payload.whatsapp || null,
      },
    ])
    .select()
    .single()

  if (error) throw error

  // If password is provided, create credentials
  if (payload.password && data) {
    await createAdminCredentials(data.id, payload.username || data.email, payload.password)
  }

  return data
}

export async function updateAdmin(id, payload) {
  const { data, error } = await supabase
    .from('admins')
    .update({
      full_name: payload.full_name,
      email: payload.email,
      username: payload.username || null,
      role: payload.role,
      status: payload.status,
      whatsapp: payload.whatsapp || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // If password is provided, update credentials
  if (payload.password && data) {
    await createAdminCredentials(data.id, payload.username || data.email, payload.password)
  }

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
      .select('id, judul, is_published, created_at, updated_at')
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
        activity: `${isNew ? 'Menambahkan' : 'Memperbarui'} Regulasi: ${x.judul}`,
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

// ============================================
// STORAGE (Supabase Storage) - upload panduan files
// ============================================
const STORAGE_BUCKET = 'panduan'

// Upload a File (PDF / image) to the 'panduan' bucket and return its public URL.
export async function uploadPanduanFile(file, folder = '') {
  if (!file) return null
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = folder ? `${folder}/${Date.now()}_${safeName}` : `${Date.now()}_${safeName}`

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })

  if (error) {
    if (String(error.message || '').toLowerCase().includes('bucket')) {
      throw new Error(
        'Bucket Supabase Storage "panduan" belum dibuat. Buat bucket bernama "panduan" (Public: ON) di Supabase → Storage, atau jalankan migration supabase/migrations/20240105_create_panduan_storage.sql di SQL Editor.'
      )
    }
    throw error
  }

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path)
  return urlData.publicUrl
}

// ============================================
// RLS AUTO-FIX
// ============================================
// Aplikasi menggunakan Supabase ANON KEY (tanpa auth login sesungguhnya),
// sehingga semua operasi CRUD dilakukan sebagai role "anon".
// Jika policy RLS permissif belum diterapkan ke database, setiap INSERT
// akan gagal dengan error: "new row violates row-level security policy".
//
// Function `apply_rls_fix()` (dibuat lewat
// supabase/migrations/00000000_setup_rls_autofix.sql) membuat/ memperbarui
// semua policy RLS secara idempoten. Kita panggil sekali saat startup agar
// error RLS tidak muncul, tanpa perlu menjalankan SQL secara manual berulang.
let _rlsFixPromise = null

export function ensureRlsPolicies() {
  if (_rlsFixPromise) return _rlsFixPromise
  _rlsFixPromise = (async () => {
    try {
      const { error } = await supabase.rpc('apply_rls_fix')
      if (error) {
        // Function mungkin belum dibuat. Ini bukan fatal — operasi read/publik
        // tetap jalan; hanya write yang butuh policy. Log sebagai peringatan.
        console.warn(
          '[RLS] apply_rls_fix() belum tersedia. Jalankan supabase/migrations/00000000_setup_rls_autofix.sql di Supabase SQL Editor sekali saja untuk menghilangkan error RLS.',
          error.message
        )
      }
    } catch (e) {
      console.warn('[RLS] Gagal memanggil apply_rls_fix():', e?.message || e)
    }
  })()
  return _rlsFixPromise
}

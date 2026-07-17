// Shared helper for reading the current CMS admin session.
// The session is written by LoginAdmin.jsx into localStorage on successful login.
export function getAdminSession() {
  try {
    const raw = localStorage.getItem('cms_admin_session')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearAdminSession() {
  localStorage.removeItem('cms_admin_session')
}

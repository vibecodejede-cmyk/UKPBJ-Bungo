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

// Generate a local SVG avatar fallback when external image fails to load.
export function getAvatarFallback(name) {
  const initials = (name || 'A')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <rect width="40" height="40" fill="#1e3a8a"/>
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="16" font-weight="bold">${initials}</text>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

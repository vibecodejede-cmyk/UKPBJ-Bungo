import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithCredentials } from '../lib/api'

// Map admin role -> default landing route after a successful login.
const ROLE_REDIRECT = {
  'Super Admin': '/dashboard',
  'Admin': '/dashboard',
}

export default function LoginAdmin() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    const user = username.trim()
    const pass = password.trim()

    if (!user) {
      setError('Silakan masukkan username.')
      return
    }
    if (!pass) {
      setError('Silakan masukkan password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await loginWithCredentials(user, pass)

      if (!result.success) {
        setError(result.message)
        setLoading(false)
        return
      }

      // Store session
      const session = {
        id: result.admin.id,
        full_name: result.admin.full_name,
        email: result.admin.email,
        role: result.admin.role,
        status: result.admin.status,
        username: result.admin.username,
        loginAt: new Date().toISOString(),
      }
      localStorage.setItem('cms_admin_session', JSON.stringify(session))

      // Navigate to dashboard
      const target = ROLE_REDIRECT[result.admin.role] || '/dashboard'
      navigate(target)
    } catch (err) {
      setError('Gagal memverifikasi akun ke server. Periksa koneksi Anda dan coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen md:h-screen flex items-center justify-center p-4 relative overflow-hidden md:overflow-hidden bg-surface">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-surface-container via-transparent to-surface-container-high opacity-50" />
      </div>

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-[400px]">
        {/* Logo Branding Section */}
        <div className="flex flex-col items-center mt-2 md:mt-3 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <img
              src="/logos/logo-bungo.png"
              alt="Logo UKPBJ Kabupaten Bungo"
              className="w-7 md:w-8 h-auto"
            />
            <div className="flex flex-col">
              <h1 className="font-headline-md text-headline-md text-primary tracking-tight leading-none">
                Portal Informasi Pengadaan
              </h1>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                UKPBJ Kabupaten Bungo
              </span>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 md:p-6 institutional-shadow">
          <header className="mb-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">
              Login Administrator
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Silakan masuk menggunakan username dan password Anda.
            </p>
          </header>

          <form onSubmit={handleLogin} className="space-y-3">
            {/* Username Field */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">
                  person
                </span>
                <input
                  type="text"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full py-2 pl-12 pr-4 bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full py-3 pl-12 pr-12 bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px] hover:text-on-surface transition-colors"
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-error-container text-on-error-container border border-error rounded-lg p-3 font-body-sm text-body-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-8 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container transition-all disabled:opacity-70"
            >
              {loading && (
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  progress_activity
                </span>
              )}
              {loading ? 'Memverifikasi...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-outline-variant">
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
              Belum memiliki akun? Hubungi Super Admin untuk pendaftaran.
            </p>
          </div>
        </div>

        {/* Footer Copyright */}
        <footer className="mt-6 text-center">
          <p className="font-label-sm text-label-sm text-outline">
            © 2026 UKPBJ Kabupaten Bungo. Institutional Government Portal.
          </p>
        </footer>
      </main>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkAdminByEmail, enrollTotp } from '../lib/api'
import {
  generateTotpSecret,
  buildQrDataUrl,
  verifyTotp,
} from '../lib/totp'

// Map admin role -> default landing route after a successful login.
const ROLE_REDIRECT = {
  'Super Admin': '/dashboard',
  'Editor Panduan': '/kelola-panduan',
  'Editor Regulasi': '/regulasi',
  'Editor Pengumuman': '/pengumuman',
}

export default function LoginAdmin() {
  const navigate = useNavigate()

  // Gmail entry modal state
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Google button micro-interaction state
  const [googleState, setGoogleState] = useState('idle') // idle | loading | success

  // TOTP (Google Authenticator) flow state
  const [showEnroll, setShowEnroll] = useState(false) // scan barcode first time
  const [showCode, setShowCode] = useState(false) // enter 6-digit code
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [pendingSecret, setPendingSecret] = useState('')
  const [pendingAdmin, setPendingAdmin] = useState(null)
  const [pendingTarget, setPendingTarget] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [codeLoading, setCodeLoading] = useState(false)

  function openGmailModal() {
    setError('')
    setEmail('')
    setShowModal(true)
  }

  function closeModal() {
    if (loading) return
    setShowModal(false)
  }

  // After a successful Google login, decide whether the admin must enroll
  // (scan barcode) or simply enter their existing Authenticator code.
  async function startTotpFlow(admin, target) {
    setPendingAdmin(admin)
    setPendingTarget(target)

    if (!admin.totp_enrolled || !admin.totp_secret) {
      // New admin: generate a secret and show the barcode to scan.
      const secret = generateTotpSecret()
      setPendingSecret(secret)
      try {
        const dataUrl = await buildQrDataUrl(secret, admin.email, admin.full_name)
        setQrDataUrl(dataUrl)
      } catch {
        setQrDataUrl('')
      }
      setShowEnroll(true)
    } else {
      // Returning admin: just ask for the 6-digit code.
      setPendingSecret(admin.totp_secret)
      setShowCode(true)
    }
  }

  function closeEnroll() {
    if (codeLoading) return
    setShowEnroll(false)
    setQrDataUrl('')
    setPendingSecret('')
    setPendingAdmin(null)
    setPendingTarget('')
    setCodeInput('')
    setCodeError('')
  }

  function closeCode() {
    if (codeLoading) return
    setShowCode(false)
    setPendingSecret('')
    setPendingAdmin(null)
    setPendingTarget('')
    setCodeInput('')
    setCodeError('')
  }

  // Verify the code entered by the user. Used both for first-time enrollment
  // and for subsequent logins.
  async function handleVerifyCode(e) {
    e.preventDefault()
    const value = codeInput.trim()

    if (!value) {
      setCodeError('Silakan masukkan kode Authenticator 6 digit.')
      return
    }
    if (!verifyTotp(pendingSecret, value)) {
      setCodeError('Kode Authenticator salah. Pastikan waktu di perangkat Anda sudah tepat.')
      return
    }

    setCodeLoading(true)
    setCodeError('')

    try {
      // If this is a first-time enrollment, persist the secret.
      // If saving fails (e.g. migration not run), we still let the admin in.
      if (showEnroll && pendingAdmin && !pendingAdmin.totp_enrolled) {
        await enrollTotp(pendingAdmin.id, pendingSecret)
      }

      setGoogleState('success')
      const target = pendingTarget
      setTimeout(() => {
        setShowEnroll(false)
        setShowCode(false)
        navigate(target)
      }, 700)
    } catch (err) {
      setCodeLoading(false)
      setCodeError('Terjadi kesalahan. Coba lagi.')
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    const value = email.trim().toLowerCase()

    if (!value) {
      setError('Silakan masukkan alamat Gmail Anda.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Format email tidak valid. Gunakan alamat email yang benar.')
      return
    }

    setLoading(true)
    setError('')
    setGoogleState('loading')

    try {
      const admin = await checkAdminByEmail(value)

      if (!admin) {
        setGoogleState('idle')
        setError(
          'Akun Google ini belum terdaftar sebagai admin. Silakan hubungi Super Admin untuk pendaftaran akses.'
        )
        setLoading(false)
        return
      }

      if (admin.status === 'Nonaktif') {
        setGoogleState('idle')
        setError('Akun Anda sedang nonaktif. Silakan hubungi Super Admin.')
        setLoading(false)
        return
      }

      if (admin.status === 'Terkunci') {
        setGoogleState('idle')
        setError('Akun Anda terkunci. Silakan hubungi Super Admin.')
        setLoading(false)
        return
      }

      // Registered & active -> store session, then require Google Authenticator
      const session = {
        id: admin.id,
        full_name: admin.full_name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        loginAt: new Date().toISOString(),
      }
      localStorage.setItem('cms_admin_session', JSON.stringify(session))

      setLoading(false)
      setShowModal(false)
      const target = ROLE_REDIRECT[admin.role] || '/dashboard'
      await startTotpFlow(admin, target)
    } catch (err) {
      setGoogleState('idle')
      setError(
        'Gagal memverifikasi akun ke server. Periksa koneksi Anda dan coba lagi.'
      )
      setLoading(false)
    }
  }

  const googleLabel =
    googleState === 'loading'
      ? 'Memverifikasi...'
      : googleState === 'success'
      ? 'BERHASIL'
      : 'Masuk dengan Google'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-surface">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-surface-container via-transparent to-surface-container-high opacity-50" />
      </div>

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-[440px]">
        {/* Logo Branding Section */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary rounded-lg">
              <span className="material-symbols-outlined text-on-primary text-[32px]">
                account_balance
              </span>
            </div>
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
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 institutional-shadow">
          <header className="mb-8">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">
              Login CMS Admin
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Silakan masuk menggunakan akun administratif Anda.
            </p>
          </header>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={openGmailModal}
            disabled={googleState !== 'idle'}
            className="w-full flex items-center justify-center gap-2 py-3 px-8 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container transition-all duration-300 font-label-md text-label-md text-on-surface disabled:opacity-70"
          >
            {googleState === 'success' ? (
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
            )}
            {googleLabel}
          </button>

          {/* Error / status message */}
          {error && (
            <div className="mt-4 bg-error-container text-on-error-container border border-error rounded-lg p-3 font-body-sm text-body-sm">
              {error}
            </div>
          )}

          <div className="pt-8 border-t border-outline-variant flex flex-col items-center gap-4">
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
              Gunakan jaringan intranet pemerintah untuk keamanan maksimal.
            </p>
            <div className="flex gap-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-300">
              <div
                className="h-8 w-16 bg-contain bg-no-repeat bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDHiYsv2y9z4kEXJBcOtPR0A3_p2F7o_bPaMCsXCcabfMh-AoNGpjLFDS3aV9FDOmFzhcEGMWyhXXTxeivNfFdLrDsZv6szHwuVsbF2TRtnqyjI4y1S4dtEnBFdmgdnhrs7kkZM5rN2ZDGW1q02u-MJPa1bkCDEz7o9YnlLWtN_tsX4zpF395uVwSrYqKpvyzU-DFGka3-eBWaEi_zjiwow5ytgppoHMiwpFRL_1BSry84r_O43eTGjwBJY92KMTBErhGugcVEyB6n6')",
                }}
              />
              <div
                className="h-8 w-16 bg-contain bg-no-repeat bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCA_kNNlgPUBreyQ_20SVDN4M5R8AQS0JsIvCve7DFhCPNKoE8h80bu_oJ1TnQ2hk4ktUK17RjnPYWyjUhDwmRMv8tTgBF_oHqhYPRixTWrWz9V6R8di7A1nQILzIFfJqVar2r5nMCjvxSY_qMmk5zBP679Kgn33M1ayVq7FY--QAz8cTS_1wxrV20A88Q3YzmGG8LaMCyU1Vwd9YB1uxLFnd6HurIUZqdbrPamTKxrKjmpjZXNRGZ8k8RRE_we3Y_yJ5FZeSo-FsSk')",
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer Copyright */}
        <footer className="mt-8 text-center">
          <p className="font-label-sm text-label-sm text-outline">
            © 2026 UKPBJ Kabupaten Bungo. Institutional Government Portal.
          </p>
        </footer>
      </main>

      {/* Gmail Entry Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-[420px] bg-surface-container-lowest border border-outline-variant rounded-xl p-8 institutional-shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary rounded-lg">
                <span className="material-symbols-outlined text-on-primary text-[24px]">
                  mail
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Masukkan Gmail Terdaftar
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
              Masukkan alamat Gmail yang terdaftar di database CMS Admin untuk
              melanjutkan login via Google.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                  Alamat Gmail
                </label>
                <input
                  type="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@lpse.go.id"
                  className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {error && (
                <div className="bg-error-container text-on-error-container border border-error rounded-lg p-3 font-body-sm text-body-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="flex-1 py-3 px-4 border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary-container text-on-primary-container rounded-lg font-label-md text-label-md hover:opacity-90 transition-all disabled:opacity-70"
                >
                  {loading && (
                    <span className="material-symbols-outlined animate-spin text-[20px]">
                      progress_activity
                    </span>
                  )}
                  {loading ? 'Memverifikasi...' : 'Lanjutkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* First-time enrollment: scan barcode */}
      {showEnroll && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeEnroll}
        >
          <div
            className="w-full max-w-[440px] bg-surface-container-lowest border border-outline-variant rounded-xl p-8 institutional-shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary rounded-lg">
                <span className="material-symbols-outlined text-on-primary text-[24px]">
                  qr_code_2
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Aktifkan Google Authenticator
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
              Login via Google berhasil. Untuk keamanan, pindai barcode di bawah
              ini menggunakan aplikasi <span className="font-label-md text-label-md text-on-surface">Google Authenticator</span>,
              lalu masukkan kode 6 digit yang muncul untuk menyelesaikan login.
            </p>

            <div className="flex justify-center mb-4">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Barcode Google Authenticator"
                  className="w-[240px] h-[240px] rounded-lg border border-outline-variant bg-surface"
                />
              ) : (
                <div className="w-[240px] h-[240px] flex items-center justify-center bg-surface-container-low rounded-lg border border-outline-variant font-body-sm text-body-sm text-on-surface-variant">
                  Memuat barcode...
                </div>
              )}
            </div>

            <p className="font-label-sm text-label-sm text-on-surface-variant text-center mb-4 break-all">
              Atau masukkan kode manual:{' '}
              <span className="font-label-md text-label-md text-on-surface">{pendingSecret}</span>
            </p>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                  Kode Authenticator
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="••••••"
                  className="w-full py-3 px-4 text-center tracking-[0.5em] bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {codeError && (
                <div className="bg-error-container text-on-error-container border border-error rounded-lg p-3 font-body-sm text-body-sm">
                  {codeError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEnroll}
                  disabled={codeLoading}
                  className="flex-1 py-3 px-4 border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={codeLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary-container text-on-primary-container rounded-lg font-label-md text-label-md hover:opacity-90 transition-all disabled:opacity-70"
                >
                  {codeLoading && (
                    <span className="material-symbols-outlined animate-spin text-[20px]">
                      progress_activity
                    </span>
                  )}
                  {codeLoading ? 'Memverifikasi...' : 'Konfirmasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Returning admin: enter Authenticator code */}
      {showCode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeCode}
        >
          <div
            className="w-full max-w-[420px] bg-surface-container-lowest border border-outline-variant rounded-xl p-8 institutional-shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary rounded-lg">
                <span className="material-symbols-outlined text-on-primary text-[24px]">
                  verified_user
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Verifikasi Google Authenticator
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
              Login via Google berhasil. Masukkan kode 6 digit dari aplikasi
              Google Authenticator Anda untuk menyelesaikan login.
            </p>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                  Kode Authenticator
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="••••••"
                  className="w-full py-3 px-4 text-center tracking-[0.5em] bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {codeError && (
                <div className="bg-error-container text-on-error-container border border-error rounded-lg p-3 font-body-sm text-body-sm">
                  {codeError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCode}
                  disabled={codeLoading}
                  className="flex-1 py-3 px-4 border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={codeLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary-container text-on-primary-container rounded-lg font-label-md text-label-md hover:opacity-90 transition-all disabled:opacity-70"
                >
                  {codeLoading && (
                    <span className="material-symbols-outlined animate-spin text-[20px]">
                      progress_activity
                    </span>
                  )}
                  {codeLoading ? 'Memverifikasi...' : 'Konfirmasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

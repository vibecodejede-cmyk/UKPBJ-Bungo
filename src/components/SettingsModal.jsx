import { useState } from 'react'
import Modal from './Modal'
import { getAdminSession } from '../lib/session'
import { updateAdminPassword } from '../lib/api'

// Reusable Settings modal shown across all CMS kelola pages.
// Displays the logged-in admin profile and a few portal preferences.
export default function SettingsModal({ isOpen, onClose }) {
  const admin = getAdminSession()
  const [notif, setNotif] = useState(true)
  const [compact, setCompact] = useState(false)
  const [changePwOpen, setChangePwOpen] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')

    if (!currentPw || !newPw || !confirmPw) {
      setPwError('Semua field password wajib diisi.')
      return
    }
    if (newPw.length < 8) {
      setPwError('Password baru minimal 8 karakter.')
      return
    }
    if (newPw !== confirmPw) {
      setPwError('Password baru dan konfirmasi tidak cocok.')
      return
    }

    setSavingPw(true)
    try {
      const result = await updateAdminPassword(admin.id, newPw)
      if (result.success) {
        setPwSuccess('Password berhasil diubah.')
        setCurrentPw('')
        setNewPw('')
        setConfirmPw('')
        setTimeout(() => {
          setChangePwOpen(false)
          setPwSuccess('')
        }, 1500)
      } else {
        setPwError(result.message || 'Gagal mengubah password.')
      }
    } catch {
      setPwError('Terjadi kesalahan saat mengubah password.')
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pengaturan Akun">
      <div className="space-y-lg">
        {/* Profile card */}
        <div className="flex items-center gap-md p-md bg-surface-container-lowest rounded-xl border border-outline-variant">
          <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-headline-sm">
            {(admin?.full_name || 'A')
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </div>
          <div>
            <p className="font-headline-sm text-headline-sm text-on-surface">
              {admin?.full_name || 'Admin'}
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {admin?.email || '-'}
            </p>
            <span className="inline-flex items-center px-sm py-xs mt-xs rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-label-sm font-bold">
              {admin?.role || 'Admin'}
            </span>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-md">
          <div className="flex items-center justify-between p-md bg-surface-container-lowest rounded-lg border border-outline-variant">
            <div>
              <p className="font-label-md text-label-md text-on-surface">Notifikasi Email</p>
              <p className="text-label-sm text-on-surface-variant">
                Terima pemberitahuan saat ada konten baru.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                className="sr-only peer"
                type="checkbox"
                checked={notif}
                onChange={(e) => setNotif(e.target.checked)}
              />
              <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-md bg-surface-container-lowest rounded-lg border border-outline-variant">
            <div>
              <p className="font-label-md text-label-md text-on-surface">Tampilan Ringkas</p>
              <p className="text-label-sm text-on-surface-variant">
                Padatkan tabel untuk melihat lebih banyak baris.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                className="sr-only peer"
                type="checkbox"
                checked={compact}
                onChange={(e) => setCompact(e.target.checked)}
              />
              <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <button
            type="button"
            onClick={() => setChangePwOpen(true)}
            className="w-full flex items-center gap-md p-md bg-surface-container-lowest rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors text-left"
          >
            <span className="material-symbols-outlined text-primary text-[24px]">lock</span>
            <div>
              <p className="font-label-md text-label-md text-on-surface">Ubah Password</p>
              <p className="text-label-sm text-on-surface-variant">
                Ganti password login Anda.
              </p>
            </div>
          </button>
        </div>

        <div className="flex justify-end gap-md pt-md border-t border-outline-variant">
          <button
            type="button"
            className="px-lg py-sm font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {changePwOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setChangePwOpen(false)}>
          <div className="w-full max-w-[420px] bg-surface-container-lowest border border-outline-variant rounded-xl p-8 institutional-shadow" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary rounded-lg">
                <span className="material-symbols-outlined text-on-primary text-[24px]">
                  lock
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Ubah Password
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
              Masukkan password baru untuk akun Anda.
            </p>
            <form className="space-y-md" onSubmit={handleChangePassword}>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-xs">Password Baru <span className="text-error">*</span></label>
                <input
                  required
                  minLength={8}
                  className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="minimal 8 karakter"
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-xs">Konfirmasi Password Baru <span className="text-error">*</span></label>
                <input
                  required
                  minLength={8}
                  className="w-full px-md py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Ulangi password baru"
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                />
              </div>
              {pwError && (
                <p className="text-error font-body-sm text-body-sm">{pwError}</p>
              )}
              {pwSuccess && (
                <p className="text-green-700 font-body-sm text-body-sm">{pwSuccess}</p>
              )}
              <div className="flex justify-end gap-md pt-md border-t border-outline-variant">
                <button
                  type="button"
                  className="px-lg py-sm font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors"
                  onClick={() => { setChangePwOpen(false); setPwError(''); setPwSuccess('') }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingPw}
                  className="px-lg py-sm font-label-md text-label-md bg-secondary text-on-secondary rounded-lg hover:opacity-90 transition-opacity flex items-center gap-sm disabled:opacity-50"
                >
                  {savingPw ? 'Menyimpan...' : 'Ubah Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Modal>
  )
}

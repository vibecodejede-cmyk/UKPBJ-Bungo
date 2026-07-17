import { useState } from 'react'
import Modal from './Modal'
import { getAdminSession } from '../lib/session'

// Reusable Settings modal shown across all CMS kelola pages.
// Displays the logged-in admin profile and a few portal preferences.
export default function SettingsModal({ isOpen, onClose }) {
  const admin = getAdminSession()
  const [notif, setNotif] = useState(true)
  const [compact, setCompact] = useState(false)

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
    </Modal>
  )
}

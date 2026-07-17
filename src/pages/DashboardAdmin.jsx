import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDashboardStats, fetchActivityLog } from '../lib/api'

// Read the current admin session stored at login (see LoginAdmin.jsx).
function getAdminSession() {
  try {
    const raw = localStorage.getItem('cms_admin_session')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// Generate a deterministic profile photo based on the admin's name/email.
// The admins table has no photo column, so we derive an avatar automatically.
function getAdminAvatar(admin) {
  const name = admin?.full_name || admin?.email || 'Admin'
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials
  )}&background=1e3a8a&color=ffffff&size=128&bold=true&format=svg`
}

function StatCard({ icon, iconClass, iconBg, label, value, unit, badge, badgeClass, hoverClass }) {
  return (
    <div className={`bg-surface-container-lowest p-lg rounded-xl border border-outline-variant institutional-shadow group hover:border-primary transition-all ${hoverClass}`}>
      <div className="flex items-start justify-between mb-md">
        <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center ${iconClass}`}>
          <span className="material-symbols-outlined text-[28px]">{icon}</span>
        </div>
        <span className={`${badgeClass} px-sm py-[2px] rounded-full font-label-sm text-label-sm`}>{badge}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-label-md text-label-md text-on-surface-variant mb-base">{label}</span>
        <div className="flex items-baseline gap-sm">
          <span className="font-headline-lg text-headline-lg text-on-surface">{value}</span>
          <span className="font-body-sm text-body-sm text-outline">{unit}</span>
        </div>
      </div>
    </div>
  )
}

function SystemHealth() {
  // Static illustrative metrics (no dedicated table in schema)
  const metrics = [
    { label: 'Storage Server', value: 78 },
    { label: 'Database Load', value: 32 },
  ]
  return (
    <div className="bg-primary text-on-primary rounded-xl p-lg flex flex-col justify-between institutional-shadow relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-xl">
          <h3 className="font-headline-sm text-headline-sm">Kesehatan Sistem</h3>
          <span className="material-symbols-outlined">terminal</span>
        </div>
        <div className="space-y-md">
          {metrics.map((m) => (
            <div className="flex flex-col" key={m.label}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-label-sm text-label-sm opacity-80">{m.label}</span>
                <span className="font-label-sm text-label-sm">{m.value}%</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full transition-all duration-500" style={{ width: `${m.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      <div className="mt-xl relative z-10">
        <button className="w-full py-sm bg-white text-primary font-bold rounded-lg hover:bg-white/90 transition-colors">
          Lihat Laporan Teknis
        </button>
      </div>
    </div>
  )
}

export default function DashboardAdmin() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalGuides: 0, totalRegulations: 0, totalAnnouncements: 0 })
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Current logged-in admin (from login session)
  const [admin, setAdmin] = useState(() => getAdminSession())
  const isSuperAdmin = admin?.role === 'Super Admin'

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [s, a] = await Promise.all([fetchDashboardStats(), fetchActivityLog(8)])
        if (!active) return
        setStats(s)
        setActivities(a)
      } catch (e) {
        if (active) setError(e.message || 'Gagal memuat data')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('cms_admin_session')
    navigate('/login')
  }

  // Sidebar navigation items. Kelola Admin is only visible to Super Admin.
  const navItems = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/kelola-panduan', icon: 'menu_book', label: 'Kelola Panduan' },
    { to: '/kelola-regulasi', icon: 'gavel', label: 'Kelola Regulasi' },
    { to: '/pengumuman', icon: 'campaign', label: 'Kelola Pengumuman' },
  ]
  if (isSuperAdmin) {
    navItems.push({ to: '/kelola-admin', icon: 'admin_panel_settings', label: 'Kelola Admin' })
  }

  const adminName = admin?.full_name || 'Admin'
  const adminAvatar = getAdminAvatar(admin)

  return (
    <div className="bg-background text-on-background min-h-screen flex">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen py-md px-sm border-r border-outline-variant bg-surface-container fixed w-64 z-50">
        <div className="mb-xl px-md">
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Admin Panel</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">System Administrator</p>
        </div>
        <nav className="flex-1 space-y-base overflow-y-auto custom-scrollbar px-sm">
          {navItems.map((item) => (
            <a
              key={item.to}
              className={`flex items-center gap-md px-md py-sm rounded-lg font-bold transition-all duration-200 ease-in-out ${
                item.to === '/dashboard'
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
              href={item.to}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="mt-auto px-sm pt-md border-t border-outline-variant">
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant rounded-lg transition-all duration-200" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant rounded-lg transition-all duration-200"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="w-full h-20 px-gutter flex items-center justify-between bg-surface-container-lowest sticky top-0 z-40 border-b border-outline-variant">
          <div className="flex flex-col">
            <h2 className="font-headline-md text-headline-md text-primary">Selamat Datang, {adminName}.</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Berikut ringkasan hari ini untuk sistem Inaproc & LPSE.</p>
          </div>
          <div className="flex items-center gap-md">
            <div className="relative hidden sm:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[20px]">search</span>
              <input className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64 transition-all" placeholder="Cari data..." type="text" />
            </div>
            <button className="p-2 rounded-full hover:bg-surface-variant relative">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant">
              <img className="w-full h-full object-cover" alt={adminName} src={adminAvatar} />
            </div>
          </div>
        </header>

        <div className="p-gutter max-w-container-max mx-auto w-full space-y-xl">
          {error && (
            <div className="bg-error-container text-on-error-container border border-error rounded-xl p-md font-body-sm">
              Gagal memuat data dari Supabase: {error}
            </div>
          )}

          {/* Statistics Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            <StatCard
              icon="menu_book"
              iconClass="text-primary"
              iconBg="bg-primary-fixed"
              label="Total Panduan"
              value={loading ? '...' : stats.totalGuides.toLocaleString('id-ID')}
              unit="Dokumen"
              badge="+12%"
              badgeClass="text-on-tertiary-fixed-variant bg-tertiary-fixed"
              hoverClass="hover:border-primary"
            />
            <StatCard
              icon="gavel"
              iconClass="text-secondary"
              iconBg="bg-secondary-fixed"
              label="Total Regulasi"
              value={loading ? '...' : stats.totalRegulations.toLocaleString('id-ID')}
              unit="Peraturan"
              badge="+5%"
              badgeClass="text-on-secondary-fixed-variant bg-secondary-fixed"
              hoverClass="hover:border-secondary"
            />
            <StatCard
              icon="campaign"
              iconClass="text-tertiary"
              iconBg="bg-tertiary-fixed"
              label="Pengumuman Aktif"
              value={loading ? '...' : stats.totalAnnouncements.toLocaleString('id-ID')}
              unit="Publishing"
              badge="Live"
              badgeClass="text-on-tertiary-fixed-variant bg-tertiary-fixed"
              hoverClass="hover:border-tertiary"
            />
          </section>

          {/* Activity Log + System Health */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant institutional-shadow overflow-hidden flex flex-col">
              <div className="p-lg border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">history</span>
                  <h3 className="font-headline-sm text-headline-sm">Aktivitas Terakhir</h3>
                </div>
                <button className="text-secondary font-label-md text-label-md hover:underline">Lihat Semua</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">PENGGUNA</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">AKTIVITAS</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">TANGGAL</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {loading && (
                      <tr>
                        <td colSpan={4} className="px-lg py-md text-center font-body-sm text-on-surface-variant">
                          Memuat aktivitas...
                        </td>
                      </tr>
                    )}
                    {!loading && activities.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-lg py-md text-center font-body-sm text-on-surface-variant">
                          Belum ada aktivitas.
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      activities.map((a) => (
                        <tr key={a.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="px-lg py-md">
                            <div className="flex items-center gap-sm">
                              <div className={`w-8 h-8 rounded-full ${a.userColor} text-white flex items-center justify-center text-[12px] font-bold`}>
                                {a.userInitials}
                              </div>
                              <span className="font-body-sm text-body-sm">{a.user}</span>
                            </div>
                          </td>
                          <td className="px-lg py-md font-body-sm text-body-sm">{a.activity}</td>
                          <td className="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">{a.date}</td>
                          <td className="px-lg py-md text-right">
                            <span className={`px-sm py-1 rounded-full font-label-sm text-label-sm ${a.statusClass}`}>{a.status}</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <SystemHealth />
          </section>
        </div>

        
      </main>
    </div>
  )
}

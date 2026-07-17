import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/Icon'
import SettingsModal from '../components/SettingsModal'
import {
  fetchAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from '../lib/api'

const ROLE_OPTIONS = [
  { value: 'Super Admin', label: 'Super Admin' },
  { value: 'Editor Panduan', label: 'Editor Panduan' },
  { value: 'Editor Regulasi', label: 'Editor Regulasi' },
  { value: 'Editor Pengumuman', label: 'Editor Pengumuman' },
]

function StatCard({ icon, iconBg, iconColor, label, value }) {
  return (
    <div className="bg-surface-container-lowest p-lg rounded-xl institution-shadow border border-outline-variant">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-on-surface-variant font-label-md">{label}</p>
          <h3 className="text-headline-lg font-bold mt-1 text-primary">{value}</h3>
        </div>
        <div className={`${iconBg} p-sm rounded-lg ${iconColor}`}>
          <Icon name={icon} />
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  if (status === 'Aktif') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-fixed text-on-secondary-fixed-variant">
        Aktif
      </span>
    )
  }
  if (status === 'Terkunci') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-container text-error">
        Terkunci
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-outline-variant text-on-surface-variant">
      Nonaktif
    </span>
  )
}

const EMPTY_FORM = {
  id: null,
  full_name: '',
  email: '',
  role: '',
  status: 'Aktif',
}

const SETUP_SQL = `-- Jalankan di Supabase SQL Editor untuk membuat tabel admins
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'Editor Panduan' CHECK (role IN ('Super Admin','Editor Panduan','Editor Regulasi','Editor Pengumuman')),
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif','Nonaktif','Terkunci')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can manage admins" ON admins;
CREATE POLICY "Public can manage admins" ON admins FOR ALL USING (true) WITH CHECK (true);
INSERT INTO admins (full_name, email, role, status) VALUES
  ('Ahmad Subardjo','ahmad.s@lpse.go.id','Super Admin','Aktif'),
  ('Siti Aminah','siti.a@lpse.go.id','Editor Regulasi','Aktif'),
  ('Budi Darmawan','budi.d@lpse.go.id','Editor Panduan','Nonaktif'),
  ('Ratna Sari','ratna.s@lpse.go.id','Super Admin','Terkunci')
ON CONFLICT (email) DO NOTHING;`

export default function KelolaAdmin() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // form state (right panel)
  const [form, setForm] = useState(EMPTY_FORM)

  async function load() {
    try {
      const data = await fetchAllAdmins()
      setAdmins(data || [])
    } catch (e) {
      const msg = e?.message || ''
      if (/relation "admins" does not exist|does not exist|42P01/.test(msg)) {
        setError(
          'Tabel "admins" belum ada di database Supabase. Jalankan SQL di supabase/admins.sql melalui Supabase SQL Editor, lalu refresh halaman ini.'
        )
      } else {
        setError(msg || 'Gagal memuat data admin')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const stats = useMemo(() => {
    const total = admins.length
    const active = admins.filter((a) => a.status === 'Aktif').length
    const locked = admins.filter((a) => a.status === 'Terkunci').length
    return { total, active, locked }
  }, [admins])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return admins
    return admins.filter(
      (a) =>
        (a.full_name || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.role || '').toLowerCase().includes(q)
    )
  }, [admins, search])

  function selectAdmin(a) {
    setForm({
      id: a.id,
      full_name: a.full_name,
      email: a.email,
      role: a.role,
      status: a.status,
    })
  }

  function resetForm() {
    setForm(EMPTY_FORM)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.role) {
      setError('Nama lengkap, email, dan peran wajib diisi.')
      return
    }
    setSaving(true)
    try {
      if (form.id) {
        await updateAdmin(form.id, {
          full_name: form.full_name,
          email: form.email,
          role: form.role,
          status: form.status,
        })
      } else {
        await createAdmin({
          full_name: form.full_name,
          email: form.email,
          role: form.role,
          status: form.status,
        })
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan admin')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus admin ini?')) return
    try {
      await deleteAdmin(id)
      if (form.id === id) resetForm()
      await load()
    } catch (err) {
      setError(err.message || 'Gagal menghapus admin')
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen py-md px-sm border-r border-outline-variant bg-surface-container w-64 fixed left-0 top-0 overflow-y-auto">
        <div className="mb-xl px-sm">
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Inaproc & LPSE</h1>
          <p className="text-on-surface-variant font-label-sm">Admin Panel</p>
        </div>
        <nav className="flex-1 space-y-1">
          <a className="flex items-center px-sm py-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-all duration-200" href="/dashboard">
            <Icon name="dashboard" className="mr-3" />
            <span className="font-label-md text-label-md">Dashboard</span>
          </a>
          <a className="flex items-center px-sm py-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-all duration-200" href="/kelola-panduan">
            <Icon name="menu_book" className="mr-3" />
            <span className="font-label-md text-label-md">Manage Guides</span>
          </a>
          <a className="flex items-center px-sm py-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-all duration-200" href="/regulasi">
            <Icon name="gavel" className="mr-3" />
            <span className="font-label-md text-label-md">Manage Regulations</span>
          </a>
          <a className="flex items-center px-sm py-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-all duration-200" href="/pengumuman">
            <Icon name="campaign" className="mr-3" />
            <span className="font-label-md text-label-md">Manage Announcements</span>
          </a>
          {/* Manage Admin active */}
          <a className="sidebar-active flex items-center px-sm py-2 rounded-lg transition-all duration-200" href="/kelola-admin">
            <Icon name="admin_panel_settings" className="mr-3" />
            <span className="font-label-md text-label-md">Manage Admin</span>
          </a>
        </nav>
        <div className="pt-xl border-t border-outline-variant space-y-1">
          <button
            className="w-full flex items-center px-sm py-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-all duration-200"
            onClick={() => setSettingsOpen(true)}
          >
            <Icon name="settings" className="mr-3" />
            <span className="font-label-md text-label-md">Settings</span>
          </button>
          <a className="flex items-center px-sm py-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-all duration-200" href="#">
            <Icon name="logout" className="mr-3" />
            <span className="font-label-md text-label-md">Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-surface border-b border-outline-variant px-gutter py-md sticky top-0 z-10">
          <div className="max-w-container-max mx-auto flex justify-between items-center">
            <div>
              <nav aria-label="Breadcrumb" className="flex text-on-surface-variant font-label-sm mb-1">
                <span>Admin Panel</span>
                <span className="mx-2">/</span>
                <span className="text-primary font-semibold">Kelola Admin</span>
              </nav>
              <h2 className="font-headline-md text-headline-md text-on-surface">Kelola Admin</h2>
            </div>
            <button
              className="bg-primary text-on-primary px-lg py-2 rounded-lg font-label-md institution-shadow hover:brightness-90 transition-all flex items-center gap-2"
              onClick={resetForm}
            >
              <Icon name="person_add" />
              Tambah Admin Baru
            </button>
          </div>
        </header>

        <div className="p-gutter max-w-container-max mx-auto w-full flex gap-lg flex-col lg:flex-row">
          {/* Left: Content Area */}
          <div className="flex-1 space-y-lg min-w-0">
            {error && (
              <div className="bg-error-container text-on-error-container border border-error rounded-xl p-md font-body-sm space-y-md">
                <div className="flex items-start justify-between gap-md">
                  <p>{error}</p>
                  <button className="underline shrink-0" onClick={() => setError(null)}>Tutup</button>
                </div>
                {error.includes('admins') && (
                  <div className="space-y-2">
                    <div className="flex justify-end">
                      <button
                        className="px-3 py-1 rounded border border-error bg-surface text-on-error-container font-label-md hover:bg-surface-variant transition-colors"
                        onClick={() => {
                          navigator.clipboard?.writeText(SETUP_SQL)
                          setCopied(true)
                          setTimeout(() => setCopied(false), 2000)
                        }}
                      >
                        {copied ? 'Tersalin!' : 'Salin SQL'}
                      </button>
                    </div>
                    <pre className="bg-surface-container-lowest text-on-surface text-label-sm rounded-lg p-md overflow-x-auto custom-scrollbar whitespace-pre-wrap">
{SETUP_SQL}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <StatCard
                icon="group"
                iconBg="bg-primary-fixed"
                iconColor="text-primary"
                label="Total Admin"
                value={loading ? '...' : stats.total}
              />
              <StatCard
                icon="verified_user"
                iconBg="bg-secondary-fixed"
                iconColor="text-secondary"
                label="Admin Aktif"
                value={loading ? '...' : stats.active}
              />
              <StatCard
                icon="lock_person"
                iconBg="bg-error-container"
                iconColor="text-error"
                label="Admin Terkunci"
                value={loading ? '...' : stats.locked}
              />
            </div>

            {/* Table Section */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant institution-shadow overflow-hidden">
              <div className="p-lg border-b border-outline-variant flex justify-between items-center">
                <h4 className="font-headline-sm text-headline-sm text-on-surface">Daftar Admin</h4>
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    className="pl-10 pr-4 py-2 border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-surface-container-low w-64"
                    placeholder="Cari admin..."
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low text-on-surface font-label-md border-b border-outline-variant">
                    <tr>
                      <th className="px-lg py-3 w-16">No</th>
                      <th className="px-lg py-3">Nama Lengkap</th>
                      <th className="px-lg py-3">Username/Email</th>
                      <th className="px-lg py-3">Peran</th>
                      <th className="px-lg py-3">Status</th>
                      <th className="px-lg py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-body-sm">
                    {loading && (
                      <tr>
                        <td colSpan={6} className="px-lg py-4 text-center text-on-surface-variant">
                          Memuat admin...
                        </td>
                      </tr>
                    )}
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-lg py-4 text-center text-on-surface-variant">
                          Tidak ada admin ditemukan.
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      filtered.map((a, i) => (
                        <tr
                          key={a.id}
                          onClick={() => selectAdmin(a)}
                          className={`border-b border-outline-variant hover:bg-surface-container transition-colors cursor-pointer ${
                            form.id === a.id ? 'bg-surface-container' : i % 2 === 1 ? 'bg-surface-container-low' : ''
                          }`}
                        >
                          <td className="px-lg py-4">{i + 1}</td>
                          <td className="px-lg py-4 font-semibold text-primary">{a.full_name}</td>
                          <td className="px-lg py-4">{a.email}</td>
                          <td className="px-lg py-4">{a.role}</td>
                          <td className="px-lg py-4">
                            <StatusBadge status={a.status} />
                          </td>
                          <td className="px-lg py-4 text-right space-x-2">
                            <button
                              className="text-secondary hover:text-primary transition-colors"
                              title="Edit"
                              onClick={(e) => {
                                e.stopPropagation()
                                selectAdmin(a)
                              }}
                            >
                              <Icon name="edit" />
                            </button>
                            <button
                              className="text-error hover:text-red-800 transition-colors"
                              title="Delete"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(a.id)
                              }}
                            >
                              <Icon name="delete" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="px-lg py-4 bg-surface-container-low flex justify-between items-center text-label-sm">
                <span className="text-on-surface-variant">
                  Menampilkan {filtered.length} dari {admins.length} admin
                </span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded border border-outline-variant bg-surface hover:bg-surface-variant disabled:opacity-50" disabled>
                    Sebelumnya
                  </button>
                  <button className="px-3 py-1 rounded border border-outline-variant bg-primary text-on-primary">1</button>
                  <button className="px-3 py-1 rounded border border-outline-variant bg-surface hover:bg-surface-variant">2</button>
                  <button className="px-3 py-1 rounded border border-outline-variant bg-surface hover:bg-surface-variant">Berikutnya</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Panel: Form Detail Admin */}
          <aside className="w-full lg:w-96 shrink-0">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl institution-shadow sticky top-[100px]">
              <div className="p-lg border-b border-outline-variant">
                <h4 className="font-headline-sm text-headline-sm text-on-surface">
                  {form.id ? 'Edit Admin' : 'Detail Admin'}
                </h4>
                <p className="text-on-surface-variant font-body-sm">
                  {form.id ? 'Perbarui informasi pengguna.' : 'Tambah atau perbarui informasi pengguna.'}
                </p>
              </div>
              <form className="p-lg space-y-md" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="block font-label-sm text-on-surface-variant" htmlFor="admin-name">Nama Lengkap</label>
                  <input
                    id="admin-name"
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-surface-container-low"
                    placeholder="Contoh: Muhammad Yusuf"
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-label-sm text-on-surface-variant" htmlFor="admin-email">Email / Username</label>
                  <input
                    id="admin-email"
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-surface-container-low"
                    placeholder="yusuf@lpse.go.id"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-label-sm text-on-surface-variant" htmlFor="admin-role">Peran</label>
                  <select
                    id="admin-role"
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-surface-container-low appearance-none cursor-pointer"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="">Pilih Peran</option>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-label-sm text-on-surface-variant" htmlFor="admin-status">Status</label>
                  <select
                    id="admin-status"
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-surface-container-low appearance-none cursor-pointer"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                    <option value="Terkunci">Terkunci</option>
                  </select>
                </div>
                <div className="pt-md border-t border-outline-variant space-y-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-primary text-on-primary py-2 rounded-lg font-label-md institution-shadow hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Menyimpan...' : form.id ? 'Simpan Perubahan' : 'Tambah Admin'}
                  </button>
                  <button
                    type="button"
                    className="w-full border border-outline text-on-surface-variant py-2 rounded-lg font-label-md hover:bg-surface-variant transition-all"
                    onClick={resetForm}
                  >
                    Batalkan
                  </button>
                </div>
              </form>
            </div>

            
          </aside>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

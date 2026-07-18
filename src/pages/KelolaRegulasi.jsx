import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import SettingsModal from '../components/SettingsModal'
import NotificationBell from '../components/NotificationBell'
import { getAdminSession } from '../lib/session'
import {
  fetchAllRegulations,
  createRegulation,
  updateRegulation,
  deleteRegulation,
  toggleRegulationPublish,
} from '../lib/api'

function StatBox({ icon, iconBg, iconColor, label, value }) {
  return (
    <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant institutional-shadow flex items-center gap-md">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg} ${iconColor}`}>
        <Icon name={icon} className="text-[24px]" />
      </div>
      <div>
        <p className="font-label-sm text-on-surface-variant">{label}</p>
        <p className="font-headline-sm text-headline-sm text-primary">{value}</p>
      </div>
    </div>
  )
}

function StatusBadge({ active }) {
  if (active) {
    return (
      <span className="inline-flex items-center px-sm py-xs rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">
        Berlaku
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-sm py-xs rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">
      Tidak Berlaku
    </span>
  )
}

const EMPTY_FORM = {
  id: null,
  nomor: '',
  tahun: new Date().getFullYear().toString(),
  judul: '',
  description: '',
  is_published: true,
  document_url: '',
}

export default function KelolaRegulasi() {
  const admin = getAdminSession()
  const [regulations, setRegulations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  const [form, setForm] = useState(EMPTY_FORM)

  async function load() {
    try {
      const data = await fetchAllRegulations()
      setRegulations(data || [])
    } catch (e) {
      setError(e.message || 'Gagal memuat data regulasi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const stats = useMemo(() => {
    const total = regulations.length
    const active = regulations.filter((r) => r.is_published).length
    const inactive = total - active
    return { total, active, inactive }
  }, [regulations])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return regulations.filter((r) => {
      if (!q) return true
      return (
        (r.judul || '').toLowerCase().includes(q) ||
        (r.nomor || '').toLowerCase().includes(q) ||
        (r.publish_date || '').slice(0, 4).includes(q)
      )
    })
  }, [regulations, search])

  function openCreate() {
    setEditing(false)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(r) {
    setEditing(true)
    setForm({
      id: r.id,
      nomor: r.nomor || '',
      tahun: (r.publish_date || '').slice(0, 4) || new Date().getFullYear().toString(),
      judul: r.judul || '',
      description: r.description || '',
      is_published: r.is_published ?? true,
      document_url: r.document_url || '',
    })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        judul: form.judul,
        description: form.description,
        document_url: form.document_url,
        publish_date: `${form.tahun}-01-01`,
        is_published: form.is_published,
        nomor: form.nomor,
      }
      if (editing) {
        await updateRegulation(form.id, payload)
      } else {
        await createRegulation(payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan regulasi')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus regulasi ini?')) return
    try {
      await deleteRegulation(id)
      await load()
    } catch (err) {
      setError(err.message || 'Gagal menghapus regulasi')
    }
  }

  async function handleToggle(r) {
    try {
      await toggleRegulationPublish(r.id, !r.is_published)
      await load()
    } catch (err) {
      setError(err.message || 'Gagal mengubah status')
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex overflow-hidden">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen py-md px-sm border-r border-outline-variant bg-surface-container w-64 flex-shrink-0">
        <div className="px-sm mb-xl">
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Admin Panel</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">System Administrator</p>
        </div>
        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/dashboard">
            <Icon name="dashboard" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Dashboard</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/kelola-panduan">
            <Icon name="menu_book" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Manage Guides</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all duration-200" href="/kelola-regulasi">
            <Icon name="gavel" />
            <span className="font-label-md text-label-md">Manage Regulations</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg group" href="/pengumuman">
            <Icon name="campaign" className="group-hover:scale-110 transition-transform" />
            <span className="font-label-md text-label-md">Manage Announcements</span>
          </a>
        </nav>
        <div className="mt-auto space-y-1 pt-md border-t border-outline-variant">
          <button
            className="w-full flex items-center justify-center gap-sm bg-primary text-on-primary py-sm rounded-lg mb-md font-label-md text-label-md hover:opacity-90 transition-opacity"
            onClick={openCreate}
          >
            <Icon name="add" className="text-[20px]" />
            New Entry
          </button>
          <button
            className="w-full flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg"
            onClick={() => setSettingsOpen(true)}
          >
            <Icon name="settings" />
            <span className="font-label-md text-label-md">Settings</span>
          </button>
          <a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg" href="/login" onClick={() => localStorage.removeItem('cms_admin_session')}>
            <Icon name="logout" />
            <span className="font-label-md text-label-md">Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-gutter border-b border-outline-variant bg-surface shrink-0">
          <div className="flex items-center gap-md">
            <Icon name="gavel" className="text-primary text-[24px]" />
            <h2 className="font-headline-md text-headline-md text-primary font-bold">Kelola Regulasi</h2>
          </div>
          <div className="flex items-center gap-md">
            <NotificationBell />
            <button
              className="bg-primary hover:bg-primary-container text-on-primary px-lg py-md rounded-lg font-label-md text-label-md transition-colors flex items-center gap-sm institutional-shadow"
              onClick={openCreate}
            >
              <Icon name="add_circle" className="text-[20px]" />
              Tambah Regulasi Baru
            </button>
          </div>
        </header>

        <div className="flex-1 p-gutter overflow-y-auto bg-surface-container-lowest space-y-lg">
          {error && (
            <div className="bg-error-container text-on-error-container border border-error rounded-xl p-md font-body-sm">
              {error}
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
            <StatBox icon="description" iconBg="bg-primary-fixed" iconColor="text-primary" label="Total Regulasi" value={loading ? '...' : stats.total} />
            <StatBox icon="check_circle" iconBg="bg-tertiary-fixed" iconColor="text-tertiary-container" label="Berlaku" value={loading ? '...' : stats.active} />
            <StatBox icon="cancel" iconBg="bg-error-container" iconColor="text-error" label="Tidak Berlaku" value={loading ? '...' : stats.inactive} />
            <StatBox icon="update" iconBg="bg-secondary-fixed" iconColor="text-secondary" label="Update Terbaru" value={loading ? '...' : '2 Hari Lalu'} />
          </div>

          {/* Management Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
            {/* Data Table */}
            <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant institutional-shadow overflow-hidden">
              <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-bright">
                <h3 className="font-label-md text-label-md text-primary">DAFTAR REGULASI</h3>
                <div className="relative">
                  <input
                    className="bg-surface text-body-sm px-lg py-sm rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary w-64"
                    placeholder="Cari regulasi..."
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Icon name="search" className="absolute right-3 top-2 text-on-surface-variant text-body-sm" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high">
                      <th className="p-md font-label-md text-label-md text-on-surface border-b border-outline-variant w-16">No.</th>
                      <th className="p-md font-label-md text-label-md text-on-surface border-b border-outline-variant">Tahun</th>
                      <th className="p-md font-label-md text-label-md text-on-surface border-b border-outline-variant">Judul / Tentang Peraturan</th>
                      <th className="p-md font-label-md text-label-md text-on-surface border-b border-outline-variant text-center">Status</th>
                      <th className="p-md font-label-md text-label-md text-on-surface border-b border-outline-variant text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {loading && (
                      <tr>
                        <td colSpan={5} className="p-md text-center font-body-sm text-on-surface-variant">Memuat regulasi...</td>
                      </tr>
                    )}
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-md text-center font-body-sm text-on-surface-variant">Tidak ada regulasi ditemukan.</td>
                      </tr>
                    )}
                    {!loading &&
                      filtered.map((r, i) => (
                        <tr key={r.id} className="hover:bg-surface-container-low transition-colors group">
                          <td className="p-md font-body-sm text-on-surface">{r.nomor || `R${i + 1}`}</td>
                          <td className="p-md font-body-sm text-on-surface">{(r.publish_date || '').slice(0, 4) || '-'}</td>
                          <td className="p-md font-body-sm text-on-surface leading-snug">{r.judul}</td>
                          <td className="p-md text-center">
                            <button onClick={() => handleToggle(r)} title="Klik untuk ubah status">
                              <StatusBadge active={r.is_published} />
                            </button>
                          </td>
                          <td className="p-md text-right">
                            <div className="flex justify-end gap-base opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-base hover:bg-surface-container-high rounded text-secondary" title="Edit" onClick={() => openEdit(r)}>
                                <Icon name="edit" />
                              </button>
                              <button className="p-base hover:bg-surface-container-high rounded text-error" title="Delete" onClick={() => handleDelete(r.id)}>
                                <Icon name="delete" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="p-md border-t border-outline-variant flex items-center justify-between">
                <span className="text-body-sm text-on-surface-variant">Menampilkan {filtered.length} dari {regulations.length} regulasi</span>
                <div className="flex gap-sm">
                  <button className="p-xs rounded border border-outline-variant hover:bg-surface-variant transition-colors">
                    <Icon name="chevron_left" className="text-[20px]" />
                  </button>
                  <button className="p-xs rounded border border-outline-variant hover:bg-surface-variant transition-colors">
                    <Icon name="chevron_right" className="text-[20px]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Form Section (Side Panel) */}
            <div className="lg:col-span-4 space-y-md">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant institutional-shadow p-lg">
                <div className="flex items-center justify-between mb-lg">
                  <h3 className="font-headline-sm text-headline-sm text-primary">{editing ? 'Edit Regulasi' : 'Detail Regulasi'}</h3>
                  <Icon name="info" className="text-on-surface-variant cursor-pointer hover:text-primary transition-colors" />
                </div>
                <form className="space-y-md" onSubmit={handleSubmit}>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Nomor Peraturan</label>
                    <input
                      className="w-full px-md py-md border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:outline-none font-body-sm"
                      placeholder="Contoh: P10/2023"
                      type="text"
                      value={form.nomor}
                      onChange={(e) => setForm({ ...form, nomor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Tahun Terbit</label>
                    <select
                      className="w-full px-md py-md border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:outline-none font-body-sm"
                      value={form.tahun}
                      onChange={(e) => setForm({ ...form, tahun: e.target.value })}
                    >
                      {['2024', '2023', '2022', '2021', '2020', '2019', '2018'].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Judul / Tentang</label>
                    <textarea
                      className="w-full px-md py-md border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:outline-none font-body-sm resize-none"
                      placeholder="Masukkan judul lengkap peraturan..."
                      rows="4"
                      value={form.judul}
                      onChange={(e) => setForm({ ...form, judul: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Status Keberlakuan</label>
                    <div className="flex gap-md mt-sm">
                      <label className="flex items-center gap-sm cursor-pointer group">
                        <input
                          className="text-primary focus:ring-primary h-4 w-4"
                          name="status"
                          type="radio"
                          checked={form.is_published === true}
                          onChange={() => setForm({ ...form, is_published: true })}
                        />
                        <span className="font-body-sm text-on-surface group-hover:text-primary">Berlaku</span>
                      </label>
                      <label className="flex items-center gap-sm cursor-pointer group">
                        <input
                          className="text-primary focus:ring-primary h-4 w-4"
                          name="status"
                          type="radio"
                          checked={form.is_published === false}
                          onChange={() => setForm({ ...form, is_published: false })}
                        />
                        <span className="font-body-sm text-on-surface group-hover:text-primary">Tidak Berlaku</span>
                      </label>
                    </div>
                  </div>
                  <div className="pt-sm">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">URL Dokumen (PDF)</label>
                    <input
                      className="w-full px-md py-md border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:outline-none font-body-sm"
                      placeholder="https://..."
                      type="text"
                      value={form.document_url}
                      onChange={(e) => setForm({ ...form, document_url: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-md pt-lg">
                    <button
                      type="button"
                      className="border border-outline-variant text-on-surface hover:bg-surface-variant py-md rounded-lg font-label-md text-label-md transition-colors"
                      onClick={() => setModalOpen(false)}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-primary text-on-primary hover:bg-primary-container py-md rounded-lg font-label-md text-label-md transition-colors institutional-shadow disabled:opacity-50"
                    >
                      {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                  {editing && (
                    <div className="pt-base">
                      <button
                        type="button"
                        className="w-full text-error hover:bg-error-container/20 py-md rounded-lg font-label-md text-label-md transition-colors border border-transparent hover:border-error-container"
                        onClick={() => handleDelete(form.id)}
                      >
                        Hapus Regulasi
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Atmospheric Tip */}
              <div className="bg-primary-container/10 p-md rounded-xl border border-primary/20 flex gap-md">
                <Icon name="lightbulb" className="text-primary" />
                <p className="font-body-sm text-primary leading-tight">
                  Pastikan dokumen PDF yang diunggah telah ditandatangani secara digital atau merupakan salinan resmi yang sah.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Icon from './Icon'

const navItems = [
  { label: 'Beranda', to: '/' },
  { label: 'Panduan', to: '/panduan' },
  { label: 'Regulasi', to: '/regulasi' },
  { label: 'Pengumuman', to: '/pengumuman' },
  { label: 'Kontak', to: '/kontak' },
]

export default function Header() {
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/panduan?q=${encodeURIComponent(q)}` : '/panduan')
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline h-16 flex items-center transition-colors duration-200">
      <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-full">
        <Link
          to="/"
          className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary tracking-tight"
        >
          UKPBJ Kabupaten Bungo
        </Link>

        <nav className="hidden md:flex items-center gap-lg">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? 'font-label-md text-label-md text-primary dark:text-inverse-primary border-b-2 border-primary dark:border-inverse-primary pb-1 transition-colors duration-200'
                  : 'font-label-md text-label-md text-on-surface-variant dark:text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors duration-200'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-md">
          <form
            className="hidden lg:flex items-center bg-surface-container-low px-sm py-xs rounded-lg border border-outline-variant"
            onSubmit={handleSearch}
          >
            <Icon name="search" className="text-outline" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-32 xl:w-48"
              placeholder="Cari panduan..."
              type="text"
            />
          </form>

          <button
            type="button"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-on-surface hover:bg-surface-container-low transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} className="text-2xl" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-surface border-b border-outline-variant shadow-lg">
          <nav className="flex flex-col px-gutter py-md gap-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `font-label-md text-label-md py-sm rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'text-primary bg-surface-container-low'
                      : 'text-on-surface-variant hover:text-secondary hover:bg-surface-container-low'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

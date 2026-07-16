import { Link, NavLink } from 'react-router-dom'
import Icon from './Icon'

const navItems = [
  { label: 'Beranda', to: '/', active: true },
  { label: 'Panduan', to: '/panduan' },
  { label: 'Regulasi', to: '/regulasi' },
  { label: 'Pengumuman', to: '#' },
  { label: 'Kontak', to: '#' },
]

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline h-16 flex items-center transition-colors duration-200">
      <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-full">
        <div className="flex items-center gap-md">
          <Link
            to="/"
            className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary tracking-tight"
          >
            UKPBJ Kabupaten Bungo
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-lg">
          {navItems.map((item) =>
            item.to.startsWith('/') ? (
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
            ) : (
              <a
                key={item.label}
                href={item.to}
                className="font-label-md text-label-md text-on-surface-variant dark:text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors duration-200"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-md">
          <div className="hidden lg:flex items-center bg-surface-container-low px-sm py-xs rounded-lg border border-outline-variant">
            <Icon name="search" className="text-outline" />
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-32 xl:w-48"
              placeholder="Search..."
              type="text"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

const navLinks = [
  { label: 'Beranda', href: '#', active: true },
  { label: 'Regulasi', href: '#' },
  { label: 'Panduan', href: '#' },
  { label: 'FAQ', href: '#' },
  { label: 'Helpdesk', href: '#' },
]

export default function Navbar() {
  return (
    <header className="bg-surface-container-lowest dark:bg-inverse-surface border-b border-outline-variant dark:border-outline sticky top-0 z-50">
      <nav className="flex justify-between items-center w-full px-margin-desktop max-w-container-max mx-auto h-16 transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[32px]">account_balance</span>
          <span className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed">
            SIPRAJA BUNGO
          </span>
        </div>

        <div className="hidden md:flex items-center gap-gutter font-body-md text-body-md">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={
                link.active
                  ? 'text-primary dark:text-primary-fixed border-b-2 border-primary font-bold pb-1 transition-colors'
                  : 'text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed transition-colors'
              }
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors">
            <span className="text-label-md font-label-md">Language</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </nav>
    </header>
  )
}

const footerLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Contact Us', href: '#' },
  { label: 'FAQ', href: '#' },
  { label: 'Help Center', href: '#' },
]

const partners = ['LKPP', 'KEMENKEU', 'KOMINFO']

export default function Footer() {
  return (
    <footer className="bg-surface-dim dark:bg-inverse-surface border-t border-outline-variant transition-colors duration-200">
      <div className="w-full py-xl px-gutter flex flex-col md:flex-row justify-between items-start md:items-center max-w-container-max mx-auto gap-lg">
        <div className="flex flex-col gap-sm">
          <span className="font-label-md text-label-md font-bold text-on-surface dark:text-inverse-on-surface">
            Portal Informasi Pengadaan Barang dan Jasa
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-surface-variant max-w-md">
            © 2026 UKPBJ Kabupaten Bungo. All Rights Reserved. Institutional Government Portal.
          </p>
        </div>
        <nav className="flex flex-wrap gap-lg">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-inverse-primary transition-opacity duration-200"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="max-w-container-max mx-auto px-gutter pb-lg">
        <div className="flex items-center gap-md grayscale opacity-50">
          {partners.map((name) => (
            <div
              key={name}
              className="h-8 w-24 bg-on-surface-variant/20 rounded flex items-center justify-center text-[10px] uppercase font-bold text-on-surface-variant"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}

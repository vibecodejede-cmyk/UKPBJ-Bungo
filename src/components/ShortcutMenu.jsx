import Icon from './Icon'

const shortcuts = [
  {
    icon: 'menu_book',
    title: 'Panduan Inaproc',
    description: 'Informasi teknis dan alur sistem pengadaan nasional.',
    iconBg: 'bg-primary',
    iconText: 'text-on-primary',
    hover: 'hover:bg-primary',
    hoverIconBg: 'group-hover:bg-on-primary',
    hoverIconText: 'group-hover:text-primary',
    hoverTitle: 'group-hover:text-on-primary',
    hoverDesc: 'group-hover:text-primary-fixed',
  },
  {
    icon: 'laptop_mac',
    title: 'Panduan LPSE',
    description: 'Dokumentasi operasional untuk admin dan pengguna LPSE.',
    iconBg: 'bg-secondary',
    iconText: 'text-on-secondary',
    hover: 'hover:bg-secondary',
    hoverIconBg: 'group-hover:bg-on-secondary',
    hoverIconText: 'group-hover:text-secondary',
    hoverTitle: 'group-hover:text-on-secondary',
    hoverDesc: 'group-hover:text-secondary-fixed',
  },
  {
    icon: 'gavel',
    title: 'Regulasi',
    description: 'Kumpulan aturan, perpres, dan surat edaran pengadaan.',
    iconBg: 'bg-primary-container',
    iconText: 'text-on-primary-container',
    hover: 'hover:bg-primary-container',
    hoverIconBg: 'group-hover:bg-on-primary-container',
    hoverIconText: 'group-hover:text-primary-container',
    hoverTitle: 'group-hover:text-on-primary-container',
    hoverDesc: 'group-hover:text-primary-fixed',
  },
  {
    icon: 'campaign',
    title: 'Pengumuman',
    description: 'Berita terkini dan pemberitahuan sistem penting.',
    iconBg: 'bg-tertiary-container',
    iconText: 'text-on-tertiary-container',
    hover: 'hover:bg-tertiary-container',
    hoverIconBg: 'group-hover:bg-on-tertiary-container',
    hoverIconText: 'group-hover:text-tertiary-container',
    hoverTitle: 'group-hover:text-on-tertiary-container',
    hoverDesc: 'group-hover:text-tertiary-fixed',
  },
]

export default function ShortcutMenu() {
  return (
    <section className="py-xl bg-white">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          {shortcuts.map((item) => (
            <a
              key={item.title}
              className={`group p-lg bg-surface-container-low border border-outline-variant rounded-xl institutional-shadow ${item.hover} transition-all duration-300`}
              href="#"
            >
              <div
                className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center mb-md ${item.hoverIconBg} transition-colors`}
              >
                <Icon name={item.icon} className={item.iconText + ' ' + item.hoverIconText} />
              </div>
              <h3 className={`font-headline-sm text-headline-sm text-primary mb-xs ${item.hoverTitle}`}>
                {item.title}
              </h3>
              <p className={`font-body-sm text-body-sm text-on-surface-variant ${item.hoverDesc}`}>
                {item.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

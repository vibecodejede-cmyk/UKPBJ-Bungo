import { Link, NavLink, useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import Footer from '../components/Footer'
import { announcements, recentAnnouncements } from '../data/announcements'

export default function PengumumanDetail() {
  const { id = 'spse-security-2024' } = useParams()
  const data = announcements.find((a) => a.id === id) || announcements[0]

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-16">
          <div className="flex items-center gap-xl">
            <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
              UKPBJ Kabupaten Bungo
            </Link>
            <nav className="hidden md:flex items-center gap-lg">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? 'font-label-md text-label-md text-primary border-b-2 border-primary pb-1 transition-colors duration-200'
                    : 'font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200'
                }
              >
                Beranda
              </NavLink>
              <NavLink
                to="/panduan"
                className={({ isActive }) =>
                  isActive
                    ? 'font-label-md text-label-md text-primary border-b-2 border-primary pb-1 transition-colors duration-200'
                    : 'font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200'
                }
              >
                Panduan
              </NavLink>
              <NavLink
                to="/regulasi"
                className={({ isActive }) =>
                  isActive
                    ? 'font-label-md text-label-md text-primary border-b-2 border-primary pb-1 transition-colors duration-200'
                    : 'font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200'
                }
              >
                Regulasi
              </NavLink>
              <NavLink
                to="/pengumuman"
                className={({ isActive }) =>
                  isActive
                    ? 'font-label-md text-label-md text-primary border-b-2 border-primary pb-1 transition-colors duration-200'
                    : 'font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200'
                }
              >
                Pengumuman
              </NavLink>
              <NavLink
                to="/kontak"
                className={({ isActive }) =>
                  isActive
                    ? 'font-label-md text-label-md text-primary border-b-2 border-primary pb-1 transition-colors duration-200'
                    : 'font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200'
                }
              >
                Kontak
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-md">
            <div className="relative hidden sm:block">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary focus:outline-none w-64"
                placeholder="Search announcements..."
                type="text"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-container-max mx-auto px-gutter py-md">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-xs text-on-surface-variant mb-xl py-sm">
          <Link className="font-label-md text-label-md hover:text-primary transition-colors" to="/">
            Beranda
          </Link>
          <Icon name="chevron_right" className="text-sm" />
          <Link className="font-label-md text-label-md hover:text-primary transition-colors" to="/pengumuman">
            Pengumuman
          </Link>
          <Icon name="chevron_right" className="text-sm" />
          <span className="font-label-md text-label-md text-primary truncate max-w-xs sm:max-w-md">
            {data.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
          {/* Main Content */}
          <article className="lg:col-span-8">
            <header className="mb-lg">
              <div className="flex flex-wrap items-center gap-md mb-md">
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm">
                  {data.badge}
                </span>
                <div className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm">
                  <Icon name="calendar_today" className="text-sm" />
                  <span>{data.date}</span>
                </div>
                <div className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm">
                  <Icon name="person" className="text-sm" />
                  <span>{data.author}</span>
                </div>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary leading-tight mb-md">{data.title}</h1>
            </header>

            <div className="rounded-xl overflow-hidden mb-xl institutional-shadow border border-outline-variant">
              <img className="w-full h-80 object-cover" src={data.image} alt={data.title} />
            </div>

            <div className="prose prose-blue max-w-none text-on-surface-variant">
              <p className="font-body-lg text-body-lg mb-lg text-on-surface">{data.intro}</p>

              <section className="mb-lg">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md">Jadwal Pemeliharaan (Maintenance)</h2>
                <div className="bg-surface-container-low p-lg rounded-lg border border-outline-variant mb-md">
                  <div className="flex items-start gap-md">
                    <Icon name="info" className="text-primary mt-1" />
                    <div>
                      <p className="font-body-md text-body-md font-bold text-on-surface">{data.maintenance.date}</p>
                      <p className="font-body-sm text-body-sm">{data.maintenance.time}</p>
                      <p className="font-body-sm text-body-sm mt-2 italic text-error">{data.maintenance.note}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-lg">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md">Detail Pembaruan Teknis</h2>
                <ul className="list-disc pl-md space-y-md font-body-md text-body-md">
                  {data.technicalUpdates.map((item) => (
                    <li key={item.bold}>
                      <span className="font-bold">{item.bold}</span>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mb-lg">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md">Instruksi Bagi Pengguna</h2>
                <p className="font-body-md text-body-md mb-md">
                  Kami menyarankan kepada seluruh pengguna (PPK, Pokja Pemilihan, dan Pelaku Usaha) untuk:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  {data.instructions.map((item) => (
                    <div key={item.title} className="p-md border border-outline-variant rounded-lg bg-surface">
                      <p className="font-label-md text-label-md text-primary mb-1">{item.title}</p>
                      <p className="font-body-sm text-body-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Attachments */}
            {data.attachments && data.attachments.length > 0 && (
              <section className="mt-xl pt-lg border-t border-outline-variant">
                <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-md">Lampiran Dokumen</h3>
                <div className="space-y-sm">
                  {data.attachments.map((att) => (
                    <a
                      key={att.name}
                      className="flex items-center justify-between p-md bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors group"
                      href="#"
                    >
                      <div className="flex items-center gap-md">
                        <Icon name={att.icon} className={att.iconClass} />
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">{att.name}</p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant">{att.size}</p>
                        </div>
                      </div>
                      <Icon name="download" className="text-on-surface-variant group-hover:text-primary" />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-xl">
            {/* Share */}
            <section className="bg-white p-lg rounded-xl institutional-shadow border border-outline-variant">
              <h3 className="font-label-md text-label-md text-on-surface mb-md">Bagikan Pengumuman</h3>
              <div className="flex gap-md">
                <button className="flex-1 py-2 rounded-lg border border-outline-variant hover:bg-surface-variant transition-all flex items-center justify-center gap-xs">
                  <Icon name="share" className="text-sm" />
                  <span className="font-label-sm text-label-sm">Salin Link</span>
                </button>
                <button className="p-2 rounded-lg border border-outline-variant hover:bg-[#1DA1F2] hover:text-white transition-all">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </button>
                <button className="p-2 rounded-lg border border-outline-variant hover:bg-[#25D366] hover:text-white transition-all">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.544.917 3.41 1.4 5.338 1.401 5.452 0 9.891-4.438 9.893-9.891.001-2.646-1.03-5.134-2.906-7.01-1.875-1.875-4.361-2.903-7.006-2.904-5.453 0-9.891 4.439-9.893 9.891-.001 1.916.498 3.79 1.443 5.421l-.916 3.344 3.425-.898zm11.385-7.391c-.301-.151-1.78-.878-2.056-.978-.275-.1-.476-.151-.675.151-.201.301-.776.978-.951 1.178-.175.2-.351.226-.653.076-.301-.151-1.273-.469-2.426-1.494-.897-.8-1.501-1.787-1.676-2.088-.176-.301-.019-.463.132-.613.136-.135.301-.351.451-.527.151-.176.201-.301.301-.503.1-.2.05-.376-.025-.527-.075-.151-.675-1.632-.925-2.235-.243-.587-.488-.507-.675-.517-.174-.01-.374-.011-.574-.011-.2 0-.526.075-.801.376-.275.301-1.052 1.029-1.052 2.51 0 1.48 1.077 2.912 1.227 3.113.151.2 2.12 3.237 5.136 4.537.717.31 1.277.494 1.714.633.72.228 1.375.196 1.892.119.577-.086 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.076-.125-.276-.201-.577-.352z" />
                  </svg>
                </button>
              </div>
            </section>

            {/* Recent Announcements */}
            <section>
              <div className="flex items-center justify-between mb-md">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Pengumuman Lainnya</h3>
                <Link className="font-label-sm text-label-sm text-secondary hover:underline" to="/pengumuman">
                  Lihat Semua
                </Link>
              </div>
              <div className="space-y-md">
                {recentAnnouncements.map((item) => (
                  <Link
                    key={item.title}
                    to="/pengumuman"
                    className="group block bg-white border border-outline-variant rounded-xl overflow-hidden institutional-shadow hover:border-primary transition-all"
                  >
                    <div className="flex gap-md p-md">
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-dim">
                        <img
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          src={item.image}
                          alt={item.title}
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="font-label-sm text-[10px] text-secondary uppercase tracking-widest mb-1">
                          {item.tag}
                        </span>
                        <h4 className="font-label-md text-label-md text-on-surface line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        <p className="font-body-sm text-[11px] text-on-surface-variant mt-1">{item.date}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Support Card */}
            <div className="bg-primary-container p-lg rounded-xl text-on-primary-container">
              <h3 className="font-headline-sm text-headline-sm mb-sm">Butuh Bantuan?</h3>
              <p className="font-body-sm text-body-sm mb-lg opacity-90">
                Hubungi Helpdesk kami jika Anda mengalami kesulitan teknis saat pembaruan sistem berlangsung.
              </p>
              <Link
                to="/kontak"
                className="inline-flex items-center gap-xs font-label-md text-label-md bg-white text-primary px-lg py-2 rounded-lg hover:bg-surface-bright transition-all"
              >
                <Icon name="support_agent" className="text-sm" />
                Hubungi Support
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}

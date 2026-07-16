import { Link, NavLink } from 'react-router-dom'
import Icon from '../components/Icon'
import Footer from '../components/Footer'
import { announcements } from '../data/announcements'

function DetailContent({ item }) {
  return (
    <>
      <div className="space-y-md font-body-md text-body-md text-on-surface">
        {item.content.map((block, i) => {
          if (Array.isArray(block)) {
            return (
              <ul key={i} className="list-disc pl-lg space-y-base text-body-sm">
                {block.map((li, j) => (
                  <li key={j}>
                    {li.strong && <strong>{li.strong}</strong>}
                    {li.text}
                  </li>
                ))}
              </ul>
            )
          }
          if (typeof block === 'object' && block.bold) {
            return (
              <p key={i} className="font-bold">
                {block.bold}
              </p>
            )
          }
          return <p key={i}>{block}</p>
        })}
      </div>

      {item.attachments.length > 0 && (
        <div className="mt-xl pt-lg border-t border-outline-variant">
          <h3 className="font-label-md text-label-md text-on-surface-variant mb-md uppercase">Lampiran Dokumen</h3>
          <div className="space-y-sm">
            {item.attachments.map((att) => (
              <div
                key={att.name}
                className="flex items-center justify-between p-md border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors group cursor-pointer"
              >
                <div className="flex items-center">
                  <Icon name={att.icon} className={`${att.iconClass} mr-md`} />
                  <div>
                    <div className="font-label-md text-label-md">{att.name}</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">{att.size}</div>
                  </div>
                </div>
                <Icon name="download" className="text-on-surface-variant group-hover:text-primary" />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default function Pengumuman() {
  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-16">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
            UKPBJ Kabupaten Bungo
          </Link>
          <nav className="hidden md:flex items-center space-x-lg">
            <Link
              to="/"
              className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              Beranda
            </Link>
            <Link
              to="/panduan"
              className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              Panduan
            </Link>
            <Link
              to="/regulasi"
              className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              Regulasi
            </Link>
            <Link
              to="/pengumuman"
              className="font-label-md text-label-md text-primary border-b-2 border-primary pb-1 transition-colors duration-200"
            >
              Pengumuman
            </Link>
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
          <div className="flex items-center space-x-md">
            <div className="relative hidden sm:block">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
              />
              <input
                className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-body-sm w-64"
                placeholder="Cari pengumuman..."
                type="text"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-container-max mx-auto px-gutter py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          {/* Left Column: Announcement Feed */}
          <div className="lg:col-span-7 space-y-md">
            <div className="flex items-center justify-between mb-md">
              <h1 className="font-headline-lg text-headline-lg text-primary">Daftar Pengumuman</h1>
              <div className="flex space-x-sm">
                <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-variant">
                  <Icon name="filter_list" />
                </button>
                <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-variant">
                  <Icon name="sort" />
                </button>
              </div>
            </div>
            <div className="space-y-md">
              {announcements.map((item) => (
                <Link
                  key={item.id}
                  to={`/pengumuman/${item.id}`}
                  className="group block bg-surface-container-lowest p-lg rounded-xl institutional-shadow transition-all hover:translate-y-[-2px] border border-outline-variant hover:border-secondary"
                >
                  <div className="flex justify-between items-start mb-sm">
                    <span
                      className={`font-label-sm text-label-sm px-2 py-1 rounded-full ${item.badgeClass}`}
                    >
                      {item.badge}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{item.date}</span>
                  </div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                    {item.title}
                  </h2>
                  <p className="mt-sm font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    {item.excerpt}
                  </p>
                  <div className="mt-md flex items-center text-primary font-label-md text-label-md">
                    <span>Lihat Detail</span>
                    <Icon name="arrow_forward" className="ml-1 text-[18px]" />
                  </div>
                </Link>
              ))}
            </div>
            <div className="pt-lg flex justify-center">
              <button className="flex items-center space-x-sm px-lg py-sm border border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-surface-container-low transition-colors">
                <span>Muat Lebih Banyak</span>
                <Icon name="expand_more" />
              </button>
            </div>
          </div>

          {/* Right Column: Detail View */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <div className="bg-surface-container-lowest border border-outline-variant institutional-shadow rounded-xl overflow-hidden flex flex-col max-h-[calc(100vh-140px)]">
                {/* Header Image */}
                <div className="h-48 w-full bg-surface-variant relative overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center opacity-80"
                    style={{ backgroundImage: `url('${announcements[0].image}')` }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-lg bg-gradient-to-t from-black/60 to-transparent">
                    <span className="font-label-sm text-label-sm px-2 py-1 bg-primary text-on-primary rounded uppercase">
                      {announcements[0].category}
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-lg overflow-y-auto custom-scrollbar">
                  <div className="flex items-center text-on-surface-variant font-label-sm text-label-sm mb-md">
                    <Icon name="calendar_month" className="text-[16px] mr-1" />
                    <span>{announcements[0].detailDate}</span>
                    <span className="mx-2">•</span>
                    <Icon name="person" className="text-[16px] mr-1" />
                    <span>{announcements[0].author}</span>
                  </div>
                  <h1 className="font-headline-md text-headline-md text-primary mb-md">{announcements[0].title}</h1>
                  <DetailContent item={announcements[0]} />
                </div>
                {/* Footer Actions */}
                <div className="p-md bg-surface-container-high flex justify-between items-center">
                  <button className="text-secondary font-label-md text-label-md flex items-center">
                    <Icon name="share" className="mr-sm" />
                    Bagikan
                  </button>
                  <Link
                    to={`/pengumuman/${announcements[0].id}`}
                    className="bg-secondary text-on-secondary px-lg py-2 rounded-lg font-label-md text-label-md hover:bg-secondary-container transition-colors"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

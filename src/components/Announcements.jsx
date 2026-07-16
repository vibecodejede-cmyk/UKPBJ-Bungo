import { Link } from 'react-router-dom'
import Icon from './Icon'
import { announcements } from '../data/announcements'

export default function Announcements() {
  return (
    <section className="py-xl bg-surface-bright">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex justify-between items-end mb-xl">
          <div>
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Update Terkini</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-base">Pengumuman Terbaru</h2>
          </div>
          <a
            className="flex items-center gap-xs font-label-md text-label-md text-primary hover:text-secondary transition-colors group"
            href="#"
          >
            Lihat Semua
            <Icon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {announcements.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-xl overflow-hidden institutional-shadow border border-outline-variant hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img className="w-full h-full object-cover" src={item.image} alt={item.title} />
                <div
                  className={`absolute top-md right-md ${item.badgeClass} px-sm py-xs rounded-lg text-label-sm font-label-sm shadow-lg`}
                >
                  {item.badge}
                </div>
              </div>
              <div className="p-lg">
                <div className="flex items-center gap-sm mb-sm text-on-surface-variant">
                  <Icon name="calendar_today" className="text-base" />
                  <span className="font-label-sm text-label-sm">{item.date}</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm line-clamp-2">{item.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-md line-clamp-3">{item.description}</p>
                <Link
                  to={`/pengumuman/${item.id}`}
                  className="text-primary font-label-md text-label-md hover:underline"
                >
                  Baca Selengkapnya
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

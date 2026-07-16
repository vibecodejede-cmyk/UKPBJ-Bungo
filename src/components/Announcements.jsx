import Icon from './Icon'

const announcements = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDv-qSF15SKFJdSUvsDnEqeFCVMDEh4mHRjzlQhQNd6YJhhSjezne0R4cM-ZLMSADR68PbOHGSMyCLGlfCnvy06iQZ_y6QZvWqgyvD-esGXCMwc5otWOAqc6cwZPl5VRApS0YIWuqPAH7FtewR99hhIsPtp1dC6uf7KJsp7VvEEQEmcRqwxxioEf7x8ZUeNuYXOX6GXiOkyN9kzXF4YNU7aeCOSPtmRZRzZjevCn2QTunDdBry9CbwIjPP39gm_vdPmHOn39h67BKGJ',
    badge: 'Sistem',
    badgeClass: 'bg-secondary text-on-secondary',
    date: '24 Mei 2024',
    title: 'Pemeliharaan Rutin Server SPSE Nasional Wilayah Barat',
    description:
      'Pemberitahuan kepada seluruh pengguna jasa SPSE mengenai jadwal pemeliharaan rutin infrastruktur server untuk meningkatkan performa layanan...',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDXXB87V5oiS3-o7jAwboE-fcbq4yUcUsrxrj2v-HiJIrXezZCH1_tdJ5w3x1DzpS9xIIOts10KLk62FlCGi6CqV86bXPMmzMQfGxzrfiA-P7KSxt4ctnkj2jSSzF_kZZTvcwxX0XefjtG2o_VnmBzY7EhRspV_60Esplc9aZv9Ro1koWtGme8LftXLETe6EXjtUy5I-7FcnxDen77_IgiIb-hZZ2xNzgRX4_ru7oDnFp-yeLLdi7L69bOzC_EjrdUAC7euw3uOYSIW',
    badge: 'Regulasi',
    badgeClass: 'bg-primary text-on-primary',
    date: '21 Mei 2024',
    title: 'Pemberlakuan Peraturan LKPP Baru Terkait E-Purchasing',
    description:
      'LKPP resmi merilis aturan turunan mengenai tata cara pembelian elektronik melalui katalog nasional untuk meningkatkan efisiensi belanja negara...',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBQm5Kd9uLy0TSXbPXAbyAERpnQiCXH2ory58HASxVMR0ul1SaAu0EaJSlUSuJoyidoKy4W_8BwPDqvCCesQ0ivRLjAUlRJM33h2qp2O1H2h6BppKvfV_4aXGCIpOXGPI3vQ-YG4n7A3yY6txARUQe345oGPS9LrJscmYTTswlnXEJB4bzl4pimDCbZ_MZ1JeSvj9tNVCCrtjUJ1HkyNsdBfZ-UnFu-ZpSf9Rylxf__CBecZVxvs-Q5M8UXMzLQSWT7LBn0M_lq_oqa',
    badge: 'Kegiatan',
    badgeClass: 'bg-tertiary-container text-on-tertiary-container',
    date: '18 Mei 2024',
    title: 'Sosialisasi Penggunaan Portal Inaproc Versi Terbaru 2024',
    description:
      'Undangan sosialisasi daring untuk Pejabat Pembuat Komitmen (PPK) mengenai fitur-fitur baru pada Dashboard monitoring Inaproc...',
  },
]

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
              key={item.title}
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
                <button className="text-primary font-label-md text-label-md hover:underline">Baca Selengkapnya</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

const announcements = [
  {
    id: 0,
    badge: 'TERBARU',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
    date: '24 Mei 2024',
    title: 'Pembaruan Sistem Keamanan SPSE Versi 4.5 Patch 2024',
    excerpt:
      'Sehubungan dengan adanya pemeliharaan rutin dan peningkatan fitur keamanan pada server produksi, kami informasikan bahwa akan dilakukan downtime terjadwal...',
    detailDate: '24 Mei 2024, 09:15 WIB',
    category: 'Informasi Teknis',
    author: 'Admin Pusat',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDGBsYMGZxz4eSgsmcVZYWnFrRynf5Ur2kZpKz2mPrr__eEk6B6fqsGOpHys1jNW5v1jO7s6zGOB_i_dMeJMhhWER0HHWMd9YORWbonlj1hAkx5mO-xqdR1YCU741LTa_q-p5bVcIkETbxIu841xH4lDmfEtvjr1SABM8rz681nW3IBWkE2dKoC0rdn-U7OOyWRMd18XVNRfb4B7uRkuwgdSwRjswEXGRdV-r43ZWWHlLpsPypbnllNJNKKU7zC4RXx4_TUabsfvuq-',
    content: [
      'Yth. Para Pengguna Layanan Pengadaan Secara Elektronik (LPSE),',
      'Dalam rangka meningkatkan kualitas layanan dan keamanan transaksi elektronik pada aplikasi SPSE, kami informasikan bahwa akan dilaksanakan pemeliharaan sistem pada:',
      [
        { strong: 'Hari/Tanggal:', text: ' Sabtu, 25 Mei 2024' },
        { strong: 'Waktu:', text: ' 22.00 WIB s.d Minggu, 26 Mei 2024 04.00 WIB' },
        { strong: 'Agenda:', text: ' Penerapan Security Patch 2024 dan Optimasi Database' },
      ],
      'Selama proses pemeliharaan tersebut, aplikasi SPSE tidak dapat diakses untuk sementara waktu. Kami menyarankan para pelaku usaha dan panitia pengadaan untuk mengatur ulang jadwal jika ada batas akhir pemasukan dokumen yang bertepatan dengan waktu tersebut.',
      'Demikian informasi ini disampaikan. Mohon maaf atas ketidaknyamanan yang ditimbulkan.',
      { bold: 'Direktorat Pengembangan Sistem Pengadaan Secara Elektronik - LKPP' },
    ],
    attachments: [
      { icon: 'picture_as_pdf', iconClass: 'text-error', name: 'Surat_Edaran_Pembaruan_SPSE.pdf', size: '1.2 MB' },
      { icon: 'article', iconClass: 'text-secondary', name: 'Panduan_Konfigurasi_Patch_45.docx', size: '450 KB' },
    ],
  },
  {
    id: 1,
    badge: 'TEKNIS',
    badgeClass: 'bg-surface-variant text-on-surface-variant',
    date: '20 Mei 2024',
    title: 'Panduan Registrasi Penyedia Luar Negeri pada Katalog Elektronik',
    excerpt:
      'Dalam rangka mendukung keterbukaan pasar pengadaan barang/jasa pemerintah, LKPP merilis modul pendaftaran bagi entitas asing yang ingin berpartisipasi...',
    detailDate: '20 Mei 2024, 14:30 WIB',
    category: 'Panduan',
    author: 'Divisi Katalog',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDGBsYMGZxz4eSgsmcVZYWnFrRynf5Ur2kZpKz2mPrr__eEk6B6fqsGOpHys1jNW5v1jO7s6zGOB_i_dMeJMhhWER0HHWMd9YORWbonlj1hAkx5mO-xqdR1YCU741LTa_q-p5bVcIkETbxIu841xH4lDmfEtvjr1SABM8rz681nW3IBWkE2dKoC0rdn-U7OOyWRMd18XVNRfb4B7uRkuwgdSwRjswEXGRdV-r43ZWWHlLpsPypbnllNJNKKU7zC4RXx4_TUabsfvuq-',
    content: [
      'Dalam rangka mendukung keterbukaan pasar pengadaan barang/jasa pemerintah, LKPP merilis modul pendaftaran bagi entitas asing yang ingin berpartisipasi dalam Katalog Elektronik Sektoral maupun Nasional...',
    ],
    attachments: [],
  },
  {
    id: 2,
    badge: 'LEGAL',
    badgeClass: 'bg-surface-variant text-on-surface-variant',
    date: '15 Mei 2024',
    title: 'Sosialisasi Peraturan Lembaga No. 12 Tahun 2024 Tentang Mitigasi Risiko',
    excerpt:
      'Kami mengundang seluruh Pejabat Pembuat Komitmen (PPK) untuk menghadiri sesi daring mengenai implementasi mitigasi risiko pada proses tender konstruksi...',
    detailDate: '15 Mei 2024, 10:00 WIB',
    category: 'Regulasi',
    author: 'Biro Hukum',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDGBsYMGZxz4eSgsmcVZYWnFrRynf5Ur2kZpKz2mPrr__eEk6B6fqsGOpHys1jNW5v1jO7s6zGOB_i_dMeJMhhWER0HHWMd9YORWbonlj1hAkx5mO-xqdR1YCU741LTa_q-p5bVcIkETbxIu841xH4lDmfEtvjr1SABM8rz681nW3IBWkE2dKoC0rdn-U7OOyWRMd18XVNRfb4B7uRkuwgdSwRjswEXGRdV-r43ZWWHlLpsPypbnllNJNKKU7zC4RXx4_TUabsfvuq-',
    content: [
      'Kami mengundang seluruh Pejabat Pembuat Komitmen (PPK) untuk menghadiri sesi daring mengenai implementasi mitigasi risiko pada proses tender konstruksi pasca terbitnya Perlem No 12...',
    ],
    attachments: [],
  },
  {
    id: 3,
    badge: 'MAINTENANCE',
    badgeClass: 'bg-surface-variant text-on-surface-variant',
    date: '10 Mei 2024',
    title: 'Jadwal Pemeliharaan Data Center Nasional (DCN) Minggu Ke-2',
    excerpt:
      'Informasi pemadaman sementara layanan Inaproc selama 4 jam pada hari Sabtu mendatang untuk migrasi database storage...',
    detailDate: '10 Mei 2024, 16:45 WIB',
    category: 'Pemeliharaan',
    author: 'IT Support',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDGBsYMGZxz4eSgsmcVZYWnFrRynf5Ur2kZpKz2mPrr__eEk6B6fqsGOpHys1jNW5v1jO7s6zGOB_i_dMeJMhhWER0HHWMd9YORWbonlj1hAkx5mO-xqdR1YCU741LTa_q-p5bVcIkETbxIu841xH4lDmfEtvjr1SABM8rz681nW3IBWkE2dKoC0rdn-U7OOyWRMd18XVNRfb4B7uRkuwgdSwRjswEXGRdV-r43ZWWHlLpsPypbnllNJNKKU7zC4RXx4_TUabsfvuq-',
    content: [
      'Informasi pemadaman sementara layanan Inaproc selama 4 jam pada hari Sabtu mendatang untuk migrasi database storage di Data Center Nasional (DCN). Semua sistem akan offline sementara...',
    ],
    attachments: [],
  },
]

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
  const [selectedId, setSelectedId] = useState(0)
  const selected = announcements.find((a) => a.id === selectedId) || announcements[0]

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
            <a
              className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
              href="#"
            >
              Kontak
            </a>
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
              {announcements.map((item) => {
                const isActive = item.id === selectedId
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`cursor-pointer group bg-surface-container-lowest p-lg rounded-xl institutional-shadow transition-all hover:translate-y-[-2px] ${
                      isActive
                        ? 'border-2 border-primary'
                        : 'border border-outline-variant hover:border-secondary'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-sm">
                      <span
                        className={`font-label-sm text-label-sm px-2 py-1 rounded-full ${item.badgeClass}`}
                      >
                        {item.badge}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{item.date}</span>
                    </div>
                    <h2
                      className={`font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors ${
                        isActive ? 'text-primary' : ''
                      }`}
                    >
                      {item.title}
                    </h2>
                    <p className="mt-sm font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      {item.excerpt}
                    </p>
                    {isActive && (
                      <div className="mt-md flex items-center text-primary font-label-md text-label-md">
                        <span>Lihat Detail</span>
                        <Icon name="arrow_forward" className="ml-1 text-[18px]" />
                      </div>
                    )}
                  </div>
                )
              })}
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
                    style={{ backgroundImage: `url('${selected.image}')` }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-lg bg-gradient-to-t from-black/60 to-transparent">
                    <span className="font-label-sm text-label-sm px-2 py-1 bg-primary text-on-primary rounded uppercase">
                      {selected.category}
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-lg overflow-y-auto custom-scrollbar">
                  <div className="flex items-center text-on-surface-variant font-label-sm text-label-sm mb-md">
                    <Icon name="calendar_month" className="text-[16px] mr-1" />
                    <span>{selected.detailDate}</span>
                    <span className="mx-2">•</span>
                    <Icon name="person" className="text-[16px] mr-1" />
                    <span>{selected.author}</span>
                  </div>
                  <h1 className="font-headline-md text-headline-md text-primary mb-md">{selected.title}</h1>
                  <DetailContent item={selected} />
                </div>
                {/* Footer Actions */}
                <div className="p-md bg-surface-container-high flex justify-between items-center">
                  <button className="text-secondary font-label-md text-label-md flex items-center">
                    <Icon name="share" className="mr-sm" />
                    Bagikan
                  </button>
                  <button className="bg-secondary text-on-secondary px-lg py-2 rounded-lg font-label-md text-label-md hover:bg-secondary-container transition-colors">
                    Cetak Pengumuman
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-dim border-t border-outline-variant mt-xl">
        <div className="w-full py-xl px-gutter flex flex-col md:flex-row justify-between items-start max-w-container-max mx-auto gap-lg">
          <div className="max-w-sm">
            <div className="font-label-md text-label-md font-bold text-on-surface mb-md">UKPBJ Kabupaten Bungo</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
              Portal resmi pengadaan barang dan jasa pemerintah Republik Indonesia yang kredibel, transparan, dan
              akuntabel.
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              © 2026 UKPBJ Kabupaten Bungo. All Rights Reserved. Institutional Government Portal.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-xl w-full md:w-auto">
            <div className="flex flex-col space-y-sm">
              <h4 className="font-label-md text-label-md font-bold text-on-surface mb-xs">Layanan</h4>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity duration-200" href="#">
                Katalog Elektronik
              </a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity duration-200" href="#">
                E-Tendering
              </a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity duration-200" href="#">
                Sikap
              </a>
            </div>
            <div className="flex flex-col space-y-sm">
              <h4 className="font-label-md text-label-md font-bold text-on-surface mb-xs">Dukungan</h4>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity duration-200" href="#">
                Help Center
              </a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity duration-200" href="#">
                FAQ
              </a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity duration-200" href="#">
                Contact Us
              </a>
            </div>
            <div className="flex flex-col space-y-sm">
              <h4 className="font-label-md text-label-md font-bold text-on-surface mb-xs">Kebijakan</h4>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity duration-200" href="#">
                Privacy Policy
              </a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-opacity duration-200" href="#">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

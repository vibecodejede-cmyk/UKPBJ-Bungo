import { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from './Modal'
import Icon from './Icon'

const footerLinks = [
  { label: 'Privacy Policy', type: 'modal' },
  { label: 'Terms of Service', type: 'modal' },
  { label: 'Contact Us', type: 'link', href: '/kontak' },
  { label: 'FAQ', type: 'modal' },
  { label: 'Help Center', type: 'modal' },
]

const partners = [
  { name: 'LKPP', logo: '/logos/lkpp.svg', url: 'https://www.lkpp.go.id' },
  { name: 'Inaproc', logo: '/logos/inaproc.svg', url: 'https://inaproc.id' },
  { name: 'LPSE Kabupaten Bungo', logo: '/logos/lpse.svg', url: 'https://spse.inaproc.id/bungokab' },
]

const modalContent = {
  'Privacy Policy': (
    <div className="space-y-md font-body-md text-body-md text-on-surface">
      <p>
        Portal Informasi Pengadaan Barang dan Jasa UKPBJ Kabupaten Bungo berkomitmen untuk melindungi privasi
        pengguna. Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi
        informasi pribadi Anda.
      </p>
      <h4 className="font-headline-sm text-headline-sm text-on-surface">1. Informasi yang Dikumpulkan</h4>
      <p>
        Kami mengumpulkan informasi yang Anda berikan secara sukarela saat berlangganan newsletter atau
        menghubungi kami melalui formulir kontak.
      </p>
      <h4 className="font-headline-sm text-headline-sm text-on-surface">2. Penggunaan Informasi</h4>
      <p>
        Informasi yang dikumpulkan digunakan untuk mengirimkan update pengadaan, regulasi, dan komunikasi
        terkait layanan portal.
      </p>
      <h4 className="font-headline-sm text-headline-sm text-on-surface">3. Perlindungan Data</h4>
      <p>
        Kami menerapkan langkah-langkah keamanan yang sesuai untuk melindungi data pribadi Anda dari akses,
        perubahan, atau pengungkapan yang tidak sah.
      </p>
    </div>
  ),
  'Terms of Service': (
    <div className="space-y-md font-body-md text-body-md text-on-surface">
      <p>
        Dengan mengakses dan menggunakan Portal Informasi Pengadaan Barang dan Jasa UKPBJ Kabupaten Bungo,
        Anda setuju untuk mematuhi syarat dan ketentuan berikut.
      </p>
      <h4 className="font-headline-sm text-headline-sm text-on-surface">1. Penggunaan Layanan</h4>
      <p>
        Layanan ini disediakan untuk tujuan informasi pengadaan barang dan jasa pemerintah. Pengguna
        bertanggung jawab atas penggunaan informasi yang diperoleh dari portal ini.
      </p>
      <h4 className="font-headline-sm text-headline-sm text-on-surface">2. Hak Kekayaan Intelektual</h4>
      <p>
        Seluruh konten di portal ini dilindungi oleh hak cipta dan hak kekayaan intelektual lainnya yang
        berlaku di Indonesia.
      </p>
      <h4 className="font-headline-sm text-headline-sm text-on-surface">3. Perubahan Syarat</h4>
      <p>
        Kami berhak untuk mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan berlaku
        segera setelah dipublikasikan di halaman ini.
      </p>
    </div>
  ),
  FAQ: (
    <div className="space-y-md font-body-md text-body-md text-on-surface">
      <div>
        <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">
          Apa itu Portal Informasi Pengadaan Barang dan Jasa?
        </h4>
        <p>
          Portal ini adalah situs resmi UKPBJ Kabupaten Bungo yang menyediakan informasi terkini seputar
          pengadaan barang/jasa, regulasi, dan pengumuman penting.
        </p>
      </div>
      <div>
        <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">
          Bagaimana cara berlangganan newsletter?
        </h4>
        <p>
          Anda dapat mendaftar dengan memasukkan alamat email pada formulir newsletter yang tersedia di
          halaman beranda.
        </p>
      </div>
      <div>
        <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">
          Apakah layanan ini gratis?
        </h4>
        <p>
          Ya, seluruh informasi dan layanan yang disediakan di portal ini adalah gratis untuk diakses oleh
          publik.
        </p>
      </div>
      <div>
        <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">
          Siapa yang bisa dihubungi untuk bantuan?
        </h4>
        <p>
          Anda dapat menghubungi Helpdesk kami melalui halaman Kontak atau mengirimkan pesan melalui formulir
          yang tersedia.
        </p>
      </div>
    </div>
  ),
  'Help Center': (
    <div className="space-y-md font-body-md text-body-md text-on-surface">
      <p>
        Butuh bantuan? Tim Helpdesk UKPBJ Kabupaten Bungo siap membantu Anda dengan pertanyaan seputar
        pengadaan barang dan jasa.
      </p>
      <h4 className="font-headline-sm text-headline-sm text-on-surface">Cara Menghubungi Kami</h4>
      <ul className="list-disc pl-md space-y-sm">
        <li>Kunjungi halaman Kontak dan isi formulir yang tersedia</li>
        <li>Kirimkan email ke helpdesk@ukpbj.bungokab.go.id</li>
        <li>Hubungi telepon di (0742) 123456 selama jam kerja</li>
      </ul>
      <h4 className="font-headline-sm text-headline-sm text-on-surface">Jam Operasional</h4>
      <p>Senin - Jumat: 08.00 - 16.00 WIB</p>
      <p>Sabtu - Minggu: Tutup</p>
    </div>
  ),
}

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null)

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
          {footerLinks.map((link) => {
            if (link.type === 'link') {
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-inverse-primary transition-opacity duration-200"
                >
                  {link.label}
                </Link>
              )
            }
            return (
              <button
                key={link.label}
                onClick={() => setActiveModal(link.label)}
                className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-inverse-primary transition-opacity duration-200"
              >
                {link.label}
              </button>
            )
          })}
        </nav>
      </div>
      <div className="max-w-container-max mx-auto px-gutter pb-lg">
        <p className="font-label-xs text-label-xs text-on-surface-variant dark:text-on-surface-variant mb-2">
          Link Penting
        </p>
        <div className="flex items-center gap-md">
          {partners.map((partner) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-24 flex items-center justify-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-200"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-full w-full object-contain"
              />
            </a>
          ))}
        </div>
      </div>

      <Modal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        title={activeModal || ''}
      >
        {activeModal && modalContent[activeModal]}
      </Modal>
    </footer>
  )
}

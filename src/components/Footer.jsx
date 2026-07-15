const quickLinks = ['Portal SPSE', 'E-Katalog Nasional', 'SiRUP', 'Sikap (Vendor Management)']
const helpLinks = ['Pusat Bantuan', 'Video Tutorial', 'Unduh Sertifikat', 'Lapor Kendala']
const legalLinks = ['Privacy Policy', 'Terms of Service', 'Accessibility', 'Contact Support']

export default function Footer() {
  return (
    <footer className="bg-surface-container-highest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline">
      <div className="max-w-container-max mx-auto px-margin-desktop py-stack-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[28px]">account_balance</span>
              <span className="font-headline-sm text-headline-sm font-bold text-primary">SIPRAJA BUNGO</span>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Pusat layanan informasi dan bantuan teknis pengadaan barang/jasa pemerintah di bawah naungan Lembaga
              Kebijakan Pengadaan Barang/Jasa Pemerintah (LKPP).
            </p>
          </div>

          <div>
            <h5 className="font-label-md text-label-md font-bold mb-6 text-primary uppercase tracking-wider">Tautan Cepat</h5>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a
                    className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
                    href="#"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-label-md text-label-md font-bold mb-6 text-primary uppercase tracking-wider">Bantuan</h5>
            <ul className="space-y-4">
              {helpLinks.map((link) => (
                <li key={link}>
                  <a
                    className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
                    href="#"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-label-md text-label-md font-bold mb-6 text-primary uppercase tracking-wider">Alamat Kantor</h5>
            <p className="font-label-sm text-label-sm text-on-surface-variant leading-relaxed">
              Jl. R.M. Thaher Nomor 503,
              <br />
              Bagian Pengadaan Barang dan Jasa,
              <br />
              Sekretariat Daerah Kabupaten Bungo, 37214
            </p>
            <div className="mt-6 flex gap-4">
              <a
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary-fixed transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">public</span>
              </a>
              <a
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary-fixed transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">mail</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-label-sm text-label-sm text-on-surface-variant opacity-90">
            © 2026 UKPBJ Kabupaten Bungo. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {legalLinks.map((link) => (
              <a
                key={link}
                className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-opacity"
                href="#"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

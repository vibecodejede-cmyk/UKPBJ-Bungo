export default function Hero() {
  return (
    <section className="relative hero-gradient overflow-hidden py-24 lg:py-32">
      <div className="max-w-container-max mx-auto px-margin-desktop relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-white space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
            <span className="text-label-sm font-label-sm uppercase tracking-wider">UKPBJ Kabupaten Bungo</span>
          </div>

          <h1 className="font-display-lg text-display-lg leading-tight">
            Sistem Informasi & Pengadaan Barang dan Jasa
          </h1>

          <p className="text-body-lg font-body-lg text-blue-100 max-w-xl">
            Kemudahan Akses Informasi Publik Sektor Pengadaan.
          </p>

          <div className="max-w-xl">
            <div className="relative group">
              <input
                className="w-full h-16 pl-14 pr-6 rounded-lg bg-white text-on-surface border-none focus:ring-4 focus:ring-primary-fixed shadow-xl transition-all font-body-md"
                placeholder="Cari regulasi, panduan, atau FAQ..."
                type="text"
              />
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary text-[28px] group-hover:scale-110 transition-transform">
                search
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-label-md font-bold text-blue-200">Cari Cepat:</span>
                <div className="flex gap-3 flex-wrap">
                  {['Peraturan Presiden', 'Peraturan LKPP', 'Panduan SPSE', 'Video Tutorial'].map((item) => (
                    <a
                      key={item}
                      href="#"
                      className="text-label-sm font-label-sm text-white bg-white/10 border border-white/20 px-4 py-2 rounded-full hover:bg-white/20 hover:border-white/50 transition-all duration-200"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 flex-wrap items-center opacity-80">
                <span className="text-label-md text-blue-200">Populer:</span>
                <a className="text-label-md text-white hover:underline transition-colors" href="#">Perpres 12/2021</a>
                <span className="text-white/30">|</span>
                <a className="text-label-md text-white hover:underline transition-colors" href="#">E-Katalog V5</a>
                <span className="text-white/30">|</span>
                <a className="text-label-md text-white hover:underline transition-colors" href="#">Sertifikasi Ahli</a>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block relative">
          <div className="aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <img
              className="w-full h-full object-cover"
              data-alt="A professional aerial view of a grand government administrative building in Jakarta under a clear blue sky, emphasizing civic authority and permanence. The architecture features clean lines, structured columns, and large glass windows reflecting a sunset glow, symbolizing transparency and modern public service in the Garuda Blue color palette."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhtVfGqS8MqopTZHMxgluMRQwerZXJliP8PVwHsY3rt3Ksb0FhM0dIiiXh4W9YOoffZw5qmaNLP9wS8D8kBSLgSSrVSb65l94_88Lva_uAuGGyuqJGUYXzwkaIyYbCXug4Suq__M8DEC51UDrgzRiBxdD3G0lA-wUteKBL0_sHrPkhxNdpE40lBZ8VumXXErFkHQ331tOu1BJwLPVi4gUplI14xd9NuTIXtcPMwPGJP4gdmzpK0Qzta3WseoTQ5o3mbqGx9dPWE0s1"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-secondary-container p-6 rounded-lg shadow-xl max-w-xs border border-secondary">
            <p className="text-on-secondary-container font-headline-sm text-headline-sm italic">
              "Integritas adalah kunci efisiensi pengadaan negara."
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

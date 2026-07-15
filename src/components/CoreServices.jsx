const services = [
  {
    icon: 'description',
    title: 'Regulasi & Panduan',
    description: 'Database lengkap peraturan presiden, instruksi, dan petunjuk teknis pengadaan terbaru.',
    features: ['Peraturan Presiden', 'Standar Dokumen Pemilihan', 'Surat Edaran Kepala LKPP'],
    link: 'Pelajari Selengkapnya',
    linkIcon: 'arrow_forward',
  },
  {
    icon: 'support_agent',
    title: 'Helpdesk LPSE',
    description: 'Dukungan teknis langsung untuk permasalahan sistem pengadaan elektronik (SPSE) di seluruh unit kerja.',
    status: { text: 'Tersedia (Waktu Tunggu < 5m)', available: true },
    link: 'Buka Tiket',
    linkIcon: 'confirmation_number',
  },
  {
    icon: 'smart_toy',
    title: 'Virtual Assistant',
    description: 'Asisten cerdas berbasis AI untuk menjawab pertanyaan umum terkait proses pengadaan secara instan.',
    questions: ['"Bagaimana cara daftar vendor?"', '"Syarat tender di atas 200 juta?"'],
    link: 'Mulai Percakapan',
    linkIcon: 'forum',
  },
]

export default function CoreServices() {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="mb-12">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Layanan Utama Kami</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Akses berbagai instrumen dukungan pengadaan barang dan jasa dalam satu platform terintegrasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white border border-outline-variant p-8 flex flex-col justify-between hover:border-primary transition-all duration-300"
            >
              <div>
                <div className="w-12 h-12 bg-primary-fixed rounded flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined" data-original-icon={service.icon}>
                    {service.icon}
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm mb-3">{service.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">{service.description}</p>
              </div>

              {service.features && (
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-label-md">
                      <span className="material-symbols-outlined text-primary text-sm" data-original-icon="check_circle">
                        check_circle
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              {service.status && (
                <div className="bg-surface-container-low p-4 mb-8">
                  <div className="text-label-sm font-bold uppercase text-on-surface-variant mb-2">Status Saat Ini</div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${service.status.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-label-md font-semibold">{service.status.text}</span>
                  </div>
                </div>
              )}

              {service.questions && (
                <div className="flex flex-col gap-2 mb-8">
                  {service.questions.map((q) => (
                    <button key={q} className="text-left p-3 text-label-md bg-surface hover:bg-primary-fixed transition-colors border border-outline-variant">
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <a
                className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all"
                href="#"
              >
                {service.link}
                <span className="material-symbols-outlined" data-original-icon={service.linkIcon}>
                  {service.linkIcon}
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

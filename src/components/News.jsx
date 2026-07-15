const featuredArticle = {
  tag: 'Highlight',
  date: '14 Nov 2024',
  title: 'Transformasi E-Katalog V6: Mempercepat Proses Belanja Pemerintah Lebih Efisien',
  description: 'Pemerintah resmi meluncurkan pembaruan sistem E-Katalog versi terbaru yang menjanjikan antarmuka lebih user-friendly dan integrasi data yang lebih ketat dengan sistem perpajakan nasional.',
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg5aiirT3j3T-gh5PEaWdfx-4Lh4sJlzbCa1IL-bRi3omyC-ZU8vvCxumY7fKFKySllQ4-4x7bUZo1_-SyhNmZsJQL0LpTFTsufNQ_AcIdAolvVloKTni2dT35-PChHWHPHBxUALJXlSJ3xCdrRoLYFAa-R-q4i722bnPrphVtGOCT_JSVObQXlxDeLEo-drF3ccyFGJB6S3En1-zF0X-pCSU86jpXJexKkuTumrjtC5vx095phpNxLDcxhigW5D0RKgk4gEcccrQb',
  imageAlt: 'A diverse group of Indonesian professionals in formal business attire collaborating around a large conference table in a sunlit, modern government office. They are reviewing digital blueprints and procurement documents on tablets and screens. The atmosphere is focused and professional, utilizing a Garuda Blue and Gold color scheme.',
}

const newsItems = [
  {
    tag: 'Update Regulasi',
    date: '12 Nov 2024',
    title: 'Pedoman Baru Audit Pengadaan Konstruksi Pasca Pandemi',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDG7Y7KiOMoua160F_RwjRYI0mM8RPaMmbNP1dPztIcMspc8UycAU1yptVR7Eq-yh9sgUIU1lzFTaKlzC5FzcjBEoVqyVNC_Jzv1kOoUG3mhU0OvRemP7XRr-8qA4L55j5RDYn6My1d88ENgkcv7kwC1cHQMOc8CxWYNZM67oxow5wnolZAz2AcNN0BVV-GGIuLxszxr41R_KeBuFWZGLhHPClys-O8vbRz0ZeGfA0-d4iPsEI1_wI4ARvPAd6z59d8zREMluho5TBn',
    imageAlt: 'A macro photograph of an official government seal being stamped onto a heavy bond paper document. The ink is deep Garuda Blue. The lighting is dramatic, highlighting the texture of the paper and the sharp edges of the seal, conveying legal authority and procedural formality.',
  },
  {
    tag: 'Sosialisasi',
    date: '10 Nov 2024',
    title: 'Workshop Nasional Sertifikasi Ahli Pengadaan Tingkat Dasar',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDywEtt2c70we_THfzZiFwSAciK_8K-IaQwM3SHg2F5OhuaDeviuoMswoTeiY04wW59HeYTi71QYHOFcZcnbscZIc0jYQqO3wAuh9wfJnsCeodJ0AveYsgFe9Dd3kMF4L7XIYyYVGYX3NHeNV1A3DNu0N0De4gK_fpg58cHWpulLKFjtU_KR1Olu-lbhYIGoPGZe9ZTH9Z4b6s5SKcFt8l2qNkHx7DS2f1XuO5CIZ6E8deUvXdTI9XlohRRDEj9pqhYhi2SigKzTEm8',
    imageAlt: 'A digital workspace setup featuring a high-end laptop displaying complex data analytics charts in shades of blue and gold. Beside the laptop is a neatly organized notebook with a professional pen. The background is a blurred office environment, representing modern, tech-driven administrative work.',
  },
  {
    tag: 'Kemitraan',
    date: '08 Nov 2024',
    title: 'MoU LKPP dengan Sektor Perbankan untuk Jaminan Penawaran Digital',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC8E9hkYrcboNX3_W0IH0pi96MYELyWKohfRjL2gsQSIIkcIGb_yRk5OUNYI958IyrlJmpCbntpiqxafpcLrlLjCVgRusNgM4sW578E1u_wwl_Jwu7S5gD4GMXp8zJMbrWKV49kbOkkFF3ZQNkfxETUgIs3_WvLRmSl4cVqY29CHZPNTG3xiyxe4qQ6bPWBXUbc68M_i_Q1uaoPqS8CF11AvanPoS09zrYEJTU5Wauv3YmheHJA8AyIE4I0RKl9NOy8OxOPlYcGQAY',
    imageAlt: 'A close-up of two professional hands shaking in a brightly lit modern hall. The participants wear formal batik and business suits. The background features institutional banners in Garuda Blue. The shot conveys trust, partnership, and successful negotiation.',
  },
]

export default function News() {
  return (
    <section className="py-24 bg-white border-y border-outline-variant">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">Berita & Pembaruan Terkini</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Tetap terinformasi dengan perubahan regulasi dan pengumuman penting.
            </p>
          </div>
          <a
            className="hidden md:flex items-center gap-2 text-label-md font-bold text-primary group"
            href="#"
          >
            Lihat Semua Berita
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Featured Article */}
          <div className="lg:col-span-7 group cursor-pointer">
            <div className="aspect-[16/9] overflow-hidden rounded mb-6">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                data-alt={featuredArticle.imageAlt}
                src={featuredArticle.image}
              />
            </div>
            <div className="flex gap-4 mb-4">
              <span className="bg-primary text-white px-2 py-1 text-label-sm font-label-sm uppercase">
                {featuredArticle.tag}
              </span>
              <span className="text-label-sm font-label-sm text-on-surface-variant">{featuredArticle.date}</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary group-hover:underline mb-4">
              {featuredArticle.title}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3">
              {featuredArticle.description}
            </p>
          </div>

          {/* News Sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {newsItems.map((item, index) => (
              <div key={index} className="flex gap-6 group cursor-pointer">
                <div className="w-24 h-24 flex-shrink-0 bg-surface-container overflow-hidden rounded">
                  <img
                    className="w-full h-full object-cover"
                    data-alt={item.imageAlt}
                    src={item.image}
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-label-sm font-label-sm text-on-surface-variant mb-1">
                    {item.tag} • {item.date}
                  </span>
                  <h4 className="font-label-md text-label-md font-bold group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

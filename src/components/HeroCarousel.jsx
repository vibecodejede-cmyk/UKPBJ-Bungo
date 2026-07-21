import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import { fetchAnnouncements } from '../lib/api'

const FALLBACK_IMAGE = '/announcements/announcement-new.png'

const fallbackSlides = [
  {
    id: 'fallback-1',
    image: FALLBACK_IMAGE,
    alt: 'Modernisasi Pengadaan Nasional',
    title: 'Modernisasi Pengadaan Nasional',
    description:
      'Transformasi digital menuju sistem pengadaan yang lebih cepat, transparan, dan akuntabel di seluruh Indonesia.',
  },
  {
    id: 'fallback-2',
    image: FALLBACK_IMAGE,
    alt: 'Layanan Publik Terintegrasi',
    title: 'Layanan Publik Terintegrasi',
    description:
      'Akses satu pintu untuk semua kebutuhan pengadaan barang dan jasa pemerintah yang terintegrasi penuh dengan sistem nasional.',
  },
  {
    id: 'fallback-3',
    image: FALLBACK_IMAGE,
    alt: 'Transparansi Data Regulasi',
    title: 'Transparansi Data Regulasi',
    description:
      'Kepastian hukum dan akses mudah terhadap dokumen regulasi pengadaan terbaru untuk seluruh pemangku kepentingan.',
  },
]

const AUTOPLAY_MS = 5000

export default function HeroCarousel() {
  const [slides, setSlides] = useState(fallbackSlides)
  const [current, setCurrent] = useState(0)
  const total = slides.length

  // Fetch slides from announcements table in Supabase
  useEffect(() => {
    let cancelled = false
    async function loadSlides() {
      try {
        const data = await fetchAnnouncements()
        console.log('[HeroCarousel] fetchAnnouncements result:', data)
        if (!cancelled && data && data.length > 0) {
          const mapped = data.map((a) => ({
            id: a.id,
            image: a.image_url || FALLBACK_IMAGE,
            alt: a.title,
            title: a.title,
            description: a.excerpt,
          }))
          console.log('[HeroCarousel] mapped slides:', mapped)
          setSlides(mapped)
          setCurrent(0)
        } else {
          console.warn('[HeroCarousel] No announcements data, keeping fallback slides')
        }
      } catch (err) {
        console.warn('fetchAnnouncements failed, using fallback slides:', err?.message)
      }
    }
    loadSlides()
    return () => {
      cancelled = true
    }
  }, [])

  const moveSlide = useCallback(
    (direction) => {
      setCurrent((prev) => (prev + direction + total) % total)
    },
    [total],
  )

  const setSlide = (index) => setCurrent(index)

  useEffect(() => {
    const id = setInterval(() => moveSlide(1), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [moveSlide, total])

  return (
    <div className="carousel-container" id="hero-carousel">
      {slides.map((slide, index) => (
        <div key={slide.id} className={`slide ${index === current ? 'active' : ''}`}>
          <img
            alt={slide.alt}
            className="w-full h-full object-cover"
            src={slide.image}
            onError={(e) => {
              console.warn('[HeroCarousel] Image failed to load:', e.target.src)
              if (e.target.src !== FALLBACK_IMAGE) {
                e.target.src = FALLBACK_IMAGE
              }
            }}
          />
          <div className="absolute inset-0 slide-overlay flex items-end sm:items-center">
            <div className="max-w-container-max mx-auto px-gutter w-full text-white">
              <div className="max-w-4xl pr-md lg:pr-xl pt-20 pb-24 sm:pt-0 sm:pb-24 lg:pt-0 lg:pb-28 lg:pl-[10%]">
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-display-lg sm:text-display-lg mb-md text-on-primary leading-tight">{slide.title}</h2>
                <p className="font-body-md text-body-md sm:font-body-lg sm:text-body-lg mb-xl text-primary-fixed leading-relaxed">{slide.description}</p>
                <Link
                  to={`/pengumuman/${slide.id}`}
                  className="bg-secondary text-on-secondary px-lg py-md sm:px-xl sm:py-lg rounded-lg font-label-md text-label-md hover:bg-secondary-container transition-all inline-block"
                >
                  Selengkapnya
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Side Arrows */}
      <button
        type="button"
        className="absolute left-md top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 p-sm rounded-full text-white transition-colors"
        onClick={() => moveSlide(-1)}
        aria-label="Previous slide"
        disabled={total <= 1}
      >
        <Icon name="chevron_left" className="text-4xl" />
      </button>
      <button
        type="button"
        className="absolute right-md top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 p-sm rounded-full text-white transition-colors"
        onClick={() => moveSlide(1)}
        aria-label="Next slide"
        disabled={total <= 1}
      >
        <Icon name="chevron_right" className="text-4xl" />
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-xl left-1/2 -translate-x-1/2 z-20 flex gap-sm">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full bg-white transition-all ${
              index === current ? 'opacity-100' : 'opacity-50'
            }`}
            onClick={() => setSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import { fetchAnnouncements } from '../lib/api'

const fallbackSlides = [
  {
    id: 'fallback-1',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDdM8DrrAIWTVwF56rnv98cnGymh1RweHCGOogDz9abXth8kFiFlB5QUf3naLwhdt-4C1evf9GjeXgvff5IymQ-kwJFqW5D4Nb-0YyDV-L_9cA2wagwNRWJ9WOL01Cot5bAtsG8fL0q9vXfZZCHI85UDhRjywykBOK0E6Z7s5R54cDbCWOOqosn8TCyKZ1XWDoVfAOMRf7Irp385XvE0f_XFdmPexypyxRCANCkxbudHnOwbsL1LtSWjwTcOJ-IgumTo1RE449_XWcN',
    alt: 'Modernisasi Pengadaan Nasional',
    title: 'Modernisasi Pengadaan Nasional',
    description:
      'Transformasi digital menuju sistem pengadaan yang lebih cepat, transparan, dan akuntabel di seluruh Indonesia.',
  },
  {
    id: 'fallback-2',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC5hPWtI4-ubrJXk3BVgt6GcX3CJ_GLlFy5Ca3Gf5fTw-XH3dq2F_10gAXzI-wvWNJTo-BQ4il6GBKGZxSfqqo1zAt8SHZqa44smF0Gez4WpiiXtzjNQqV033WKKEZUwHlA3vTcYn1RG2H7tvqy19hHzUaajRDC-81Z1eYQzO18RuB9Rzr4RbnaVHCWgrnUGhXI5IROLG9ruVhpq7mcHNPwMrGUEPwdCxa-pbf6VNbR8xlkQb929YqR7t34wl9FRczPtFUGiwnigYfb',
    alt: 'Layanan Publik Terintegrasi',
    title: 'Layanan Publik Terintegrasi',
    description:
      'Akses satu pintu untuk semua kebutuhan pengadaan barang dan jasa pemerintah yang terintegrasi penuh dengan sistem nasional.',
  },
  {
    id: 'fallback-3',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD-OEqZOftsh1gERgHOHv2FYqKPsA2K5nD6HJdERnxB8a0_qkaBiFni2qYeXqNKqi1zbimAOzlX0Xrd9jHIZ7ZhyrwxPL9GGX_ENaCRYRSjkVFIQ7kzV_sTrt1WQJmyNHoELYZS26prLpVnFKYDJuaBYKJtOeVmsGM5lnSLHCcZJrth7USfMj5wtM-ASdgkjtg9rsEbA6oFrkFtXcS5DWbpAX74oaQp6cAKFUW3sNd6t1-CNGwt7SPCfo09ugLrUp0huG3QC01ZW9tU',
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
        if (!cancelled && data && data.length > 0) {
          const mapped = data.map((a) => ({
            id: a.id,
            image: a.image_url,
            alt: a.title,
            title: a.title,
            description: a.excerpt,
          }))
          setSlides(mapped)
          setCurrent(0)
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
          <img alt={slide.alt} className="w-full h-full object-cover" src={slide.image} />
          <div className="absolute inset-0 slide-overlay flex items-center">
            <div className="max-w-container-max mx-auto px-gutter w-full text-white">
              <div className="max-w-4xl pr-md lg:pr-xl pb-24 lg:pb-28 lg:pl-[10%]">
                <h2 className="font-display-lg text-display-lg mb-md text-on-primary leading-tight">{slide.title}</h2>
                <p className="font-body-lg text-body-lg mb-xl text-primary-fixed leading-relaxed">{slide.description}</p>
                <Link
                  to={`/pengumuman/${slide.id}`}
                  className="bg-secondary text-on-secondary px-xl py-lg rounded-lg font-label-md text-label-md hover:bg-secondary-container transition-all inline-block"
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
        className="absolute left-md top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 p-sm rounded-full text-white transition-colors"
        onClick={() => moveSlide(-1)}
        aria-label="Previous slide"
      >
        <Icon name="chevron_left" className="text-4xl" />
      </button>
      <button
        className="absolute right-md top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 p-sm rounded-full text-white transition-colors"
        onClick={() => moveSlide(1)}
        aria-label="Next slide"
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

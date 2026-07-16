import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HeroCarousel from './components/HeroCarousel'
import ShortcutMenu from './components/ShortcutMenu'
import Announcements from './components/Announcements'
import Newsletter from './components/Newsletter'
import Footer from './components/Footer'
import Panduan from './pages/Panduan'
import Regulasi from './pages/Regulasi'
import Pengumuman from './pages/Pengumuman'
import Kontak from './pages/Kontak'
import PanduanLpse from './pages/PanduanLpse'
import PengumumanDetail from './pages/PengumumanDetail'

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="bg-background text-on-surface min-h-screen">
            <Header />
            <main className="pt-16">
              {/* Enhanced Hero Section with Slideshow */}
              <section className="relative">
                <HeroCarousel />
              </section>

              <ShortcutMenu />
              <Announcements />
              <Newsletter />
            </main>
            <Footer />
          </div>
        }
      />
      <Route path="/panduan" element={<Panduan />} />
      <Route path="/regulasi" element={<Regulasi />} />
      <Route path="/pengumuman" element={<Pengumuman />} />
      <Route path="/pengumuman/:id" element={<PengumumanDetail />} />
      <Route path="/kontak" element={<Kontak />} />
      <Route path="/panduan-lpse" element={<PanduanLpse />} />
    </Routes>
  )
}

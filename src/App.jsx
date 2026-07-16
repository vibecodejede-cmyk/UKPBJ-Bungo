import Header from './components/Header'
import HeroCarousel from './components/HeroCarousel'
import SearchBar from './components/SearchBar'
import ShortcutMenu from './components/ShortcutMenu'
import Announcements from './components/Announcements'
import Newsletter from './components/Newsletter'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="bg-background text-on-surface min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Enhanced Hero Section with Slideshow */}
        <section className="relative">
          <HeroCarousel />
          <SearchBar />
        </section>

        <ShortcutMenu />
        <Announcements />
        <Newsletter />
      </main>
      <Footer />
    </div>
  )
}

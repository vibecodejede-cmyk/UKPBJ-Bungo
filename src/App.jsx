import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CoreServices from './components/CoreServices'
import News from './components/News'
import CTA from './components/CTA'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-secondary-container">
      <Navbar />
      <main>
        <Hero />
        <CoreServices />
        <News />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

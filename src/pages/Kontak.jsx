import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import Footer from '../components/Footer'

const contactInfo = [
  {
    icon: 'location_on',
    iconBg: 'bg-primary text-on-primary',
    title: 'Alamat Kantor',
    lines: ['Jl. Bhayangkara No. 1, Pasar Bungo', 'Kabupaten Bungo, Jambi 37211'],
  },
  {
    icon: 'call',
    iconBg: 'bg-secondary text-on-secondary',
    title: 'Telepon',
    lines: ['(0741) 123456', 'Call Center 1500 119'],
  },
  {
    icon: 'mail',
    iconBg: 'bg-tertiary-container text-on-tertiary-container',
    title: 'Email',
    lines: ['helpdesk@inaproc.id', 'info@ukpbj-bungo.go.id'],
  },
  {
    icon: 'schedule',
    iconBg: 'bg-primary-container text-on-primary-container',
    title: 'Jam Operasional',
    lines: ['Senin - Jumat: 08.00 - 16.00 WIB', 'Sabtu - Minggu: Tutup'],
  },
]

export default function Kontak() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-16">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
            UKPBJ Kabupaten Bungo
          </Link>
          <nav className="hidden md:flex items-center space-x-lg">
            <Link
              to="/"
              className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              Beranda
            </Link>
            <Link
              to="/panduan"
              className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              Panduan
            </Link>
            <Link
              to="/regulasi"
              className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              Regulasi
            </Link>
            <Link
              to="/pengumuman"
              className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              Pengumuman
            </Link>
            <Link
              to="/kontak"
              className="font-label-md text-label-md text-primary border-b-2 border-primary pb-1 transition-colors duration-200"
            >
              Kontak
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary py-xl">
          <div className="max-w-container-max mx-auto px-gutter text-center md:text-left">
            <h1 className="font-display-lg text-display-lg text-on-primary mb-base">Hubungi Kami</h1>
            <p className="font-body-lg text-body-lg text-primary-fixed max-w-2xl">
              Punya pertanyaan terkait pengadaan barang/jasa? Tim UKPBJ Kabupaten Bungo siap membantu Anda.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-container-max mx-auto px-gutter py-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            {/* Contact Form */}
            <div className="bg-surface border border-outline-variant rounded-xl p-lg institutional-shadow">
              <h2 className="font-headline-md text-headline-md text-primary mb-md">Kirim Pesan</h2>
              {submitted ? (
                <div className="bg-surface-container-lowest border border-primary rounded-lg p-lg text-center">
                  <Icon name="check_circle" className="text-primary text-[48px]" />
                  <p className="font-headline-sm text-headline-sm text-primary mt-md">
                    Pesan Anda telah terkirim!
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-sm">
                    Terima kasih, kami akan merespons melalui email Anda sesegera mungkin.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setForm({ name: '', email: '', subject: '', message: '' })
                    }}
                    className="mt-md bg-secondary text-on-secondary px-lg py-sm rounded-lg font-label-md text-label-md hover:bg-secondary-container transition-all"
                  >
                    Kirim Pesan Lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-md">
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="name">
                      Nama Lengkap
                    </label>
                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all bg-surface"
                      placeholder="Nama Anda"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all bg-surface"
                      placeholder="alamat@email.com"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="subject">
                      Subjek
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all bg-surface"
                      placeholder="Subjek pesan"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="message">
                      Pesan
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all bg-surface resize-none"
                      placeholder="Tulis pesan Anda di sini..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-secondary text-on-secondary px-lg py-md rounded-lg font-label-md text-label-md hover:bg-secondary-container transition-all flex items-center justify-center gap-sm"
                  >
                    <Icon name="send" className="text-[18px]" />
                    Kirim Pesan
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-md">
              {contactInfo.map((info) => (
                <div
                  key={info.title}
                  className="flex items-start gap-md p-lg bg-surface-container-lowest border border-outline-variant rounded-xl institutional-shadow"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${info.iconBg}`}>
                    <Icon name={info.icon} />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-primary mb-xs">{info.title}</h3>
                    {info.lines.map((line) => (
                      <p key={line} className="font-body-sm text-body-sm text-on-surface-variant">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              {/* Map placeholder */}
              <div className="h-48 rounded-xl border border-outline-variant overflow-hidden bg-surface-variant flex items-center justify-center">
                <div className="text-center text-on-surface-variant">
                  <Icon name="map" className="text-[48px]" />
                  <p className="font-label-sm text-label-sm mt-sm">Peta Lokasi Kantor UKPBJ Bungo</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

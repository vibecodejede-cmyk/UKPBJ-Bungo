import { useState } from 'react'
import Icon from '../components/Icon'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { submitContactMessage } from '../lib/api'

const contactInfo = [
  {
    icon: 'location_on',
    iconBg: 'bg-primary text-on-primary',
    title: 'Alamat Kantor',
    lines: ['Jl. R.M. Thaher Nomor 503 Rimbo Tengah', 'Kabupaten Bungo, Jambi 37214'],
  },
  {
    icon: 'mail',
    iconBg: 'bg-tertiary-container text-on-tertiary-container',
    title: 'Email',
    lines: ['helpdesk.lpse.bungokab@gmail.com', 'pbjbungo@gmail.com'],
  },
  {
    icon: 'schedule',
    iconBg: 'bg-primary-container text-on-primary-container',
    title: 'Jam Operasional',
    lines: ['Senin - Kamis: 08.00 - 16.00 WIB', 'Jumat: 08.00 - 11.00', 'Sabtu - Minggu: Tutup'],
  },
]

// Field limits (security / abuse prevention)
const LIMITS = {
  name: 60,
  email: 120,
  subject: 120,
  message: 2000,
}

// Basic sanitizer: trim + collapse excessive whitespace + cap length.
function sanitize(value, max) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

// Per-field validation. Returns an errors object (empty = valid).
function validate(values) {
  const errors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const subject = values.subject.trim()
  const message = values.message.trim()

  if (!name) {
    errors.name = 'Nama lengkap wajib diisi.'
  } else if (name.length < 3) {
    errors.name = 'Nama minimal 3 karakter.'
  } else if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
    errors.name = 'Nama hanya boleh berisi huruf, spasi, titik, dan tanda hubung.'
  }

  if (!email) {
    errors.email = 'Email wajib diisi.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Format email tidak valid.'
  }

  if (!subject) {
    errors.subject = 'Subjek wajib diisi.'
  } else if (subject.length < 3) {
    errors.subject = 'Subjek minimal 3 karakter.'
  }

  if (!message) {
    errors.message = 'Pesan wajib diisi.'
  } else if (message.length < 10) {
    errors.message = 'Pesan minimal 10 karakter.'
  }

  return errors
}

export default function Kontak() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    // Enforce max length per field as the user types (security guard)
    setForm((prev) => ({ ...prev, [name]: value.slice(0, LIMITS[name] || 2000) }))
    // Clear a field's error as the user corrects it
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSendError(null)

    const sanitized = {
      name: sanitize(form.name, LIMITS.name),
      email: sanitize(form.email, LIMITS.email),
      subject: sanitize(form.subject, LIMITS.subject),
      message: sanitize(form.message, LIMITS.message),
    }

    const validationErrors = validate(sanitized)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSending(true)
    try {
      await submitContactMessage(sanitized.name, sanitized.email, sanitized.subject, sanitized.message)
      setSubmitted(true)
    } catch (err) {
      setSendError(err.message || 'Gagal mengirim pesan. Coba lagi.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow pt-16">
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
                <form onSubmit={handleSubmit} className="space-y-md" noValidate>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="name">
                      Nama Lengkap <span className="text-error">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      maxLength={LIMITS.name}
                      required
                      aria-invalid={!!errors.name}
                      className={`w-full px-md py-sm border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all bg-surface ${
                        errors.name ? 'border-error' : 'border-outline-variant'
                      }`}
                      placeholder="Nama Anda"
                      type="text"
                    />
                    {errors.name && (
                      <p className="mt-xs font-label-sm text-label-sm text-error">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="email">
                      Email <span className="text-error">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      maxLength={LIMITS.email}
                      required
                      aria-invalid={!!errors.email}
                      className={`w-full px-md py-sm border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all bg-surface ${
                        errors.email ? 'border-error' : 'border-outline-variant'
                      }`}
                      placeholder="alamat@email.com"
                      type="email"
                    />
                    {errors.email && (
                      <p className="mt-xs font-label-sm text-label-sm text-error">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="subject">
                      Subjek <span className="text-error">*</span>
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      maxLength={LIMITS.subject}
                      required
                      aria-invalid={!!errors.subject}
                      className={`w-full px-md py-sm border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all bg-surface ${
                        errors.subject ? 'border-error' : 'border-outline-variant'
                      }`}
                      placeholder="Subjek pesan"
                      type="text"
                    />
                    {errors.subject && (
                      <p className="mt-xs font-label-sm text-label-sm text-error">{errors.subject}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="message">
                      Pesan <span className="text-error">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      maxLength={LIMITS.message}
                      required
                      rows={4}
                      aria-invalid={!!errors.message}
                      className={`w-full px-md py-sm border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all bg-surface resize-none ${
                        errors.message ? 'border-error' : 'border-outline-variant'
                      }`}
                      placeholder="Tulis pesan Anda di sini (minimal 10 karakter)..."
                    />
                    <div className="flex justify-between mt-xs">
                      {errors.message ? (
                        <p className="font-label-sm text-label-sm text-error">{errors.message}</p>
                      ) : (
                        <span />
                      )}
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {form.message.length}/{LIMITS.message}
                      </span>
                    </div>
                  </div>
                  {sendError && (
                    <div className="bg-error-container text-on-error-container border border-error rounded-lg p-md font-body-sm">
                      {sendError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-secondary text-on-secondary px-lg py-md rounded-lg font-label-md text-label-md hover:bg-secondary-container transition-all flex items-center justify-center gap-sm disabled:opacity-60"
                  >
                    <Icon name="send" className="text-[18px]" />
                    {sending ? 'Mengirim...' : 'Kirim Pesan'}
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

              {/* Map */}
              <div className="h-64 rounded-xl border border-outline-variant overflow-hidden bg-surface-variant">
                <iframe
                  title="Peta Lokasi Kantor UKPBJ Bungo"
                  className="w-full h-full border-0"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=102.11728748058219%2C-1.5181256968702204%2C102.12128748058219%2C-1.5141256968702204&layer=mapnik&marker=-1.5161256968702204%2C102.11928748058219"
                  allow="geolocation; fullscreen"
                />
                <div className="flex items-center justify-between gap-md px-md py-sm bg-surface border-t border-outline-variant">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Peta Lokasi Kantor UKPBJ Bungo
                  </span>
                  <a
                    href="https://www.openstreetmap.org/?mlat=-1.5161256968702204&mlon=102.11928748058219#map=17/-1.5161256968702204/102.11928748058219"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-xs text-secondary font-label-sm text-label-sm hover:underline"
                  >
                    <Icon name="open_in_new" className="text-[18px]" />
                    Buka di Peta
                  </a>
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

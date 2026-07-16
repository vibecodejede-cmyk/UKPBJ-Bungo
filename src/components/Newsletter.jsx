import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')

    // Simulasi pengiriman ke backend
    // Nanti ganti dengan API call ke endpoint newsletter subscription
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Validasi sederhana
    if (email && email.includes('@') && email.includes('.')) {
      setStatus('success')
      setEmail('')
    } else {
      setStatus('error')
    }
  }

  return (
    <section className="py-xl">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="bg-primary p-xl rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-lg">
            <div className="text-center lg:text-left">
              <h2 className="font-headline-lg text-headline-lg text-on-primary mb-xs">Dapatkan Update Terkini</h2>
              <p className="font-body-lg text-body-lg text-primary-fixed">
                Daftarkan email Anda untuk berlangganan info pengadaan dan regulasi terbaru.
              </p>
            </div>
            <div className="w-full lg:w-auto">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-sm">
                <input
                  className="px-lg py-md rounded-lg border-none focus:ring-secondary w-full sm:w-80"
                  placeholder="Alamat email Anda"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (status !== 'idle') setStatus('idle')
                  }}
                  disabled={status === 'loading'}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-secondary text-on-secondary px-xl py-md rounded-lg font-label-md text-label-md hover:bg-secondary-container transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Mengirim...' : 'Berlangganan'}
                </button>
              </form>
              {status === 'success' && (
                <p className="mt-sm text-sm text-green-300 font-label-sm">
                  Berhasil! Email Anda telah terdaftar untuk menerima update.
                </p>
              )}
              {status === 'error' && (
                <p className="mt-sm text-sm text-red-300 font-label-sm">
                  Mohon masukkan alamat email yang valid.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

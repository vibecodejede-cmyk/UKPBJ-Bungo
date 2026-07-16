export default function Newsletter() {
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
            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-sm">
              <input
                className="px-lg py-md rounded-lg border-none focus:ring-secondary w-full sm:w-80"
                placeholder="Alamat email Anda"
                type="email"
              />
              <button className="bg-secondary text-on-secondary px-xl py-md rounded-lg font-label-md text-label-md hover:bg-secondary-container transition-all">
                Berlangganan
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

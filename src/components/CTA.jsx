export default function CTA() {
  return (
    <section className="py-24 bg-surface-container-low overflow-hidden">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="bg-primary text-white p-12 lg:p-20 relative rounded-xl shadow-2xl overflow-hidden">
          <div
            className="absolute top-0 right-0 w-1/3 h-full opacity-10 bg-no-repeat bg-right"
            style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}
          ></div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-headline-lg text-headline-lg mb-6">Masih Memiliki Pertanyaan Terkait Pengadaan?</h2>
            <p className="font-body-lg text-body-lg text-blue-100 mb-10">
              Tim ahli kami di seluruh Indonesia siap membantu Anda memastikan proses pengadaan berjalan sesuai koridor
              hukum dan efisien.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-[#C5A059] text-on-secondary-fixed font-bold py-4 px-8 rounded shadow-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">near_me</span>
                Hubungi LPSE Terdekat
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

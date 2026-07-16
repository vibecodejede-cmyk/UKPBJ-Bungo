import { useRef, useState } from 'react'
import Icon from './Icon'

const popularTags = [
  { label: 'Perpres No. 12 Tahun 2021', href: '#' },
  { label: 'E-Katalog v5.0', href: '#' },
  { label: 'Panduan LPSE', href: '#' },
]

export default function SearchBar() {
  const [focused, setFocused] = useState(false)
  const wrapperRef = useRef(null)

  return (
    <div className="relative z-30 -mt-24 max-w-container-max mx-auto px-gutter">
      <div
        ref={wrapperRef}
        className={`bg-white p-base rounded-xl institutional-shadow border border-outline-variant flex items-center max-w-3xl mx-auto lg:mx-0 transition-all ${
          focused ? 'ring-2 ring-primary ring-offset-2' : ''
        }`}
      >
        <div className="flex-1 flex items-center px-md">
          <Icon name="manage_search" className="text-primary text-2xl mr-sm" />
          <input
            className="w-full border-none focus:ring-0 font-body-md text-body-md text-on-surface py-lg"
            placeholder="Cari panduan teknis, Perpres, atau regulasi LKPP..."
            type="text"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>
        <button className="bg-primary text-on-primary px-xl py-lg rounded-lg font-label-md text-label-md hover:bg-primary-container transition-all flex items-center gap-sm">
          <Icon name="search" />
          <span>Cari Sekarang</span>
        </button>
      </div>

      <div className="mt-lg flex flex-wrap gap-md justify-center lg:justify-start">
        <span className="text-label-sm font-label-sm text-on-surface-variant bg-surface px-sm py-1 rounded">Populer:</span>
        {popularTags.map((tag) => (
          <a
            key={tag.label}
            className="text-label-sm font-label-sm text-secondary hover:underline bg-surface px-sm py-1 rounded"
            href={tag.href}
          >
            {tag.label}
          </a>
        ))}
      </div>
    </div>
  )
}

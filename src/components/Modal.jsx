import { useEffect } from 'react'
import Icon from './Icon'

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-outline-variant rounded-xl institutional-shadow max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-lg border-b border-outline-variant">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-variant transition-colors"
          >
            <Icon name="close" className="text-on-surface-variant" />
          </button>
        </div>
        <div className="p-lg overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

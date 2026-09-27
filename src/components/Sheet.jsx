import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './Sheet.css'

export default function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="sheet__backdrop"
        aria-label="Хаах"
        onClick={onClose}
      />
      <div className="sheet__panel">
        <div className="sheet__handle" aria-hidden />
        <div className="sheet__head">
          <h3>{title}</h3>
          <button type="button" className="sheet__close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="sheet__body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

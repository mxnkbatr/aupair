import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './Sheet.css'

const CLOSE_MS = 220
const SNAP = 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)'

export default function Sheet({ open, onClose, title, children }) {
  const panelRef = useRef(null)
  const backdropRef = useRef(null)
  const closeTimer = useRef(null)
  const onCloseRef = useRef(onClose)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const close = useCallback(() => {
    if (closeTimer.current) return
    setClosing(true)
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null
      setClosing(false)
      onCloseRef.current?.()
    }, CLOSE_MS)
  }, [])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  useEffect(() => {
    const panel = panelRef.current
    if (!open || !panel) return undefined
    let drag = null

    function onStart(e) {
      if (e.touches.length !== 1) return
      const fromHandle = e.target.closest('.sheet__handle, .sheet__head')
      drag = {
        y0: e.touches[0].clientY,
        allowed: fromHandle || panel.scrollTop <= 0,
        active: false,
        dy: 0,
        t: e.timeStamp,
        v: 0,
      }
    }

    function onMove(e) {
      if (!drag?.allowed) return
      const dy = e.touches[0].clientY - drag.y0
      if (!drag.active) {
        if (dy < -6) drag.allowed = false
        if (dy <= 6) return
        drag.active = true
        panel.style.transition = 'none'
      }
      e.preventDefault()
      const y = Math.max(0, dy)
      drag.v = (y - drag.dy) / Math.max(1, e.timeStamp - drag.t)
      drag.t = e.timeStamp
      drag.dy = y
      panel.style.transform = `translate3d(0, ${y}px, 0)`
      if (backdropRef.current) {
        backdropRef.current.style.opacity = String(1 - Math.min(1, y / panel.offsetHeight))
      }
    }

    function onEnd() {
      const d = drag
      drag = null
      if (!d?.active) return
      const dismiss = d.dy > panel.offsetHeight * 0.3 || d.v > 0.6
      panel.style.transition = SNAP
      if (backdropRef.current) {
        backdropRef.current.style.transition = 'opacity 0.28s ease'
        backdropRef.current.style.opacity = dismiss ? '0' : ''
      }
      if (!dismiss) {
        panel.style.transform = ''
        return
      }
      panel.style.transform = 'translate3d(0, 100%, 0)'
      setTimeout(() => onCloseRef.current?.(), 240)
    }

    panel.addEventListener('touchstart', onStart, { passive: true })
    panel.addEventListener('touchmove', onMove, { passive: false })
    panel.addEventListener('touchend', onEnd)
    panel.addEventListener('touchcancel', onEnd)
    return () => {
      panel.removeEventListener('touchstart', onStart)
      panel.removeEventListener('touchmove', onMove)
      panel.removeEventListener('touchend', onEnd)
      panel.removeEventListener('touchcancel', onEnd)
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className={`sheet${closing ? ' is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        ref={backdropRef}
        type="button"
        className="sheet__backdrop"
        aria-label="Хаах"
        onClick={close}
      />
      <div className="sheet__panel" ref={panelRef}>
        <div className="sheet__handle" aria-hidden />
        <div className="sheet__head">
          <h3>{title}</h3>
          <button type="button" className="sheet__close" onClick={close}>
            ✕
          </button>
        </div>
        <div className="sheet__body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

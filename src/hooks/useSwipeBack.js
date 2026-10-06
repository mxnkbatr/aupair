import { useEffect, useLayoutEffect, useRef } from 'react'

const EDGE = 28
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'
const SETTLE_MS = 300

/**
 * iOS edge swipe: drag the current page right to reveal the previous one underneath.
 * `onStart` renders the underlay, `onFinish(done)` either navigates back or cancels.
 */
export default function useSwipeBack({ enabled, canStart, pageRef, underRef, onStart, onFinish }) {
  const opts = useRef({ enabled, canStart, onStart, onFinish })

  useLayoutEffect(() => {
    opts.current = { enabled, canStart, onStart, onFinish }
  })

  useEffect(() => {
    const root = document.documentElement
    let g = null
    let settling = false

    function paint(x, animate) {
      const w = window.innerWidth
      const r = Math.min(1, x / w)
      const transition = animate ? `transform ${SETTLE_MS}ms ${EASE}, filter ${SETTLE_MS}ms ${EASE}` : 'none'
      const page = pageRef.current
      if (page) {
        page.style.transition = transition
        page.style.transform = `translate3d(${x}px, 0, 0)`
      }
      const under = underRef.current
      if (under) {
        under.style.transition = transition
        under.style.transform = `translate3d(${-30 * (1 - r)}%, 0, 0)`
        under.style.filter = `brightness(${0.92 + 0.08 * r})`
      }
    }

    function onTouchStart(e) {
      const o = opts.current
      if (!o.enabled || e.touches.length !== 1 || g || settling) return
      if (document.body.style.overflow === 'hidden') return
      if (document.querySelector('[data-vaul-drawer], .auth, .story-viewer')) return
      const t = e.touches[0]
      if (t.clientX > EDGE || !o.canStart()) return
      g = { x0: t.clientX, y0: t.clientY, active: false, x: 0, t: e.timeStamp, v: 0 }
    }

    function onTouchMove(e) {
      if (!g) return
      const t = e.touches[0]
      const dx = t.clientX - g.x0
      const dy = t.clientY - g.y0
      if (!g.active) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
        if (dx <= 0 || Math.abs(dy) > Math.abs(dx)) {
          g = null
          return
        }
        g.active = true
        root.dataset.swipe = ''
        opts.current.onStart()
      }
      e.preventDefault()
      const x = Math.max(0, dx)
      g.v = (x - g.x) / Math.max(1, e.timeStamp - g.t)
      g.t = e.timeStamp
      g.x = x
      paint(x, false)
    }

    function onTouchEnd() {
      const gesture = g
      g = null
      if (!gesture?.active) return
      const w = window.innerWidth
      const done = gesture.x > w * 0.35 || gesture.v > 0.45
      paint(done ? w : 0, true)
      settling = true
      setTimeout(() => {
        settling = false
        delete root.dataset.swipe
        opts.current.onFinish(done)
      }, SETTLE_MS)
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [pageRef, underRef])
}

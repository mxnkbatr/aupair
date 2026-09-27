import { useEffect, useRef, useState } from 'react'
import { haptic } from '../native'

const THRESHOLD = 64
const MAX_PULL = 110

export default function usePullToRefresh(onRefresh, enabled = true) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const start = useRef(null)
  const distance = useRef(0)
  const callback = useRef(onRefresh)

  useEffect(() => {
    callback.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    if (!enabled) return undefined

    function onStart(e) {
      const sheetOpen = document.body.style.overflow === 'hidden'
      const t = e.touches[0]
      start.current = window.scrollY <= 0 && !sheetOpen ? { x: t.clientX, y: t.clientY } : null
    }

    function onMove(e) {
      if (start.current == null) return
      const t = e.touches[0]
      const dx = t.clientX - start.current.x
      const dy = t.clientY - start.current.y
      if ('swipe' in document.documentElement.dataset || (distance.current === 0 && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy))) {
        start.current = null
        distance.current = 0
        setPull(0)
        return
      }
      const next = dy > 0 ? Math.min(MAX_PULL, dy * 0.5) : 0
      if (distance.current < THRESHOLD && next >= THRESHOLD) haptic()
      distance.current = next
      setPull(next)
    }

    async function onEnd() {
      if (start.current == null) return
      start.current = null
      const reached = distance.current >= THRESHOLD
      distance.current = 0
      setPull(0)
      if (!reached) return
      setRefreshing(true)
      try {
        await callback.current()
      } finally {
        setRefreshing(false)
      }
    }

    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onEnd)
    window.addEventListener('touchcancel', onEnd)
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('touchcancel', onEnd)
    }
  }, [enabled])

  return { pull, refreshing, ready: pull >= THRESHOLD }
}

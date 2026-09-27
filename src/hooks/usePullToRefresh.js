import { useEffect, useRef, useState } from 'react'
import { haptic } from '../native'

const THRESHOLD = 64
const MAX_PULL = 110

export default function usePullToRefresh(onRefresh) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(null)
  const distance = useRef(0)
  const callback = useRef(onRefresh)

  useEffect(() => {
    callback.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    function onStart(e) {
      const sheetOpen = document.body.style.overflow === 'hidden'
      startY.current = window.scrollY <= 0 && !sheetOpen ? e.touches[0].clientY : null
    }

    function onMove(e) {
      if (startY.current == null) return
      const dy = e.touches[0].clientY - startY.current
      const next = dy > 0 ? Math.min(MAX_PULL, dy * 0.5) : 0
      if (distance.current < THRESHOLD && next >= THRESHOLD) haptic()
      distance.current = next
      setPull(next)
    }

    async function onEnd() {
      if (startY.current == null) return
      startY.current = null
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
  }, [])

  return { pull, refreshing, ready: pull >= THRESHOLD }
}

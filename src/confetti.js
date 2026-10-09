import confetti from 'canvas-confetti'

const COLORS = ['#e8173f', '#12c6c1', '#ffc83d']

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Brand-colored celebration burst. No-op when the user prefers reduced motion. */
export function celebrate({ big = false } = {}) {
  if (reduced()) return
  const base = { colors: COLORS, disableForReducedMotion: true, zIndex: 400, ticks: 180 }
  confetti({ ...base, particleCount: big ? 120 : 70, spread: 70, origin: { y: 0.7 } })
  if (big) {
    setTimeout(() => {
      confetti({ ...base, particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.75 } })
      confetti({ ...base, particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.75 } })
    }, 180)
  }
}

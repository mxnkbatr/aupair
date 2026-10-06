import { useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { CaretLeft } from '@phosphor-icons/react'
import { haptic } from '../native'
import './NavBar.css'

const COLLAPSE_AT = 52

/**
 * iOS-style navigation bar (mobile).
 * - Tab roots (`root`): the page owns the Large Title; a compact centered title fades in after 52px of scroll.
 * - Push screens: chevron + back label, centered title, optional trailing actions.
 * - `transparent`: floats over a hero image, turns solid once scrolled.
 * - `minimal`: only safe-area + blur on scroll (Home has its own header).
 */
export default function NavBar({
  title = '',
  root = false,
  minimal = false,
  transparent = false,
  backLabel = 'Буцах',
  onBack,
  trailing = null,
}) {
  const { scrollY } = useScroll()
  const progress = useTransform(scrollY, [0, COLLAPSE_AT], [0, 1], { clamp: true })
  const [solid, setSolid] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const next = y > COLLAPSE_AT
    setSolid((prev) => (prev === next ? prev : next))
  })

  // Push screens with an opaque bar always show their title and background.
  const staticBar = !root && !transparent && !minimal
  const bgOpacity = staticBar ? 1 : progress
  const titleOpacity = staticBar ? 1 : progress

  const className = [
    'navbar',
    root && 'navbar--root',
    minimal && 'navbar--minimal',
    transparent && 'navbar--transparent',
    (solid || staticBar) && 'is-solid',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className={className}>
      <motion.div className="navbar__bg" style={{ opacity: bgOpacity }} aria-hidden />
      {!minimal && (
        <div className="navbar__row">
          <div className="navbar__side navbar__side--left">
            {!root && (
              <button
                type="button"
                className="navbar__back"
                onClick={() => {
                  haptic('light')
                  onBack?.()
                }}
                aria-label={backLabel}
              >
                <CaretLeft weight="bold" size={22} aria-hidden />
                <span>{backLabel}</span>
              </button>
            )}
          </div>
          <motion.div
            className="navbar__title"
            style={{ opacity: titleOpacity }}
            aria-hidden={root || undefined}
          >
            {title}
          </motion.div>
          <div className="navbar__side navbar__side--right">{trailing}</div>
        </div>
      )}
    </header>
  )
}

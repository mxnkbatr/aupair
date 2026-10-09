import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { BookOpenText, GlobeHemisphereEast, House, UserCircle } from '@phosphor-icons/react'
import { haptic } from '../native'
import './TabBar.css'

export const TAB_ITEMS = [
  { to: '/', label: 'Нүүр', icon: House },
  { to: '/learn', label: 'Сурах', icon: BookOpenText },
  { to: '/countries', label: 'Улсууд', icon: GlobeHemisphereEast },
  { to: '/me', label: 'Би', icon: UserCircle },
]

export const TAB_PATHS = TAB_ITEMS.map((t) => t.to)

export default function TabBar() {
  const { pathname } = useLocation()
  const reduce = useReducedMotion()
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!TAB_PATHS.includes(pathname)) return undefined
    setHidden(false)
    let last = window.scrollY
    function onScroll() {
      const y = Math.max(0, window.scrollY)
      const delta = y - last
      if (y < 48) setHidden(false)
      else if (delta > 10) setHidden(true)
      else if (delta < -8) setHidden(false)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  if (!TAB_PATHS.includes(pathname)) return null

  function onTap(e, to) {
    haptic('selection')
    if (pathname !== to) return
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' })
  }

  return (
    <nav className={hidden ? 'tabbar is-hidden' : 'tabbar'} aria-label="Үндсэн цэс">
      {TAB_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          onClick={(e) => onTap(e, to)}
          className={({ isActive }) => (isActive ? 'tabbar__item is-active' : 'tabbar__item')}
        >
          {({ isActive }) => (
            <>
              {isActive && !reduce ? (
                <motion.span
                  layoutId="tabbar-pill"
                  className="tabbar__pill"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              ) : isActive ? (
                <span className="tabbar__pill" />
              ) : null}
              <motion.span
                className="tabbar__icon"
                animate={{ scale: isActive && !reduce ? [0.9, 1.06, 1] : 1 }}
                whileTap={reduce ? undefined : { scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              >
                <Icon size={24} weight={isActive ? 'fill' : 'regular'} aria-hidden />
              </motion.span>
              {isActive ? <span className="tabbar__label">{label}</span> : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

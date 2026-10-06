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

  if (!TAB_PATHS.includes(pathname)) return null

  function onTap(e, to) {
    haptic('selection')
    if (pathname !== to) return
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' })
  }

  return (
    <nav className="tabbar" aria-label="Үндсэн цэс">
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
              <motion.span
                className="tabbar__icon"
                animate={{ scale: isActive && !reduce ? [0.9, 1.08, 1] : 1 }}
                whileTap={reduce ? undefined : { scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              >
                <Icon size={26} weight={isActive ? 'fill' : 'regular'} aria-hidden />
              </motion.span>
              <span className="tabbar__label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

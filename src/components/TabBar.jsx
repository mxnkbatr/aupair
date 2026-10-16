import { NavLink, useLocation } from 'react-router-dom'
import {
  BookOpenText,
  GlobeHemisphereEast,
  Newspaper,
  Storefront,
} from '@phosphor-icons/react'
import { haptic } from '../native'
import './TabBar.css'

export const TAB_ITEMS = [
  { to: '/news', label: 'Мэдээ', icon: Newspaper },
  { to: '/learn', label: 'Сургалт', icon: BookOpenText },
  { to: '/countries', label: 'Au Pair', icon: GlobeHemisphereEast },
  { to: '/shop', label: 'Дэлгүүр', icon: Storefront },
]

export const TAB_PATHS = TAB_ITEMS.map((t) => t.to)

/** Dock харагдах үндсэн хуудсууд (detail/push биш). */
export function isDockRoute(pathname) {
  if (TAB_PATHS.includes(pathname)) return true
  if (pathname === '/' || pathname === '/me') return true
  return false
}

export default function TabBar() {
  const { pathname } = useLocation()

  if (!isDockRoute(pathname)) return null

  function onTap(e, to) {
    haptic('selection')
    if (pathname !== to) return
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <nav className="tabbar" aria-label="Үндсэн цэс">
      {TAB_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          aria-label={label}
          onClick={(e) => onTap(e, to)}
          className={({ isActive }) => (isActive ? 'tabbar__item is-active' : 'tabbar__item')}
        >
          {({ isActive }) => (
            <>
              {isActive ? <span className="tabbar__pill" aria-hidden /> : null}
              <span className="tabbar__icon">
                <Icon size={22} weight={isActive ? 'fill' : 'regular'} aria-hidden />
              </span>
              <span className="tabbar__label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

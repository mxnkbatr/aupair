import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { CaretLeft, MagnifyingGlass, UserCircle } from '@phosphor-icons/react'
import { useAuth } from '../auth'
import { haptic } from '../native'
import NotificationMenu from './NotificationMenu'
import './NavBar.css'

const COLLAPSE_AT = 48

function initials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

/**
 * Root tabs: logo + flex search + notification + profile.
 * Push screens: back + centered title + trailing.
 */
export default function NavBar({
  title = '',
  root = false,
  largeTitle = false,
  transparent = false,
  backLabel = 'Буцах',
  onBack,
  trailing = null,
}) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { scrollY } = useScroll()
  const progress = useTransform(scrollY, [0, COLLAPSE_AT], [0, 1], { clamp: true })
  const [scrolled, setScrolled] = useState(false)
  const [query, setQuery] = useState('')

  useMotionValueEvent(scrollY, 'change', (y) => {
    const next = y > 6
    setScrolled((prev) => (prev === next ? prev : next))
  })

  const pushSolid = !root && !transparent
  const useSearchChrome = root && !transparent
  const titleAlways = pushSolid || (root && !largeTitle && !useSearchChrome)
  const bgOpacity = transparent ? progress : 1
  const titleOpacity = useSearchChrome ? 0 : titleAlways ? 1 : progress

  const className = [
    'navbar',
    root && 'navbar--root',
    useSearchChrome && 'navbar--search',
    largeTitle && 'navbar--large',
    transparent && 'navbar--transparent',
    (scrolled || pushSolid) && 'is-scrolled',
  ]
    .filter(Boolean)
    .join(' ')

  function openSearch(nextQuery = query) {
    haptic('light')
    if (pathname !== '/countries') {
      navigate('/countries')
    }
    window.dispatchEvent(new Event('aupair:countries-search-open'))
    if (nextQuery.trim()) {
      window.dispatchEvent(new CustomEvent('aupair:countries-search-query', { detail: nextQuery }))
    }
  }

  return (
    <header className={className}>
      <motion.div className="navbar__bg" style={{ opacity: bgOpacity }} aria-hidden />
      {useSearchChrome ? (
        <div className="navbar__shell">
          <Link to="/" className="navbar__logo" aria-label="Mongolian Au Pair">
            <img src="/logo.png" alt="" width={36} height={36} />
          </Link>

          <label className="navbar__search">
            <MagnifyingGlass size={18} weight="bold" aria-hidden />
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              placeholder="Хайх"
              value={query}
              aria-label="Хайх"
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => openSearch()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  openSearch(e.currentTarget.value)
                }
              }}
            />
          </label>

          <div className="navbar__actions">
            <NotificationMenu variant="icon" />
            <Link to="/me" className="navbar__avatar" aria-label="Би">
              {user ? initials(user.name) : <UserCircle size={22} weight="fill" aria-hidden />}
            </Link>
          </div>
        </div>
      ) : (
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
                <CaretLeft weight="bold" size={28} aria-hidden />
              </button>
            )}
          </div>
          <motion.div
            className="navbar__title"
            style={{ opacity: titleOpacity }}
            aria-hidden={largeTitle && !scrolled ? true : undefined}
          >
            {title}
          </motion.div>
          <div className="navbar__side navbar__side--right">{trailing}</div>
        </div>
      )}
    </header>
  )
}

import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { navLinks } from '../data'
import './AppHeader.css'

const TAB_ROOTS = ['/', '/learn', '/countries', '/me']

export default function AppHeader({ title, showBrand = false }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isTabRoot = TAB_ROOTS.includes(pathname)
  const canBack = !isTabRoot && !showBrand

  return (
    <header className="app-header">
      <div className="container app-header__inner">
        <div className="app-header__left">
          {canBack ? (
            <button
              type="button"
              className="app-header__icon app-header__back"
              onClick={() => navigate(-1)}
              aria-label="Буцах"
            >
              <BackIcon />
            </button>
          ) : null}
          <Link to="/" className="app-header__brand">
            <img src="/logo.png" alt="" />
            <strong>Au Pair</strong>
          </Link>
          {canBack && title ? <h1 className="app-header__page">{title}</h1> : null}
        </div>

        <nav className="app-header__nav" aria-label="Үндсэн цэс">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                isActive ? 'app-header__link is-active' : 'app-header__link'
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-header__right" />
      </div>
    </header>
  )
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M14.5 6.5 9 12l5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

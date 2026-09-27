import { NavLink } from 'react-router-dom'
import { navLinks, social } from '../data'
import './Navbar.css'

export default function Navbar() {
  return (
    <header className="topnav">
      <div className="container topnav__inner">
        <NavLink to="/" className="brand" aria-label="Mongolian Au Pair">
          <img src="/logo.png" alt="" className="brand__mark" />
          <span className="brand__text">
            <strong>Au Pair</strong>
            <small>Mongolian Au Pair</small>
          </span>
        </NavLink>

        <nav className="topnav__links" aria-label="Үндсэн цэс">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                isActive ? 'topnav__link is-active' : 'topnav__link'
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <a
          className="btn btn-primary topnav__cta"
          href={social.facebook}
          target="_blank"
          rel="noreferrer"
        >
          Холбоо барих
        </a>
      </div>
    </header>
  )
}

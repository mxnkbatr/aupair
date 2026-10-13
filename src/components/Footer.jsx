import { Link } from 'react-router-dom'
import { org, social } from '../data'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <div className="site-footer__brand">
            <img src="/logo.png" alt="Mongolian Au Pair" />
            <div>
              <strong>{org.legalName}</strong>
              <p>{org.tagline}</p>
            </div>
          </div>
          <p className="site-footer__lead">
            {org.aboutShort} IAPA (International Au Pair Association) гишүүн · {social.recommend}.
          </p>
          <p className="site-footer__lead">{social.address}</p>
        </div>

        <div>
          <h4>Цэс</h4>
          <div className="site-footer__links">
            <Link to="/learn">Сурах</Link>
            <Link to="/countries">Улсууд</Link>
            <Link to="/learn?tab=materials">Материал</Link>
            <Link to="/me/help">Холбоо барих</Link>
            <Link to="/privacy">Нууцлалын бодлого</Link>
            <a href={org.website} target="_blank" rel="noreferrer">
              mongolianaupair.com
            </a>
          </div>
        </div>

        <div>
          <h4>Холбоо</h4>
          <div className="site-footer__links">
            <a href={social.facebook} target="_blank" rel="noreferrer">
              Facebook / MongolianAuPair
            </a>
            <a href={social.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href={`tel:${social.phoneTel}`}>{social.phone}</a>
            <a href={`mailto:${social.email}`}>{social.email}</a>
            <span>
              {org.years} жил · {org.placed} оролцогч · {org.partnerCountries} улс
            </span>
          </div>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <span>
          © {new Date().getFullYear()} {org.name}. Бүх эрх хуулиар хамгаалагдсан.
        </span>
        <Link to="/privacy">Privacy Policy</Link>
      </div>
    </footer>
  )
}

import { Link } from 'react-router-dom'
import { social } from '../data'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <div className="site-footer__brand">
            <img src="/logo.svg" alt="Mongolian Au Pair" />
            <div>
              <strong>Mongolian Au Pair</strong>
              <p>Европ руу соёл солилцоо · 2005 оноос</p>
            </div>
          </div>
          <p className="site-footer__lead">
            1969 оны Олон Улсын Конвенцийн дагуу хэрэгжих албан ёсны Au Pair хөтөлбөр.
            {social.address}
          </p>
        </div>

        <div>
          <h4>Цэс</h4>
          <div className="site-footer__links">
            <Link to="/courses">Хөтөлбөр</Link>
            <Link to="/universities">Улс орнууд</Link>
            <Link to="/shop">Дэлгүүр</Link>
            <Link to="/profile">Холбоо барих</Link>
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
            <span>{social.address}</span>
          </div>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <span>© {new Date().getFullYear()} Mongolian Au Pair</span>
        <span>facebook.com/MongolianAuPair</span>
      </div>
    </footer>
  )
}

import { Link } from 'react-router-dom'
import { social } from '../data'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <div className="site-footer__brand">
            <img src="/logo.png" alt="ХАНЗ" />
            <div>
              <strong>Ханз Академи</strong>
              <p>Хятад хэлний академи · Улаанбаатар</p>
            </div>
          </div>
          <p className="site-footer__lead">
            HSK 1–5, эрчимжүүлсэн болон ганцаарчилсан сургалт. Union Building
            1204, СБД.
          </p>
        </div>

        <div>
          <h4>Цэс</h4>
          <div className="site-footer__links">
            <Link to="/courses">Сургалт</Link>
            <Link to="/universities">Их сургууль</Link>
            <Link to="/videos">Бичлэг</Link>
            <Link to="/shop">Дэлгүүр</Link>
            <Link to="/profile">Холбоо барих</Link>
          </div>
        </div>

        <div>
          <h4>Холбоо</h4>
          <div className="site-footer__links">
            <a href={social.facebook} target="_blank" rel="noreferrer">
              Facebook / HanzAcademy
            </a>
            <a href={`tel:${social.phoneTel}`}>{social.phone}</a>
            <a href={`tel:${social.phoneAltTel}`}>{social.phoneAlt}</a>
            <a href={`mailto:${social.email}`}>{social.email}</a>
            <span>{social.address}</span>
          </div>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <span>© {new Date().getFullYear()} Ханз Академи</span>
        <span>{social.followers} дагагч · facebook.com/HanzAcademy</span>
      </div>
    </footer>
  )
}

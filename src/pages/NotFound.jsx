import { Link, useNavigate } from 'react-router-dom'
import { Compass, House } from '@phosphor-icons/react'
import { social } from '../data'
import './NotFound.css'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="notfound container">
      <span className="notfound__icon">
        <Compass weight="duotone" size={56} aria-hidden />
      </span>
      <h1>Хуудас олдсонгүй</h1>
      <p>Таны хайсан хуудас байхгүй эсвэл зөөгдсөн байна. Нүүр хуудаснаас үргэлжлүүлээрэй.</p>
      <div className="notfound__actions">
        <Link to="/" replace className="btn btn-primary">
          <House weight="fill" size={18} aria-hidden /> Нүүр хуудас
        </Link>
        <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
          Буцах
        </button>
      </div>
      <a className="notfound__help" href={`tel:${social.phoneTel}`}>
        Тусламж хэрэгтэй юу? {social.phone}
      </a>
    </div>
  )
}

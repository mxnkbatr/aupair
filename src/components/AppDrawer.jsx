import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  Bell,
  Globe,
  Phone,
  Question,
  ShieldCheck,
  SignIn,
  X,
} from '@phosphor-icons/react'
import { useAuth } from '../auth'
import { org, social } from '../data'
import { haptic } from '../native'
import './AppDrawer.css'

export default function AppDrawer({ open, onClose }) {
  const { user } = useAuth()
  if (!open) return null

  return createPortal(
    <div className="app-drawer" role="dialog" aria-label="Цэс">
      <button type="button" className="app-drawer__backdrop" aria-label="Хаах" onClick={onClose} />
      <aside className="app-drawer__panel">
        <div className="app-drawer__top">
          <div className="app-drawer__brand">
            <img src="/logo.png" alt="" width={36} height={36} />
            <div>
              <strong>{org.name}</strong>
              <span>{org.tagline}</span>
            </div>
          </div>
          <button
            type="button"
            className="app-drawer__close"
            aria-label="Хаах"
            onClick={() => {
              haptic('light')
              onClose()
            }}
          >
            <X size={18} weight="bold" aria-hidden />
          </button>
        </div>

        <nav className="app-drawer__nav">
          <Link to="/me" onClick={onClose}>
            <SignIn size={20} weight="duotone" aria-hidden />
            {user ? 'Миний профайл' : 'Нэвтрэх / Бүртгэл'}
          </Link>
          <Link to="/me/help" onClick={onClose}>
            <Question size={20} weight="duotone" aria-hidden />
            Тусламж ба холбоо
          </Link>
          <Link to="/countries" onClick={onClose}>
            <Globe size={20} weight="duotone" aria-hidden />
            Au Pair улсууд
          </Link>
          <Link to="/privacy" onClick={onClose}>
            <ShieldCheck size={20} weight="duotone" aria-hidden />
            Нууцлалын бодлого
          </Link>
          <a href={`tel:${social.phoneTel}`} onClick={onClose}>
            <Phone size={20} weight="duotone" aria-hidden />
            {social.phone}
          </a>
          <a href={org.website} target="_blank" rel="noreferrer" onClick={onClose}>
            <Bell size={20} weight="duotone" aria-hidden />
            mongolianaupair.com
          </a>
        </nav>
      </aside>
    </div>,
    document.body,
  )
}

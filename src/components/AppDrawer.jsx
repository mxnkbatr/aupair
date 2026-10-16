import { Drawer } from 'vaul'
import { Link } from 'react-router-dom'
import {
  Info,
  Newspaper,
  Question,
  Storefront,
  X,
} from '@phosphor-icons/react'
import { org } from '../data'
import { haptic } from '../native'
import './AppDrawer.css'

const ITEMS = [
  { to: '/news', icon: Newspaper, label: 'Мэдээ' },
  { to: '/shop', icon: Storefront, label: 'Дэлгүүр' },
  { to: '/about', icon: Info, label: 'Бидний тухай' },
  { to: '/me/help', icon: Question, label: 'Холбоо барих' },
]

export default function AppDrawer({ open, onClose }) {
  function close() {
    haptic('light')
    onClose()
  }

  return (
    <Drawer.Root
      open={Boolean(open)}
      onOpenChange={(next) => {
        if (!next) onClose?.()
      }}
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="app-drawer__backdrop" />
        <Drawer.Content className="app-drawer__panel" aria-describedby={undefined}>
          <div className="app-drawer__grab" aria-hidden />

          <header className="app-drawer__head">
            <div>
              <p className="app-drawer__brand">{org.shortName || 'Au Pair'}</p>
              <Drawer.Title asChild>
                <h2>Бусад хэсгүүд</h2>
              </Drawer.Title>
            </div>
            <button type="button" className="app-drawer__x" aria-label="Хаах" onClick={close}>
              <X size={16} weight="bold" aria-hidden />
            </button>
          </header>

          <nav className="app-drawer__grid" aria-label="Бусад хэсгүүд">
            {ITEMS.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} className="app-drawer__tile" onClick={close}>
                <span className="app-drawer__glyph">
                  <Icon size={20} weight="fill" aria-hidden />
                </span>
                <strong>{label}</strong>
              </Link>
            ))}
          </nav>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

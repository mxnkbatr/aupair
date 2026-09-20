import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const items = [
  { to: '/', label: 'Нүүр', icon: HomeIcon },
  { to: '/courses', label: 'Хөтөлбөр', icon: BookIcon },
  { to: '/universities', label: 'Улс', icon: UniIcon },
  { to: '/shop', label: 'Дэлгүүр', icon: BagIcon },
  { to: '/profile', label: 'Холбоо', icon: UserIcon },
]

export default function BottomNav() {
  return (
    <nav className="bottomnav" aria-label="Үндсэн цэс">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            isActive ? 'bottomnav__item is-active' : 'bottomnav__item'
          }
        >
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden>
      <path
        d="M4.2 10.6 12 4.3l7.8 6.3V19a1.2 1.2 0 0 1-1.2 1.2h-4.4v-5.4H9.8v5.4H5.4A1.2 1.2 0 0 1 4.2 19v-8.4Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden>
      <path
        d="M5.2 5.6A2.2 2.2 0 0 1 7.4 3.4H19v14.8H7.4A2.2 2.2 0 0 0 5.2 20.4V5.6Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path d="M5.2 17.8h12.2" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
    </svg>
  )
}

function UniIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden>
      <path
        d="M3.8 10.2 12 6l8.2 4.2L12 14.4 3.8 10.2Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="M7.2 12.2V15.8c0 .7 2.1 2 4.8 2s4.8-1.3 4.8-2v-3.6"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden>
      <path
        d="M6.6 8.6h10.8l-.7 10.4a1.4 1.4 0 0 1-1.4 1.2H8.7a1.4 1.4 0 0 1-1.4-1.2L6.6 8.6Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 8.6V7.2a2.8 2.8 0 0 1 5.6 0v1.4"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden>
      <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.65" />
      <path
        d="M5.8 18.8c1.3-2.6 3.7-3.9 6.2-3.9s4.9 1.3 6.2 3.9"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </svg>
  )
}

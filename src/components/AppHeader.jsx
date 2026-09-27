import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { navLinks, social } from '../data'
import './AppHeader.css'

const NOTIFICATIONS = [
  {
    id: 'german-a1',
    type: 'course',
    title: 'Герман хэлний A1 анги — элсэлт',
    body: 'Анхан шатнаас · Au Pair бэлтгэл',
    time: 'A1',
    to: '/courses/german-a1',
  },
  {
    id: 'german-a2',
    type: 'course',
    title: 'Герман хэлний A2 анги — элсэлт',
    body: 'A1 төгссөн хүмүүст · виза, ярилцлагын бэлтгэл',
    time: 'A2',
    to: '/courses/german-a2',
  },
  {
    id: 'germany-aupair',
    type: 'uni',
    title: 'Герман Au Pair элсэлт',
    body: 'Гэр бүл, виза, хэлний бэлтгэл',
    time: 'DE',
    to: '/universities/germany',
  },
]

const READ_STORAGE = 'aupair-read-notifications'

function loadNotifications() {
  let read = []
  try {
    read = JSON.parse(localStorage.getItem(READ_STORAGE) || '[]')
  } catch {
    read = []
  }
  return NOTIFICATIONS.map((n) => ({ ...n, unread: !read.includes(n.id) }))
}

function saveRead(list) {
  const read = list.filter((n) => !n.unread).map((n) => n.id)
  try {
    localStorage.setItem(READ_STORAGE, JSON.stringify(read))
  } catch {
    // storage unavailable (private mode)
  }
}

const NOTIF_ICON = {
  course: 'DE',
  video: '▶',
  uni: 'AP',
}

export default function AppHeader({ title, showBrand = false }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState(loadNotifications)
  const notifRef = useRef(null)

  const canBack = !showBrand && title !== 'Au Pair'
  const unreadCount = notifications.filter((n) => n.unread).length

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setNotifOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!menuOpen && !notifOpen) return undefined
    const prev = document.body.style.overflow
    const lockScroll = menuOpen || (notifOpen && window.innerWidth < 900)
    if (lockScroll) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen, notifOpen])

  useEffect(() => {
    if (!notifOpen) return undefined
    function onPointer(e) {
      if (notifRef.current?.contains(e.target)) return
      if (e.target.closest?.('.app-notif-sheet')) return
      setNotifOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [notifOpen])

  function toggleNotif() {
    setNotifOpen((v) => {
      const next = !v
      if (next) {
        setMenuOpen(false)
      }
      return next
    })
  }

  function openNotif(item) {
    const next = notifications.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    setNotifications(next)
    saveRead(next)
    setNotifOpen(false)
    navigate(item.to)
  }

  function markAllRead() {
    const next = notifications.map((n) => ({ ...n, unread: false }))
    setNotifications(next)
    saveRead(next)
  }

  const notifPanel = (
    <div className="app-notif" role="dialog" aria-label="Мэдэгдэл">
      <div className="app-notif__head">
        <div>
          <strong>Мэдэгдэл</strong>
          {unreadCount > 0 ? (
            <p>{unreadCount} шинэ</p>
          ) : (
            <p>Бүгд уншсан</p>
          )}
        </div>
        {unreadCount > 0 ? (
          <button type="button" className="app-notif__read" onClick={markAllRead}>
            Бүгдийг унших
          </button>
        ) : null}
      </div>

      <div className="app-notif__list">
        {notifications.length === 0 ? (
          <div className="app-notif__empty">
            <BellIcon />
            <p>Шинэ мэдэгдэл алга</p>
          </div>
        ) : (
          notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.unread ? 'app-notif__item is-unread' : 'app-notif__item'}
              onClick={() => openNotif(item)}
            >
              <span className={`app-notif__avatar is-${item.type}`} aria-hidden>
                {NOTIF_ICON[item.type] || 'AP'}
              </span>
              <span className="app-notif__body">
                <strong>{item.title}</strong>
                <small>{item.body}</small>
              </span>
              <em>{item.time}</em>
              {item.unread ? <i className="app-notif__pulse" aria-hidden /> : null}
            </button>
          ))
        )}
      </div>
    </div>
  )

  const notifPortal =
    notifOpen &&
    createPortal(
      <div className="app-notif-sheet">
        <button
          type="button"
          className="app-notif-sheet__backdrop"
          aria-label="Мэдэгдэл хаах"
          onClick={() => setNotifOpen(false)}
        />
        <div className="app-notif-sheet__panel">{notifPanel}</div>
      </div>,
      document.body,
    )

  const menuPortal =
    menuOpen &&
    createPortal(
      <div className="app-menu" role="dialog" aria-modal="true" aria-label="Цэс">
        <button
          type="button"
          className="app-menu__backdrop"
          aria-label="Цэс хаах"
          onClick={() => setMenuOpen(false)}
        />
        <nav className="app-menu__panel">
          <div className="app-menu__top">
            <div className="app-menu__brand">
              <img src="/logo.svg" alt="" />
              <div>
                <strong>Au Pair</strong>
                <span>Mongolia</span>
              </div>
            </div>
            <button
              type="button"
              className="app-menu__close"
              aria-label="Хаах"
              onClick={() => setMenuOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          <div className="app-menu__hero">
            <p>Au Pair · Европ · Элсэлт нээлттэй</p>
            <div className="app-menu__stats">
              <span>{social.since} оноос</span>
              <span>{social.placed} залуус</span>
            </div>
          </div>

          <div className="app-menu__links">
            {navLinks.map((link) => {
              const Icon = menuIconFor(link.to)
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    isActive ? 'app-menu__link is-active' : 'app-menu__link'
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="app-menu__link-icon" aria-hidden>
                    <Icon />
                  </span>
                  <span className="app-menu__link-text">{link.label}</span>
                </NavLink>
              )
            })}
          </div>

          <div className="app-menu__footer">
            <div className="app-menu__actions">
              <a href={`tel:${social.phoneTel}`} className="app-menu__action is-primary">
                Залгах
              </a>
              <a
                href={social.messenger}
                target="_blank"
                rel="noreferrer"
                className="app-menu__action"
              >
                Messenger
              </a>
            </div>

            <a
              href={social.facebook}
              target="_blank"
              rel="noreferrer"
              className="app-menu__fb"
              onClick={() => setMenuOpen(false)}
            >
              Facebook · MongolianAuPair
            </a>
          </div>
        </nav>
      </div>,
      document.body,
    )

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
            <img src="/logo.svg" alt="" />
            <strong>Au Pair</strong>
          </Link>
          {canBack ? <h1 className="app-header__page">{title}</h1> : null}
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

        <div className="app-header__right">
          <div className="app-header__notif-wrap" ref={notifRef}>
            <button
              type="button"
              className={
                notifOpen
                  ? 'app-header__icon app-header__notif-btn is-on'
                  : 'app-header__icon app-header__notif-btn'
              }
              aria-label="Мэдэгдэл"
              aria-expanded={notifOpen}
              onClick={toggleNotif}
            >
              <BellIcon />
              {unreadCount > 0 ? (
                <span className="app-header__badge">{unreadCount}</span>
              ) : null}
            </button>

            {notifOpen ? (
              <div className="app-header__notif-desktop">{notifPanel}</div>
            ) : null}
          </div>

          <Link to="/universities" className="app-header__cta">
            Элсэлт
          </Link>

          <button
            type="button"
            className={
              menuOpen
                ? 'app-header__icon app-header__menu-btn is-on'
                : 'app-header__icon app-header__menu-btn'
            }
            aria-label="Цэс"
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((v) => !v)
              setNotifOpen(false)
            }}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {notifPortal}
      {menuPortal}
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

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path d="M5 7h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 17h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <path
        d="M7 7l10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M12 4.5c-2.9 0-5.2 2.2-5.2 5v1.4c0 .7-.2 1.4-.6 2L5 15.2h14l-1.2-2.3c-.4-.6-.6-1.3-.6-2V9.5c0-2.8-2.3-5-5.2-5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.6 16.8a2.4 2.4 0 0 0 4.8 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M4.5 10.5 12 4.5l7.5 6V19a1.5 1.5 0 0 1-1.5 1.5h-3.5v-5h-5v5H6A1.5 1.5 0 0 1 4.5 19v-8.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15.5H7.5A2.5 2.5 0 0 0 5 21V5.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M5 18.5h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10.5 9.2 15.2 12l-4.7 2.8V9.2Z" fill="currentColor" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M6.5 8.5h11l-.8 10.2a1.5 1.5 0 0 1-1.5 1.3H8.8a1.5 1.5 0 0 1-1.5-1.3L6.5 8.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 8.5V7a3 3 0 0 1 6 0v1.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <circle cx="12" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5.5 18.5c1.6-2.4 3.8-3.6 6.5-3.6s4.9 1.2 6.5 3.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function UniIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d="M3.5 10 12 5.5 20.5 10 12 14.5 3.5 10Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7 12.2V16c0 .8 2.2 2.2 5 2.2s5-1.4 5-2.2v-3.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function menuIconFor(to) {
  switch (to) {
    case '/':
      return HomeIcon
    case '/courses':
      return BookIcon
    case '/universities':
      return UniIcon
    case '/videos':
      return PlayIcon
    case '/shop':
      return BagIcon
    case '/profile':
      return UserIcon
    default:
      return BookIcon
  }
}

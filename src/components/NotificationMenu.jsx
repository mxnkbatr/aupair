import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCircle, Path, WarningCircle, BookOpen } from '@phosphor-icons/react'
import useNotifications from '../hooks/useNotifications'
import { haptic } from '../native'
import './NotificationMenu.css'

function KindIcon({ kind }) {
  if (kind === 'program') return <Path weight="fill" size={18} aria-hidden />
  if (kind === 'docs') return <WarningCircle weight="fill" size={18} aria-hidden />
  if (kind === 'enroll') return <CheckCircle weight="fill" size={18} aria-hidden />
  return <BookOpen weight="fill" size={18} aria-hidden />
}

function Panel({ items, unread, onClose, onSelect, onMarkAll, showSheetClose }) {
  return (
    <div className="app-notif">
      <div className="app-notif__head">
        <div>
          <strong>Мэдэгдэл</strong>
          <p>{unread ? `${unread} шинэ` : 'Бүгд уншсан'}</p>
        </div>
        {unread > 0 ? (
          <button type="button" className="app-notif__read" onClick={onMarkAll}>
            Бүгдийг уншсан
          </button>
        ) : null}
      </div>
      {items.length === 0 ? (
        <div className="app-notif__empty">
          <Bell size={28} weight="duotone" aria-hidden />
          <p>Мэдэгдэл алга</p>
        </div>
      ) : (
        <div className="app-notif__list" role="list">
          {items.map((n) => (
            <button
              key={n.id}
              type="button"
              role="listitem"
              className={`app-notif__item${n.unread ? ' is-unread' : ''}`}
              onClick={() => onSelect(n)}
            >
              <span className={`app-notif__avatar app-notif__avatar--${n.kind}`}>
                <KindIcon kind={n.kind} />
              </span>
              <span className="app-notif__body">
                <strong>{n.title}</strong>
                <small>{n.text}</small>
              </span>
              {n.when ? <em>{n.when}</em> : null}
              {n.unread ? <span className="app-notif__pulse" aria-hidden /> : null}
            </button>
          ))}
        </div>
      )}
      {showSheetClose ? (
        <button type="button" className="app-notif__close-sheet" onClick={onClose}>
          Хаах
        </button>
      ) : null}
    </div>
  )
}

/**
 * Bell button + notification panel.
 * `variant`: "header" (desktop AppHeader) | "icon" (NavBar / Home)
 */
export default function NotificationMenu({ variant = 'icon' }) {
  const navigate = useNavigate()
  const { items, unread, markRead, markAllRead } = useNotifications()
  const panelId = useId()
  const wrapRef = useRef(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onClick = (e) => {
      if (e.target.closest('[data-notif-root]')) return
      setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    // Delay so the opening click doesn't immediately close.
    const t = window.setTimeout(() => window.addEventListener('pointerdown', onClick), 0)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onClick)
    }
  }, [open])

  function toggle() {
    haptic('light')
    setOpen((v) => !v)
  }

  function onSelect(n) {
    markRead(n.id)
    haptic('selection')
    setOpen(false)
    if (n.to) navigate(n.to, n.state ? { state: n.state } : undefined)
  }

  const panelProps = {
    items,
    unread,
    onClose: () => setOpen(false),
    onSelect,
    onMarkAll: () => {
      markAllRead()
      haptic('success')
    },
  }

  const btnClass =
    variant === 'header'
      ? `app-header__icon app-header__notif-btn${open ? ' is-on' : ''}`
      : `notif-bell${open ? ' is-on' : ''}`

  const btn = (
    <button
      type="button"
      className={btnClass}
      aria-label={unread ? `Мэдэгдэл, ${unread} шинэ` : 'Мэдэгдэл'}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={toggle}
    >
      <Bell
        weight={unread ? 'fill' : 'regular'}
        size={variant === 'header' ? 18 : 22}
        aria-hidden
      />
      {unread > 0 ? <span className="notif-bell__badge">{unread > 9 ? '9+' : unread}</span> : null}
    </button>
  )

  const sheet = open
    ? createPortal(
        <div className="app-notif-sheet" role="dialog" aria-label="Мэдэгдэл" data-notif-root>
          <button
            type="button"
            className="app-notif-sheet__backdrop"
            aria-label="Хаах"
            onClick={() => setOpen(false)}
          />
          <div id={panelId} className="app-notif-sheet__panel">
            <Panel {...panelProps} showSheetClose />
          </div>
        </div>,
        document.body,
      )
    : null

  if (variant === 'header') {
    return (
      <div className="app-header__notif-wrap" ref={wrapRef} data-notif-root>
        {btn}
        {open ? (
          <div className="app-header__notif-desktop" role="dialog" aria-label="Мэдэгдэл">
            <Panel {...panelProps} />
          </div>
        ) : null}
        {sheet}
      </div>
    )
  }

  return (
    <div className="notif-bell-wrap" ref={wrapRef} data-notif-root>
      {btn}
      {sheet}
    </div>
  )
}

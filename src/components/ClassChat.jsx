import { useEffect, useMemo, useRef, useState } from 'react'
import { PaperPlaneTilt, UsersThree } from '@phosphor-icons/react'
import { api } from '../api'
import { useAuth } from '../auth'
import { haptic } from '../native'
import './ClassChat.css'

const AVATAR_COLORS = ['#e8173f', '#0084ff', '#00a400', '#a33fb5', '#f5a623', '#44bec7', '#fa3c4c']

function initials(name) {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || '?'
}

function avatarColor(key) {
  const s = String(key || '')
  let h = 0
  for (let i = 0; i < s.length; i += 1) h = (h + s.charCodeAt(i) * (i + 1)) % AVATAR_COLORS.length
  return AVATAR_COLORS[h]
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
}

function dayLabel(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const today = new Date()
  const yday = new Date()
  yday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Өнөөдөр'
  if (d.toDateString() === yday.toDateString()) return 'Өчигдөр'
  return d.toLocaleDateString('mn-MN', { month: 'long', day: 'numeric' })
}

function sameDay(a, b) {
  if (!a || !b) return false
  return new Date(a).toDateString() === new Date(b).toDateString()
}

function annotate(messages, myId) {
  return messages.map((m, i) => {
    const prev = messages[i - 1]
    const next = messages[i + 1]
    const mine = m.userId === myId
    const samePrev =
      prev &&
      prev.userId === m.userId &&
      Math.abs(new Date(m.createdAt) - new Date(prev.createdAt)) < 120000
    const sameNext =
      next &&
      next.userId === m.userId &&
      Math.abs(new Date(next.createdAt) - new Date(m.createdAt)) < 120000
    return {
      ...m,
      mine,
      showDay: !prev || !sameDay(prev.createdAt, m.createdAt),
      showName: !mine && !samePrev,
      showAvatar: !mine && !sameNext,
      cluster: samePrev ? (sameNext ? 'mid' : 'end') : sameNext ? 'start' : 'solo',
    }
  })
}

export default function ClassChat({ courseId, courseTitle }) {
  const { user } = useAuth()
  const myId = user?.id
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const rows = useMemo(() => annotate(messages, myId), [messages, myId])

  async function load(silent = false) {
    if (!courseId) return
    try {
      const res = await api.getClassMessages(courseId)
      setMessages(res.messages || [])
      setError('')
    } catch (err) {
      if (!silent) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    load()
    const t = setInterval(() => load(true), 4000)
    return () => clearInterval(t)
  }, [courseId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  async function send(e) {
    e.preventDefault()
    const value = text.trim()
    if (!value || sending) return
    setSending(true)
    const optimistic = {
      id: `tmp-${Date.now()}`,
      courseId,
      userId: myId,
      userName: user?.name || 'Би',
      role: 'student',
      text: value,
      createdAt: new Date().toISOString(),
      pending: true,
    }
    setMessages((m) => [...m, optimistic])
    setText('')
    try {
      const res = await api.postClassMessage(courseId, value)
      setMessages((m) => m.map((x) => (x.id === optimistic.id ? res.message : x)))
      haptic('light')
    } catch (err) {
      haptic('error')
      setMessages((m) => m.filter((x) => x.id !== optimistic.id))
      setText(value)
      setError(err.message)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="msg-chat">
      <header className="msg-chat__head">
        <span className="msg-chat__avatar msg-chat__avatar--group" aria-hidden>
          <UsersThree weight="fill" size={22} />
        </span>
        <div>
          <strong>{courseTitle || 'Ангийн чат'}</strong>
          <span>Багш + ангийнхан · бүлгийн чат</span>
        </div>
      </header>

      <div className="msg-chat__list" ref={listRef}>
        {loading ? <p className="msg-chat__empty">Ачаалж байна…</p> : null}
        {!loading && messages.length === 0 ? (
          <div className="msg-chat__empty">
            <UsersThree size={36} weight="duotone" aria-hidden />
            <p>Ангийн бүлгийн чат</p>
            <small>Эхний зурвасаа бичээрэй — бүгд харна.</small>
          </div>
        ) : null}

        {rows.map((m) => (
          <div key={m.id}>
            {m.showDay ? (
              <div className="msg-chat__day">
                <span>{dayLabel(m.createdAt)}</span>
              </div>
            ) : null}
            <div
              className={`msg-row msg-row--${m.mine ? 'me' : 'them'}${m.role === 'teacher' ? ' is-teacher' : ''}${m.pending ? ' is-pending' : ''}`}
            >
              {!m.mine ? (
                <span
                  className={`msg-row__avatar${m.showAvatar ? '' : ' is-spacer'}`}
                  style={m.showAvatar ? { background: avatarColor(m.userId || m.userName) } : undefined}
                  aria-hidden
                >
                  {m.showAvatar ? initials(m.userName) : null}
                </span>
              ) : null}

              <div className={`msg-bubble msg-bubble--${m.cluster}`}>
                {m.showName ? (
                  <em className={m.role === 'teacher' ? 'is-teacher' : ''}>
                    {m.role === 'teacher' ? `Багш · ${m.userName}` : m.userName}
                  </em>
                ) : null}
                <p>{m.text}</p>
                <time>{formatTime(m.createdAt)}</time>
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error ? <p className="msg-chat__err">{error}</p> : null}

      <form className="msg-chat__composer" onSubmit={send}>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Aa"
          maxLength={1000}
          disabled={sending}
          enterKeyHint="send"
          autoComplete="off"
        />
        <button type="submit" aria-label="Илгээх" disabled={sending || !text.trim()}>
          <PaperPlaneTilt weight="fill" size={20} aria-hidden />
        </button>
      </form>
    </div>
  )
}

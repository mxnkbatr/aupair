import { useEffect, useMemo, useRef, useState } from 'react'
import { ChatsCircle, PaperPlaneTilt } from '@phosphor-icons/react'
import { api } from '../api'
import { useAuth } from '../auth'
import { haptic } from '../native'
import './TeacherDm.css'

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
}

/** Багш ↔ сурагч шууд мессеж */
export default function TeacherDm({ courseId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  const rows = useMemo(() => {
    const list = (messages || []).filter((m) => !courseId || !m.courseId || m.courseId === courseId)
    return list.map((m) => ({
      ...m,
      mine: m.fromUserId === user?.id || (m.fromRole === 'student' && m.fromUserId === user?.id),
    }))
  }, [messages, courseId, user?.id])

  async function load(silent = false) {
    try {
      const res = await api.getDm()
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
    void load()
    const t = setInterval(() => void load(true), 8000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [rows.length])

  async function send(e) {
    e?.preventDefault?.()
    const body = text.trim()
    if (!body || sending) return
    setSending(true)
    try {
      const res = await api.postDm({ text: body, courseId })
      setMessages((prev) => [...prev, res.message])
      setText('')
      haptic('light')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="tdm" aria-label="Багштай чат">
      <header className="tdm__head">
        <ChatsCircle weight="fill" size={18} aria-hidden />
        <div>
          <strong>Багштай шууд чат</strong>
          <small>Бүлгийн чатаас тусдаа · зөвхөн танд</small>
        </div>
      </header>

      <div className="tdm__list">
        {loading ? <p className="tdm__hint">Ачаалж байна…</p> : null}
        {!loading && rows.length === 0 ? (
          <p className="tdm__hint">Мессеж байхгүй. Багш руу бичнэ үү.</p>
        ) : null}
        {rows.map((m) => (
          <div key={m.id} className={`tdm__bubble ${m.mine ? 'is-mine' : 'is-theirs'}`}>
            {!m.mine ? <em>Багш</em> : null}
            <p>{m.text}</p>
            <time>{formatTime(m.createdAt)}</time>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error ? <p className="tdm__err">{error}</p> : null}

      <form className="tdm__composer" onSubmit={send}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Багш руу бичих…"
          disabled={sending}
          aria-label="Мессеж"
        />
        <button type="submit" disabled={sending || !text.trim()} aria-label="Илгээх">
          <PaperPlaneTilt weight="fill" size={18} />
        </button>
      </form>
    </section>
  )
}

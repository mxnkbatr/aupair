import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { lessons, social } from '../data'
import Sheet from '../components/Sheet'
import './ProductDetail.css'

export default function LessonDetail() {
  const { id } = useParams()
  const lesson = useMemo(() => lessons.find((item) => item.id === id), [id])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  if (!lesson) {
    return (
      <div className="container fade-up" style={{ padding: '2rem 0' }}>
        <h1>Олдсонгүй</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          Хичээл олдсонгүй
        </p>
        <Link to="/videos" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Хичээл рүү
        </Link>
      </div>
    )
  }

  async function order(e) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const res = await api.order({
        name: form.name,
        phone: form.phone,
        items: [{ id: lesson.id, name: lesson.title, price: lesson.price }],
      })
      setStatus({ ok: true, text: res.message || 'Захиалга бүртгэгдлээ' })
      setForm({ name: '', phone: '' })
    } catch (err) {
      setStatus({ ok: false, text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pd fade-up">
      <div className="container">
        <section className="pd-hero">
          <div className="pd-hero__visual" aria-hidden>
            <img
              src={lesson.thumb}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
              onError={(e) => {
                e.currentTarget.src = '/cover.jpg'
              }}
            />
          </div>
          <div className="pd-hero__meta">
            <span className="pd-hero__tag">{lesson.category}</span>
            <h1>{lesson.title}</h1>
            <p>{lesson.blurb}</p>
          </div>
        </section>

        <section className="pd-block">
          <h2>Танилцуулга</h2>
          <p>{lesson.description}</p>
        </section>

        <section className="pd-block">
          <h2>Юу багтах вэ?</h2>
          <ul className="pd-list">
            <li>
              <span>1</span>
              {lesson.duration} · {lesson.mode}
            </li>
            <li>
              <span>2</span>
              {lesson.lessons}
            </li>
            {(lesson.points || []).map((point, i) => (
              <li key={point}>
                <span>{i + 3}</span>
                {point}
              </li>
            ))}
          </ul>
        </section>

        <section className="pd-note">
          <strong>Худалдан авалт</strong>
          <p>Захиалга бүртгэгдэж, төлбөр, цагийн хуваарийг утсаар тохирно.</p>
        </section>
      </div>

      <div className="pd-bar">
        <div className="pd-bar__price">
          <small>Үнэ</small>
          <strong>{lesson.price}</strong>
        </div>
        <button type="button" className="btn btn-primary pd-bar__cta" onClick={() => setOpen(true)}>
          Авах
        </button>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Хичээл авах">
        <form className="pd-form" onSubmit={order}>
          <div className="pd-form__item">
            <span>{lesson.title}</span>
            <strong>{lesson.price}</strong>
          </div>
          <label className="field">
            <span>Нэр *</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Таны нэр"
            />
          </label>
          <label className="field">
            <span>Утас *</span>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+976 ..."
            />
          </label>
          {status && (
            <div className={`alert ${status.ok ? 'alert-ok' : 'alert-err'}`}>
              {status.text}
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Илгээж байна...' : 'Захиалга илгээх'}
          </button>
          <a
            className="btn btn-ghost btn-block"
            href={social.messenger}
            target="_blank"
            rel="noreferrer"
          >
            Messenger
          </a>
        </form>
      </Sheet>
    </div>
  )
}

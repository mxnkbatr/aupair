import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { social } from '../data'
import PageHeader from '../components/PageHeader'
import './Profile.css'

const QUICK = [
  { to: '/courses', label: 'Сургалт', desc: 'HSK 1–5 анги' },
  { to: '/universities', label: 'Зуучлал', desc: 'Их сургууль' },
  { to: '/videos', label: 'Бичлэг', desc: 'Хичээлийн видео' },
  { href: social.facebook, label: 'Facebook', desc: `${social.followers} дагагч` },
]

export default function Profile() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    interest: 'course',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const res = await api.contact(form)
      setStatus({ ok: true, text: res.message || 'Хүсэлт хүлээн авлаа. Удахгүй холбогдоно.' })
      setForm({ name: '', phone: '', interest: 'course', message: '' })
    } catch (err) {
      setStatus({ ok: false, text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="container">
        <PageHeader
          title="Профайл"
          text="Элсэлт, зөвлөгөө — шууд холбогдоорой"
        />

        <section className="profile-card fade-up">
          <img src="/logo.png" alt="" className="profile-card__avatar" />
          <div>
            <h2>Ханз Академи</h2>
            <p>
              {social.city} · {social.followers} дагагч · {social.recommend} зөвлөдөг
            </p>
          </div>
        </section>

        <section className="profile-quick">
          {QUICK.map((item) =>
            item.href ? (
              <a
                key={item.label}
                href={item.href}
                className="profile-quick__item"
                target="_blank"
                rel="noreferrer"
              >
                <strong>{item.label}</strong>
                <span>{item.desc}</span>
              </a>
            ) : (
              <Link key={item.to} to={item.to} className="profile-quick__item">
                <strong>{item.label}</strong>
                <span>{item.desc}</span>
              </Link>
            ),
          )}
        </section>

        <section className="profile-contact">
          <h3>Бүртгүүлэх / асуух</h3>
          <div className="profile-contact__grid">
            <form className="profile-form" onSubmit={onSubmit}>
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
              <label className="field">
                <span>Сэдэв</span>
                <select
                  value={form.interest}
                  onChange={(e) => setForm({ ...form, interest: e.target.value })}
                >
                  <option value="course">Сургалт / Элсэлт</option>
                  <option value="private">Ганцаарчилсан</option>
                  <option value="uni">Зуучлал</option>
                  <option value="other">Бусад</option>
                </select>
              </label>
              <label className="field">
                <span>Зурвас</span>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Ямар анги сонирхож байна вэ?"
                />
              </label>

              {status && (
                <div className={`alert ${status.ok ? 'alert-ok' : 'alert-err'}`}>
                  {status.text}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Илгээж байна...' : 'Илгээх'}
              </button>
            </form>

            <aside className="profile-aside">
              <h4>Шууд холбоо</h4>
              <a href={`tel:${social.phoneTel}`}>{social.phone}</a>
              <a href={`tel:${social.phoneAltTel}`}>{social.phoneAlt}</a>
              <a href={`mailto:${social.email}`}>{social.email}</a>
              <p>{social.address}</p>
              <a
                className="btn btn-ghost btn-block"
                href={social.map}
                target="_blank"
                rel="noreferrer"
              >
                Газрын зураг
              </a>
              <a
                className="btn btn-ghost btn-block"
                href={social.messenger || social.facebook}
                target="_blank"
                rel="noreferrer"
              >
                Messenger · Facebook
              </a>
            </aside>
          </div>
        </section>
      </div>
    </div>
  )
}

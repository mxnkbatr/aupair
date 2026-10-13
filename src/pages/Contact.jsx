import { useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth'
import { org, social } from '../data'
import AgencyCard from '../components/AgencyCard'
import './Contact.css'

export default function Contact() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    interest: 'german-a1',
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
      setStatus({ ok: true, text: res.message || 'Хүсэлт хүлээн авлаа' })
      setForm({ name: user?.name || '', phone: user?.phone || '', interest: 'german-a1', message: '' })
    } catch (err) {
      setStatus({ ok: false, text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container page-hero fade-up">
      <span className="eyebrow">Холбоо барих</span>
      <h1>Элсэлт & зөвлөгөө</h1>
      <p>
        {org.legalName} — Au Pair элсэлт, хэлний бэлтгэл. Формыг бөглөөрэй, бид удахгүй холбогдоно.
      </p>

      <div className="contact-layout">
        <form className="contact-form" onSubmit={onSubmit}>
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
            <span>Сонирхол</span>
            <select
              value={form.interest}
              onChange={(e) => setForm({ ...form, interest: e.target.value })}
            >
              <option value="country">Au Pair улс / элсэлт</option>
              <option value="german-a1">Герман хэл A1</option>
              <option value="german-a2">Герман хэл A2</option>
              <option value="other">Бусад</option>
            </select>
          </label>
          <label className="field">
            <span>Зурвас</span>
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Түвшин, зорилгоо бичнэ үү..."
            />
          </label>

          {status && (
            <div className={`alert ${status.ok ? 'alert-ok' : 'alert-err'}`}>
              {status.text}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Илгээж байна...' : 'Илгээх'}
          </button>
        </form>

        <aside className="contact-aside">
          <AgencyCard />
          <div className="contact-aside__links">
            <h2>Шууд холбоо</h2>
            <a href={social.messenger} target="_blank" rel="noreferrer">
              Messenger
            </a>
            <a href={social.facebook} target="_blank" rel="noreferrer">
              facebook.com/MongolianAuPair
            </a>
            <a href={social.instagram} target="_blank" rel="noreferrer">
              Instagram @mongolian.aupair
            </a>
            <a href={social.map} target="_blank" rel="noreferrer">
              Газрын зураг дээр харах
            </a>
          </div>
        </aside>
      </div>
    </div>
  )
}

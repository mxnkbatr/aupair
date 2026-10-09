import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { products, social } from '../data'
import Sheet from '../components/Sheet'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const product = useMemo(() => products.find((p) => p.id === id), [id])
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  if (!product) {
    return (
      <div className="container fade-up" style={{ padding: '2rem 0' }}>
        <h1>Олдсонгүй</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          Бүтээгдэхүүн олдсонгүй
        </p>
        <Link to="/learn?tab=materials" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Материал руу
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
        items: [{ id: product.id, name: product.name, price: product.price }],
      })
      setStatus({ ok: true, text: res.message || 'Захиалга бүртгэгдлээ' })
      setForm({ name: user?.name || '', phone: user?.phone || '' })
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
            <span>{product.tag}</span>
            <strong>{product.tag || 'AP'}</strong>
          </div>
          <div className="pd-hero__meta">
            <span className="pd-hero__tag">{product.tag}</span>
            <h1>{product.name}</h1>
            <p>{product.blurb}</p>
          </div>
        </section>

        <section className="pd-block">
          <h2>Танилцуулга</h2>
          <p>{product.description}</p>
        </section>

        <section className="pd-block">
          <h2>Онцлог</h2>
          <ul className="pd-list">
            {(product.points || []).map((point, i) => (
              <li key={point}>
                <span>{i + 1}</span>
                {point}
              </li>
            ))}
          </ul>
        </section>

        <section className="pd-note">
          <strong>Захиалга</strong>
          <p>Захиалга бүртгэгдэж, бид утсаар холбогдоно.</p>
        </section>
      </div>

      <div className="pd-bar">
        <div className="pd-bar__price">
          <small>Үнэ</small>
          <strong>{product.price}</strong>
        </div>
        <button type="button" className="btn btn-primary pd-bar__cta" onClick={() => setOpen(true)}>
          Захиалах
        </button>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Захиалах">
        <form className="pd-form" onSubmit={order}>
          <div className="pd-form__item">
            <span>{product.name}</span>
            <strong>{product.price}</strong>
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

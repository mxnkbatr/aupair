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
      <div className="pd">
        <div className="container pd-miss">
          <h1>Олдсонгүй</h1>
          <p>Бараа олдсонгүй</p>
          <Link to="/shop" className="btn btn-primary">
            Дэлгүүр рүү
          </Link>
        </div>
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
    <div className="pd">
      <div className="pd-cover">
        <img
          src={product.image || '/cover.jpg'}
          alt=""
          onError={(e) => {
            e.currentTarget.src = '/cover.jpg'
          }}
        />
        <span className="pd-cover__tag">{product.tag}</span>
      </div>

      <div className="container pd-main">
        <header className="pd-meta">
          <h1>{product.name}</h1>
          <p>{product.blurb}</p>
          <strong className="pd-meta__price">{product.price}</strong>
        </header>

        <section className="pd-block">
          <h2>Танилцуулга</h2>
          <p>{product.description}</p>
        </section>

        {(product.points || []).length > 0 ? (
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
        ) : null}

        <section className="pd-note">
          <strong>Худалдан авах</strong>
          <p>Захиалга бүртгэгдэж, бид утсаар холбогдож баталгаажуулна.</p>
        </section>
      </div>

      <div className="pd-bar">
        <div className="pd-bar__price">
          <small>Үнэ</small>
          <strong>{product.price}</strong>
        </div>
        <button type="button" className="btn btn-primary pd-bar__cta" onClick={() => setOpen(true)}>
          Худалдан авах
        </button>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Худалдан авах">
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
            <div className={`alert ${status.ok ? 'alert-ok' : 'alert-err'}`}>{status.text}</div>
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Илгээж байна...' : 'Худалдан авах'}
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

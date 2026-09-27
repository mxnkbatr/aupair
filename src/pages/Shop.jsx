import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { products, social } from '../data'
import PageHeader from '../components/PageHeader'
import Sheet from '../components/Sheet'
import './Shop.css'

const FILTERS = [
  { id: 'all', label: 'Бүгд' },
  { id: 'Хэл', label: 'Хэл' },
  { id: 'Виза', label: 'Виза' },
]

const VISUAL = {
  Ном: 'book',
  Карт: 'cards',
  Merch: 'merch',
  Дэвтэр: 'notebook',
  Шалгалт: 'test',
}

export default function Shop() {
  const [filter, setFilter] = useState('all')
  const [cart, setCart] = useState([])
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  const list = useMemo(
    () =>
      filter === 'all' ? products : products.filter((p) => p.tag === filter),
    [filter],
  )

  const cartItems = products.filter((p) => cart.includes(p.id))

  function toggle(id) {
    setCart((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function checkout(e) {
    e.preventDefault()
    if (!cartItems.length) return
    setLoading(true)
    setStatus(null)
    try {
      const res = await api.order({
        name: form.name,
        phone: form.phone,
        items: cartItems.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
        })),
      })
      setStatus({ ok: true, text: res.message || 'Захиалга бүртгэгдлээ' })
      setCart([])
      setForm({ name: user?.name || '', phone: user?.phone || '' })
    } catch (err) {
      setStatus({ ok: false, text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="shop-page">
      <div className="container">
        <PageHeader
          title="Дэлгүүр"
          text="Ном, материал — бүртгүүлнэ"
          right={
            <button
              type="button"
              className="shop-cart-btn"
              onClick={() => setOpen(true)}
            >
              Миний сагс · {cart.length}
            </button>
          }
        />

        <div className="page-filters" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={
                filter === f.id ? 'page-filters__btn is-active' : 'page-filters__btn'
              }
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="shop-grid">
          {list.map((item) => {
            const inCart = cart.includes(item.id)
            const visual = VISUAL[item.tag] || 'book'
            return (
              <article key={item.id} className="product">
                <Link to={`/shop/${item.id}`} className="product__main">
                  <div className={`product__media is-${visual}`} aria-hidden>
                    <span className="product__badge">{item.tag}</span>
                    <ProductArt type={visual} />
                  </div>
                  <div className="product__info">
                    <span className="product__cat">{item.tag}</span>
                    <h2>{item.name}</h2>
                    <p>{item.blurb}</p>
                    <strong className="product__price">{item.price}</strong>
                  </div>
                </Link>
                <button
                  type="button"
                  className={inCart ? 'product__cta is-on' : 'product__cta'}
                  onClick={() => toggle(item.id)}
                  aria-label={inCart ? 'Сагснаас хасах' : 'Сагсанд нэмэх'}
                >
                  <CartIcon />
                  <span>{inCart ? 'Сагсанд' : '+ Нэмэх'}</span>
                </button>
              </article>
            )
          })}
        </div>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Миний сагс">
        {cartItems.length === 0 ? (
          <p className="shop-empty">Сагс хоосон байна.</p>
        ) : (
          <form className="shop-checkout" onSubmit={checkout}>
            <ul className="shop-checkout__list">
              {cartItems.map((item) => (
                <li key={item.id}>
                  <div className={`shop-checkout__thumb is-${VISUAL[item.tag] || 'book'}`}>
                    <ProductArt type={VISUAL[item.tag] || 'book'} />
                  </div>
                  <span>{item.name}</span>
                  <strong>{item.price}</strong>
                </li>
              ))}
            </ul>

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
        )}
      </Sheet>
    </div>
  )
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
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

function ProductArt({ type }) {
  if (type === 'cards') {
    return (
      <div className="art art-cards">
        <i />
        <i />
        <i />
      </div>
    )
  }
  if (type === 'merch') {
    return (
      <div className="art art-merch">
        <b>漢</b>
      </div>
    )
  }
  if (type === 'notebook') {
    return (
      <div className="art art-notebook">
        <span />
        <em />
      </div>
    )
  }
  if (type === 'test') {
    return (
      <div className="art art-test">
        <i />
        <i />
      </div>
    )
  }
  return (
    <div className="art art-book">
      <i />
      <i />
      <b>AP</b>
    </div>
  )
}

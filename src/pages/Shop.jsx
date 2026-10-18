import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { products, social } from '../data'
import Pressable from '../components/Pressable'
import { haptic } from '../native'
import './Shop.css'

const FILTERS = [
  { id: 'all', label: 'Бүгд' },
  { id: 'Хэл', label: 'Хэл' },
  { id: 'Виза', label: 'Виза' },
]

export default function Shop() {
  const [filter, setFilter] = useState('all')

  const list = useMemo(() => {
    if (filter === 'all') return products
    return products.filter((p) => p.tag === filter)
  }, [filter])

  return (
    <div className="shop">
      <header className="shop-hero container">
        <h1>Дэлгүүр</h1>
        <p>Ном · чеклист · захиалга</p>
      </header>

      <div className="container">
        <div className="shop-filters" role="tablist" aria-label="Шүүлтүүр">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={filter === f.id ? 'is-active' : ''}
              onClick={() => {
                haptic('selection')
                setFilter(f.id)
              }}
            >
              {filter === f.id ? (
                <motion.i
                  layoutId="shop-filter"
                  className="shop-filters__pill"
                  transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                />
              ) : null}
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="container shop-grid" aria-label="Бараа">
        {list.length === 0 ? (
          <p className="shop-empty">Энэ ангилалд бараа алга.</p>
        ) : (
          list.map((item) => (
            <Pressable key={item.id} as={Link} to={`/shop/${item.id}`} className="product-card">
              <div className="product-card__media">
                <img
                  src={item.image || '/cover.jpg'}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/cover.jpg'
                  }}
                />
                <em className="product-card__tag">{item.tag}</em>
              </div>
              <div className="product-card__body">
                <strong>{item.name}</strong>
                <p>{item.blurb}</p>
                <div className="product-card__foot">
                  <span>{item.price}</span>
                  <i aria-hidden>
                    <ArrowRight weight="bold" size={14} />
                  </i>
                </div>
              </div>
            </Pressable>
          ))
        )}
      </section>

      <p className="shop-note container">
        Асуулттай бол <a href={`tel:${social.phoneTel}`}>{social.phone}</a>
      </p>
    </div>
  )
}

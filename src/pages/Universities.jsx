import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { countries } from '../data'
import Pressable from '../components/Pressable'
import './Universities.css'

const FILTERS = [
  { id: 'all', label: 'Бүгд' },
  { id: 'german', label: 'Герман хэлтэй' },
  { id: 'french', label: 'Франц хэлтэй' },
  { id: 'north', label: 'Англи хэлтэй' },
]

const FLAGS = {
  germany: '🇩🇪',
  france: '🇫🇷',
  austria: '🇦🇹',
  switzerland: '🇨🇭',
  belgium: '🇧🇪',
  netherlands: '🇳🇱',
  denmark: '🇩🇰',
}

function matchesFilter(country, filter) {
  if (filter === 'all') return true
  return country.langGroup === filter
}

export default function Universities() {
  const [filter, setFilter] = useState('all')
  const list = useMemo(() => countries.filter((u) => matchesFilter(u, filter)), [filter])

  return (
    <div className="uni-page">
      <div className="container">
        <header className="page-hero">
          <h1>Улсууд</h1>
          <p>Au Pair хийх Европын 7 улс</p>
        </header>

        <div className="page-filters" role="tablist" aria-label="Хэлний шүүлтүүр">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={filter === f.id ? 'page-filters__btn is-active' : 'page-filters__btn'}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="uni2-grid">
          {list.map((uni) => (
            <Pressable
              key={uni.id}
              as={Link}
              to={`/countries/${uni.id}`}
              className="uni2-card"
              aria-label={`${uni.nameMn} — ${uni.city}`}
            >
              <motion.img
                layoutId={`country-img-${uni.id}`}
                src={uni.image}
                alt=""
                loading="lazy"
                transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                onError={(e) => {
                  e.currentTarget.src = '/cover.jpg'
                }}
              />
              <span className="uni2-card__shade" aria-hidden />
              <span className="uni2-card__top">
                <b>{FLAGS[uni.id] || uni.short}</b>
                {uni.badge ? <em>{uni.badge}</em> : null}
              </span>
              <span className="uni2-card__text">
                <strong>{uni.nameMn}</strong>
                <small>{uni.city}</small>
              </span>
            </Pressable>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="uni-empty">
            <p>🌍 Энэ шүүлтээр улс олдсонгүй</p>
            <button type="button" className="btn btn-primary" onClick={() => setFilter('all')}>
              Бүгдийг харах
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

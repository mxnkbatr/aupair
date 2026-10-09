import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { CaretRight, MagnifyingGlass, X } from '@phosphor-icons/react'
import { countries } from '../data'
import Pressable from '../components/Pressable'
import { haptic } from '../native'
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

function matchesQuery(country, q) {
  if (!q) return true
  const hay = `${country.nameMn} ${country.name} ${country.city} ${country.language}`.toLowerCase()
  return hay.includes(q)
}

function pillsFor(uni) {
  const out = []
  if (uni.duration) out.push(uni.duration.includes('12') ? '1 жил' : uni.duration)
  if (uni.badge) out.push(uni.badge)
  else if (uni.open) out.push('Нээлттэй')
  return out.slice(0, 2)
}

export default function Universities() {
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const inputRef = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    function onToggle() {
      setSearching((v) => {
        const next = !v
        if (!next) setQuery('')
        return next
      })
    }
    function onOpen() {
      setSearching(true)
    }
    window.addEventListener('aupair:countries-search', onToggle)
    window.addEventListener('aupair:countries-search-open', onOpen)
    return () => {
      window.removeEventListener('aupair:countries-search', onToggle)
      window.removeEventListener('aupair:countries-search-open', onOpen)
    }
  }, [])

  useEffect(() => {
    if (searching) inputRef.current?.focus()
  }, [searching])

  const q = query.trim().toLowerCase()
  const list = useMemo(
    () => countries.filter((u) => matchesFilter(u, filter) && matchesQuery(u, q)),
    [filter, q],
  )
  const featured = useMemo(
    () => countries.find((u) => u.id === 'germany') || countries.find((u) => u.featured),
    [],
  )
  const showFeatured = featured && filter === 'all' && !q
  const rows = showFeatured ? list.filter((u) => u.id !== featured.id) : list

  return (
    <div className="uni-page">
      <div className="container">
        <header className="uni-head">
          <h1>Улсууд</h1>
          <p>Au Pair хийх Европын 7 улс</p>
        </header>

        {searching ? (
          <div className="uni-search">
            <MagnifyingGlass size={18} weight="bold" aria-hidden />
            <input
              ref={inputRef}
              type="search"
              inputMode="search"
              placeholder="Улс хайх…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Улс хайх"
            />
            <button
              type="button"
              className="uni-search__clear"
              aria-label="Хайх хаах"
              onClick={() => {
                haptic('light')
                setSearching(false)
                setQuery('')
              }}
            >
              <X size={16} weight="bold" aria-hidden />
            </button>
          </div>
        ) : null}

        <div className="uni-chips" role="tablist" aria-label="Хэлний шүүлтүүр">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={filter === f.id ? 'uni-chip is-active' : 'uni-chip'}
              onClick={() => {
                haptic('selection')
                setFilter(f.id)
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {showFeatured ? (
          <Pressable
            as={Link}
            to={`/countries/${featured.id}`}
            className="uni-featured"
            scale={0.97}
          >
            <motion.img
              layoutId={reduce ? undefined : `country-img-${featured.id}`}
              src={featured.image}
              alt=""
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              onError={(e) => {
                e.currentTarget.src = '/cover.jpg'
              }}
            />
            <span className="uni-featured__shade" aria-hidden />
            <em className="uni-featured__badge">Эрэлттэй</em>
            <span className="uni-featured__body">
              <strong>
                {FLAGS[featured.id]} {featured.nameMn}
              </strong>
              <small>
                {featured.city} · {featured.language}
              </small>
            </span>
          </Pressable>
        ) : null}

        <ul className="uni-list">
          {rows.map((uni) => (
            <li key={uni.id}>
              <Pressable
                as={Link}
                to={`/countries/${uni.id}`}
                className="uni-row"
                scale={0.97}
                aria-label={`${uni.nameMn} — ${uni.city}`}
              >
                <motion.img
                  className="uni-row__photo"
                  layoutId={reduce ? undefined : `country-img-${uni.id}`}
                  src={uni.image}
                  alt=""
                  loading="lazy"
                  transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                  onError={(e) => {
                    e.currentTarget.src = '/cover.jpg'
                  }}
                />
                <div className="uni-row__body">
                  <strong>
                    {FLAGS[uni.id] || ''} {uni.nameMn}
                  </strong>
                  <span>
                    {uni.city} · {uni.language}
                  </span>
                  <div className="uni-row__pills">
                    {pillsFor(uni).map((p) => (
                      <em key={p}>{p}</em>
                    ))}
                  </div>
                </div>
                <CaretRight className="uni-row__chev" size={18} weight="bold" aria-hidden />
              </Pressable>
            </li>
          ))}
        </ul>

        {list.length === 0 ? (
          <div className="uni-empty">
            <p>🌍 Улс олдсонгүй</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setFilter('all')
                setQuery('')
                setSearching(false)
              }}
            >
              Бүгдийг харах
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

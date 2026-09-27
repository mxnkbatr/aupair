import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { coursesFallback, countries, products } from '../data'
import { haptic } from '../native'
import './SearchSheet.css'

const RECENT_STORAGE = 'aupair-recent-search'
const MAX_RECENT = 6

const GROUPS = [
  { id: 'course', label: 'Хөтөлбөр' },
  { id: 'country', label: 'Au Pair улс' },
  { id: 'product', label: 'Ном · материал' },
]

const SUGGESTIONS = ['A1', 'A2', 'Герман', 'Австри', 'Швейцарь', 'Виза']

const CATEGORIES = [
  { to: '/courses', label: 'Хөтөлбөр', hint: 'A1 · A2', icon: 'DE', tone: 'red' },
  { to: '/universities', label: 'Улс орнууд', hint: `${countries.length} улс`, icon: 'EU', tone: 'wine' },
  { to: '/shop', label: 'Дэлгүүр', hint: 'Ном', icon: 'BK', tone: 'ink' },
  { to: '/profile', label: 'Профайл', hint: 'Миний элсэлт', icon: 'ME', tone: 'rose' },
]

const INDEX = [
  ...coursesFallback.map((c) => ({
    id: `course-${c.id}`,
    group: 'course',
    title: c.title,
    meta: [c.level, c.duration, c.mode].filter(Boolean).join(' · '),
    keywords: [c.hsk, c.subtitle, 'герман хэл', 'анги'].join(' '),
    to: `/courses/${c.id}`,
    icon: c.level || 'DE',
  })),
  ...countries.map((u) => ({
    id: `country-${u.id}`,
    group: 'country',
    title: `${u.nameMn} Au Pair`,
    meta: `${u.city} · ${u.language}`,
    keywords: [u.name, u.short, u.region, u.focus, 'au pair'].join(' '),
    to: `/universities/${u.id}`,
    icon: u.short,
    image: u.image,
  })),
  ...products.map((p) => ({
    id: `product-${p.id}`,
    group: 'product',
    title: p.name,
    meta: [p.blurb, p.price].filter(Boolean).join(' · '),
    keywords: [p.tag, p.description].join(' '),
    to: `/shop/${p.id}`,
    icon: 'BK',
  })),
]

function score(item, q) {
  const title = item.title.toLowerCase()
  if (title.startsWith(q)) return 4
  if (title.split(/\s+/).some((w) => w.startsWith(q))) return 3
  if (title.includes(q)) return 2
  if (`${item.meta} ${item.keywords}`.toLowerCase().includes(q)) return 1
  return 0
}

function loadRecent() {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_STORAGE) || '[]')
    return Array.isArray(list) ? list.slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

function saveRecent(list) {
  try {
    localStorage.setItem(RECENT_STORAGE, JSON.stringify(list))
  } catch {
    // storage unavailable
  }
}

function Highlight({ text, query }) {
  const q = query.trim()
  if (!q) return text
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}

export default function SearchSheet({ open, onClose, onNavigate }) {
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState(loadRecent)
  const inputRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return undefined
    setQuery('')
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(id)
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const q = query.trim().toLowerCase()

  const groups = useMemo(() => {
    if (!q) return []
    const hits = INDEX.map((item) => ({ item, s: score(item, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.item)
    return GROUPS.map((g) => ({ ...g, items: hits.filter((h) => h.group === g.id) })).filter(
      (g) => g.items.length,
    )
  }, [q])

  const total = groups.reduce((n, g) => n + g.items.length, 0)

  if (!open) return null

  function remember(term) {
    const t = term.trim()
    if (!t) return
    const next = [t, ...recent.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(
      0,
      MAX_RECENT,
    )
    setRecent(next)
    saveRecent(next)
  }

  function go(to) {
    remember(query)
    haptic()
    onNavigate(to)
  }

  function clearRecent() {
    setRecent([])
    saveRecent([])
  }

  function onSubmit(e) {
    e.preventDefault()
    inputRef.current?.blur()
    const first = groups[0]?.items[0]
    if (first) go(first.to)
    else remember(query)
  }

  return createPortal(
    <div className="ios-search" role="dialog" aria-modal="true" aria-label="Хайлт">
      <button type="button" className="ios-search__scrim" aria-label="Хаах" onClick={onClose} />

      <div className={q ? 'ios-search__panel has-query' : 'ios-search__panel'}>
        <div className="ios-search__top">
          <h2 className="ios-search__title">Хайлт</h2>
          <form className="ios-search__bar" onSubmit={onSubmit} role="search">
            <label className="ios-search__field">
              <SearchIcon />
              <input
                ref={inputRef}
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                value={query}
                placeholder="Хөтөлбөр, улс, ном..."
                aria-label="Хайлт"
                onChange={(e) => setQuery(e.target.value)}
              />
              {query ? (
                <button
                  type="button"
                  className="ios-search__clear"
                  aria-label="Цэвэрлэх"
                  onClick={() => {
                    setQuery('')
                    inputRef.current?.focus()
                  }}
                >
                  <ClearIcon />
                </button>
              ) : null}
            </label>
            <button type="button" className="ios-search__cancel" onClick={onClose}>
              Болих
            </button>
          </form>
        </div>

        <div className="ios-search__body">
          {!q && (
            <>
              {recent.length > 0 && (
                <section className="ios-search__section">
                  <div className="ios-search__head">
                    <h3>Сүүлд хайсан</h3>
                    <button type="button" onClick={clearRecent}>
                      Цэвэрлэх
                    </button>
                  </div>
                  <ul className="ios-search__list">
                    {recent.map((term) => (
                      <li key={term}>
                        <button type="button" className="ios-search__recent" onClick={() => setQuery(term)}>
                          <ClockIcon />
                          <span>{term}</span>
                          <ArrowIcon />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="ios-search__section">
                <div className="ios-search__head">
                  <h3>Санал болгох</h3>
                </div>
                <div className="ios-search__chips">
                  {SUGGESTIONS.map((term) => (
                    <button key={term} type="button" onClick={() => setQuery(term)}>
                      <SearchIcon />
                      {term}
                    </button>
                  ))}
                </div>
              </section>

              <section className="ios-search__section">
                <div className="ios-search__head">
                  <h3>Ангилал</h3>
                </div>
                <div className="ios-search__cats">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.to}
                      type="button"
                      className="ios-search__cat"
                      onClick={() => {
                        haptic()
                        onNavigate(cat.to)
                      }}
                    >
                      <span className={`ios-search__cat-icon is-${cat.tone}`} aria-hidden>
                        {cat.icon}
                      </span>
                      <strong>{cat.label}</strong>
                      <small>{cat.hint}</small>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {q && total === 0 && (
            <div className="ios-search__empty">
              <span aria-hidden>
                <SearchIcon />
              </span>
              <strong>«{query.trim()}» олдсонгүй</strong>
              <p>Үгээ шалгаад дахин оролдоно уу, эсвэл доорхоос сонгоно уу.</p>
              <div className="ios-search__chips">
                {SUGGESTIONS.slice(0, 4).map((term) => (
                  <button key={term} type="button" onClick={() => setQuery(term)}>
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {groups.map((g) => (
            <section key={g.id} className="ios-search__section">
              <div className="ios-search__head">
                <h3>
                  {g.label} <span>{g.items.length}</span>
                </h3>
              </div>
              <ul className="ios-search__list">
                {g.items.map((item) => (
                  <li key={item.id}>
                    <button type="button" className="ios-search__row" onClick={() => go(item.to)}>
                      {item.image ? (
                        <img className="ios-search__thumb" src={item.image} alt="" loading="lazy" />
                      ) : (
                        <span className={`ios-search__thumb is-${g.id}`} aria-hidden>
                          {item.icon}
                        </span>
                      )}
                      <span className="ios-search__text">
                        <strong>
                          <Highlight text={item.title} query={query} />
                        </strong>
                        <small>{item.meta}</small>
                      </span>
                      <ChevronIcon />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {q && total > 0 && (
            <p className="ios-search__count">
              {total} үр дүн
              {groups.map((g, i) => (
                <Fragment key={g.id}>
                  {i === 0 ? ' · ' : ', '}
                  {g.label.toLowerCase()} {g.items.length}
                </Fragment>
              ))}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="M16.2 16.2 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <path d="m9 9 6 6m0-6-6 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4l2.6 1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <path d="M17 17 7 7m0 0v7m0-7h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden className="ios-search__chev">
      <path d="m9.5 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

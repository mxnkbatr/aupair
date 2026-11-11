import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  BookOpenText,
  CaretRight,
  GlobeHemisphereEast,
  MagnifyingGlass,
  Newspaper,
  Storefront,
  X,
} from '@phosphor-icons/react'
import { countries, newsItems, products } from '../data'
import useCourses from '../hooks/useCourses'
import { haptic } from '../native'
import './SearchOverlay.css'

const RECENT_KEY = 'aupair:recent-search'
const TRENDING = ['Герман A1', 'Франц', 'Виза', 'QPay', 'Австри', 'Чеклист']
const QUICK = [
  { to: '/learn', label: 'Сургалт', icon: BookOpenText },
  { to: '/countries', label: 'Au Pair', icon: GlobeHemisphereEast },
  { to: '/news', label: 'Мэдээ', icon: Newspaper },
  { to: '/shop', label: 'Дэлгүүр', icon: Storefront },
]

/** Open from anywhere: window.dispatchEvent(new CustomEvent('app:search', { detail: 'query' })) */
export function openSearch(query = '') {
  window.dispatchEvent(new CustomEvent('app:search', { detail: query }))
}

function readRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').slice(0, 5)
  } catch {
    return []
  }
}

function norm(v) {
  return String(v || '').toLowerCase()
}

function Highlight({ text, q }) {
  const t = String(text || '')
  const i = q ? t.toLowerCase().indexOf(q) : -1
  if (i < 0) return t
  return (
    <>
      {t.slice(0, i)}
      <mark>{t.slice(i, i + q.length)}</mark>
      {t.slice(i + q.length)}
    </>
  )
}

export default function SearchOverlay() {
  const navigate = useNavigate()
  const { courses } = useCourses()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState(readRecent)
  const inputRef = useRef(null)

  useEffect(() => {
    function onOpen(e) {
      setQuery(String(e?.detail || ''))
      setRecent(readRecent())
      setOpen(true)
    }
    function onShortcut(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpen()
      }
    }
    window.addEventListener('app:search', onOpen)
    window.addEventListener('keydown', onShortcut)
    return () => {
      window.removeEventListener('app:search', onOpen)
      window.removeEventListener('keydown', onShortcut)
    }
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const t = setTimeout(() => inputRef.current?.focus(), 80)
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.documentElement.classList.add('is-searching')
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('is-searching')
    }
  }, [open])

  const q = norm(query.trim())

  const groups = useMemo(() => {
    if (!q) return []
    const match = (...fields) => fields.some((f) => norm(f).includes(q))
    return [
      {
        id: 'courses',
        title: 'Сургалт',
        items: courses
          .filter((c) => match(c.title, c.subtitle, c.level, c.mode))
          .map((c) => ({
            key: c.id,
            to: `/learn/course/${c.id}`,
            image: c.image,
            title: c.title,
            sub: [c.priceLabel, c.duration].filter(Boolean).join(' · '),
          })),
      },
      {
        id: 'countries',
        title: 'Au Pair улс',
        items: countries
          .filter((c) => match(c.nameMn, c.name, c.city, c.language))
          .map((c) => ({
            key: c.id,
            to: `/countries/${c.id}`,
            image: c.image,
            title: `${c.nameMn} Au Pair`,
            sub: `${c.language} · ${c.duration}`,
          })),
      },
      {
        id: 'news',
        title: 'Мэдээ',
        items: newsItems
          .filter((n) => match(n.title, n.excerpt, n.tag))
          .map((n) => ({ key: n.id, to: n.href || `/news/${n.id}`, image: n.image, title: n.title, sub: n.dateLabel })),
      },
      {
        id: 'shop',
        title: 'Дэлгүүр',
        items: products
          .filter((p) => match(p.name, p.blurb, p.tag, p.description))
          .map((p) => ({ key: p.id, to: `/shop/${p.id}`, image: p.image, title: p.name, sub: `${p.blurb} · ${p.price}` })),
      },
    ].filter((g) => g.items.length > 0)
  }, [q, courses])

  const total = groups.reduce((n, g) => n + g.items.length, 0)

  function remember(term) {
    const t = term.trim()
    if (!t) return
    const next = [t, ...readRecent().filter((r) => r !== t)].slice(0, 5)
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {
      /* storage full / private mode */
    }
  }

  function go(to) {
    haptic('light')
    remember(query)
    setOpen(false)
    navigate(to)
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="search-ov"
          role="dialog"
          aria-modal="true"
          aria-label="Хайлт"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="search-ov__panel"
            initial={{ y: -16, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            <div className="search-ov__bar">
              <label className="search-ov__field">
                <MagnifyingGlass size={19} weight="bold" aria-hidden />
                <input
                  ref={inputRef}
                  type="search"
                  inputMode="search"
                  enterKeyHint="search"
                  placeholder="Сургалт, улс, мэдээ хайх"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && groups[0]?.items[0]) go(groups[0].items[0].to)
                  }}
                />
                {query ? (
                  <button type="button" aria-label="Цэвэрлэх" onClick={() => setQuery('')}>
                    <X size={12} weight="bold" aria-hidden />
                  </button>
                ) : null}
              </label>
              <button type="button" className="search-ov__cancel" onClick={() => setOpen(false)}>
                Болих
              </button>
            </div>

            <div className="search-ov__scroll">
              {!q ? (
                <>
                  <div className="search-ov__quick">
                    {QUICK.map(({ to, label, icon: Icon }, i) => (
                      <motion.button
                        key={to}
                        type="button"
                        onClick={() => go(to)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 * i, type: 'spring', stiffness: 400, damping: 30 }}
                        whileTap={{ scale: 0.94 }}
                      >
                        <span>
                          <Icon size={22} weight="fill" aria-hidden />
                        </span>
                        {label}
                      </motion.button>
                    ))}
                  </div>

                  {recent.length ? (
                    <section className="search-ov__group">
                      <h3>Сүүлд хайсан</h3>
                      <div className="search-ov__chips">
                        {recent.map((r) => (
                          <button key={r} type="button" onClick={() => setQuery(r)}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  <section className="search-ov__group">
                    <h3>Түгээмэл</h3>
                    <div className="search-ov__chips">
                      {TRENDING.map((t) => (
                        <button key={t} type="button" onClick={() => setQuery(t)}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              ) : total === 0 ? (
                <div className="search-ov__empty">
                  <MagnifyingGlass size={34} aria-hidden />
                  <strong>“{query}” олдсонгүй</strong>
                  <small>Өөр үгээр хайгаад үзээрэй</small>
                </div>
              ) : (
                <>
                  <p className="search-ov__count">{total} үр дүн</p>
                  {groups.map((g) => (
                    <section key={g.id} className="search-ov__group">
                      <h3>{g.title}</h3>
                      <div className="search-ov__list">
                        {g.items.map((item, i) => (
                          <motion.button
                            key={item.key}
                            type="button"
                            className="search-ov__row"
                            onClick={() => go(item.to)}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(i, 6) * 0.03 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <img
                              src={item.image || '/cover.jpg'}
                              alt=""
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = '/cover.jpg'
                              }}
                            />
                            <span>
                              <strong>
                                <Highlight text={item.title} q={q} />
                              </strong>
                              {item.sub ? <small>{item.sub}</small> : null}
                            </span>
                            <CaretRight size={16} weight="bold" aria-hidden />
                          </motion.button>
                        ))}
                      </div>
                    </section>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

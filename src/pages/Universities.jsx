import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  CaretRight,
  CheckCircle,
  MagnifyingGlass,
  SealCheck,
  X,
} from '@phosphor-icons/react'
import { countries } from '../data'
import CountryMatch from '../components/CountryMatch'
import MyAuPairPanel from '../components/MyAuPairPanel'
import Pressable from '../components/Pressable'
import { useAuth } from '../auth'
import useMyData from '../hooks/useMyData'
import { haptic } from '../native'
import './Universities.css'

const FILTERS = [
  { id: 'all', label: 'Бүгд' },
  { id: 'german', label: 'Герман хэл' },
  { id: 'french', label: 'Франц хэл' },
  { id: 'north', label: 'Англи хэл' },
]

const FLAGS = {
  germany: '🇩🇪',
  usa: '🇺🇸',
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

export default function Universities() {
  const { user } = useAuth()
  const myData = useMyData()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const inputRef = useRef(null)
  const reduce = useReducedMotion()

  const countryAccepted = useMemo(
    () =>
      (myData?.enrollments || []).some(
        (e) => e.kind === 'country' && e.status === 'accepted',
      ),
    [myData?.enrollments],
  )
  // Зөвхөн нэвтэрсэн + админ улс зөвшөөрсөн / хөтөлбөрт оруулсан үед
  const isEnrolled = Boolean(user) && (Boolean(user.inProgram) || countryAccepted)

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
    function onQuery(e) {
      const next = String(e?.detail || '')
      setSearching(true)
      if (next) setQuery(next)
    }
    window.addEventListener('aupair:countries-search', onToggle)
    window.addEventListener('aupair:countries-search-open', onOpen)
    window.addEventListener('aupair:countries-search-query', onQuery)
    return () => {
      window.removeEventListener('aupair:countries-search', onToggle)
      window.removeEventListener('aupair:countries-search-open', onOpen)
      window.removeEventListener('aupair:countries-search-query', onQuery)
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
  const openCount = countries.filter((c) => c.open !== false).length

  // Элссэн: зөвхөн үйл явц + бүрдүүлэх материал (улсын жагсаалт нуугдана)
  if (isEnrolled) {
    return (
      <div className="uni-page">
        <div className="container">
          <MyAuPairPanel user={user} standalone />
        </div>
      </div>
    )
  }

  return (
    <div className="uni-page">
      <div className="container">
        <header className="uni-head">
          <p className="uni-head__kicker">Албан ёсны хөтөлбөр · IAPA</p>
          <h1>Au Pair</h1>
          <p>
            Асуултад хариулаад тохирох улсаа олоорой — эсвэл доороос шууд сонгоно.
          </p>
        </header>

        <CountryMatch />

        <div className="uni-howto" aria-label="Яаж бүртгүүлэх вэ">
          <div>
            <i>1</i>
            <span>Улс тохируулах</span>
          </div>
          <div>
            <i>2</i>
            <span>Хүсэлт илгээх</span>
          </div>
          <div>
            <i>3</i>
            <span>Материал аппаар</span>
          </div>
        </div>

        <div className="uni-banner">
          <SealCheck weight="fill" size={22} aria-hidden />
          <div>
            <strong>{openCount} улсад элсэлт нээлттэй</strong>
            <small>Улс руу ороод шаардлагаа үзээд шууд бүртгүүлнэ</small>
          </div>
        </div>

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

        <div className="uni-seg" role="tablist" aria-label="Хэлний шүүлтүүр">
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
                  layoutId="uni-seg"
                  className="uni-seg__pill"
                  transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                />
              ) : null}
              <span>{f.label}</span>
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
            <em className="uni-featured__badge">Бүртгэл нээлттэй</em>
            <span className="uni-featured__body">
              <strong>
                {FLAGS[featured.id]} {featured.nameMn} Au Pair
              </strong>
              <small>
                {featured.hsk} · {featured.duration} · {featured.city}
              </small>
              <span className="uni-featured__cta">
                Сонгоод бүртгүүлэх <ArrowRight weight="bold" size={14} aria-hidden />
              </span>
            </span>
          </Pressable>
        ) : null}

        <h2 className="uni-section-title">Улс сонгох</h2>

        <ul className="uni-list">
          {rows.map((uni) => {
            const open = uni.open !== false
            const reqPreview = (uni.requirements || []).slice(0, 2)
            return (
              <li key={uni.id}>
                <Pressable
                  as={Link}
                  to={`/countries/${uni.id}`}
                  className="uni-row"
                  scale={0.97}
                  aria-label={`${uni.nameMn} Au Pair — бүртгүүлэх`}
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
                      {uni.language} · {uni.duration}
                    </span>
                    <div className="uni-row__pills">
                      <em className={open ? 'is-open' : ''}>{open ? 'Бүртгэл нээлттэй' : 'Урьдчилсан'}</em>
                      {uni.hsk ? <em>{uni.hsk}</em> : null}
                    </div>
                    {reqPreview.length > 0 ? (
                      <small className="uni-row__reqs">
                        <CheckCircle size={12} weight="fill" aria-hidden />
                        {reqPreview.join(' · ')}
                      </small>
                    ) : null}
                  </div>
                  <CaretRight className="uni-row__chev" size={18} weight="bold" aria-hidden />
                </Pressable>
              </li>
            )
          })}
        </ul>

        {list.length === 0 ? (
          <div className="uni-empty">
            <p>Улс олдсонгүй</p>
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

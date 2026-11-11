import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, MagnifyingGlass, SealCheck, X } from '@phosphor-icons/react'
import { countries } from '../data'
import CountryMatch from '../components/CountryMatch'
import MyAuPairPanel from '../components/MyAuPairPanel'
import Pressable from '../components/Pressable'
import SoftImage from '../components/SoftImage'
import { GlassCard, GlassChips, RedHero, Reveal, SectionHead } from '../components/glass/Glass'
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

const STEPS = [
  { n: 1, t: 'Улс тохируулах', s: '5 асуулт' },
  { n: 2, t: 'Хүсэлт илгээх', s: 'Аппаар шууд' },
  { n: 3, t: 'Материал бүрдүүлэх', s: 'Бид хамт' },
]

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
  const inputRef = useRef(null)

  const countryAccepted = useMemo(
    () => (myData?.enrollments || []).some((e) => e.kind === 'country' && e.status === 'accepted'),
    [myData?.enrollments],
  )
  // Зөвхөн нэвтэрсэн + админ улс зөвшөөрсөн / хөтөлбөрт оруулсан үед
  const isEnrolled = Boolean(user) && (Boolean(user.inProgram) || countryAccepted)

  // Search requests from Home / navbar focus the hero search field.
  useEffect(() => {
    const focus = () => setTimeout(() => inputRef.current?.focus(), 30)
    function onQuery(e) {
      const next = String(e?.detail || '')
      if (next) setQuery(next)
      focus()
    }
    window.addEventListener('aupair:countries-search', focus)
    window.addEventListener('aupair:countries-search-open', focus)
    window.addEventListener('aupair:countries-search-query', onQuery)
    return () => {
      window.removeEventListener('aupair:countries-search', focus)
      window.removeEventListener('aupair:countries-search-open', focus)
      window.removeEventListener('aupair:countries-search-query', onQuery)
    }
  }, [])

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
  const openCount = countries.filter((c) => c.open !== false).length

  // Элссэн: зөвхөн үйл явц + бүрдүүлэх материал (улсын жагсаалт нуугдана)
  if (isEnrolled) {
    return (
      <div className="uni-page">
        <RedHero kicker="Миний хөтөлбөр" title="Au Pair" lead="Үйл явц · бүрдүүлэх материал" />
        <div className="container ap-enrolled">
          <MyAuPairPanel user={user} standalone />
        </div>
      </div>
    )
  }

  return (
    <div className="uni-page">
      <RedHero
        kicker="Албан ёсны хөтөлбөр · IAPA"
        title="Au Pair"
        lead="Гэр бүлд амьдарч, хэл сурч, Европт туршлага хуримтлуул."
      >
        <label className="rh-search">
          <MagnifyingGlass size={20} weight="bold" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            placeholder="Улс, хот, хэл хайх"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Улс хайх"
          />
          {query ? (
            <button
              type="button"
              aria-label="Цэвэрлэх"
              onClick={() => {
                haptic('light')
                setQuery('')
                inputRef.current?.focus()
              }}
            >
              <X size={14} weight="bold" aria-hidden />
            </button>
          ) : null}
        </label>
      </RedHero>

      <GlassChips items={FILTERS} value={filter} onChange={setFilter} layoutId="uni-seg" label="Хэл" overlap />

      {showFeatured ? (
        <div className="container ap-grid">
          <Reveal className="ap-grid__a">
            <Pressable as={Link} to={`/countries/${featured.id}`} scale={0.97} className="ap-feature">
              <SoftImage src={featured.image} alt="" />
              <span className="ap-pill">
                <i className={featured.open !== false ? 'is-open' : ''} aria-hidden />
                {featured.open !== false ? 'Нээлттэй' : 'Удахгүй'}
              </span>
              <span className="ap-feature__body">
                <small>Онцлох</small>
                <strong>
                  {FLAGS[featured.id]} {featured.nameMn}
                </strong>
                <em>
                  {featured.hsk} · {featured.duration}
                </em>
              </span>
            </Pressable>
          </Reveal>

          <Reveal i={1} className="ap-grid__b">
            <GlassCard tone="ink" className="ap-stat">
              <span className="ap-stat__top">
                <span>Элсэлт</span>
                <SealCheck size={18} weight="fill" aria-hidden />
              </span>
              <strong>
                {openCount}
                <em> / {countries.length} улс</em>
              </strong>
              <small>{openCount > 0 ? 'нээлттэй байна' : 'удахгүй нээгдэнэ'}</small>
            </GlassCard>
          </Reveal>

          <Reveal i={2} className="ap-grid__c">
            <GlassCard className="ap-steps">
              <span className="ap-stat__top">
                <span>3 алхам</span>
              </span>
              <ol>
                {STEPS.map((s) => (
                  <li key={s.n}>
                    <b>{s.n}</b>
                    <span>{s.t}</span>
                  </li>
                ))}
              </ol>
            </GlassCard>
          </Reveal>
        </div>
      ) : null}

      {showFeatured ? (
        <section className="ap-section">
          <SectionHead title="Тохирох улсаа ол" />
          <div className="container">
            <CountryMatch />
          </div>
        </section>
      ) : null}

      <section className="ap-section">
        <SectionHead title={q || filter !== 'all' ? `${list.length} улс` : 'Бүх улс'} />
        <ul className="container ap-tiles">
          {list.map((uni, i) => {
            const open = uni.open !== false
            return (
              <li key={uni.id}>
                <Reveal i={i % 4}>
                  <Pressable
                    as={Link}
                    to={`/countries/${uni.id}`}
                    className="ap-tile"
                    scale={0.96}
                    aria-label={`${uni.nameMn} Au Pair`}
                  >
                    <SoftImage src={uni.image} alt="" />
                    <span className="ap-tile__go" aria-hidden>
                      <ArrowUpRight size={14} weight="bold" />
                    </span>
                    <span className="ap-tile__glass">
                      <strong>
                        {FLAGS[uni.id] || '🇪🇺'} {uni.nameMn}
                      </strong>
                      <small>
                        <i className={open ? 'is-open' : ''} aria-hidden />
                        {open ? 'Нээлттэй' : uni.duration}
                      </small>
                    </span>
                  </Pressable>
                </Reveal>
              </li>
            )
          })}
        </ul>

        {list.length === 0 ? (
          <div className="container ap-empty">
            <p>Улс олдсонгүй</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setFilter('all')
                setQuery('')
              }}
            >
              Бүгдийг харах
            </button>
          </div>
        ) : null}
      </section>
    </div>
  )
}

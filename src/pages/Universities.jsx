import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { countries, social } from '../data'
import './Universities.css'

const FILTERS = [
  { id: 'all', label: 'Бүгд' },
  { id: 'open', label: 'Элсэлт нээлттэй' },
  { id: 'german', label: 'Герман хэл' },
  { id: 'french', label: 'Франц хэл' },
  { id: 'north', label: 'Хойд Европ' },
]

function matchesFilter(country, filter) {
  if (filter === 'all') return true
  if (filter === 'open') return country.open
  return country.langGroup === filter
}

export default function Universities() {
  const [filter, setFilter] = useState('all')
  const [slide, setSlide] = useState(0)

  const featured = useMemo(
    () => countries.filter((u) => u.featured),
    [],
  )

  const list = useMemo(
    () => countries.filter((u) => matchesFilter(u, filter)),
    [filter],
  )

  useEffect(() => {
    if (featured.length < 2) return undefined
    const timer = setInterval(() => {
      setSlide((i) => (i + 1) % featured.length)
    }, 4200)
    return () => clearInterval(timer)
  }, [featured.length])

  const current = featured[slide] || featured[0]

  return (
    <div className="uni-page fade-up">
      <div className="container">
        {current ? (
          <section className="uni-banner" aria-label="Au Pair улс орнууд">
            <div className="uni-banner__frame">
              {featured.map((uni, i) => (
                <Link
                  key={uni.id}
                  to={`/universities/${uni.id}`}
                  className={
                    i === slide
                      ? 'uni-banner__slide is-active'
                      : 'uni-banner__slide'
                  }
                  aria-hidden={i !== slide}
                  tabIndex={i === slide ? 0 : -1}
                >
                  <img
                    src={uni.image}
                    alt=""
                    loading={i === 0 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      e.currentTarget.src = '/cover.jpg'
                    }}
                  />
                  <div className="uni-banner__shade" aria-hidden />
                  <div className="uni-banner__body">
                    <span className="uni-banner__kicker">Au Pair · элсэлт авч байна</span>
                    <strong>{uni.nameMn}</strong>
                    <p>
                      {uni.city} · {uni.language}
                    </p>
                    <em>Элсэх →</em>
                  </div>
                </Link>
              ))}
            </div>

            <div className="uni-banner__dots" role="tablist" aria-label="Слайд">
              {featured.map((uni, i) => (
                <button
                  key={uni.id}
                  type="button"
                  className={i === slide ? 'is-on' : ''}
                  aria-label={`${uni.short} слайд`}
                  aria-selected={i === slide}
                  onClick={() => setSlide(i)}
                />
              ))}
            </div>
          </section>
        ) : null}

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

        <div className="uni-grid">
          {list.map((uni) => {
            const seats = uni.seatsLeft
            const total = uni.seats || 10
            const filled =
              typeof seats === 'number'
                ? Math.min(100, Math.round(((total - seats) / total) * 100))
                : 0
            return (
              <article key={uni.id} className="uni-card">
                <Link to={`/universities/${uni.id}`} className="uni-card__media">
                  <img
                    src={uni.image}
                    alt={uni.nameMn}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/cover.jpg'
                    }}
                  />
                  <div className="uni-card__overlay" aria-hidden />
                  <div className="uni-card__media-top">
                    <span className="uni-card__mark">{uni.short}</span>
                    {uni.badge ? <span className="uni-card__badge">{uni.badge}</span> : null}
                  </div>
                  <div className="uni-card__media-bottom">
                    <span>{uni.city}</span>
                    <strong>{uni.language}</strong>
                  </div>
                </Link>

                <div className="uni-card__body">
                  <h2>
                    <Link to={`/universities/${uni.id}`}>{uni.nameMn}</Link>
                  </h2>
                  <p className="uni-card__en">{uni.name} Au Pair</p>

                  <ul className="uni-card__facts">
                    <li>
                      <PinIcon />
                      <span>{uni.city}</span>
                    </li>
                    <li>
                      <BookIcon />
                      <span>{uni.language}</span>
                    </li>
                    <li>
                      <CalIcon />
                      <span>{uni.intake}</span>
                    </li>
                    <li>
                      <LevelIcon />
                      <span>{uni.duration}</span>
                    </li>
                  </ul>

                  {typeof seats === 'number' ? (
                    <p className="uni-card__en" style={{ marginTop: '0.35rem' }}>
                      {seats} суудал үлдсэн · {filled}% дүүрсэн
                    </p>
                  ) : null}

                  <div className="uni-card__foot">
                    <div className="uni-card__price">
                      <small>Нөхцөл</small>
                      <strong>{uni.tuition}</strong>
                    </div>
                    <Link to={`/universities/${uni.id}`} className="uni-card__cta">
                      Элсэх
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {list.length === 0 ? (
          <p className="uni-empty">Энэ шүүлтээр улс олдсонгүй.</p>
        ) : null}

        <div className="uni-cta">
          <div>
            <h3>Ямар улс руу явахаа мэдэхгүй байна уу?</h3>
            <p>
              Нас, хэл, зорилгоо хэлээд тохирох Au Pair улс, гэр бүл, визийн процессыг хамт хийнэ.
            </p>
          </div>
          <div className="uni-cta__actions">
            <a href={`tel:${social.phoneTel}`} className="btn btn-primary">
              Залгах
            </a>
            <a
              href={social.messenger}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
            >
              Messenger
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
      <path
        d="M12 20s5-4 5-7.8A5 5 0 0 0 7 12.2C7 16 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.2" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
      <path
        d="M5 6a2 2 0 0 1 2-2h11v14H7a2 2 0 0 0-2 2V6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CalIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
      <rect x="4.5" y="6" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M8 4.5V7M16 4.5V7M4.5 10h15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LevelIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
      <path
        d="M5 17h4V7H5v10Zm5 0h4V4h-4v13Zm5 0h4v-8h-4v8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

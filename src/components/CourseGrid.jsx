import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { coursesFallback } from '../data'
import './CourseGrid.css'

const FILTERS = [
  { id: 'all', label: 'Бүгд' },
  { id: 'A1', label: 'A1' },
  { id: 'A2', label: 'A2' },
]

function matchesFilter(course, filter) {
  if (course.type === 'country') return false
  return filter === 'all' || course.level === filter
}

export default function CourseGrid({
  limit,
  showAllLink = false,
  showFilters = false,
}) {
  const [filter, setFilter] = useState('all')
  const [list, setList] = useState(coursesFallback)
  const loading = list.length === 0

  useEffect(() => {
    let alive = true
    const load = () =>
      api
        .getCourses()
        .then((data) => {
          if (alive) setList(data)
        })
        .catch(() => {})
    load()
    window.addEventListener('app:refresh', load)
    return () => {
      alive = false
      window.removeEventListener('app:refresh', load)
    }
  }, [])

  const visible = useMemo(() => {
    const filtered = list.filter((c) => matchesFilter(c, filter))
    return limit ? filtered.slice(0, limit) : filtered
  }, [list, filter, limit])

  return (
    <div className="course-grid-wrap">
      {showAllLink && (
        <div className="section-head">
          <div>
            <span className="eyebrow">Хөтөлбөр</span>
            <h2>Элсэлт нээлттэй ангиуд</h2>
          </div>
          <Link to="/courses" className="link-more">
            Бүгдийг харах →
          </Link>
        </div>
      )}

      {showFilters && (
        <div className="course-filters" role="tablist" aria-label="Шүүлтүүр">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={
                filter === f.id ? 'course-filters__btn is-active' : 'course-filters__btn'
              }
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="course-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="course-card course-card--skeleton" aria-hidden />
          ))}
        </div>
      )}

      {!loading && visible.length === 0 && (
        <p className="course-empty">Энэ ангилалд сургалт олдсонгүй.</p>
      )}

      {!loading && (
        <div className="course-grid">
          {visible.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}

function CourseCard({ course }) {
  const seats = course.seatsLeft
  const full = typeof seats === 'number' && seats <= 0
  const total = course.seats || 16
  const filled =
    typeof seats === 'number'
      ? Math.min(100, Math.round(((total - seats) / total) * 100))
      : 40
  const accent = Boolean(course.badge)

  return (
    <article className="course-card">
      <div className="course-card__head">
        <span className="course-card__hsk">{course.hsk || 'AP'}</span>
        {accent ? (
          <span className="course-card__badge">{course.badge}</span>
        ) : course.level ? (
          <span className="course-card__level">{course.level}</span>
        ) : null}
      </div>

      <h3 className="course-card__title">{course.title}</h3>
      {course.subtitle ? (
        <p className="course-card__sub">{course.subtitle}</p>
      ) : null}

      <ul className="course-card__facts">
        <li>
          <ClockIcon />
          <span>{course.duration}</span>
        </li>
        <li>
          <PinIcon />
          <span>{course.mode}</span>
        </li>
        {course.schedule ? (
          <li className="is-wide">
            <CalIcon />
            <span>{course.schedule}</span>
          </li>
        ) : null}
      </ul>

      {typeof seats === 'number' ? (
        <div className={`course-card__seats${full ? ' is-full' : ''}`}>
          <div className="course-card__seats-row">
            <span className="course-card__seats-pill">
              {full ? 'Суудал дууссан' : `${seats} суудал үлдсэн`}
            </span>
            <em>{filled}% дүүрсэн</em>
          </div>
          <div className="course-card__bar" aria-hidden>
            <i style={{ width: `${full ? 100 : filled}%` }} />
          </div>
        </div>
      ) : null}

      <div className="course-card__foot">
        <div className="course-card__price">
          <small>Төлбөр</small>
          <strong>{course.priceLabel || course.price}</strong>
        </div>
        <Link
          to={`/courses/${course.id}`}
          className={`course-card__cta${full ? ' is-disabled' : ''}`}
          aria-disabled={full}
          onClick={(e) => {
            if (full) e.preventDefault()
          }}
        >
          {full ? 'Дууссан' : 'Дэлгэрэнгүй'}
        </Link>
      </div>
    </article>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 8.5V12l2.5 1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <path
        d="M12 20s5.5-4.2 5.5-8.2A5.5 5.5 0 0 0 12 6.3a5.5 5.5 0 0 0-5.5 5.5C6.5 15.8 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11.8" r="1.7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function CalIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <rect x="4.5" y="6" width="15" height="13.5" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 4.5V7.5M16 4.5V7.5M4.5 10.5h15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

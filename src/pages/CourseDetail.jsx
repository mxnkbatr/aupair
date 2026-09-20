import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { coursesFallback, social } from '../data'
import EnrollForm from '../components/EnrollForm'
import Sheet from '../components/Sheet'
import './CourseDetail.css'

export default function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState(
    () => coursesFallback.find((c) => c.id === id) || null,
  )
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setError('')
    api
      .getCourse(id)
      .then((data) => {
        if (alive) setCourse(data)
      })
      .catch(() => {
        const fallback = coursesFallback.find((c) => c.id === id)
        if (alive) {
          if (fallback) setCourse(fallback)
          else setError('Хөтөлбөр олдсонгүй')
        }
      })
    return () => {
      alive = false
    }
  }, [id])

  if (error) {
    return (
      <div className="container fade-up" style={{ padding: '2rem 0' }}>
        <h1>Олдсонгүй</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{error}</p>
        <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Буцах
        </Link>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container course-detail-loading fade-up">
        <div className="course-detail-loading__block" />
        <div className="course-detail-loading__block is-short" />
      </div>
    )
  }

  const full = course.seatsLeft === 0
  const seats = course.seatsLeft
  const total = course.seats || 16
  const filled =
    typeof seats === 'number'
      ? Math.min(100, Math.round(((total - seats) / total) * 100))
      : 40

  return (
    <div className="course-detail fade-up">
      <div className="container">
        <section className="cd-hero">
          <div className="cd-hero__banner">
            <div className="cd-hero__badge-row">
              <span className="cd-hero__hsk">{course.hsk || 'AP'}</span>
              {course.badge ? (
                <span className="cd-hero__status">{course.badge}</span>
              ) : null}
            </div>
            <span className="cd-hero__level">{course.level}</span>
            <h1>{course.title}</h1>
            {course.subtitle ? <p>{course.subtitle}</p> : null}
          </div>
        </section>

        <section className="cd-stats" aria-label="Үндсэн мэдээлэл">
          <div className="cd-stat">
            <span className="cd-stat__label">Хугацаа</span>
            <strong>{course.duration}</strong>
          </div>
          <div className="cd-stat">
            <span className="cd-stat__label">Хэлбэр</span>
            <strong>{course.mode}</strong>
          </div>
          <div className="cd-stat">
            <span className="cd-stat__label">Суудал</span>
            <strong>
              {typeof seats === 'number' ? (full ? 'Дууссан' : seats) : '—'}
            </strong>
          </div>
        </section>

        {course.schedule ? (
          <section className="cd-schedule">
            <div>
              <span>Хуваарь</span>
              <strong>{course.schedule}</strong>
            </div>
            <a href={`tel:${social.phoneTel}`} className="cd-schedule__call">
              Залгах
            </a>
          </section>
        ) : null}

        {typeof seats === 'number' && !full ? (
          <section className="cd-seats">
            <div className="cd-seats__row">
              <span>{seats} суудал үлдсэн</span>
              <span>{filled}% дүүрсэн</span>
            </div>
            <div className="cd-seats__bar" aria-hidden>
              <i style={{ width: `${filled}%` }} />
            </div>
          </section>
        ) : null}

        <section className="cd-block">
          <h2>Юу сурах вэ?</h2>
          {course.description ? <p className="cd-block__lead">{course.description}</p> : null}
          <ul className="cd-list">
            {(course.points || []).map((point, i) => (
              <li key={point}>
                <span className="cd-list__num">{i + 1}</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="cd-block cd-block--soft">
          <h2>Яагаад Mongolian Au Pair?</h2>
          <div className="cd-why">
            <div>
              <strong>2005 оноос</strong>
              <span>3,000+ залуусыг Европ руу зуучилсан</span>
            </div>
            <div>
              <strong>Албан ёсны хөтөлбөр</strong>
              <span>1969 оны Олон Улсын Конвенц</span>
            </div>
            <div>
              <strong>Хэлний бэлтгэл</strong>
              <span>Франц, герман хэлний ангитай</span>
            </div>
          </div>
        </section>
      </div>

      <div className="cd-bar">
        <div className="cd-bar__price">
          <small>Төлбөр</small>
          <strong>{course.priceLabel}</strong>
        </div>
        <button
          type="button"
          className="btn btn-primary cd-bar__cta"
          onClick={() => setOpen(true)}
          disabled={full}
        >
          {full ? 'Суудал дууссан' : 'Бүртгүүлэх'}
        </button>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Ангид бүртгүүлэх">
        <EnrollForm
          course={course}
          onSuccess={(res) => {
            if (typeof res.seatsLeft === 'number') {
              setCourse((c) => ({ ...c, seatsLeft: res.seatsLeft }))
            }
          }}
        />
      </Sheet>
    </div>
  )
}

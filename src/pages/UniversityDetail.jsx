import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { countries, social } from '../data'
import EnrollForm from '../components/EnrollForm'
import Sheet from '../components/Sheet'
import './UniversityDetail.css'

export default function UniversityDetail() {
  const { id } = useParams()
  const uni = useMemo(() => countries.find((u) => u.id === id), [id])
  const [open, setOpen] = useState(false)
  const [seatsLeft, setSeatsLeft] = useState(uni?.seatsLeft)

  useEffect(() => {
    if (!uni) return undefined
    let alive = true
    api
      .getCourse(uni.id)
      .then((data) => {
        if (alive && typeof data.seatsLeft === 'number') setSeatsLeft(data.seatsLeft)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [uni])

  if (!uni) {
    return (
      <div className="container fade-up" style={{ padding: '2rem 0' }}>
        <h1>Олдсонгүй</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          Au Pair улс олдсонгүй
        </p>
        <Link to="/universities" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Улс орнууд руу
        </Link>
      </div>
    )
  }

  const seats = typeof seatsLeft === 'number' ? seatsLeft : uni.seatsLeft
  const total = uni.seats || 10
  const full = typeof seats === 'number' && seats <= 0
  const filled =
    typeof seats === 'number'
      ? Math.min(100, Math.round(((total - seats) / total) * 100))
      : 0

  const course = {
    id: uni.id,
    title: `${uni.nameMn} Au Pair`,
    priceLabel: uni.priceLabel || 'Зөвлөгөө үнэгүй',
    seatsLeft: seats,
    seats: total,
    level: 'Au Pair',
  }

  return (
    <div className="ud fade-up">
      <div className="container">
        <section className="ud-hero">
          <div className="ud-hero__media">
            <img
              src={uni.image}
              alt=""
              onError={(e) => {
                e.currentTarget.src = '/cover.jpg'
              }}
            />
            <div className="ud-hero__shade" aria-hidden />
            <div className="ud-hero__media-top">
              <span className="ud-hero__mark">{uni.short}</span>
              {uni.badge ? <span className="ud-hero__badge">{uni.badge}</span> : null}
            </div>
            <p className="ud-hero__city">{uni.city}</p>
          </div>

          <div className="ud-hero__copy">
            <h1>{uni.nameMn} Au Pair</h1>
            <p className="ud-hero__en">{uni.name} · {uni.language}</p>
            <p className="ud-hero__lead">{uni.description}</p>
          </div>
        </section>

        <section className="ud-facts" aria-label="Үндсэн мэдээлэл">
          <div>
            <small>Хот</small>
            <strong>{uni.city}</strong>
          </div>
          <div>
            <small>Хэл</small>
            <strong>{uni.language}</strong>
          </div>
          <div>
            <small>Элсэлт</small>
            <strong>{uni.intake}</strong>
          </div>
          <div>
            <small>Түвшин</small>
            <strong>{uni.hsk}</strong>
          </div>
          <div>
            <small>Хугацаа</small>
            <strong>{uni.duration}</strong>
          </div>
          <div>
            <small>Нөхцөл</small>
            <strong>{uni.tuition}</strong>
          </div>
        </section>

        {typeof seats === 'number' ? (
          <section className="ud-block">
            <h2>Суудал</h2>
            <p>
              {full
                ? 'Энэ улсын суудал дууссан байна.'
                : `${seats} суудал үлдсэн · ${filled}% дүүрсэн`}
            </p>
          </section>
        ) : null}

        <section className="ud-block">
          <h2>Яагаад энэ улс?</h2>
          <p>{uni.why}</p>
        </section>

        <section className="ud-block">
          <h2>Хөтөлбөрийн онцлог</h2>
          <ul className="ud-list">
            {(uni.points || []).map((point, i) => (
              <li key={point}>
                <span>{i + 1}</span>
                {point}
              </li>
            ))}
          </ul>
        </section>

        <section className="ud-block">
          <h2>Шаардлага</h2>
          <ul className="ud-reqs">
            {(uni.requirements || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="ud-help">
          <strong>Mongolian Au Pair зуучлал</strong>
          <p>
            Гэр бүлтэй тохирох, виза, хэлний бэлтгэл, бичиг баримтын явцад бид тантай хамт ажиллана.
            1969 оны Олон Улсын Конвенцийн дагуу албан ёсны хөтөлбөр.
          </p>
        </section>
      </div>

      <div className="ud-bar">
        <div className="ud-bar__meta">
          <small>{full ? 'Суудал' : 'Элсэлт'}</small>
          <strong>{full ? 'Дууссан' : 'Нээлттэй'}</strong>
        </div>
        <button
          type="button"
          className="btn btn-primary ud-bar__cta"
          onClick={() => setOpen(true)}
          disabled={full}
        >
          {full ? 'Суудал дууссан' : 'Элсэх'}
        </button>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={`${uni.nameMn} руу элсэх`}>
        <EnrollForm
          course={course}
          onSuccess={(res) => {
            if (typeof res.seatsLeft === 'number') setSeatsLeft(res.seatsLeft)
          }}
        />
      </Sheet>
    </div>
  )
}

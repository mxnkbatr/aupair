import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { universities, social } from '../data'
import './UniversityDetail.css'

export default function UniversityDetail() {
  const { id } = useParams()
  const uni = useMemo(() => universities.find((u) => u.id === id), [id])

  if (!uni) {
    return (
      <div className="container fade-up" style={{ padding: '2rem 0' }}>
        <h1>Олдсонгүй</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          Их сургууль олдсонгүй
        </p>
        <Link to="/universities" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Жагсаалт руу
        </Link>
      </div>
    )
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
            <h1>{uni.nameMn}</h1>
            <p className="ud-hero__en">{uni.name}</p>
            <p className="ud-hero__lead">{uni.description}</p>
          </div>
        </section>

        <section className="ud-facts" aria-label="Үндсэн мэдээлэл">
          <div>
            <small>Хот</small>
            <strong>{uni.city}</strong>
          </div>
          <div>
            <small>Чиглэл</small>
            <strong>{uni.focus}</strong>
          </div>
          <div>
            <small>Элсэлт</small>
            <strong>{uni.intake}</strong>
          </div>
          <div>
            <small>HSK</small>
            <strong>{uni.hsk}</strong>
          </div>
          <div>
            <small>Хугацаа</small>
            <strong>{uni.duration}</strong>
          </div>
          <div>
            <small>Төлбөр</small>
            <strong>{uni.tuition}</strong>
          </div>
        </section>

        <section className="ud-block">
          <h2>Яагаад энэ сургууль?</h2>
          <p>{uni.why}</p>
        </section>

        <section className="ud-block">
          <h2>Онцлог</h2>
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
          <strong>ХАНЗ зуучлал</strong>
          <p>
            Бичиг баримт бэлтгэх, сургууль сонгох, элсэлтийн явцад бид тантай хамт ажиллана.
          </p>
        </section>
      </div>

      <div className="ud-bar">
        <div className="ud-bar__meta">
          <small>Зөвлөгөө</small>
          <strong>Үнэгүй</strong>
        </div>
        <a href={`tel:${social.phoneTel}`} className="btn btn-primary ud-bar__cta">
          Залгах
        </a>
      </div>
    </div>
  )
}

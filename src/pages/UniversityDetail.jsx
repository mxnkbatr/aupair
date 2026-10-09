import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { countries } from '../data'
import EnrollForm from '../components/EnrollForm'
import Sheet from '../components/Sheet'
import ShareButton from '../components/ShareButton'
import './UniversityDetail.css'

export default function UniversityDetail() {
  const { id } = useParams()
  const uni = useMemo(() => countries.find((u) => u.id === id), [id])
  const [open, setOpen] = useState(false)

  if (!uni) {
    return (
      <div className="container fade-up" style={{ padding: '2rem 0' }}>
        <h1>Олдсонгүй</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          Au Pair улс олдсонгүй
        </p>
        <Link to="/countries" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Улсууд руу
        </Link>
      </div>
    )
  }

  const isOpen = uni.open !== false

  const course = {
    id: uni.id,
    title: `${uni.nameMn} Au Pair`,
    priceLabel: uni.priceLabel || 'Зөвлөгөө үнэгүй',
  }

  return (
    <div className="ud fade-up">
      <div className="container">
        <section className="ud-hero">
          <div className="ud-hero__media">
            <motion.img
              layoutId={`country-img-${uni.id}`}
              src={uni.image}
              alt=""
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
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
            <ShareButton
              className="share-btn--bottom"
              title={`${uni.nameMn} Au Pair`}
              text={`${uni.nameMn} Au Pair — элсэлт`}
            />
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
          <small>Элсэлт</small>
          <strong>{isOpen ? 'Нээлттэй' : 'Урьдчилсан бүртгэл'}</strong>
        </div>
        <button
          type="button"
          className="btn btn-primary ud-bar__cta"
          onClick={() => setOpen(true)}
        >
          {isOpen ? 'Элсэх' : 'Бүртгүүлэх'}
        </button>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={`${uni.nameMn} руу элсэх`}>
        <EnrollForm course={course} />
      </Sheet>
    </div>
  )
}

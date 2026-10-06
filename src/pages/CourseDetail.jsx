import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { CaretDown, Fire } from '@phosphor-icons/react'
import { api } from '../api'
import { coursesFallback, social } from '../data'
import EnrollForm from '../components/EnrollForm'
import Sheet from '../components/Sheet'
import ShareButton from '../components/ShareButton'
import Skeleton from '../components/Skeleton'
import './CourseDetail.css'

const FAQ = [
  { q: 'Төлбөр хэд вэ?', a: 'Зөвлөгөө үнэгүй. Ангийн төлбөрийг бүртгэлийн дараа тохиролцоно.' },
  { q: 'Хаана сурна вэ?', a: 'Улаанбаатар дахь танхимд. Хуваарийг доорх мэдээллээс харна уу.' },
  { q: 'Хэзээ эхлэх вэ?', a: 'Элсэлт нээлттэй үед шинэ бүлэг нээгдэнэ. Бүртгүүлээд бидэнтэй холбогдоорой.' },
]

export default function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState(() => coursesFallback.find((c) => c.id === id) || null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [faqOpen, setFaqOpen] = useState(0)

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
      <div className="container cd-error">
        <h1>Олдсонгүй</h1>
        <p>{error}</p>
        <Link to="/learn" className="btn btn-primary">
          Сурах руу буцах
        </Link>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="course-detail-loading" aria-label="Ачаалж байна" role="status">
        <Skeleton w="100%" h={300} r={0} />
        <div className="container course-detail-loading__body">
          <Skeleton h={64} r={24} />
          <Skeleton h={120} r={24} />
        </div>
      </div>
    )
  }

  const seats = course.seatsLeft ?? course.seats
  const hasSeats = typeof seats === 'number'
  const full = hasSeats && seats <= 0
  const level = String(course.level || course.hsk || 'A1').replace(/^DE\s*/i, '')
  const hero = course.image || '/cover.jpg'

  return (
    <div className="course-detail">
      <section className="cd-hero cd-hero--bleed">
        <motion.img
          layoutId={`course-img-${course.id}`}
          src={hero}
          alt=""
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          onError={(e) => {
            e.currentTarget.src = '/cover.jpg'
          }}
        />
        <div className="cd-hero__shade" aria-hidden />
        <ShareButton title={course.title} text={`${course.title} — элсэлт`} />
        <div className="cd-hero__content container">
          <div className="cd-hero__badge-row">
            <span className="cd-hero__status">{level}</span>
            <span className="cd-hero__status is-open">● Элсэлт нээлттэй</span>
          </div>
          <motion.h1 layoutId={`course-title-${course.id}`}>{course.title}</motion.h1>
          {course.subtitle ? <p>{course.subtitle}</p> : null}
        </div>
      </section>

      <div className="container">
        <section className="cd-facts" aria-label="Үндсэн мэдээлэл">
          <div>
            <span>Хугацаа</span>
            <strong>{course.duration}</strong>
          </div>
          <div>
            <span>Хэлбэр</span>
            <strong>{course.mode}</strong>
          </div>
          <div>
            <span>Хуваарь</span>
            <strong>{course.schedule || '—'}</strong>
          </div>
        </section>

        {hasSeats && !full ? (
          <section className="cd-seats">
            <span>
              <Fire weight="fill" size={16} aria-hidden /> {seats} суудал үлдсэн
            </span>
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

        <section className="cd-block">
          <h2>Түгээмэл асуулт</h2>
          <div className="cd-faq">
            {FAQ.map((item, i) => (
              <button
                key={item.q}
                type="button"
                className={faqOpen === i ? 'cd-faq__item is-open' : 'cd-faq__item'}
                onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}
              >
                <span>
                  <strong>{item.q}</strong>
                  {faqOpen === i ? <p>{item.a}</p> : null}
                </span>
                <CaretDown size={18} weight="bold" aria-hidden />
              </button>
            ))}
          </div>
        </section>

        <p className="cd-help">
          Асуулт байна уу?{' '}
          <a href={`tel:${social.phoneTel}`}>Залгах</a> ·{' '}
          <a href={social.messenger} target="_blank" rel="noreferrer">
            Messenger
          </a>
        </p>
      </div>

      <div className="cd-bar">
        <button
          type="button"
          className="btn btn-primary cd-bar__cta cd-bar__cta--full"
          onClick={() => setOpen(true)}
          disabled={full}
        >
          {full ? 'Суудал дууссан' : 'Бүртгүүлэх'}
        </button>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Бүртгүүлэх">
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

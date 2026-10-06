import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Clock, Gift, MapPin, Lock } from '@phosphor-icons/react'
import { products, social } from '../data'
import PageHeader from '../components/PageHeader'
import Pressable from '../components/Pressable'
import { SkeletonList } from '../components/Skeleton'
import DailyQuiz from '../features/german/DailyQuiz'
import useCourses from '../hooks/useCourses'
import { haptic } from '../native'
import './Learn.css'

const SEGMENTS = [
  { id: 'courses', label: 'Ангиуд' },
  { id: 'materials', label: 'Материал' },
  { id: 'practice', label: 'Дасгал' },
]

const PATH = [
  { level: 'A1', name: 'Анхан шат', course: 'german-a1' },
  { level: 'A2', name: 'Суурь', course: 'german-a2' },
  { level: 'B1', name: 'Дунд шат', course: null },
]

function CourseCard({ course }) {
  const seats = course.seatsLeft ?? course.seats
  const full = typeof seats === 'number' && seats <= 0
  const level = String(course.level || 'A1').replace(/^DE\s*/i, '')

  return (
    <Pressable as={Link} to={`/learn/course/${course.id}`} className="learn-card">
      <div className="learn-card__top">
        <span className="learn-card__level">{level}</span>
        {course.badge ? <span className="learn-card__badge">{course.badge}</span> : null}
      </div>
      <h3>{course.title}</h3>
      {course.subtitle ? <p>{course.subtitle}</p> : null}
      <ul className="learn-card__facts">
        <li>
          <Clock size={16} aria-hidden /> {course.duration}
        </li>
        <li>
          <MapPin size={16} aria-hidden /> {course.mode}
        </li>
      </ul>
      {typeof seats === 'number' && !full ? (
        <div className="learn-card__seats">
          <span>🔥 {seats} суудал үлдсэн</span>
        </div>
      ) : null}
      <span className="learn-card__cta">
        {full ? 'Дууссан' : 'Дэлгэрэнгүй'} <ArrowRight weight="bold" size={16} aria-hidden />
      </span>
    </Pressable>
  )
}

export default function Learn() {
  const [params, setParams] = useSearchParams()
  // The URL is the source of truth, so Home tiles can deep-link to /learn?tab=practice.
  const urlTab = params.get('tab')
  const tab = SEGMENTS.some((s) => s.id === urlTab) ? urlTab : 'courses'
  const { courses, loading } = useCourses()

  function pick(id) {
    if (id === tab) return
    haptic('selection')
    setParams(id === 'courses' ? {} : { tab: id }, { replace: true })
  }

  const checklist = products.find((p) => p.id === 'p3')

  return (
    <div className="learn container">
      <PageHeader title="Сурах" text="Герман хэл · материал · өдрийн дасгал" />

      <div className="seg" role="tablist" aria-label="Сурах хэсэг">
        {SEGMENTS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={tab === s.id}
            className={tab === s.id ? 'is-active' : ''}
            onClick={() => pick(s.id)}
          >
            {tab === s.id && (
              <motion.i
                layoutId="learn-seg"
                className="seg__pill"
                transition={{ type: 'spring', stiffness: 520, damping: 40 }}
              />
            )}
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {tab === 'courses' && (
        <>
          <section className="learn-path" aria-label="Түвшний зам">
            <h2>Түвшний зам</h2>
            <ol>
              {PATH.map((step, i) => {
                const available = step.course && courses.some((c) => c.id === step.course)
                const inner = (
                  <>
                    <i className="learn-path__node">
                      {step.course ? step.level : <Lock size={14} weight="bold" aria-hidden />}
                    </i>
                    <strong>{step.level}</strong>
                    <span>{step.course ? step.name : 'Удахгүй'}</span>
                  </>
                )
                return (
                  <li key={step.level} className={available ? 'is-open' : ''}>
                    {available ? (
                      <Link to={`/learn/course/${step.course}`}>{inner}</Link>
                    ) : (
                      <div>{inner}</div>
                    )}
                    {i < PATH.length - 1 ? <b className="learn-path__line" aria-hidden /> : null}
                  </li>
                )
              })}
            </ol>
          </section>

          <section className="learn-list" aria-label="Ангиуд">
            {loading ? (
              <SkeletonList count={2} h={190} />
            ) : (
              courses.map((course) => <CourseCard key={course.id} course={course} />)
            )}
          </section>

          {checklist ? (
            <Pressable as={Link} to={`/learn/item/${checklist.id}`} className="learn-teaser">
              <span className="learn-teaser__icon">
                <Gift weight="fill" size={26} aria-hidden />
              </span>
              <div>
                <strong>Үнэгүй чеклист</strong>
                <span>Au Pair бичиг баримтын жагсаалт — паспорт, анкет, эрүүл мэнд.</span>
              </div>
              <ArrowRight weight="bold" size={18} aria-hidden />
            </Pressable>
          ) : null}
        </>
      )}

      {tab === 'materials' && (
        <section className="learn-materials" aria-label="Материал">
          {products.map((item) => (
            <Pressable
              key={item.id}
              as={Link}
              to={`/learn/item/${item.id}`}
              className="learn-material"
            >
              <span className="learn-material__tag">{item.tag}</span>
              <h3>{item.name}</h3>
              <p>{item.blurb}</p>
              <strong>{item.price}</strong>
            </Pressable>
          ))}
          <p className="learn-note">
            Захиалахдаа утас, нэрээ үлдээнэ — бид холбогдоно.{' '}
            <a href={social.messenger} target="_blank" rel="noreferrer">
              Messenger
            </a>
          </p>
        </section>
      )}

      {tab === 'practice' && <DailyQuiz />}
    </div>
  )
}

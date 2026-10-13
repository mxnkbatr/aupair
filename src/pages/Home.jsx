import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { MessengerLogo, Phone } from '@phosphor-icons/react'
import { useAuth } from '../auth'
import { countries, org, social } from '../data'
import JourneyTimeline, {
  JOURNEY_STEPS,
  journeyIndex,
  programStageIndex,
} from '../components/JourneyTimeline'
import Pressable from '../components/Pressable'
import SoftImage from '../components/SoftImage'
import { SkeletonRow } from '../components/Skeleton'
import { PROGRAM_STAGES } from '../data/program'
import useCourses from '../hooks/useCourses'
import useMyData from '../hooks/useMyData'
import './Home.css'

const spring = { type: 'spring', stiffness: 420, damping: 34 }
const reveal = { type: 'spring', stiffness: 360, damping: 32 }

function flagFor(id) {
  const map = {
    germany: '🇩🇪',
    france: '🇫🇷',
    austria: '🇦🇹',
    switzerland: '🇨🇭',
    belgium: '🇧🇪',
    netherlands: '🇳🇱',
    denmark: '🇩🇰',
  }
  return map[id] || '🇪🇺'
}

function Reveal({ children, delay = 0, className = '', reduce }) {
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...reveal, delay }}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const data = useMyData()
  const { courses, loading } = useCourses()
  const reduce = useReducedMotion()

  const enrollments = data?.enrollments || []
  const inProgram = Boolean(user?.inProgram)
  const step = inProgram ? programStageIndex(user) : journeyIndex(user, enrollments)
  const stepLabel = inProgram
    ? PROGRAM_STAGES[step]?.label || JOURNEY_STEPS[step]?.label
    : JOURNEY_STEPS[step]?.label
  const stepHint = inProgram
    ? PROGRAM_STAGES[step]?.hint || ''
    : JOURNEY_STEPS[step]?.hint || ''
  const journeyCta = !user
    ? { to: '/me', state: { auth: 'register' }, label: 'Бүртгэл үүсгэх' }
    : inProgram
      ? { to: '/me/program', label: 'Аяллаа харах' }
      : enrollments.length === 0
        ? { to: '/learn', label: 'Анги сонгох' }
        : { to: '/me', label: 'Явцаа харах' }

  return (
    <div className="home">
      <Reveal className="container home-section home-section--first" delay={0} reduce={reduce}>
        {!user ? (
          <Pressable as={Link} to="/me" state={{ auth: 'register' }} className="journey-card journey-card--intro">
            <span className="journey-card__kicker">Au Pair гэж юу вэ?</span>
            <strong>60 секундэд ойлгоорой</strong>
            <small>Гэр бүлд амьдарч, хэл сурч, Европт туршлага хуримтлуулна.</small>
            <span className="journey-card__cta">Бүртгэл үүсгэх</span>
          </Pressable>
        ) : inProgram ? (
          <Pressable as={Link} to="/me/program" className="journey-card">
            <div className="journey-card__head">
              <span className="journey-card__kicker">Миний Au Pair аялал</span>
              <strong>{stepLabel}</strong>
              <small>{stepHint}</small>
            </div>
            <JourneyTimeline user={user} mode="program" compact />
            <span className="journey-card__cta">{journeyCta.label}</span>
          </Pressable>
        ) : (
          <Pressable as={Link} to={journeyCta.to} className="journey-card">
            <div className="journey-card__head">
              <span className="journey-card__kicker">Миний Au Pair аялал</span>
              <strong>{stepLabel}</strong>
              <small>{stepHint}</small>
            </div>
            <JourneyTimeline user={user} enrollments={enrollments} compact />
            <span className="journey-card__cta">{journeyCta.label}</span>
          </Pressable>
        )}
      </Reveal>

      <Reveal className="home-section" delay={0.06} reduce={reduce}>
        <div className="container block-head">
          <h2>Элсэлт нээлттэй</h2>
          <Link to="/learn" className="link-more">
            Бүгд
          </Link>
        </div>
        {loading ? (
          <SkeletonRow count={2} w={260} h={180} />
        ) : (
          <div className="home-rail">
            {courses.slice(0, 4).map((course, i) => {
              const seats = course.seatsLeft
              const level = String(course.level || 'A1').replace(/^DE\s*/i, '')
              return (
                <Pressable
                  key={course.id}
                  as={Link}
                  to={`/learn/course/${course.id}`}
                  className="home-course"
                  style={reduce ? undefined : { animationDelay: `${0.08 + i * 0.05}s` }}
                >
                  <motion.div
                    className="home-course__media"
                    layoutId={`course-img-${course.id}`}
                    transition={spring}
                  >
                    <SoftImage src={course.image || '/cover.jpg'} alt="" />
                    <span className="home-course__level">{level}</span>
                  </motion.div>
                  <motion.h3 layoutId={`course-title-${course.id}`} transition={spring}>
                    {course.title}
                  </motion.h3>
                  <p>
                    {course.duration} · {course.mode}
                  </p>
                  {typeof seats === 'number' && seats > 0 ? (
                    <span className="home-course__foot">🔥 {seats} суудал үлдсэн</span>
                  ) : (
                    <span className="home-course__foot">{course.badge || 'Бүртгэл нээлттэй'}</span>
                  )}
                </Pressable>
              )
            })}
          </div>
        )}
      </Reveal>

      <Reveal className="home-section" delay={0.12} reduce={reduce}>
        <div className="container block-head">
          <h2>Улсууд</h2>
          <Link to="/countries" className="link-more">
            Бүгд
          </Link>
        </div>
        <div className="home-rail">
          {countries.slice(0, 6).map((c, i) => (
            <Pressable
              key={c.id}
              as={Link}
              to={`/countries/${c.id}`}
              className="home-country"
              style={reduce ? undefined : { animationDelay: `${0.14 + i * 0.04}s` }}
            >
              <motion.div
                className="home-country__media"
                layoutId={`country-img-${c.id}`}
                transition={spring}
              >
                <SoftImage src={c.image} alt="" />
              </motion.div>
              <span className="home-country__shade" aria-hidden />
              <span className="home-country__text">
                <strong>
                  {flagFor(c.id)} {c.nameMn}
                </strong>
                <small>{c.city}</small>
              </span>
            </Pressable>
          ))}
        </div>
      </Reveal>

      <Reveal className="container home-section home-section--end" delay={0.18} reduce={reduce}>
        <div className="advice-card">
          <h2>Зөвлөгөө авах</h2>
          <p>
            {org.legalName} · {org.since} оноос · IAPA гишүүн. Аль улс, аль анги тохирохыг хамт
            сонгоё — үнэгүй.
          </p>
          <div className="advice-card__actions">
            <a className="btn btn-primary" href={social.messenger} target="_blank" rel="noreferrer">
              <MessengerLogo weight="fill" size={18} aria-hidden /> Messenger
            </a>
            <a className="btn btn-ghost" href={`tel:${social.phoneTel}`}>
              <Phone weight="fill" size={18} aria-hidden /> Залгах
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  )
}

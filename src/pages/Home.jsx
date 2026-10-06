import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { MessengerLogo, Phone, UserCircle } from '@phosphor-icons/react'
import { useAuth } from '../auth'
import { countries, social } from '../data'
import JourneyTimeline, { JOURNEY_STEPS, journeyIndex } from '../components/JourneyTimeline'
import Pressable from '../components/Pressable'
import { SkeletonRow } from '../components/Skeleton'
import useCourses from '../hooks/useCourses'
import useMyData from '../hooks/useMyData'
import './Home.css'

function firstName(name) {
  const part = String(name || '')
    .trim()
    .split(/\s+/)[0] || ''
  return part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ''
}

function initials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

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

export default function Home() {
  const { user } = useAuth()
  const data = useMyData()
  const { courses, loading } = useCourses()

  const enrollments = data?.enrollments || []
  const step = journeyIndex(user, enrollments)
  const name = firstName(user?.name)
  const journeyCta = !user
    ? { to: '/me', state: { auth: 'register' }, label: 'Бүртгэл үүсгэх' }
    : enrollments.length === 0
      ? { to: '/learn', label: 'Анги сонгох' }
      : { to: '/me', label: 'Явцаа харах' }

  return (
    <div className="home">
      <header className="home-top container">
        <div>
          <p className="home-top__date">
            {new Date().toLocaleDateString('mn-MN', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <h1>Сайн уу{name ? `, ${name}` : ''} 👋</h1>
        </div>
        <Link to="/me" className="home-avatar" aria-label="Би">
          {user ? initials(user.name) : <UserCircle size={28} weight="fill" aria-hidden />}
        </Link>
      </header>

      <section className="container home-section">
        {!user ? (
          <Pressable as={Link} to="/me" state={{ auth: 'register' }} className="journey-card journey-card--intro">
            <span className="journey-card__kicker">Au Pair гэж юу вэ?</span>
            <strong>60 секундэд ойлгоорой</strong>
            <small>Гэр бүлд амьдарч, хэл сурч, Европт туршлага хуримтлуулна.</small>
            <span className="journey-card__cta">Бүртгэл үүсгэх</span>
          </Pressable>
        ) : (
          <Pressable as={Link} to={journeyCta.to} className="journey-card">
            <div className="journey-card__head">
              <span className="journey-card__kicker">Миний Au Pair аялал</span>
              <strong>{JOURNEY_STEPS[step].label}</strong>
              <small>{JOURNEY_STEPS[step].hint}</small>
            </div>
            <JourneyTimeline user={user} enrollments={enrollments} compact />
            <span className="journey-card__cta">{journeyCta.label}</span>
          </Pressable>
        )}
      </section>

      <section className="home-section">
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
            {courses.slice(0, 4).map((course) => {
              const seats = course.seatsLeft
              const level = String(course.level || 'A1').replace(/^DE\s*/i, '')
              return (
                <Pressable
                  key={course.id}
                  as={Link}
                  to={`/learn/course/${course.id}`}
                  className="home-course"
                >
                  <motion.div
                    className="home-course__media"
                    layoutId={`course-img-${course.id}`}
                    transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                  >
                    <img
                      src={course.image || '/cover.jpg'}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/cover.jpg'
                      }}
                    />
                    <span className="home-course__level">{level}</span>
                  </motion.div>
                  <motion.h3 layoutId={`course-title-${course.id}`}>{course.title}</motion.h3>
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
      </section>

      <section className="home-section">
        <div className="container block-head">
          <h2>Улсууд</h2>
          <Link to="/countries" className="link-more">
            Бүгд
          </Link>
        </div>
        <div className="home-rail">
          {countries.slice(0, 6).map((c) => (
            <Pressable key={c.id} as={Link} to={`/countries/${c.id}`} className="home-country">
              <motion.img
                layoutId={`country-img-${c.id}`}
                src={c.image}
                alt=""
                loading="lazy"
                transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                onError={(e) => {
                  e.currentTarget.src = '/cover.jpg'
                }}
              />
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
      </section>

      <section className="container home-section home-section--end">
        <div className="advice-card">
          <h2>Зөвлөгөө авах</h2>
          <p>Аль улс, аль анги тохирохыг хамт сонгоё. Үнэгүй.</p>
          <div className="advice-card__actions">
            <a className="btn btn-primary" href={social.messenger} target="_blank" rel="noreferrer">
              <MessengerLogo weight="fill" size={18} aria-hidden /> Messenger
            </a>
            <a className="btn btn-ghost" href={`tel:${social.phoneTel}`}>
              <Phone weight="fill" size={18} aria-hidden /> Залгах
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

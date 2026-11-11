import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowUpRight,
  CalendarBlank,
  CaretRight,
  Exam,
  MagnifyingGlass,
  MessengerLogo,
  Path,
  Phone,
  Star,
} from '@phosphor-icons/react'
import { useAuth } from '../auth'
import {
  countries,
  coursesFallback,
  enrollmentOpening,
  isEnrollmentOpen,
  newsItems,
  org,
  social,
} from '../data'
import { JOURNEY_STEPS, journeyIndex, programStageIndex } from '../components/JourneyTimeline'
import { GlassCard, GlassChips, RedHero, Reveal, SectionHead } from '../components/glass/Glass'
import Pressable from '../components/Pressable'
import SoftImage from '../components/SoftImage'
import { SkeletonRow } from '../components/Skeleton'
import { PROGRAM_STAGES } from '../data/program'
import useCourses from '../hooks/useCourses'
import useMyData from '../hooks/useMyData'
import { haptic } from '../native'
import '../styles/shared-blocks.css'
import './Home.css'

const FLAGS = {
  germany: '🇩🇪',
  france: '🇫🇷',
  austria: '🇦🇹',
  switzerland: '🇨🇭',
  belgium: '🇧🇪',
  netherlands: '🇳🇱',
  denmark: '🇩🇰',
  usa: '🇺🇸',
}

const CHIPS = [
  { id: 'all', label: 'Бүгд' },
  { id: 'learn', label: 'Сургалт' },
  { id: 'aupair', label: 'Au Pair' },
  { id: 'news', label: 'Мэдээ' },
]

function shortDate(iso) {
  if (!iso) return ''
  const [, m, d] = iso.split('-')
  return `${m}.${d}`
}

function levelOf(course) {
  return String(course.level || 'A1').replace(/^DEs*/i, '')
}

function payState(enrollments) {
  const course = enrollments.filter((e) => e.kind !== 'country')
  if (course.some((e) => e.status === 'accepted' || e.status === 'paid')) {
    return { tone: 'ok', title: 'Төлөгдсөн', sub: 'Суудал баталгаажсан' }
  }
  if (course.some((e) => e.status === 'pending_payment')) {
    return { tone: 'wait', title: 'Хүлээгдэж байна', sub: 'QPay-аар төлж суудлаа ав' }
  }
  return { tone: 'idle', title: 'QPay', sub: 'Төлмөгц суудал баталгаажна' }
}

/** Tiny decorative sparkline for the dark program card. */
function Spark() {
  return (
    <svg className="bento__spark" viewBox="0 0 160 48" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="spk" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e11d2e" stopOpacity="0.45" />
          <stop offset="1" stopColor="#e11d2e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 38 C14 34 20 22 34 26 S56 40 70 30 92 12 106 20 128 34 140 18 154 8 160 6 V48 H0Z"
        fill="url(#spk)"
      />
      <path
        d="M0 38 C14 34 20 22 34 26 S56 40 70 30 92 12 106 20 128 34 140 18 154 8 160 6"
        fill="none"
        stroke="#ff3347"
        strokeWidth="2"
      />
    </svg>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const data = useMyData()
  const { courses, loading } = useCourses()
  const [chip, setChip] = useState('all')

  const enrollments = data?.enrollments || []
  const inProgram = Boolean(user?.inProgram)
  const steps = inProgram ? PROGRAM_STAGES : JOURNEY_STEPS
  const step = inProgram ? programStageIndex(user) : journeyIndex(user, enrollments)

  const open = courses.filter((c) => isEnrollmentOpen(c.id))
  const featured = open[0] || courses[0]
  const base = coursesFallback.find((c) => c.id === 'german-a1') || {}
  const next = {
    date: featured?.startDate || base.startDate,
    time: (featured?.classTime || base.classTime || '15:00').split('–')[0],
  }
  const pay = payState(enrollments)
  const show = (id) => chip === 'all' || chip === id

  function openSearch() {
    haptic('light')
    navigate('/countries')
    setTimeout(() => window.dispatchEvent(new Event('aupair:countries-search-open')), 60)
  }

  return (
    <div className="hx">
      <RedHero kicker="Mongolian Au Pair · 2005 оноос" title="Европ руу хаалгаа өнөөдөр нээ">
        <button type="button" className="rh-search" onClick={openSearch}>
          <MagnifyingGlass size={20} weight="bold" aria-hidden />
          <span>Сургалт, улс, хөтөлбөр хайх</span>
        </button>
      </RedHero>

      <GlassChips items={CHIPS} value={chip} onChange={setChip} layoutId="hx-chip" label="Шүүлтүүр" overlap />

      {/* Bento */}
      <div className="container bento">
        {featured ? (
          <Reveal i={0} className="bento__a">
            <Pressable as={Link} to={`/learn/course/${featured.id}`} scale={0.97} className="bento-photo">
              <SoftImage src={featured.image || '/cover.jpg'} alt="" />
              <span className="bento-photo__tag">{levelOf(featured)}</span>
              <span className="bento-photo__glass">
                <strong>{featured.title}</strong>
                {featured.priceLabel ? <small>{featured.priceLabel}</small> : null}
              </span>
            </Pressable>
          </Reveal>
        ) : (
          <div className="bento__a bento-photo is-loading" />
        )}

        <Reveal i={1} className="bento__b">
          <GlassCard as={Link} to={enrollmentOpening.to} tone="ink" className="bento-card">
            <span className="bento-card__top">
              <span className="bento-label">Дараагийн элсэлт</span>
              <CalendarBlank size={18} aria-hidden />
            </span>
            <span className="bento-big">{shortDate(next.date)}</span>
            <span className="bento-card__row">
              <small>{next.time} · танхим</small>
              <CaretRight size={16} weight="bold" aria-hidden />
            </span>
          </GlassCard>
        </Reveal>

        <Reveal i={2} className="bento__c">
          <GlassCard as={Link} to={user ? '/me' : '/learn'} className="bento-card">
            <span className="bento-card__top">
              <span className="bento-label">Төлбөр</span>
              <span className={`bento-dot bento-dot--${pay.tone}`} aria-hidden />
            </span>
            <span className="bento-mid">{pay.title}</span>
            <small className="bento-one">{pay.sub}</small>
          </GlassCard>
        </Reveal>

        <Reveal i={3} className="bento__d">
          <GlassCard
            as={Link}
            to={user ? (inProgram ? '/me/program' : '/me') : '/learn?tab=test'}
            className="bento-card"
          >
            <span className="bento-card__top">
              <span className="bento-label">{user ? 'Миний аялал' : 'Түвшин тест'}</span>
              {user ? <Path size={18} aria-hidden /> : <Exam size={18} aria-hidden />}
            </span>
            <span className="bento-big">
              {user ? `${step + 1}/${steps.length}` : '6'}
              {user ? null : <em> асуулт</em>}
            </span>
            <small className="bento-one">{user ? steps[step]?.label : '2 минутад түвшнээ мэд'}</small>
            <span className="bento-bar">
              <motion.i
                initial={{ width: 0 }}
                animate={{ width: user ? `${((step + 1) / steps.length) * 100}%` : '8%' }}
                transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.3 }}
              />
            </span>
          </GlassCard>
        </Reveal>

        <Reveal i={4} className="bento__e">
          <GlassCard as={Link} to="/countries" tone="ink" className="bento-card bento-card--spark">
            <span className="bento-card__top">
              <span className="bento-label">Au Pair</span>
              <Star size={16} weight="fill" className="bento-star" aria-hidden />
            </span>
            <span className="bento-big">
              {countries.length}
              <em> улс</em>
            </span>
            <small className="bento-one">6–12 сар · гэр бүлд</small>
            <Spark />
          </GlassCard>
        </Reveal>
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {show('learn') && (
          <motion.section
            key="learn"
            className="hx-section"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <SectionHead title="Сургалт" action={<Link to="/learn">Бүгд</Link>} />
            {loading ? (
              <SkeletonRow count={2} w={240} h={210} />
            ) : (
              <div className="hx-rail">
                {courses.slice(0, 4).map((course) => {
                  const seats = course.seatsLeft ?? course.seats
                  return (
                    <Pressable
                      key={course.id}
                      as={Link}
                      to={`/learn/course/${course.id}`}
                      scale={0.97}
                      className="hx-course"
                    >
                      <div className="hx-course__media">
                        <SoftImage src={course.image || '/cover.jpg'} alt="" />
                        <span className="hx-tag">
                          {String(course.level || 'A1').replace(/^DE\s*/i, '')}
                        </span>
                      </div>
                      <div className="hx-course__body">
                        <h3>{course.title}</h3>
                        <p>
                          {course.duration} · {course.mode}
                        </p>
                        <div className="hx-course__foot">
                          <strong>{course.priceLabel}</strong>
                          {typeof seats === 'number' && seats > 0 ? <span>{seats} суудал</span> : null}
                        </div>
                      </div>
                    </Pressable>
                  )
                })}
              </div>
            )}
          </motion.section>
        )}

        {show('aupair') && (
          <motion.section
            key="aupair"
            className="hx-section"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <SectionHead title="Au Pair улсууд" action={<Link to="/countries">Бүгд</Link>} />
            <div className="hx-rail">
              {countries.slice(0, 6).map((c) => (
                <Pressable key={c.id} as={Link} to={`/countries/${c.id}`} scale={0.97} className="hx-country">
                  <SoftImage src={c.image} alt="" />
                  <span className="hx-country__glass">
                    <strong>
                      {FLAGS[c.id] || '🇪🇺'} {c.nameMn}
                    </strong>
                    <small>{c.duration}</small>
                  </span>
                  <span className="hx-country__go" aria-hidden>
                    <ArrowUpRight size={16} weight="bold" />
                  </span>
                </Pressable>
              ))}
            </div>
          </motion.section>
        )}

        {show('news') && (
          <motion.section
            key="news"
            className="hx-section"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <SectionHead title="Мэдээ" action={<Link to="/news">Бүгд</Link>} />
            <div className="container hx-list">
              {newsItems.slice(0, 4).map((item) => (
                <Pressable key={item.id} as={Link} to={item.href} scale={0.98} className="hx-list__row">
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/cover.jpg'
                    }}
                  />
                  <span className="hx-list__text">
                    <em>{item.tag}</em>
                    <strong>{item.title}</strong>
                    <small>{item.dateLabel}</small>
                  </span>
                  <CaretRight size={16} weight="bold" aria-hidden />
                </Pressable>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="container hx-section hx-section--end">
        <GlassCard tone="ink" className="hx-advice">
          <strong>Аль улс, аль анги тохирохыг хамт сонгоё</strong>
          <p>
            Үнэгүй зөвлөгөө · {org.since} оноос · IAPA гишүүн
          </p>
          <div className="hx-advice__actions">
            <a className="btn btn-primary" href={social.messenger} target="_blank" rel="noreferrer">
              <MessengerLogo weight="fill" size={18} aria-hidden /> Messenger
            </a>
            <a className="btn hx-btn-light" href={`tel:${social.phoneTel}`}>
              <Phone weight="fill" size={18} aria-hidden /> Залгах
            </a>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

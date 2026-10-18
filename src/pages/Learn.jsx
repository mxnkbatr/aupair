import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowRight,
  Clock,
  Exam,
  Gift,
  MapPin,
  Sparkle,
} from '@phosphor-icons/react'
import { products } from '../data'
import MyClassHub from '../components/MyClassHub'
import PlacementTest from '../components/PlacementTest'
import Pressable from '../components/Pressable'
import SoftImage from '../components/SoftImage'
import { SkeletonList } from '../components/Skeleton'
import DailyQuiz from '../features/german/DailyQuiz'
import useCourses from '../hooks/useCourses'
import useMyData from '../hooks/useMyData'
import { haptic } from '../native'
import './Learn.css'

/** Browse catalog — зөвхөн элсээгүй хэрэглэгчдэд */
const BROWSE_SEGMENTS = [
  { id: 'courses', label: 'Сургалт' },
  { id: 'test', label: 'Тест' },
  { id: 'practice', label: 'Дасгал' },
]

/** Админ зөвшөөрсөн сурагч — зөвхөн энэ 2 */
const ENROLLED_SEGMENTS = [
  { id: 'schedule', label: 'Хуваарь' },
  { id: 'chat', label: 'Чат' },
]

const LEVEL_FILTERS = [
  { id: 'all', label: 'Бүгд' },
  { id: 'A1', label: 'A1' },
  { id: 'A2', label: 'A2' },
  { id: 'B1', label: 'B1+' },
]

function courseLevel(course) {
  return String(course.level || course.hsk || '').replace(/^DE\s*/i, '').toUpperCase()
}

function CourseCard({ course }) {
  const seats = course.seatsLeft ?? course.seats
  const full = typeof seats === 'number' && seats <= 0
  const level = courseLevel(course)

  return (
    <Pressable as={Link} to={`/learn/course/${course.id}`} className="learn-card">
      <div className="learn-card__media">
        <SoftImage src={course.image || '/cover.jpg'} alt="" />
        <span className="learn-card__level">{level || 'A1'}</span>
        {course.badge ? <span className="learn-card__badge">{course.badge}</span> : null}
      </div>
      <div className="learn-card__body">
        <h3>{course.title}</h3>
        {course.subtitle ? <p>{course.subtitle}</p> : null}
        <ul className="learn-card__facts">
          <li>
            <Clock size={15} weight="bold" aria-hidden /> {course.duration}
          </li>
          <li>
            <MapPin size={15} weight="bold" aria-hidden /> {course.mode}
          </li>
        </ul>
        {typeof seats === 'number' && !full ? (
          <span className="learn-card__seats">🔥 {seats} суудал үлдсэн</span>
        ) : null}
        <span className="learn-card__cta">
          {full ? 'Дууссан' : 'Дэлгэрэнгүй'} <ArrowRight weight="bold" size={15} aria-hidden />
        </span>
      </div>
    </Pressable>
  )
}

export default function Learn() {
  const [params, setParams] = useSearchParams()
  const urlTab = params.get('tab')
  const { courses, loading } = useCourses()
  const myData = useMyData()
  const [enrollments, setEnrollments] = useState([])
  const [level, setLevel] = useState('all')

  useEffect(() => {
    setEnrollments(myData?.enrollments || [])
  }, [myData?.enrollments])

  const isEnrolled = useMemo(
    () => enrollments.some((e) => e.kind === 'course' && e.status === 'accepted'),
    [enrollments],
  )

  const segments = isEnrolled ? ENROLLED_SEGMENTS : BROWSE_SEGMENTS
  const defaultTab = isEnrolled ? 'schedule' : 'courses'
  const tab = segments.some((s) => s.id === urlTab) ? urlTab : defaultTab

  function pick(id) {
    if (id === tab) return
    haptic('selection')
    setParams(id === defaultTab ? {} : { tab: id }, { replace: true })
  }

  useEffect(() => {
    if (urlTab === 'materials' || urlTab === 'myclass') {
      setParams(isEnrolled ? { tab: 'schedule' } : {}, { replace: true })
    }
  }, [urlTab, isEnrolled, setParams])

  // Элссэн бол автоматаар Хуваарь/Чат руу; бусад tab зөвшөөрөхгүй
  useEffect(() => {
    if (!isEnrolled) return
    if (urlTab && !ENROLLED_SEGMENTS.some((s) => s.id === urlTab)) {
      setParams({ tab: 'schedule' }, { replace: true })
    }
  }, [isEnrolled, urlTab, setParams])

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const lv = courseLevel(c)
      if (level === 'all') return true
      if (level === 'B1') return lv.startsWith('B') || lv.includes('B1')
      return lv.startsWith(level)
    })
  }, [courses, level])

  const checklist = products.find((p) => p.id === 'p3')

  if (isEnrolled) {
    return (
      <div className="learn">
        <header className="learn-hero container">
          <p className="learn-hero__kicker">Миний анги</p>
          <h1>Сургалт</h1>
          <p className="learn-hero__lead">Хуваарь · ангийн чат</p>
        </header>

        <div className="container">
          <div className="seg" role="tablist" aria-label="Анги">
            {segments.map((s) => (
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
        </div>

        <section className="container">
          <MyClassHub
            mode={tab === 'chat' ? 'chat' : 'schedule'}
            enrollments={enrollments}
            classGroups={myData?.classGroups || []}
            onUpdated={(item) => {
              setEnrollments((list) => list.map((e) => (e.id === item.id ? item : e)))
            }}
          />
        </section>
      </div>
    )
  }

  return (
    <div className="learn">
      <header className="learn-hero container">
        <p className="learn-hero__kicker">Герман хэл · Au Pair бэлтгэл</p>
        <h1>Сургалт</h1>
        <p className="learn-hero__lead">Түвшиндээ тохирсон ангиа сонгоод бүртгүүлнэ.</p>
      </header>

      <div className="container">
        <div className="seg" role="tablist" aria-label="Сургалт хэсэг">
          {segments.map((s) => (
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
      </div>

      {tab === 'courses' && (
        <>
          <section className="container learn-test-banner">
            <button
              type="button"
              className="learn-test-cta"
              onClick={() => {
                haptic('light')
                setParams({ tab: 'test' }, { replace: true })
              }}
            >
              <span className="learn-test-cta__icon">
                <Exam weight="fill" size={22} aria-hidden />
              </span>
              <span className="learn-test-cta__text">
                <strong>Түвшин тогтоох тест</strong>
                <small>6 асуулт · тохирох сургалт санал болгоно</small>
              </span>
              <Sparkle weight="fill" size={18} aria-hidden />
            </button>
          </section>

          <section className="container learn-levels" aria-label="Түвшин">
            <div className="learn-seg" role="toolbar">
              {LEVEL_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={level === f.id ? 'is-active' : ''}
                  onClick={() => {
                    haptic('selection')
                    setLevel(f.id)
                  }}
                >
                  {level === f.id ? (
                    <motion.i
                      layoutId="learn-level"
                      className="learn-seg__pill"
                      transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                    />
                  ) : null}
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="container learn-list" aria-label="Герман хэлний сургалт">
            {loading ? (
              <SkeletonList count={2} h={220} />
            ) : filtered.length === 0 ? (
              <div className="learn-empty">
                <p>Энэ түвшинд тохирох сургалт алга.</p>
                <button type="button" className="learn-empty__reset" onClick={() => setLevel('all')}>
                  Бүгдийг харах
                </button>
              </div>
            ) : (
              filtered.map((course) => <CourseCard key={course.id} course={course} />)
            )}
          </section>

          {checklist ? (
            <div className="container">
              <Pressable as={Link} to={`/learn/item/${checklist.id}`} className="learn-teaser">
                <span className="learn-teaser__icon">
                  <Gift weight="fill" size={26} aria-hidden />
                </span>
                <div>
                  <strong>Үнэгүй чеклист</strong>
                  <span>Au Pair бичиг баримтын жагсаалт</span>
                </div>
                <ArrowRight weight="bold" size={18} aria-hidden />
              </Pressable>
            </div>
          ) : null}
        </>
      )}

      {tab === 'test' && (
        <section className="container">
          <PlacementTest variant="page" courses={courses} />
        </section>
      )}

      {tab === 'practice' && (
        <div className="container">
          <DailyQuiz />
        </div>
      )}
    </div>
  )
}

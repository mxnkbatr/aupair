import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarBlank,
  Clock,
  Exam,
  CaretRight,
  CheckCircle,
  FileText,
  ListBullets,
  QrCode,
  Question,
  MapPin,
} from '@phosphor-icons/react'
import { coursesFallback, enrollmentOpening, products } from '../data'
import {
  GlassCard,
  GlassChips,
  PageTitle,
  Reveal,
  SectionHead,
  StepsTimeline,
} from '../components/glass/Glass'
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

/** Элсэх процесс — хэрэглэгчид ойлгомжтой 4 алхам */
const ENROLL_FLOW = [
  { title: 'Ангиа сонгоно', text: 'Түвшиндээ тохирох A1 эсвэл A2 анги', icon: ListBullets },
  { title: 'Мэдээллээ бөглөнө', text: 'Нэр, утас, нас — 30 секунд', icon: Question },
  { title: 'QPay-аар төлнө', text: 'Банкны аппаар QR уншуулах эсвэл линкээр', icon: QrCode },
  { title: 'Суудал баталгаажна', text: 'Автоматаар · хуваарь, ангийн чат нээгдэнэ', icon: CheckCircle },
]

const LEVEL_FILTERS = [
  { id: 'all', label: 'Бүгд' },
  { id: 'A1', label: 'A1' },
  { id: 'A2', label: 'A2' },
  { id: 'B1', label: 'B1' },
  { id: 'B2', label: 'B2' },
]

function courseLevel(course) {
  return String(course.level || course.hsk || '').replace(/^DE\s*/i, '').toUpperCase()
}

function CourseCard({ course, i }) {
  const seats = course.seatsLeft ?? course.seats
  const full = typeof seats === 'number' && seats <= 0
  const level = courseLevel(course)

  return (
    <Reveal i={i}>
      <Pressable as={Link} to={`/learn/course/${course.id}`} scale={0.98} className="lc">
        <div className="lc__media">
          <SoftImage src={course.image || '/cover.jpg'} alt="" />
          <span className="lc__tag">{level || 'A1'}</span>
          {course.badge ? <span className="lc__when">{course.badge}</span> : null}
        </div>
        <div className="lc__body">
          <h3>{course.title}</h3>
          {course.subtitle ? <p>{course.subtitle}</p> : null}
          <ul className="lc__facts">
            <li>
              <Clock size={14} weight="bold" aria-hidden /> {course.duration}
            </li>
            <li>
              <MapPin size={14} weight="bold" aria-hidden /> {course.mode}
            </li>
            {course.hours ? <li>{course.hours} цаг</li> : null}
          </ul>
          <div className="lc__foot">
            <span className="lc__price">
              <strong>{course.priceLabel || 'Үнэгүй зөвлөгөө'}</strong>
              {typeof seats === 'number' ? (
                <small className={full ? 'is-full' : ''}>
                  {full ? 'Суудал дууссан' : `${seats} суудал үлдсэн`}
                </small>
              ) : null}
            </span>
            <span className="lc__go" aria-hidden>
              <ArrowUpRight size={18} weight="bold" />
            </span>
          </div>
        </div>
      </Pressable>
    </Reveal>
  )
}

function daysUntil(iso) {
  if (!iso) return null
  const ms = new Date(`${iso}T00:00:00`).getTime() - Date.now()
  return ms > 0 ? Math.ceil(ms / 86400000) : 0
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
      return lv === level || lv.startsWith(level)
    })
  }, [courses, level])

  const checklist = products.find((p) => p.id === 'p3')
  const base = coursesFallback.find((c) => c.id === 'german-a1') || {}
  const intakeIso = courses.find((c) => c.startDate)?.startDate || base.startDate
  const intakeDays = daysUntil(intakeIso)
  const intakeDate = intakeIso ? intakeIso.replaceAll('-', '.') : ''
  const intakeTime = base.classTime || '15:00–18:15'
  const intakeSeats =
    courses.reduce((n, c) => n + (Number(c.seatsLeft ?? 0) || 0), 0) || enrollmentOpening.seats

  if (isEnrolled) {
    return (
      <div className="learn">
        <PageTitle title="Сургалт" lead="Хуваарь · ангийн чат · багш" />
        <GlassChips items={segments} value={tab} onChange={pick} layoutId="learn-seg" label="Анги" />

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
      <PageTitle
       
        title="Сургалт"
        lead="Түвшиндээ тохирсон ангиа сонгоод QPay-аар шууд суудлаа ав."
      />
      <GlassChips items={segments} value={tab} onChange={pick} layoutId="learn-seg" label="Сургалт хэсэг" />

      {tab === 'courses' && (
        <>
          <div className="container lgrid">
            <Reveal className="lgrid__wide">
              <GlassCard tone="ink" className="lintake">
                <span className="lintake__top">
                  <span className="lintake__live">
                    <i aria-hidden /> {enrollmentOpening.tag}
                  </span>
                  <CalendarBlank size={18} aria-hidden />
                </span>
                <strong className="lintake__date">{intakeDate}</strong>
                <span className="lintake__title">{enrollmentOpening.title}</span>
                <div className="lintake__stats">
                  <div>
                    <b>{intakeDays ?? '—'}</b>
                    <small>хоног үлдсэн</small>
                  </div>
                  <div>
                    <b>{intakeSeats}</b>
                    <small>сул суудал</small>
                  </div>
                  <div>
                    <b>{intakeTime.split('–')[0]}</b>
                    <small>эхлэх цаг</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="lintake__cta"
                  onClick={() => {
                    haptic('light')
                    document
                      .getElementById('learn-classes')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  Анги сонгох <ArrowRight weight="bold" size={16} aria-hidden />
                </button>
              </GlassCard>
            </Reveal>

            <Reveal i={1}>
              <GlassCard
                as="button"
                className="lmini"
                onClick={() => setParams({ tab: 'test' }, { replace: true })}
              >
                <span className="lmini__icon">
                  <Exam size={20} weight="fill" aria-hidden />
                </span>
                <strong>Түвшин тест</strong>
                <small>6 асуулт · 2 минут</small>
              </GlassCard>
            </Reveal>

            {checklist ? (
              <Reveal i={2}>
                <GlassCard as={Link} to={`/learn/item/${checklist.id}`} className="lmini">
                  <span className="lmini__icon lmini__icon--ink">
                    <FileText size={20} weight="fill" aria-hidden />
                  </span>
                  <strong>Үнэгүй чеклист</strong>
                  <small>Бичиг баримт</small>
                </GlassCard>
              </Reveal>
            ) : null}
          </div>

          <section className="learn-explain">
            <SectionHead title="Хэрхэн элсэх вэ?" />
            <div className="container">
              <StepsTimeline steps={ENROLL_FLOW} />
            </div>
          </section>

          <section className="learn-explain">
            <SectionHead title="Аль ангид орох вэ?" />
            <div className="container gchoice">
              {[
                { id: 'german-a1', who: 'Огт мэдэхгүй / шинээр эхэлж байна' },
                { id: 'german-a2', who: 'A1 дүүргэсэн / үндэс мэднэ' },
              ].map(({ id, who }, i) => {
                const c = courses.find((x) => x.id === id) || coursesFallback.find((x) => x.id === id)
                if (!c) return null
                return (
                  <Reveal key={id} i={i}>
                    <Pressable as={Link} to={`/learn/course/${id}`} scale={0.98} className={i ? 'gchoice__card gchoice__card--ink' : 'gchoice__card'}>
                      <span className="gchoice__badge">{courseLevel(c)}</span>
                      <span className="gchoice__text">
                        <em>{who}</em>
                        <strong>{c.title}</strong>
                        <small>
                          {c.duration} · {c.hours} цаг · {c.priceLabel}
                        </small>
                      </span>
                      <CaretRight size={16} weight="bold" aria-hidden />
                    </Pressable>
                  </Reveal>
                )
              })}
              <Reveal i={2}>
                <Pressable
                  scale={0.98}
                  className="gchoice__card gchoice__card--ghost"
                  onClick={() => setParams({ tab: 'test' }, { replace: true })}
                >
                  <span className="gchoice__badge">?</span>
                  <span className="gchoice__text">
                    <em>Мэдэхгүй байна уу?</em>
                    <strong>Түвшин тогтоох тест өгөх</strong>
                    <small>6 асуулт · тохирох ангийг санал болгоно</small>
                  </span>
                  <CaretRight size={16} weight="bold" aria-hidden />
                </Pressable>
              </Reveal>
            </div>
          </section>

          <section id="learn-classes" className="learn-classes">
            <SectionHead title="Ангиууд" />
            <div className="gchips--small">
              <GlassChips
                items={LEVEL_FILTERS}
                value={level}
                onChange={setLevel}
                layoutId="learn-level"
                label="Түвшин"
              />
            </div>
            <div className="container lc-list">
              {loading ? (
                <SkeletonList count={2} h={300} />
              ) : filtered.length === 0 ? (
                <div className="learn-empty">
                  <p>Энэ түвшинд тохирох сургалт алга.</p>
                  <button type="button" className="learn-empty__reset" onClick={() => setLevel('all')}>
                    Бүгдийг харах
                  </button>
                </div>
              ) : (
                filtered.map((course, i) => <CourseCard key={course.id} course={course} i={i} />)
              )}
            </div>
          </section>
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

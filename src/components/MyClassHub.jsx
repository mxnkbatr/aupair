import { useEffect, useMemo, useState } from 'react'
import { CalendarBlank, MapPin, User } from '@phosphor-icons/react'
import { api } from '../api'
import { resolveClassSchedule } from '../data/classProgressMock'
import ClassChat from './ClassChat'
import MyClassPanel from './MyClassPanel'
import './MyClassHub.css'

const DAY = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба']

function nextLabel(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${DAY[d.getDay()]} ${d.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}`
}

/** Хуваарь | Чат — зөвхөн элссэн сурагч */
export default function MyClassHub({
  enrollments = [],
  classGroups = [],
  mode = 'schedule',
  onUpdated,
}) {
  const courses = enrollments.filter((e) => e.kind === 'course' && e.status === 'accepted')
  const [activeId, setActiveId] = useState(courses[0]?.courseId || '')
  const [meta, setMeta] = useState(null)

  useEffect(() => {
    if (!courses.length) return
    if (!courses.some((c) => c.courseId === activeId)) setActiveId(courses[0].courseId)
  }, [courses, activeId])

  useEffect(() => {
    if (!activeId || mode === 'chat') return undefined
    let alive = true
    api
      .getClass(activeId)
      .then((res) => {
        if (alive) setMeta(res)
      })
      .catch(() => {
        if (alive) setMeta(null)
      })
    return () => {
      alive = false
    }
  }, [activeId, mode])

  const active = courses.find((c) => c.courseId === activeId) || courses[0]
  const group =
    classGroups.find((g) => g.courseId === activeId || g.id === activeId) || meta?.group

  const schedule = useMemo(
    () => resolveClassSchedule({ meta, group }),
    [meta, group],
  )

  if (courses.length === 0) {
    return (
      <div className="class-hub class-hub--empty">
        <p>Админ элсэлтийг зөвшөөрөхөд хуваарь, чат энд автоматаар нээгдэнэ.</p>
      </div>
    )
  }

  const coursePicker =
    courses.length > 1 ? (
      <div className="class-hub__tabs" role="tablist">
        {courses.map((c) => (
          <button
            key={c.courseId}
            type="button"
            className={c.courseId === activeId ? 'is-active' : ''}
            onClick={() => setActiveId(c.courseId)}
          >
            {c.courseTitle}
          </button>
        ))}
      </div>
    ) : null

  if (mode === 'chat') {
    return (
      <div className="class-hub">
        {coursePicker}
        <ClassChat courseId={activeId} courseTitle={active?.courseTitle} />
      </div>
    )
  }

  return (
    <div className="class-hub">
      {coursePicker}

      <article className="class-hub__schedule">
        <header className="class-hub__schedule-top">
          <h3>
            <CalendarBlank weight="fill" size={18} aria-hidden /> Хуваарь
          </h3>
          {schedule?.source === 'mock' ? <em className="class-hub__demo">demo</em> : null}
        </header>

        {schedule ? (
          <>
            <p className="class-hub__when">{schedule.scheduleLabel}</p>
            {schedule.nextClassAt ? (
              <p className="class-hub__next">
                Дараагийн хичээл: <strong>{nextLabel(schedule.nextClassAt)}</strong>
                {schedule.soon ? <em> · удахгүй</em> : null}
              </p>
            ) : schedule.nextHint ? (
              <p className="class-hub__next">{schedule.nextHint}</p>
            ) : null}
            <ul className="class-hub__facts">
              {schedule.teacherName ? (
                <li>
                  <User size={15} weight="bold" aria-hidden />
                  {schedule.teacherName}
                </li>
              ) : null}
              {schedule.room ? (
                <li>
                  <MapPin size={15} weight="bold" aria-hidden />
                  {schedule.room}
                </li>
              ) : null}
            </ul>
            {Array.isArray(schedule.weekdays) && schedule.weekdays.length > 0 ? (
              <div className="class-hub__days" aria-label="Гаригууд">
                {DAY.map((label, i) => {
                  const on = schedule.weekdays.includes(i)
                  return (
                    <span key={label} className={on ? 'is-on' : ''}>
                      {label.slice(0, 2)}
                    </span>
                  )
                })}
              </div>
            ) : null}
            <p className="class-hub__hint">Хичээл эхлэхэд утсан дээр мэдэгдэл автоматаар ирнэ.</p>
          </>
        ) : (
          <p className="class-hub__hint">Хуваарийг админ оруулахад энд харагдана.</p>
        )}
      </article>

      <MyClassPanel
        enrollments={enrollments.filter((e) => e.courseId === activeId)}
        onUpdated={onUpdated}
      />
    </div>
  )
}

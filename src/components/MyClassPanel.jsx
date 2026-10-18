import { useMemo, useState } from 'react'
import {
  CheckCircle,
  Circle,
  Clock,
  Notebook,
  UserCheck,
  XCircle,
} from '@phosphor-icons/react'
import { api } from '../api'
import { resolveClassProgress } from '../data/classProgressMock'
import { haptic } from '../native'
import './MyClassPanel.css'

/**
 * Ирц + даалгавар — API эсвэл mock.
 * Багш админаас ангид даалгавар тавина → сурагчид энд харна.
 */
export default function MyClassPanel({ enrollments = [], onUpdated }) {
  const courses = enrollments.filter(
    (e) => e.kind === 'course' && e.status === 'accepted',
  )
  if (courses.length === 0) return null

  return (
    <section className="my-class" aria-label="Миний анги">
      <h2 className="my-class__title">Миний анги</h2>
      {courses.map((enroll) => (
        <ClassCard key={enroll.id} enroll={enroll} onUpdated={onUpdated} />
      ))}
    </section>
  )
}

function StatusIcon({ status }) {
  if (status === 'present') return <CheckCircle weight="fill" size={18} className="is-ok" />
  if (status === 'late') return <Clock weight="fill" size={18} className="is-late" />
  if (status === 'absent') return <XCircle weight="fill" size={18} className="is-bad" />
  return <Circle weight="regular" size={18} />
}

const STATUS_MN = {
  present: 'Ирсэн',
  late: 'Хоцорсон',
  absent: 'Тасалсан',
}

function ClassCard({ enroll, onUpdated }) {
  const [busy, setBusy] = useState(null)
  const [localHw, setLocalHw] = useState(null)
  const progress = useMemo(() => resolveClassProgress(enroll), [enroll])
  const homework = localHw || progress?.homework || []
  const done = homework.filter((h) => h.status === 'done').length
  const attendance = progress?.attendanceCount ?? 0
  const sessions = progress?.sessions || []
  const isMock = progress?.source === 'mock' && !localHw

  async function toggle(hw) {
    if (busy) return
    const next = hw.status === 'done' ? 'pending' : 'done'

    // Demo: локал тэмдэглэх
    if (progress?.source === 'mock' || localHw) {
      setLocalHw((prev) => {
        const base = prev || progress?.homework || []
        return base.map((h) => (h.id === hw.id ? { ...h, status: next } : h))
      })
      haptic(next === 'done' ? 'success' : 'selection')
      return
    }

    setBusy(hw.id)
    try {
      const res = await api.markHomework(enroll.id, hw.id, next)
      haptic(next === 'done' ? 'success' : 'selection')
      onUpdated?.(res.item)
    } catch {
      haptic('error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <article className="my-class__card">
      <header className="my-class__head">
        <div>
          <strong>{enroll.courseTitle}</strong>
          <span>
            Ирц {attendance}
            {progress?.totalSessions ? `/${progress.totalSessions}` : ''} удаа · Даалгавар{' '}
            {done}/{homework.length}
          </span>
        </div>
        <Notebook size={22} weight="fill" aria-hidden />
      </header>

      <div className="my-class__stats">
        <div className="my-class__stat">
          <UserCheck weight="fill" size={18} aria-hidden />
          <div>
            <strong>{attendance}</strong>
            <small>Ирц</small>
          </div>
        </div>
        <div className="my-class__stat">
          <CheckCircle weight="fill" size={18} aria-hidden />
          <div>
            <strong>
              {done}/{homework.length || 0}
            </strong>
            <small>Даалгавар</small>
          </div>
        </div>
        {progress?.rate != null ? (
          <div className="my-class__stat">
            <Clock weight="fill" size={18} aria-hidden />
            <div>
              <strong>{progress.rate}%</strong>
              <small>Ирцийн хувь</small>
            </div>
          </div>
        ) : null}
      </div>

      {sessions.length > 0 ? (
        <div className="my-class__att">
          <h3>
            Ирцийн түүх
            {isMock ? <em> · demo</em> : null}
          </h3>
          <ul>
            {sessions.map((s) => (
              <li key={s.id} className={`is-${s.status}`}>
                <StatusIcon status={s.status} />
                <div>
                  <strong>{s.label}</strong>
                  <small>
                    {STATUS_MN[s.status] || s.status}
                    {s.topic ? ` · ${s.topic}` : ''}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="my-class__hw-block">
        <h3>
          Даалгавар
          {isMock ? <em> · demo</em> : null}
        </h3>
        <p className="my-class__hw-lead">Багш тавьсан даалгавраа энд тэмдэглэнэ.</p>
        {homework.length === 0 ? (
          <p className="my-class__empty">Багш даалгавар тавихад энд харагдана.</p>
        ) : (
          <ul className="my-class__hw">
            {homework.map((hw) => {
              const isDone = hw.status === 'done'
              return (
                <li key={hw.id}>
                  <button
                    type="button"
                    className={`my-class__hw-btn${isDone ? ' is-done' : ''}`}
                    disabled={busy === hw.id}
                    onClick={() => toggle(hw)}
                  >
                    {isDone ? (
                      <CheckCircle weight="fill" size={22} aria-hidden />
                    ) : (
                      <Circle weight="regular" size={22} aria-hidden />
                    )}
                    <span>
                      <strong>{hw.title}</strong>
                      {hw.hint ? <small>{hw.hint}</small> : null}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </article>
  )
}

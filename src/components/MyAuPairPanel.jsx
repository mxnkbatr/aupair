import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarBlank,
  Check,
  CheckCircle,
  Circle,
  Clock,
  WarningCircle,
} from '@phosphor-icons/react'
import { api } from '../api'
import { DOC_STATUS_LABELS } from '../data/program'
import { resolveAuPairProgress } from '../data/aupairProgress'
import Pressable from './Pressable'
import useMyData from '../hooks/useMyData'
import './MyAuPairPanel.css'

function DocIcon({ status }) {
  if (status === 'approved') return <CheckCircle weight="fill" size={18} className="is-ok" />
  if (status === 'rejected') return <WarningCircle weight="fill" size={18} className="is-bad" />
  if (status === 'submitted') return <Clock weight="fill" size={18} className="is-wait" />
  return <Circle weight="regular" size={18} className="is-empty" />
}

/** Шат дараалалтай үйл явц — ойлгомжтой жагсаалт */
function StageSteps({ stages, current }) {
  const idx = Math.max(0, Number(current) - 1)
  return (
    <ol className="my-ap__steps" aria-label="Хөтөлбөрийн шат">
      {stages.map((s, i) => {
        const done = i < idx
        const now = i === idx
        return (
          <li
            key={s.id}
            className={done ? 'is-done' : now ? 'is-now' : ''}
            aria-current={now ? 'step' : undefined}
          >
            <i aria-hidden>{done ? <Check weight="bold" size={14} /> : i + 1}</i>
            <div>
              <strong>
                {i + 1}-р шат · {s.label}
              </strong>
              <span>
                {now ? 'Одоо энд байна · ' : done ? 'Дууссан · ' : ''}
                {s.hint}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default function MyAuPairPanel({ user, standalone = false }) {
  const data = useMyData()
  const [countryMeta, setCountryMeta] = useState(null)

  const enrollments = data?.enrollments || []
  const progress = useMemo(
    () => resolveAuPairProgress({ user, enrollments }),
    [user, enrollments],
  )

  const countryEnroll = enrollments.find(
    (e) => e.kind === 'country' && e.status === 'accepted',
  )
  const aupairGroup =
    (data?.classGroups || []).find(
      (g) => g.kind === 'country' && (!countryEnroll || g.courseId === countryEnroll.courseId),
    ) || (data?.classGroups || []).find((g) => g.kind === 'country')

  useEffect(() => {
    const id = countryEnroll?.courseId || progress?.countryId
    if (!id) return undefined
    let alive = true
    api
      .getClass(id)
      .then((res) => {
        if (alive) setCountryMeta(res)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [countryEnroll?.courseId, progress?.countryId])

  if (!progress) return null

  const stage = progress.stages[(progress.stage || 1) - 1] || progress.stages[0]
  const todo = progress.docs.filter((d) => d.status !== 'approved')
  const done = progress.docs.filter((d) => d.status === 'approved')
  const summary = progress.summary || {
    approved: done.length,
    total: progress.docs.length,
  }
  const scheduleLabel = countryMeta?.scheduleLabel || progress.scheduleLabel || ''
  const stageNum = progress.stage || 1
  const stageTotal = progress.stages.length

  return (
    <section className={`my-ap${standalone ? ' my-ap--page' : ''}`} aria-label="Миний Au Pair">
      {standalone ? (
        <header className="my-ap__hero">
          <p className="my-ap__kicker">
            Миний хөтөлбөр
            {progress.source === 'mock' ? ' · demo' : ''}
          </p>
          <h1>Au Pair</h1>
          <p>{progress.countryTitle || 'Үйл явц · материал'}</p>
        </header>
      ) : (
        <h2 className="my-ap__title">Миний Au Pair</h2>
      )}

      {scheduleLabel || aupairGroup?.schedule?.time ? (
        <article className="my-ap__card my-ap__card--sched">
          <h3>
            <CalendarBlank weight="fill" size={18} aria-hidden /> Уулзалт
          </h3>
          <p>
            {scheduleLabel ||
              `${(aupairGroup.schedule.weekdays || []).join(', ')} · ${aupairGroup.schedule.time}`}
          </p>
          <small>Эхлэхэд утсан дээр мэдэгдэл автоматаар ирнэ.</small>
        </article>
      ) : null}

      {progress.note ? (
        <article className="my-ap__card my-ap__card--note">
          <strong>Тэмдэглэл</strong>
          <p>{progress.note}</p>
        </article>
      ) : null}

      <article className="my-ap__card">
        <header className="my-ap__head">
          <div>
            <strong>
              Үйл явц · {stageNum}/{stageTotal}-р шат
            </strong>
            <span>
              Одоо: <b>{stage.label}</b> — {stage.hint}
            </span>
          </div>
          <em>
            {summary.approved}/{summary.total}
          </em>
        </header>
        <div className="my-ap__progress" aria-hidden>
          <i style={{ width: `${(stageNum / stageTotal) * 100}%` }} />
        </div>
        <StageSteps stages={progress.stages} current={stageNum} />
      </article>

      <article className="my-ap__card">
        <h3 className="my-ap__sub">
          Энэ шатанд бүрдүүлэх ({todo.length} үлдсэн)
        </h3>
        {todo.length === 0 ? (
          <p className="my-ap__done">Бүх баримт зөвшөөрөгдсөн ({done.length}).</p>
        ) : (
          <ul className="my-ap__docs">
            {todo.map((doc) => (
              <li key={doc.key}>
                <DocIcon status={doc.status} />
                <span>
                  <strong>{doc.label}</strong>
                  <small>{DOC_STATUS_LABELS[doc.status] || doc.status}</small>
                </span>
              </li>
            ))}
          </ul>
        )}
        {progress.source === 'api' ? (
          <Pressable as={Link} to="/me/program" className="my-ap__cta">
            Баримт илгээх <ArrowRight weight="bold" size={16} aria-hidden />
          </Pressable>
        ) : (
          <p className="my-ap__mock-hint">Demo өгөгдөл — админ зөвшөөрөөд бодит мэдээлэл орно.</p>
        )}
      </article>
    </section>
  )
}

import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowSquareOut, CheckCircle, Circle, WarningCircle, Clock } from '@phosphor-icons/react'
import { useAuth } from '../auth'
import { api } from '../api'
import JourneyTimeline, { programStageIndex } from '../components/JourneyTimeline'
import Sheet from '../components/Sheet'
import { DOC_STATUS_LABELS, PROGRAM_CATEGORY_LABELS, PROGRAM_STAGES } from '../data/program'
import { haptic } from '../native'
import './Program.css'

function StatusIcon({ status }) {
  if (status === 'approved') return <CheckCircle weight="fill" size={22} className="is-ok" />
  if (status === 'rejected') return <WarningCircle weight="fill" size={22} className="is-bad" />
  if (status === 'submitted') return <Clock weight="fill" size={22} className="is-wait" />
  return <Circle weight="regular" size={22} className="is-empty" />
}

export default function Program() {
  const { user, refresh } = useAuth()
  const [active, setActive] = useState(null)
  const [link, setLink] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checklist = user?.programChecklist || []
  const stageIdx = programStageIndex(user)
  const stage = PROGRAM_STAGES[stageIdx] || PROGRAM_STAGES[0]
  const stageNum = stageIdx + 1
  const summary = user?.programSummary || { total: 0, approved: 0, submitted: 0, rejected: 0 }
  const visibleDocs = useMemo(
    () =>
      checklist.filter((item) => {
        const s = Number(item.stage)
        if (!Number.isFinite(s) || s < 1) return true
        return s <= stageNum
      }),
    [checklist, stageNum],
  )

  const progress = useMemo(() => {
    if (!summary.total) return 0
    return Math.round((summary.approved / summary.total) * 100)
  }, [summary])

  if (!user) return <Navigate to="/me" replace state={{ auth: 'login' }} />
  if (!user.inProgram) return <Navigate to="/me" replace />

  function openDoc(item) {
    setActive(item)
    setLink(item.link || '')
    setNote(item.note || '')
    setError('')
  }

  async function submit(e) {
    e.preventDefault()
    if (!active) return
    setLoading(true)
    setError('')
    try {
      await api.submitProgramDoc(active.key, { link, note })
      haptic('success')
      await refresh()
      setActive(null)
    } catch (err) {
      haptic('error')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="program-page">
      <div className="container">
        <header className="page-hero">
          <p className="program-kicker">
            {PROGRAM_CATEGORY_LABELS[user.programCategory] || 'Хөтөлбөр'}
          </p>
          <h1>Миний аялал</h1>
          <p>
            Одоо: <strong>{stage.label}</strong> — {stage.hint}
          </p>
        </header>

        <section className="program-card">
          <JourneyTimeline user={user} mode="program" />
        </section>

        {user.visaAppointment?.when ? (
          <section className="program-card program-note">
            <strong>Визний тов</strong>
            <p>
              {user.visaAppointment.when}
              {user.visaAppointment.place ? ` · ${user.visaAppointment.place}` : ''}
            </p>
            {user.visaAppointment.note ? <small>{user.visaAppointment.note}</small> : null}
          </section>
        ) : null}

        {user.programNote ? (
          <section className="program-card program-note">
            <strong>Админ тэмдэглэл</strong>
            <p>{user.programNote}</p>
          </section>
        ) : null}

        <section className="program-card program-progress">
          <div className="program-progress__row">
            <strong>Баримтын checklist</strong>
            <span>
              {summary.approved}/{summary.total} зөвшөөрсөн
            </span>
          </div>
          <div className="program-progress__bar" aria-hidden>
            <i style={{ width: `${progress}%` }} />
          </div>
          {summary.rejected > 0 ? (
            <p className="program-progress__warn">{summary.rejected} баримт засварлах хэрэгтэй</p>
          ) : null}
        </section>

        <ul className="program-docs">
          {visibleDocs.map((item) => (
            <li key={item.key}>
              <button type="button" className="program-doc" onClick={() => openDoc(item)}>
                <StatusIcon status={item.status} />
                <span className="program-doc__body">
                  <strong>{item.label}</strong>
                  <small>{DOC_STATUS_LABELS[item.status] || item.status}</small>
                  {item.adminNote ? <em>Админ: {item.adminNote}</em> : null}
                </span>
                {item.link ? (
                  <ArrowSquareOut
                    size={18}
                    weight="bold"
                    className="program-doc__ext"
                    aria-hidden
                  />
                ) : null}
              </button>
            </li>
          ))}
        </ul>

        <p className="program-help">
          Асуулттай бол <Link to="/me/help">Тусламж</Link> руу хандана уу.
        </p>
      </div>

      <Sheet
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.label || 'Баримт'}
      >
        {active ? (
          <form className="program-form" onSubmit={submit}>
            <p className="program-form__hint">{active.hint}</p>
            <label className="field">
              <span>Линк (Drive / YouTube / файл)</span>
              <input
                type="url"
                inputMode="url"
                placeholder="https://…"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Тайлбар</span>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Нэмэлт мэдээлэл…"
              />
            </label>
            {active.adminNote ? (
              <div className="alert alert-err">Админ: {active.adminNote}</div>
            ) : null}
            {error ? <div className="alert alert-err">{error}</div> : null}
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Илгээж байна…' : 'Илгээх'}
            </button>
          </form>
        ) : null}
      </Sheet>
    </div>
  )
}

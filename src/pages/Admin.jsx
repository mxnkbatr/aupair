import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import {
  GERMAN_LEVEL_LABELS,
  INTEREST_LABELS,
  STATUS_LABELS,
  coursesFallback,
  countries,
} from '../data'
import {
  ATTENDANCE_STATUS_LABELS,
  DOC_STATUS_LABELS,
  PROGRAM_CATEGORY_LABELS,
  PROGRAM_STAGES,
} from '../data/program'
import PageHeader from '../components/PageHeader'
import './Admin.css'

const KEY_STORAGE = 'aupair-admin-key'

const TABS = [
  { id: 'program', label: 'Хөтөлбөр' },
  { id: 'course-req', label: 'Сургалтын хүсэлт' },
  { id: 'aupair-req', label: 'Au Pair хүсэлт' },
  { id: 'notify', label: 'Мэдэгдэл' },
  { id: 'contacts', label: 'Холбоо' },
  { id: 'orders', label: 'Захиалга' },
  { id: 'users', label: 'Хэрэглэгч' },
]

const ENROLL_TABS = new Set(['course-req', 'aupair-req'])

const COURSE_OPTIONS = coursesFallback.map((c) => ({
  id: c.id,
  title: c.title,
  kind: 'course',
}))

const COUNTRY_OPTIONS = countries.map((c) => ({
  id: c.id,
  title: `${c.nameMn} Au Pair`,
  kind: 'country',
}))

const PROGRAM_FILTERS = [
  { id: 'all', label: 'Бүгд' },
  { id: 'pending', label: 'Шалгах баримт' },
  { id: 'rejected', label: 'Засвар' },
  { id: 'stage', label: 'Шатаар' },
]

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function rowsFor(tab, items) {
  if (tab === 'program' || tab === 'users') {
    return items.map((u) => ({
      Код: u.id,
      Бүртгүүлсэн: formatDate(u.createdAt),
      Нэр: u.name,
      Утас: u.phone,
      Имэйл: u.email,
      Нас: u.age ?? '',
      'Герман хэл': GERMAN_LEVEL_LABELS[u.germanLevel] || '',
      Хөтөлбөр: u.inProgram ? 'Тийм' : 'Үгүй',
      Ангилал: PROGRAM_CATEGORY_LABELS[u.programCategory] || '',
      Шат: u.programStage ?? '',
      'Зөвшөөрсөн': u.programSummary?.approved ?? '',
      'Хүлээгдэж': u.programSummary?.submitted ?? '',
      Засвар: u.programSummary?.rejected ?? '',
      Тэмдэглэл: u.programNote || '',
    }))
  }
  if (ENROLL_TABS.has(tab)) {
    return items.map((e) => ({
      Код: e.id,
      Огноо: formatDate(e.createdAt),
      Төрөл: e.kind === 'country' ? 'Au Pair' : 'Сургалт',
      'Хаанаас': e.courseTitle,
      'Хөтөлбөр ID': e.courseId,
      'Хэнээс · нэр': e.name,
      'Хэнээс · утас': e.phone,
      Имэйл: e.email,
      'Хэрэглэгч ID': e.userId || '',
      Нас: e.age,
      'Герман хэл': GERMAN_LEVEL_LABELS[e.germanLevel] || '',
      Тэмдэглэл: e.note,
      Төлөв: STATUS_LABELS.enrollments[e.status] || e.status,
    }))
  }
  if (tab === 'contacts') {
    return items.map((c) => ({
      Код: c.id,
      Огноо: formatDate(c.createdAt),
      Нэр: c.name,
      Утас: c.phone,
      Сэдэв: INTEREST_LABELS[c.interest] || c.interest,
      Зурвас: c.message,
      Төлөв: STATUS_LABELS.contacts[c.status] || c.status,
    }))
  }
  return items.map((o) => ({
    Код: o.id,
    Огноо: formatDate(o.createdAt),
    Нэр: o.name,
    Утас: o.phone,
    Бараа: (o.items || []).map((i) => i.name).join('; '),
    Төлөв: STATUS_LABELS.orders[o.status] || o.status,
  }))
}

function downloadCsv(tab, items) {
  const rows = rowsFor(tab, items)
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [headers, ...rows.map((r) => headers.map((h) => r[h]))]
    .map((line) => line.map(escape).join(','))
    .join('\r\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `aupair-${tab}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function Login({ onLogin, error, loading }) {
  const [key, setKey] = useState('')
  return (
    <form
      className="admin-login"
      onSubmit={(e) => {
        e.preventDefault()
        onLogin(key)
      }}
    >
      <label className="field">
        <span>Админ нууц үг</span>
        <input
          type="password"
          required
          autoFocus
          value={key}
          onChange={(e) => setKey(e.target.value)}
          autoComplete="current-password"
        />
      </label>
      {error && <div className="alert alert-err">{error}</div>}
      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Шалгаж байна...' : 'Нэвтрэх'}
      </button>
    </form>
  )
}

function DocEditor({ doc, busy, onSave }) {
  const [status, setStatus] = useState(doc.status || 'empty')
  const [link, setLink] = useState(doc.link || '')
  const [adminNote, setAdminNote] = useState(doc.adminNote || '')
  const [open, setOpen] = useState(doc.status === 'submitted' || doc.status === 'rejected')

  useEffect(() => {
    setStatus(doc.status || 'empty')
    setLink(doc.link || '')
    setAdminNote(doc.adminNote || '')
  }, [doc.key, doc.status, doc.link, doc.adminNote, doc.updatedAt])

  return (
    <li className={`admin-docs__item admin-docs__item--${doc.status || 'empty'}`}>
      <button type="button" className="admin-docs__toggle" onClick={() => setOpen((v) => !v)}>
        <div>
          <strong>{doc.label}</strong>
          <small>{DOC_STATUS_LABELS[doc.status] || doc.status}</small>
        </div>
        <span>{open ? '▾' : '▸'}</span>
      </button>

      {open ? (
        <div className="admin-docs__edit">
          {doc.note ? <p className="admin-docs__user-note">Хэрэглэгч: {doc.note}</p> : null}
          <label>
            Төлөв
            <select disabled={busy} value={status} onChange={(e) => setStatus(e.target.value)}>
              {Object.entries(DOC_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Линк
            <input
              type="url"
              disabled={busy}
              value={link}
              placeholder="https://..."
              onChange={(e) => setLink(e.target.value)}
            />
          </label>
          <label>
            Админ тэмдэглэл (хэрэглэгчид харагдана)
            <textarea
              rows={2}
              disabled={busy}
              value={adminNote}
              placeholder="Засварлах шалтгаан..."
              onChange={(e) => setAdminNote(e.target.value)}
            />
          </label>
          <div className="admin-docs__btns">
            <button type="button" disabled={busy} onClick={() => onSave(doc.key, { status: 'approved', adminNote })}>
              Зөвшөөрөх
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onSave(doc.key, { status: 'rejected', adminNote: adminNote || 'Засварлана уу' })}
            >
              Буцаах
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onSave(doc.key, { status, link, adminNote })}
            >
              Хадгалах
            </button>
            {doc.link ? (
              <a href={doc.link} target="_blank" rel="noreferrer">
                Нээх
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  )
}

const WEEKDAY_OPTS = [
  { id: 1, label: 'Дав' },
  { id: 2, label: 'Мяг' },
  { id: 3, label: 'Лха' },
  { id: 4, label: 'Пүр' },
  { id: 5, label: 'Баа' },
  { id: 6, label: 'Бям' },
  { id: 0, label: 'Ням' },
]

function ClassSchedulePanel({ item, adminKey, onError }) {
  const [busy, setBusy] = useState(false)
  const [weekdays, setWeekdays] = useState([1, 3, 5])
  const [time, setTime] = useState('18:00')
  const [teacherName, setTeacherName] = useState('')
  const [room, setRoom] = useState('')
  const [msg, setMsg] = useState('')
  const [hwTitle, setHwTitle] = useState('')
  const [hwHint, setHwHint] = useState('')
  const [ok, setOk] = useState('')

  function toggleDay(d) {
    setWeekdays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()))
  }

  async function saveSchedule() {
    setBusy(true)
    setOk('')
    try {
      const res = await api.adminSetClass(adminKey, item.courseId, {
        teacherName,
        schedule: { weekdays, time, teacherName, room },
      })
      setOk(res.scheduleLabel || 'Хадгаллаа')
    } catch (err) {
      onError?.(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function notifyNow() {
    setBusy(true)
    setOk('')
    try {
      const res = await api.adminNotifyClass(adminKey, item.courseId)
      setOk(`Мэдэгдэл: ${res.sent}/${res.tokens} төхөөрөмж`)
    } catch (err) {
      onError?.(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function sendTeacherMsg() {
    if (!msg.trim()) return
    setBusy(true)
    try {
      await api.adminClassMessage(adminKey, item.courseId, {
        text: msg.trim(),
        teacherName: teacherName || 'Багш',
      })
      setMsg('')
      setOk('Чат руу илгээлээ')
    } catch (err) {
      onError?.(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function assignHomework() {
    if (!hwTitle.trim()) return
    setBusy(true)
    setOk('')
    try {
      const res = await api.adminAssignHomework(adminKey, item.courseId, {
        title: hwTitle.trim(),
        hint: hwHint.trim() || undefined,
      })
      setHwTitle('')
      setHwHint('')
      setOk(`Даалгавар тавигдлаа · ${res.assignedTo} сурагч`)
    } catch (err) {
      onError?.(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-progress admin-class-sched">
      <strong>{item.kind === 'country' ? 'Au Pair уулзалт / мэдэгдэл' : 'Ангийн хуваарь + чат'}</strong>
      <div className="admin-class-sched__days">
        {WEEKDAY_OPTS.map((d) => (
          <button
            key={d.id}
            type="button"
            className={weekdays.includes(d.id) ? 'is-on' : ''}
            disabled={busy}
            onClick={() => toggleDay(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div className="admin-progress__row">
        <label>
          Цаг
          <input type="time" disabled={busy} value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <label>
          Багш
          <input
            disabled={busy}
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            placeholder="Нэр"
          />
        </label>
        <label>
          Өрөө / байршил
          <input disabled={busy} value={room} onChange={(e) => setRoom(e.target.value)} />
        </label>
      </div>
      <div className="admin-progress__row">
        <button type="button" className="btn btn-primary" disabled={busy || !weekdays.length} onClick={saveSchedule}>
          Хуваарь хадгалах
        </button>
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={notifyNow}>
          Сурагчдад мэдэгдэх
        </button>
      </div>
      <div className="admin-progress__add">
        <input
          placeholder="Багшийн зурвас (ангийн чат)…"
          disabled={busy}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button type="button" className="btn btn-ghost" disabled={busy || !msg.trim()} onClick={sendTeacherMsg}>
          Чат
        </button>
      </div>

      {item.kind !== 'country' ? (
        <div className="admin-hw-assign">
          <strong>Багш · даалгавар тавих</strong>
          <p>Ангийн бүх элссэн сурагчид харагдана.</p>
          <label>
            Даалгаврын нэр
            <input
              disabled={busy}
              value={hwTitle}
              onChange={(e) => setHwTitle(e.target.value)}
              placeholder="Ж: Үгсийн жагсаалт цээжлэх"
            />
          </label>
          <label>
            Тайлбар (заавал биш)
            <input
              disabled={busy}
              value={hwHint}
              onChange={(e) => setHwHint(e.target.value)}
              placeholder="Ж: Хичээл 3 · 20 үг"
            />
          </label>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy || !hwTitle.trim()}
            onClick={assignHomework}
          >
            Даалгавар тавих
          </button>
        </div>
      ) : null}

      {ok ? <small className="admin-notify__ok">{ok}</small> : null}
    </div>
  )
}

function CourseProgressPanel({ item, adminKey, onUpdated, onError }) {
  const [busy, setBusy] = useState(false)
  const [attendance, setAttendance] = useState(item.attendanceCount ?? 0)
  const [attStatus, setAttStatus] = useState('present')
  const [attNote, setAttNote] = useState('')
  const [messageStudent, setMessageStudent] = useState(true)
  const [dmText, setDmText] = useState('')
  const [title, setTitle] = useState('')
  const [ok, setOk] = useState('')
  const homework = item.homework || []

  useEffect(() => {
    setAttendance(item.attendanceCount ?? 0)
  }, [item.id, item.attendanceCount])

  async function save(payload) {
    setBusy(true)
    setOk('')
    try {
      const res = await api.adminEnrollmentProgress(adminKey, item.id, payload)
      onUpdated?.(res.item)
      if (payload.attendanceStatus) setOk(`Ирц хадгаллаа · ${ATTENDANCE_STATUS_LABELS[payload.attendanceStatus]}`)
    } catch (err) {
      onError?.(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function sendDm() {
    if (!item.userId || !dmText.trim()) return
    setBusy(true)
    setOk('')
    try {
      await api.adminDm(adminKey, item.userId, {
        text: dmText.trim(),
        courseId: item.courseId,
      })
      setDmText('')
      setOk('Мессеж илгээлээ')
    } catch (err) {
      onError?.(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-progress">
      <strong>Сургалтын явц · {item.courseTitle}</strong>
      <div className="admin-progress__att">
        <p className="admin-progress__att-label">Ирц бүртгэх</p>
        <div className="admin-progress__att-btns" role="group" aria-label="Ирцийн төлөв">
          {Object.entries(ATTENDANCE_STATUS_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={attStatus === value ? 'is-on' : ''}
              disabled={busy}
              onClick={() => setAttStatus(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          placeholder="Тэмдэглэл (сонголттой)"
          disabled={busy}
          value={attNote}
          onChange={(e) => setAttNote(e.target.value)}
        />
        <label className="admin-progress__check">
          <input
            type="checkbox"
            checked={messageStudent}
            disabled={busy}
            onChange={(e) => setMessageStudent(e.target.checked)}
          />
          Сурагчид мессеж илгээх
        </label>
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy}
          onClick={() =>
            save({
              attendanceStatus: attStatus,
              note: attNote,
              messageStudent,
            })
          }
        >
          Ирц хадгалах
        </button>
        <small>Нийт ирц: {item.attendanceCount ?? 0}</small>
      </div>
      <div className="admin-progress__row">
        <label>
          Ирц (удаа)
          <input
            type="number"
            min={0}
            max={999}
            disabled={busy}
            value={attendance}
            onChange={(e) => setAttendance(Number(e.target.value))}
          />
        </label>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy}
          onClick={() => save({ attendanceCount: attendance })}
        >
          Тоо хадгалах
        </button>
      </div>
      {item.userId ? (
        <div className="admin-progress__dm">
          <strong>Шууд мессеж</strong>
          <textarea
            rows={2}
            disabled={busy}
            placeholder="Сурагчид бичих…"
            value={dmText}
            onChange={(e) => setDmText(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy || !dmText.trim()}
            onClick={sendDm}
          >
            Илгээх
          </button>
        </div>
      ) : null}
      {ok ? <small className="admin-notify__ok">{ok}</small> : null}

      {homework.length === 0 ? (
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy}
          onClick={() =>
            save({
              homework: [
                { id: 'hw-1', title: 'Үгсийн жагсаалт цээжлэх', hint: 'Хичээлийн шинэ үгс', status: 'pending' },
                { id: 'hw-2', title: 'Ярианы дасгал', hint: 'Богино бичлэг', status: 'pending' },
                { id: 'hw-3', title: 'Дүрмийн дасгал', hint: 'Ном / worksheet', status: 'pending' },
              ],
            })
          }
        >
          Үндсэн даалгавар үүсгэх
        </button>
      ) : (
        <ul className="admin-progress__hw">
          {homework.map((hw) => (
            <li key={hw.id}>
              <span>
                {hw.title}
                {hw.hint ? <small> · {hw.hint}</small> : null}
              </span>
              <select
                disabled={busy}
                value={hw.status}
                onChange={(e) =>
                  save({ homeworkId: hw.id, homeworkStatus: e.target.value })
                }
              >
                <option value="pending">Хийгээгүй</option>
                <option value="done">Хийсэн</option>
              </select>
            </li>
          ))}
        </ul>
      )}

      <div className="admin-progress__add">
        <input
          placeholder="Энэ сурагчид шинэ даалгавар…"
          disabled={busy}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy || !title.trim()}
          onClick={() => {
            save({ addHomework: { title: title.trim() } })
            setTitle('')
          }}
        >
          Нэмэх
        </button>
      </div>
      <small className="admin-progress__tip">
        Бүх ангид тавих бол дээрх «Багш · даалгавар тавих» хэсгийг ашиглана.
      </small>
    </div>
  )
}

function NotifyPanel({
  adminKey,
  userId = '',
  userLabel = '',
  defaultAudience = 'all',
  onDone,
  onError,
}) {
  const [title, setTitle] = useState('Au Pair Mongolia')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('/news')
  const [audience, setAudience] = useState(userId ? 'user' : defaultAudience)
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState('')

  async function send(e) {
    e.preventDefault()
    setBusy(true)
    setOk('')
    try {
      const res = await api.adminNotify(adminKey, {
        title,
        body,
        url: url || undefined,
        audience: userId ? 'user' : audience,
        userId: userId || undefined,
      })
      const pushPart =
        res.tokens > 0
          ? ` · push ${res.sent || 0}/${res.tokens}`
          : ' · push алга (app дотор харагдана)'
      setOk(`Илгээлээ: ${res.recipients} хүүхэд${pushPart}`)
      setBody('')
      onDone?.(res)
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="admin-notify" onSubmit={send}>
      <strong>
        {userId ? `Мэдэгдэл · ${userLabel || userId}` : 'Хүүхдүүд рүү мэдэгдэл илгээх'}
      </strong>
      {!userId ? (
        <label>
          Хэн рүү
          <select value={audience} disabled={busy} onChange={(e) => setAudience(e.target.value)}>
            <option value="all">Бүх хэрэглэгч</option>
            <option value="students">Сургалтад элссэн</option>
            <option value="aupair">Au Pair хөтөлбөрт</option>
          </select>
        </label>
      ) : null}
      <label>
        Гарчиг
        <input required value={title} disabled={busy} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        Мессеж
        <textarea
          required
          rows={3}
          value={body}
          disabled={busy}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>
      <label>
        Нээх зам (ж: /news, /learn, /me/program)
        <input value={url} disabled={busy} onChange={(e) => setUrl(e.target.value)} />
      </label>
      <button type="submit" className="btn btn-primary" disabled={busy || !body.trim()}>
        {busy ? 'Илгээж байна...' : 'Мэдэгдэл илгээх'}
      </button>
      {ok ? <small className="admin-notify__ok">{ok}</small> : null}
    </form>
  )
}

function ProgramPanel({ item, adminKey, onUpdated, onError, defaultOpen = false }) {
  const [busy, setBusy] = useState(false)
  const [openDocs, setOpenDocs] = useState(defaultOpen)
  const [category, setCategory] = useState(item.programCategory || 'standard')
  const [stage, setStage] = useState(item.programStage || 1)
  const [note, setNote] = useState(item.programNote || '')
  const [visaWhen, setVisaWhen] = useState(item.visaAppointment?.when || '')
  const [visaPlace, setVisaPlace] = useState(item.visaAppointment?.place || '')
  const [visaNote, setVisaNote] = useState(item.visaAppointment?.note || '')
  const [visaOk, setVisaOk] = useState('')

  useEffect(() => {
    setCategory(item.programCategory || 'standard')
    setStage(item.programStage || 1)
    setNote(item.programNote || '')
    setVisaWhen(item.visaAppointment?.when || '')
    setVisaPlace(item.visaAppointment?.place || '')
    setVisaNote(item.visaAppointment?.note || '')
  }, [
    item.id,
    item.programCategory,
    item.programStage,
    item.programNote,
    item.visaAppointment?.when,
    item.visaAppointment?.place,
    item.visaAppointment?.note,
  ])

  async function setProgram(payload) {
    setBusy(true)
    try {
      const res = await api.adminSetProgram(adminKey, item.id, payload)
      onUpdated(res.user)
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function saveDoc(docKey, payload) {
    setBusy(true)
    try {
      const res = await api.adminReviewDoc(adminKey, item.id, docKey, payload)
      onUpdated(res.user)
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function saveVisa() {
    setBusy(true)
    setVisaOk('')
    try {
      const res = await api.adminVisaAppointment(adminKey, item.id, {
        when: visaWhen,
        place: visaPlace,
        note: visaNote,
      })
      onUpdated(res.user)
      setVisaOk('Визний тов илгээлээ · хэрэглэгчид мэдэгдэл ирнэ')
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!item.inProgram) {
    return (
      <div className="admin-program">
        <div className="admin-program__row">
          <label>
            Ангилал
            <select disabled={busy} value={category} onChange={(e) => setCategory(e.target.value)}>
              {Object.entries(PROGRAM_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Эхлэх шат
            <select disabled={busy} value={stage} onChange={(e) => setStage(Number(e.target.value))}>
              {PROGRAM_STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}. {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy}
          onClick={() =>
            setProgram({
              inProgram: true,
              programCategory: category,
              programStage: stage,
            })
          }
        >
          Хөтөлбөрт оруулах
        </button>
      </div>
    )
  }

  const summary = item.programSummary || {}
  const checklist = item.programChecklist || []
  const pendingCount = summary.submitted || 0

  return (
    <div className="admin-program">
      <div className="admin-program__badge">
        Хөтөлбөрт · шат {item.programStage}/5
        {pendingCount > 0 ? ` · ${pendingCount} шалгах` : ''}
      </div>

      <div className="admin-program__row">
        <label>
          Ангилал
          <select
            disabled={busy}
            value={category}
            onChange={(e) => {
              const value = e.target.value
              setCategory(value)
              setProgram({ programCategory: value })
            }}
          >
            {Object.entries(PROGRAM_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Шат
          <select
            disabled={busy}
            value={stage}
            onChange={(e) => {
              const value = Number(e.target.value)
              setStage(value)
              setProgram({ programStage: value })
            }}
          >
            {PROGRAM_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id}. {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="admin-program__note">
        Админ тэмдэглэл (хэрэглэгчид харагдана)
        <textarea
          rows={2}
          disabled={busy}
          value={note}
          placeholder="Жишээ: orientation 4/20, collage засах..."
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy || note === (item.programNote || '')}
          onClick={() => setProgram({ programNote: note })}
        >
          Тэмдэглэл хадгалах
        </button>
      </label>

      <div className="admin-program__visa">
        <strong>Визний тов / мэдэгдэл</strong>
        <input
          disabled={busy}
          placeholder="Огноо · цаг (жишээ: 2026-05-12 10:00)"
          value={visaWhen}
          onChange={(e) => setVisaWhen(e.target.value)}
        />
        <input
          disabled={busy}
          placeholder="Газар (ЭСЯ / виз төв)"
          value={visaPlace}
          onChange={(e) => setVisaPlace(e.target.value)}
        />
        <input
          disabled={busy}
          placeholder="Нэмэлт тэмдэглэл"
          value={visaNote}
          onChange={(e) => setVisaNote(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy || !visaWhen.trim()}
          onClick={saveVisa}
        >
          Тов илгээх
        </button>
        {visaOk ? <small className="admin-notify__ok">{visaOk}</small> : null}
        {item.visaAppointment?.when ? (
          <small>
            Одоогийн: {item.visaAppointment.when}
            {item.visaAppointment.place ? ` · ${item.visaAppointment.place}` : ''}
          </small>
        ) : null}
      </div>

      <p className="admin-program__summary">
        Баримт: {summary.approved || 0}/{summary.total || 13} зөвшөөрсөн · {summary.submitted || 0}{' '}
        хүлээгдэж · {summary.rejected || 0} засвар
        {item.programEnrolledAt ? ` · орсон: ${formatDate(item.programEnrolledAt)}` : ''}
      </p>

      <div className="admin-program__actions">
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setOpenDocs((v) => !v)}>
          {openDocs ? 'Баримт нуух' : `Баримт удирдах (${checklist.length})`}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy}
          onClick={() => {
            if (window.confirm('Бүх баримтыг хоослох уу?')) setProgram({ resetChecklist: true })
          }}
        >
          Checklist дахин эхлүүлэх
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy}
          onClick={() => {
            if (window.confirm('Хөтөлбөрөөс гаргах уу?')) setProgram({ inProgram: false })
          }}
        >
          Хөтөлбөрөөс гаргах
        </button>
      </div>

      {openDocs ? (
        <ul className="admin-docs">
          {checklist.map((doc) => (
            <DocEditor key={doc.key} doc={doc} busy={busy} onSave={saveDoc} />
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function EnrollmentKindPanel({ item, adminKey, onUpdated, onError }) {
  const [busy, setBusy] = useState(false)
  const isCourse = item.kind === 'course'
  const options = isCourse ? COURSE_OPTIONS : COUNTRY_OPTIONS

  async function save(payload) {
    setBusy(true)
    try {
      const res = await api.adminUpdateEnrollment(adminKey, item.id, payload)
      onUpdated?.(res.item)
    } catch (err) {
      onError?.(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-enroll-meta">
      <div className="admin-enroll-meta__grid">
        <div>
          <small>Хэнээс</small>
          <strong>{item.name}</strong>
          <span>{item.phone}</span>
          {item.email ? <span>{item.email}</span> : null}
          <span className="admin-enroll-meta__id">
            {item.userId ? `Апп хэрэглэгч · ${item.userId}` : 'Зочин (нэвтрээгүй)'}
          </span>
        </div>
        <div>
          <small>Хаанаас / хаашаа</small>
          <strong>{item.courseTitle}</strong>
          <span>{isCourse ? 'Сургалт' : 'Au Pair улс'} · {item.courseId}</span>
          <span>
            Нас {item.age ?? '—'} · {GERMAN_LEVEL_LABELS[item.germanLevel] || 'хэл —'}
          </span>
        </div>
      </div>

      {item.note ? <p className="admin-enroll-meta__note">Тэмдэглэл: {item.note}</p> : null}

      <div className="admin-enroll-meta__actions">
        <label>
          Төрөл (үүрэг)
          <select
            disabled={busy}
            value={item.kind || 'course'}
            onChange={(e) => {
              const kind = e.target.value
              const first = (kind === 'course' ? COURSE_OPTIONS : COUNTRY_OPTIONS)[0]
              if (!first) return
              save({ kind, courseId: first.id })
            }}
          >
            <option value="course">Сургалт</option>
            <option value="country">Au Pair</option>
          </select>
        </label>
        <label>
          {isCourse ? 'Анги' : 'Улс'}
          <select
            disabled={busy}
            value={item.courseId}
            onChange={(e) => save({ courseId: e.target.value })}
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
            {!options.some((o) => o.id === item.courseId) ? (
              <option value={item.courseId}>{item.courseTitle || item.courseId}</option>
            ) : null}
          </select>
        </label>
      </div>
    </div>
  )
}

function ItemDetails({
  tab,
  item,
  adminKey,
  onUserUpdated,
  onEnrollmentUpdated,
  onError,
  enrollments = [],
}) {
  if (tab === 'users' || tab === 'program') {
    const mine = enrollments.filter((e) => e.userId === item.id && e.status !== 'cancelled')
    const hasCourse = mine.some((e) => e.kind === 'course')
    const hasAuPair = mine.some((e) => e.kind === 'country') || item.inProgram
    return (
      <>
        <span>
          Нас: {item.age ?? '—'} · Герман хэл: {GERMAN_LEVEL_LABELS[item.germanLevel] || '—'}
          {item.pushTokenCount ? ` · push: ${item.pushTokenCount}` : ' · push: үгүй'}
        </span>
        <div className="admin-user-flags">
          <em className={hasCourse ? 'is-on' : ''}>Сургалт {hasCourse ? 'бүртгэлтэй' : 'үгүй'}</em>
          <em className={hasAuPair ? 'is-on' : ''}>Au Pair {hasAuPair ? 'бүртгэлтэй' : 'үгүй'}</em>
        </div>
        {item.email && <a href={`mailto:${item.email}`}>{item.email}</a>}
        <ProgramPanel
          item={item}
          adminKey={adminKey}
          onUpdated={onUserUpdated}
          onError={onError}
          defaultOpen={tab === 'program'}
        />
        <NotifyPanel
          adminKey={adminKey}
          userId={item.id}
          userLabel={item.name}
          onError={onError}
        />
      </>
    )
  }
  if (ENROLL_TABS.has(tab)) {
    return (
      <>
        <EnrollmentKindPanel
          item={item}
          adminKey={adminKey}
          onUpdated={onEnrollmentUpdated}
          onError={onError}
        />
        {item.status === 'accepted' ? (
          <ClassSchedulePanel item={item} adminKey={adminKey} onError={onError} />
        ) : null}
        {item.kind === 'course' && item.status === 'accepted' ? (
          <CourseProgressPanel
            item={item}
            adminKey={adminKey}
            onUpdated={onEnrollmentUpdated}
            onError={onError}
          />
        ) : null}
      </>
    )
  }
  if (tab === 'contacts') {
    return (
      <>
        <strong className="admin-item__title">
          {INTEREST_LABELS[item.interest] || item.interest}
        </strong>
        {item.message && <p>{item.message}</p>}
      </>
    )
  }
  return (
    <>
      <strong className="admin-item__title">{(item.items || []).length} бараа</strong>
      <ul>
        {(item.items || []).map((i, idx) => (
          <li key={`${i.id}-${idx}`}>{i.name}</li>
        ))}
      </ul>
    </>
  )
}

export default function Admin() {
  const [key, setKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) || '')
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('program')
  const [statusFilter, setStatusFilter] = useState('all')
  const [programFilter, setProgramFilter] = useState('all')
  const [stageFilter, setStageFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (adminKey) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.adminData(adminKey)
      sessionStorage.setItem(KEY_STORAGE, adminKey)
      setKey(adminKey)
      setData(res)
    } catch (err) {
      if (err.status === 401 || err.status === 503) {
        sessionStorage.removeItem(KEY_STORAGE)
        setKey('')
        setData(null)
      }
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const saved = sessionStorage.getItem(KEY_STORAGE)
    if (saved) load(saved)
  }, [load])

  async function changeStatus(item, status) {
    const collection = ENROLL_TABS.has(tab) ? 'enrollments' : tab
    try {
      const res = await api.adminSetStatus(key, collection, item.id, status)
      setData((d) => ({
        ...d,
        [collection]: (d[collection] || []).map((x) => (x.id === item.id ? res.item : x)),
      }))
    } catch (err) {
      setError(err.message)
    }
  }

  function onUserUpdated(user) {
    setData((d) => {
      const users = (d.users || []).map((u) => (u.id === user.id ? user : u))
      const programUsers = users.filter((u) => u.inProgram)
      return {
        ...d,
        users,
        program: {
          users: programUsers,
          pendingDocs: programUsers.reduce((n, u) => n + (u.programSummary?.submitted || 0), 0),
          enrolled: programUsers.length,
        },
      }
    })
  }

  function onEnrollmentUpdated(item) {
    setData((d) => ({
      ...d,
      enrollments: (d.enrollments || []).map((e) => (e.id === item.id ? item : e)),
    }))
  }

  function logout() {
    sessionStorage.removeItem(KEY_STORAGE)
    setKey('')
    setData(null)
  }

  const programStats = data?.program || { enrolled: 0, pendingDocs: 0 }

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matchQ = (item) => {
      if (!q) return true
      return [item.name, item.phone, item.email, item.id]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    }

    if (tab === 'program') {
      let list = (data?.users || []).filter((u) => u.inProgram)
      if (programFilter === 'pending') {
        list = list.filter((u) => (u.programSummary?.submitted || 0) > 0)
      } else if (programFilter === 'rejected') {
        list = list.filter((u) => (u.programSummary?.rejected || 0) > 0)
      }
      if (stageFilter !== 'all') {
        list = list.filter((u) => String(u.programStage) === String(stageFilter))
      }
      list = list.filter(matchQ)
      return list.sort((a, b) => {
        const as = a.programSummary?.submitted || 0
        const bs = b.programSummary?.submitted || 0
        if (bs !== as) return bs - as
        return String(b.programEnrolledAt || '').localeCompare(String(a.programEnrolledAt || ''))
      })
    }

    let list = data?.[tab] || []
    if (tab === 'course-req') {
      list = (data?.enrollments || []).filter((e) => {
        if (e.kind === 'course') return true
        if (e.kind === 'country') return false
        return COURSE_OPTIONS.some((c) => c.id === e.courseId)
      })
    } else if (tab === 'aupair-req') {
      list = (data?.enrollments || []).filter((e) => {
        if (e.kind === 'country') return true
        if (e.kind === 'course') return false
        return COUNTRY_OPTIONS.some((c) => c.id === e.courseId)
      })
    }
    const byStatus = statusFilter === 'all' ? list : list.filter((x) => x.status === statusFilter)
    return byStatus.filter(matchQ)
  }, [data, tab, statusFilter, programFilter, stageFilter, query])

  if (!data) {
    return (
      <div className="admin-page">
        <div className="container">
          <PageHeader title="Админ" text="Хөтөлбөр, элсэлт, хүсэлт, захиалгыг удирдах" />
          <Login onLogin={load} error={error} loading={loading} />
        </div>
      </div>
    )
  }

  const labels =
    tab === 'program' || tab === 'users'
      ? null
      : ENROLL_TABS.has(tab)
        ? STATUS_LABELS.enrollments
        : STATUS_LABELS[tab] || null

  const courseReqCount = (data.enrollments || []).filter((e) => {
    if (e.kind === 'course') return true
    if (e.kind === 'country') return false
    return COURSE_OPTIONS.some((c) => c.id === e.courseId)
  }).length
  const aupairReqCount = (data.enrollments || []).filter((e) => {
    if (e.kind === 'country') return true
    if (e.kind === 'course') return false
    return COUNTRY_OPTIONS.some((c) => c.id === e.courseId)
  }).length
  const coursePending = (data.enrollments || []).filter((e) => {
    const isCourse =
      e.kind === 'course' || (!e.kind && COURSE_OPTIONS.some((c) => c.id === e.courseId))
    return isCourse && e.status === 'pending'
  }).length
  const aupairPending = (data.enrollments || []).filter((e) => {
    const isCountry =
      e.kind === 'country' || (!e.kind && COUNTRY_OPTIONS.some((c) => c.id === e.courseId))
    return isCountry && e.status === 'pending'
  }).length

  return (
    <div className="admin-page">
      <div className="container">
        <PageHeader
          title="Админ"
          text="Хөтөлбөр, элсэлт, хүсэлт, захиалгыг нэг дороос удирдах"
          right={
            <div className="admin-actions">
              <button type="button" className="btn btn-ghost" onClick={() => load(key)}>
                {loading ? '...' : 'Шинэчлэх'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={logout}>
                Гарах
              </button>
            </div>
          }
        />

        <div className="admin-tabs" role="tablist">
          {TABS.map((t) => {
            let count = (data[t.id] || []).length
            let badge = 0
            if (t.id === 'program') {
              count = programStats.enrolled || 0
              badge = programStats.pendingDocs || 0
            } else if (t.id === 'users') {
              count = (data.users || []).length
            } else if (t.id === 'notify') {
              count = (data.users || []).length
            } else if (t.id === 'course-req') {
              count = courseReqCount
              badge = coursePending
            } else if (t.id === 'aupair-req') {
              count = aupairReqCount
              badge = aupairPending
            } else {
              badge = (data[t.id] || []).filter((x) => x.status === 'pending').length
            }
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`admin-tab${tab === t.id ? ' is-active' : ''}`}
                onClick={() => {
                  setTab(t.id)
                  setStatusFilter('all')
                  setProgramFilter('all')
                  setStageFilter('all')
                  setQuery('')
                }}
              >
                {t.label}
                <span>{count}</span>
                {badge > 0 && <em>{badge} шинэ</em>}
              </button>
            )
          })}
        </div>

        {tab === 'program' ? (
          <div className="admin-stats">
            <div>
              <strong>{programStats.enrolled || 0}</strong>
              <span>хөтөлбөрт</span>
            </div>
            <div>
              <strong>{programStats.pendingDocs || 0}</strong>
              <span>шалгах баримт</span>
            </div>
            <div>
              <strong>{(data.users || []).filter((u) => !u.inProgram).length}</strong>
              <span>ороогүй</span>
            </div>
          </div>
        ) : null}

        {tab === 'notify' ? (
          <>
            {error ? <div className="alert alert-err">{error}</div> : null}
            <NotifyPanel adminKey={key} onError={setError} defaultAudience="students" />
          </>
        ) : null}

        {tab !== 'notify' ? (
          <>
            <div className="admin-toolbar">
              <input
                className="admin-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Нэр, утас, имэйл..."
              />
              {tab === 'program' ? (
                <>
                  <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)}>
                    {PROGRAM_FILTERS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
                    <option value="all">Бүх шат</option>
                    {PROGRAM_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id}. {s.label}
                      </option>
                    ))}
                  </select>
                </>
              ) : null}
              {labels && (
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">Бүх төлөв</option>
                  {Object.entries(labels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                disabled={!items.length}
                onClick={() => downloadCsv(tab, items)}
              >
                CSV татах
              </button>
            </div>

            {error ? <div className="alert alert-err">{error}</div> : null}

            {tab === 'program' && items.length === 0 ? (
              <p className="admin-empty">
                Хөтөлбөрт хэрэглэгч алга. «Хэрэглэгч» табаас «Хөтөлбөрт оруулах» дарна уу.
              </p>
            ) : tab === 'course-req' && items.length === 0 ? (
              <p className="admin-empty">Сургалтын хүсэлт алга.</p>
            ) : tab === 'aupair-req' && items.length === 0 ? (
              <p className="admin-empty">Au Pair хүсэлт алга.</p>
            ) : items.length === 0 ? (
              <p className="admin-empty">Одоогоор бүртгэл алга.</p>
            ) : (
              <ul className="admin-list">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={`admin-item admin-item--${item.status || (item.inProgram ? 'program' : 'user')}`}
                  >
                    <div className="admin-item__head">
                      <div>
                        <strong>{item.name}</strong>
                        <a href={`tel:${item.phone.replace(/\s/g, '')}`}>{item.phone}</a>
                        {ENROLL_TABS.has(tab) ? (
                          <span className="admin-item__from">
                            → {item.courseTitle || item.courseId}
                          </span>
                        ) : null}
                      </div>
                      {labels && (
                        <select
                          value={item.status}
                          onChange={(e) => changeStatus(item, e.target.value)}
                          aria-label="Төлөв"
                        >
                          {Object.entries(labels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      )}
                      {ENROLL_TABS.has(tab) ? (
                        <span className={`admin-item__pill admin-item__pill--${item.kind || 'course'}`}>
                          {item.kind === 'country' ? 'Au Pair' : 'Сургалт'}
                        </span>
                      ) : null}
                      {(tab === 'program' || tab === 'users') && item.inProgram ? (
                        <span className="admin-item__pill">
                          {PROGRAM_CATEGORY_LABELS[item.programCategory] || 'Хөтөлбөр'} ·{' '}
                          {item.programStage}/5
                        </span>
                      ) : null}
                    </div>
                    <div className="admin-item__body">
                      <ItemDetails
                        tab={tab}
                        item={item}
                        adminKey={key}
                        onUserUpdated={onUserUpdated}
                        onEnrollmentUpdated={onEnrollmentUpdated}
                        onError={setError}
                        enrollments={data.enrollments || []}
                      />
                    </div>
                    <small className="admin-item__meta">
                      {formatDate(item.createdAt)} · {item.id}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}

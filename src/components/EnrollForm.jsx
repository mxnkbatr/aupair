import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { GERMAN_LEVEL_LABELS, formatMnt, social } from '../data'
import { celebrate } from '../confetti'
import { haptic } from '../native'
import { Stepper } from './glass/Glass'
import './EnrollForm.css'

const STEPS = ['Мэдээлэл', 'Төлбөр', 'Баталгаа']

function initialForm(user) {
  return {
    name: user?.name || '',
    phone: user?.phone || '',
    age: user?.age ?? '',
    email: user?.email || '',
    germanLevel: user?.germanLevel || 'none',
    note: '',
  }
}

function PaymentPanel({ done, phone, onChecked }) {
  const [checking, setChecking] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const payment = done?.payment
  const enrollmentId = done?.enrollment?.id
  const paid =
    done?.enrollment?.status === 'accepted' ||
    done?.enrollment?.status === 'paid' ||
    Boolean(done?.paid)

  const qrSrc = payment?.qrImage
    ? payment.qrImage.startsWith('data:')
      ? payment.qrImage
      : `data:image/png;base64,${payment.qrImage}`
    : null

  async function checkPay(silent = false) {
    if (!enrollmentId) return
    if (!silent) {
      setChecking(true)
      setErr('')
      setMsg('')
    }
    try {
      const res = await api.checkEnrollmentPayment(enrollmentId, { phone })
      if (!silent) setMsg(res.message || '')
      onChecked?.(res)
      if (res.paid) {
        haptic('success')
        celebrate()
      } else if (!silent) {
        haptic('selection')
      }
    } catch (e) {
      if (!silent) {
        setErr(e.message)
        haptic('error')
      }
    } finally {
      if (!silent) setChecking(false)
    }
  }

  useEffect(() => {
    if (paid || !enrollmentId) return undefined
    const id = setInterval(() => checkPay(true), 4000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paid, enrollmentId, phone])

  if (paid) {
    return (
      <div className="enroll-pay enroll-pay--ok">
        <div className="enroll-success">
          <span className="enroll-success__check" aria-hidden>✓</span>
          <strong>Төлбөр амжилттай</strong>
          <small>Суудал автоматаар бүртгэгдлээ</small>
        </div>
        <p className="enroll-form__ref">
          Захиалгын код: <strong>{enrollmentId}</strong>
        </p>
      </div>
    )
  }

  if (!payment) return null

  return (
    <div className="enroll-pay">
      <div className="enroll-pay__card">
        <span className="enroll-pay__brand">QPay</span>
        <p className="enroll-pay__amount">
          <small>Төлөх дүн</small>
          <strong>{formatMnt(payment.amount)}</strong>
        </p>
      {qrSrc ? (
        <img className="enroll-pay__qr" src={qrSrc} alt="QPay QR" />
      ) : (
        <p className="enroll-form__ref">QR үүсээгүй — банкны апп линк ашиглана уу.</p>
      )}
        <p className="enroll-pay__wait">
          <i aria-hidden /> Төлбөр хүлээж байна · автоматаар шалгана
        </p>
      </div>
      {payment.shortUrl ? (
        <a className="btn btn-ghost btn-block" href={payment.shortUrl} target="_blank" rel="noreferrer">
          QPay холбоос нээх
        </a>
      ) : null}
      {Array.isArray(payment.urls) && payment.urls.length > 0 ? (
        <div className="enroll-pay__banks">
          {payment.urls.slice(0, 8).map((bank) => (
            <a key={bank.link || bank.name} href={bank.link} target="_blank" rel="noreferrer">
              {bank.name || 'Банк'}
            </a>
          ))}
        </div>
      ) : null}
      <button type="button" className="btn btn-primary btn-block" disabled={checking} onClick={() => checkPay(false)}>
        {checking ? 'Шалгаж байна…' : 'Төлсөн · суудал шалгах'}
      </button>
      {msg ? <p className="enroll-form__ref">{msg}</p> : null}
      {err ? <div className="alert alert-err">{err}</div> : null}
      <p className="enroll-form__ref">
        Төлбөр ормогц суудал <strong>автоматаар</strong> бүртгэгдэнэ. Гараар баталгаажуулах шаардлагагүй.
      </p>
    </div>
  )
}

export default function EnrollForm({ course, onSuccess, steps = STEPS }) {
  const { user } = useAuth()
  const [form, setForm] = useState(() => initialForm(user))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  const hasSeats = typeof course.seatsLeft === 'number'
  const full = hasSeats && course.seatsLeft <= 0
  const confirmMode = Boolean(user?.name && user?.phone && Number.isInteger(Number(user?.age)) && user?.age)
  const priceLabel = course.priceLabel || (course.priceMnt ? formatMnt(course.priceMnt) : '')
  const payCta = full
    ? 'Суудал дууссан'
    : loading
      ? 'QPay бэлдэж байна…'
      : priceLabel
        ? `Төлбөр төлөх · ${priceLabel}`
        : 'Үргэлжлүүлэх'

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.enroll({ ...form, courseId: course.id })
      setDone(res)
      haptic('success')
      if (!res.payment) celebrate()
      onSuccess?.(res)
    } catch (err) {
      setError(err.message)
      haptic('error')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    const needsPay = Boolean(done.payment) && done.enrollment?.status === 'pending_payment'
    const paidDone =
      done.paid ||
      done.enrollment?.status === 'accepted' ||
      done.enrollment?.status === 'paid'
    return (
      <div className="enroll-form">
        <Stepper steps={steps} current={needsPay && !paidDone ? 1 : 2} />
        <div className="alert alert-ok">
          {paidDone
            ? done.message || 'Суудал бүртгэгдлээ'
            : done.message || 'QPay-аар төлбөрөө төлнө үү'}
        </div>
        {needsPay ? (
          <PaymentPanel
            done={done}
            phone={form.phone || user?.phone}
            onChecked={(res) => {
              setDone((prev) => ({
                ...prev,
                ...res,
                enrollment: { ...(prev.enrollment || {}), ...(res.enrollment || {}) },
                payment: res.payment || prev.payment,
                paid: res.paid,
                message: res.message,
              }))
              onSuccess?.(res)
            }}
          />
        ) : paidDone ? (
          <p className="enroll-form__ref">
            Захиалгын код: <strong>{done.enrollment?.id}</strong>
          </p>
        ) : null}
        {user ? (
          <Link to="/me" className="btn btn-primary btn-block">
            Миний суудал харах
          </Link>
        ) : (
          <p className="enroll-form__ref">
            <Link to="/me">Профайл үүсгэвэл</Link> суудлаа апп дээрээс харах боломжтой.
          </p>
        )}
        <a href={`tel:${social.phoneTel}`} className="btn btn-ghost btn-block">
          {social.phone} руу залгах
        </a>
      </div>
    )
  }

  const summary = (
    <div className="enroll-form__summary">
      <span className="enroll-form__sumrow">
        <strong>{course.title}</strong>
        {hasSeats ? (
          <em>{full ? 'Дууссан' : `${course.seatsLeft} суудал`}</em>
        ) : null}
      </span>
      <span className="enroll-form__price">{priceLabel}</span>
      {course.priceMnt ? (
        <small className="enroll-form__pay-hint">
          Төлбөр төлсний дараа суудал автоматаар бүртгэгдэнэ · админ зөвшөөрөл хэрэггүй
        </small>
      ) : null}
    </div>
  )

  if (confirmMode) {
    return (
      <form className="enroll-form" onSubmit={handleSubmit}>
        <Stepper steps={steps} current={0} />
        {summary}

        <div className="enroll-form__row">
          <label className="field">
            <span>Овог нэр</span>
            <input value={form.name} readOnly aria-readonly="true" className="is-readonly" />
          </label>
          <label className="field">
            <span>Утас</span>
            <input value={form.phone} readOnly aria-readonly="true" className="is-readonly" />
          </label>
        </div>

        <label className="field">
          <span>Нэмэлт мэдээлэл (заавал биш)</span>
          <textarea
            rows={2}
            value={form.note}
            onChange={update('note')}
            placeholder="Асуух зүйл, тохиромжтой цаг..."
          />
        </label>

        {error && <div className="alert alert-err">{error}</div>}

        <button type="submit" className="btn btn-primary btn-block" disabled={loading || full}>
          {payCta}
        </button>
      </form>
    )
  }

  return (
    <form className="enroll-form" onSubmit={handleSubmit}>
      <Stepper steps={steps} current={0} />
      {summary}

      <label className="field">
        <span>Овог нэр *</span>
        <input
          required
          value={form.name}
          onChange={update('name')}
          placeholder="Таны нэр"
          autoComplete="name"
        />
      </label>

      <div className="enroll-form__row">
        <label className="field">
          <span>Утас *</span>
          <input
            required
            type="tel"
            inputMode="tel"
            value={form.phone}
            onChange={update('phone')}
            placeholder="8811 2233"
            autoComplete="tel"
          />
        </label>

        <label className="field">
          <span>Нас *</span>
          <input
            required
            type="number"
            inputMode="numeric"
            min="16"
            max="45"
            value={form.age}
            onChange={update('age')}
            placeholder="20"
          />
        </label>
      </div>

      <label className="field">
        <span>Герман хэлний түвшин</span>
        <select value={form.germanLevel} onChange={update('germanLevel')}>
          {Object.entries(GERMAN_LEVEL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Имэйл</span>
        <input
          type="email"
          value={form.email}
          onChange={update('email')}
          placeholder="Заавал биш"
          autoComplete="email"
        />
      </label>

      <label className="field">
        <span>Нэмэлт мэдээлэл</span>
        <textarea
          rows={2}
          value={form.note}
          onChange={update('note')}
          placeholder="Асуух зүйл, тохиромжтой цаг..."
        />
      </label>

      {error && <div className="alert alert-err">{error}</div>}

      <button type="submit" className="btn btn-primary btn-block" disabled={loading || full}>
        {payCta}
      </button>
    </form>
  )
}

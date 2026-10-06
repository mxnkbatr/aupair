import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { GERMAN_LEVEL_LABELS, social } from '../data'
import { celebrate } from '../confetti'
import { haptic } from '../native'
import './EnrollForm.css'

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

export default function EnrollForm({ course, onSuccess }) {
  const { user } = useAuth()
  const [form, setForm] = useState(() => initialForm(user))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  const hasSeats = typeof course.seatsLeft === 'number'
  const full = hasSeats && course.seatsLeft <= 0
  // Logged-in users with a complete profile only confirm; everyone else fills the full form.
  const confirmMode = Boolean(user?.name && user?.phone && Number.isInteger(Number(user?.age)) && user?.age)

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
      setForm(initialForm(user))
      haptic('success')
      celebrate()
      onSuccess?.(res)
    } catch (err) {
      setError(err.message)
      haptic('error')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="enroll-form">
        <div className="alert alert-ok">{done.message || 'Бүртгэл амжилттай!'}</div>
        <p className="enroll-form__ref">
          Бүртгэлийн код: <strong>{done.enrollment?.id}</strong>
        </p>
        {user ? (
          <Link to="/me" className="btn btn-primary btn-block">
            Элсэлтийн явцыг харах
          </Link>
        ) : (
          <p className="enroll-form__ref">
            <Link to="/me">Профайл үүсгэвэл</Link> элсэлтийнхээ явцыг апп дээрээс харах
            боломжтой.
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
      <strong>{course.title}</strong>
      <span>
        {course.priceLabel}
        {hasSeats ? ` · ${full ? 'Суудал дууссан' : `${course.seatsLeft} суудал үлдсэн`}` : ''}
      </span>
    </div>
  )

  if (confirmMode) {
    return (
      <form className="enroll-form" onSubmit={handleSubmit}>
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
          {full ? 'Суудал дууссан' : loading ? 'Илгээж байна...' : 'Баталгаажуулах'}
        </button>
        <p className="enroll-form__ref">Профайлын мэдээллээр бүртгэнэ. Бид удахгүй холбогдоно.</p>
      </form>
    )
  }

  return (
    <form className="enroll-form" onSubmit={handleSubmit}>
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
        {full ? 'Суудал дууссан' : loading ? 'Илгээж байна...' : 'Бүртгүүлэх'}
      </button>
    </form>
  )
}

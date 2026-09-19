import { useState } from 'react'
import { api } from '../api'
import './EnrollForm.css'

const empty = { name: '', phone: '', email: '', note: '' }

export default function EnrollForm({ course, onSuccess }) {
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  const full = typeof course.seatsLeft === 'number' && course.seatsLeft <= 0

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.enroll({
        ...form,
        courseId: course.id,
        level: course.level,
      })
      setDone(res)
      setForm(empty)
      onSuccess?.(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="enroll-form">
        <div className="alert alert-ok">
          {done.message || 'Бүртгэл амжилттай!'}
        </div>
        <p className="enroll-form__ref">
          Код: <strong>{done.enrollment?.id}</strong>
        </p>
        <button type="button" className="btn btn-ghost btn-block" onClick={() => setDone(null)}>
          Дахин бүртгэх
        </button>
      </div>
    )
  }

  return (
    <form className="enroll-form" onSubmit={handleSubmit}>
      <div className="enroll-form__summary">
        <strong>{course.title}</strong>
        <span>
          {course.priceLabel} ·{' '}
          {full ? 'Суудал дууссан' : `${course.seatsLeft ?? '—'} суудал`}
        </span>
      </div>

      <label className="field">
        <span>Нэр *</span>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Таны нэр"
          autoComplete="name"
        />
      </label>

      <label className="field">
        <span>Утас *</span>
        <input
          required
          inputMode="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+976 ..."
          autoComplete="tel"
        />
      </label>

      <label className="field">
        <span>Имэйл</span>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="optional@mail.com"
          autoComplete="email"
        />
      </label>

      <label className="field">
        <span>Тэмдэглэл</span>
        <textarea
          rows={2}
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          placeholder="Цаг, түвшин..."
        />
      </label>

      {error && <div className="alert alert-err">{error}</div>}

      <button type="submit" className="btn btn-primary btn-block" disabled={loading || full}>
        {full ? 'Суудал дууссан' : loading ? 'Илгээж байна...' : 'Бүртгэл баталгаажуулах'}
      </button>
    </form>
  )
}

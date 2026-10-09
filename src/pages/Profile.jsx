import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CaretRight, Path, Bell, Fire, SignIn } from '@phosphor-icons/react'
import { useAuth } from '../auth'
import { api } from '../api'
import { GERMAN_LEVEL_LABELS, INTEREST_LABELS, STATUS_LABELS } from '../data'
import AuthModal from '../components/AuthModal'
import JourneyTimeline from '../components/JourneyTimeline'
import Sheet from '../components/Sheet'
import { confirmDialog, haptic } from '../native'
import usePullToRefresh from '../hooks/usePullToRefresh'
import PullIndicator from '../components/PullIndicator'
import './Profile.css'

const ENROLL_STEPS = ['pending', 'contacted', 'accepted']

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function initials(name) {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function displayName(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

const PERKS = [
  { icon: Path, title: 'Явц хянах', text: 'Элсэлтийн алхам бүрийг утаснаасаа' },
  { icon: Bell, title: 'Мэдэгдэл', text: 'Статус солигдоход мэдэгдэнэ' },
  { icon: Fire, title: 'Streak', text: 'Өдөр тутмын герман үг' },
]

function LoggedOut() {
  const location = useLocation()
  const [auth, setAuth] = useState(() => location.state?.auth || null)

  return (
    <>
      <section className="pf-guest">
        <img src="/logo.png" alt="" className="pf-guest__logo" />
        <h2>Элсэлтээ утаснаасаа хяна</h2>
        <p>Нэвтрээд явц, захиалга, зөвлөгөөг нэг дороос.</p>
        <div className="pf-guest__actions">
          <button
            type="button"
            className="btn pf-guest__primary"
            onClick={() => {
              haptic('light')
              setAuth('login')
            }}
          >
            <SignIn weight="bold" size={18} aria-hidden /> Нэвтрэх
          </button>
          <button
            type="button"
            className="btn pf-guest__ghost"
            onClick={() => {
              haptic('light')
              setAuth('register')
            }}
          >
            Бүртгэл үүсгэх
          </button>
        </div>
      </section>

      <ul className="pf-perks">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="pf-card">
            <span className="pf-perks__icon">
              <Icon weight="duotone" size={22} aria-hidden />
            </span>
            <div>
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          </li>
        ))}
      </ul>

      <section className="pf-section">
        <div className="pf-menu">
          <Link to="/me/help">
            Тусламж <CaretRight size={16} weight="bold" aria-hidden />
          </Link>
        </div>
      </section>

      <AuthModal open={Boolean(auth)} mode={auth || 'login'} onClose={() => setAuth(null)} />
    </>
  )
}

function EnrollmentCard({ item }) {
  const cancelled = item.status === 'cancelled'
  const step = ENROLL_STEPS.indexOf(item.status)
  return (
    <li className={`pf-enroll${cancelled ? ' is-cancelled' : ''}`}>
      <div className="pf-enroll__head">
        <strong>{item.courseTitle}</strong>
        <span className={`pf-status pf-status--${item.status}`}>
          {STATUS_LABELS.enrollments[item.status] || item.status}
        </span>
      </div>
      {!cancelled && (
        <ol className="pf-steps" aria-label="Явц">
          {ENROLL_STEPS.map((s, i) => (
            <li key={s} className={i <= step ? 'is-done' : ''}>
              <i />
              <span>{STATUS_LABELS.enrollments[s]}</span>
            </li>
          ))}
        </ol>
      )}
      <small>
        {formatDate(item.createdAt)} · Код {item.id}
      </small>
    </li>
  )
}

function EditSheet({ open, onClose, onDelete, deleting }) {
  const { user, update } = useAuth()
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && user) {
      setForm({
        name: user.name,
        email: user.email || '',
        age: user.age ?? '',
        germanLevel: user.germanLevel || 'none',
      })
      setError('')
    }
  }, [open, user])

  if (!form) return null
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await update(form)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Хувийн мэдээлэл">
      <form className="pf-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Овог нэр</span>
          <input required value={form.name} onChange={set('name')} autoComplete="name" />
        </label>
        <label className="field">
          <span>Имэйл</span>
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" />
        </label>
        <div className="pf-row">
          <label className="field">
            <span>Нас</span>
            <input
              type="number"
              inputMode="numeric"
              min="16"
              max="45"
              value={form.age}
              onChange={set('age')}
            />
          </label>
          <label className="field">
            <span>Герман хэл</span>
            <select value={form.germanLevel} onChange={set('germanLevel')}>
              {Object.entries(GERMAN_LEVEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && <div className="alert alert-err">{error}</div>}
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Хадгалж байна...' : 'Хадгалах'}
        </button>
        {onDelete ? (
          <button
            type="button"
            className="btn btn-ghost btn-block is-danger"
            style={{ color: 'var(--brand)', marginTop: '0.75rem' }}
            disabled={deleting}
            onClick={onDelete}
          >
            {deleting ? 'Устгаж байна…' : 'Бүртгэл устгах'}
          </button>
        ) : null}
      </form>
    </Sheet>
  )
}

function PasswordSheet({ open, onClose }) {
  const { update } = useAuth()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' })
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({ currentPassword: '', newPassword: '' })
      setError('')
      setDone(false)
    }
  }, [open])

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await update(form)
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Нууц үг солих">
      {done ? (
        <div className="pf-form">
          <div className="alert alert-ok">Нууц үг амжилттай солигдлоо.</div>
          <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
            Хаах
          </button>
        </div>
      ) : (
        <form className="pf-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Одоогийн нууц үг</span>
            <input
              required
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              autoComplete="current-password"
            />
          </label>
          <label className="field">
            <span>Шинэ нууц үг</span>
            <input
              required
              type="password"
              minLength={6}
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              autoComplete="new-password"
            />
          </label>
          {error && <div className="alert alert-err">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Хадгалж байна...' : 'Солих'}
          </button>
        </form>
      )}
    </Sheet>
  )
}

function Dashboard() {
  const { user, refresh, logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [sheet, setSheet] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      const res = await refresh()
      if (res) setData(res)
    } catch (err) {
      setError(err.message)
    }
  }, [refresh])

  useEffect(() => {
    load()
  }, [load])

  const ptr = usePullToRefresh(load)

  async function deleteAccount() {
    const ok = await confirmDialog(
      'Таны бүртгэл болон мэдээлэл бүрмөсөн устна. Итгэлтэй байна уу?',
      { title: 'Бүртгэл устгах', okTitle: 'Устгах', cancelTitle: 'Болих' },
    )
    if (!ok || deleting) return
    setDeleting(true)
    try {
      await api.deleteMe()
      haptic('success')
      logout()
      navigate('/', { replace: true })
    } catch (err) {
      haptic('error')
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const enrollments = data?.enrollments || []
  const orders = data?.orders || []
  const contacts = data?.contacts || []

  return (
    <>
      <PullIndicator {...ptr} />
      <section className="pf-hero">
        <span className="pf-hero__avatar">{initials(user.name)}</span>
        <div className="pf-hero__info">
          <h2>{displayName(user.name)}</h2>
          <p>{user.phone}</p>
          <p>
            Герман хэл: {GERMAN_LEVEL_LABELS[user.germanLevel] || '—'}
            {user.age ? ` · ${user.age} нас` : ''}
          </p>
        </div>
        <button type="button" className="pf-hero__edit" onClick={() => setSheet('edit')}>
          Засах
        </button>
      </section>

      {data && (enrollments.length > 0 || orders.length > 0 || contacts.length > 0) ? (
        <section className="pf-stats">
          <div>
            <strong>{enrollments.length}</strong>
            <span>Элсэлт</span>
          </div>
          <div>
            <strong>{orders.length}</strong>
            <span>Захиалга</span>
          </div>
          <div>
            <strong>{contacts.length}</strong>
            <span>Хүсэлт</span>
          </div>
        </section>
      ) : null}

      {error && <div className="alert alert-err pf-gap">{error}</div>}

      <section className="pf-section">
        <h3>Миний аялал</h3>
        <div className="pf-card">
          <JourneyTimeline user={user} enrollments={enrollments} />
        </div>
      </section>

      <section className="pf-section">
        <h3>Миний элсэлт</h3>
        {!data ? (
          <div className="pf-card pf-skeleton" aria-label="Ачаалж байна">
            <div className="skeleton" style={{ height: 16, width: '60%' }} />
            <div className="skeleton" style={{ height: 12, width: '100%' }} />
            <div className="skeleton" style={{ height: 12, width: '40%' }} />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="pf-card pf-empty">
            <p>Та одоогоор бүртгүүлээгүй байна.</p>
            <div className="pf-empty__actions">
              <Link to="/learn" className="btn btn-primary">
                Хэлний анги
              </Link>
              <Link to="/countries" className="btn btn-ghost">
                Au Pair улсууд
              </Link>
            </div>
          </div>
        ) : (
          <ul className="pf-list">
            {enrollments.map((item) => (
              <EnrollmentCard key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>

      {orders.length > 0 && (
        <section className="pf-section">
          <h3>Миний захиалга</h3>
          <ul className="pf-list">
            {orders.map((order) => (
              <li key={order.id} className="pf-card pf-line">
                <div>
                  <strong>{(order.items || []).map((i) => i.name).join(', ')}</strong>
                  <small>{formatDate(order.createdAt)}</small>
                </div>
                <span className={`pf-status pf-status--${order.status}`}>
                  {STATUS_LABELS.orders[order.status] || order.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {contacts.length > 0 && (
        <section className="pf-section">
          <h3>Миний хүсэлт</h3>
          <ul className="pf-list">
            {contacts.map((c) => (
              <li key={c.id} className="pf-card pf-line">
                <div>
                  <strong>{INTEREST_LABELS[c.interest] || c.interest}</strong>
                  <small>{formatDate(c.createdAt)}</small>
                </div>
                <span className={`pf-status pf-status--${c.status}`}>
                  {STATUS_LABELS.contacts[c.status] || c.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="pf-section">
        <h3>Тохиргоо</h3>
        <div className="pf-menu">
          <button type="button" onClick={() => setSheet('edit')}>
            Хувийн мэдээлэл <CaretRight size={16} weight="bold" aria-hidden />
          </button>
          <button type="button" onClick={() => setSheet('password')}>
            Нууц үг солих <CaretRight size={16} weight="bold" aria-hidden />
          </button>
          <Link to="/me/help">
            Тусламж ба холбоо <CaretRight size={16} weight="bold" aria-hidden />
          </Link>
          <Link to="/privacy">
            Нууцлалын бодлого <CaretRight size={16} weight="bold" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="pf-section">
        <div className="pf-menu">
          <button type="button" className="is-danger" onClick={logout}>
            Гарах
          </button>
        </div>
      </section>

      <EditSheet
        open={sheet === 'edit'}
        onClose={() => setSheet(null)}
        onDelete={deleteAccount}
        deleting={deleting}
      />
      <PasswordSheet open={sheet === 'password'} onClose={() => setSheet(null)} />
    </>
  )
}

export default function Profile() {
  const { user } = useAuth()

  return (
    <div className="profile-page">
      <div className="container">
        <header className="pf-title">
          <h1>Би</h1>
        </header>
        {user ? <Dashboard /> : <LoggedOut />}
      </div>
    </div>
  )
}

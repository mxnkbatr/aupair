import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpenText,
  CaretRight,
  ChatsCircle,
  Globe,
  GlobeHemisphereEast,
  ListChecks,
  LockKey,
  Package,
  Path,
  PencilSimple,
  Phone,
  QrCode,
  SealCheck,
  ShieldCheck,
  SignIn,
  SignOut,
  Translate,
  UserCircle,
} from '@phosphor-icons/react'
import { useAuth } from '../auth'
import { api } from '../api'
import { GERMAN_LEVEL_LABELS, INTEREST_LABELS, STATUS_LABELS, org, social } from '../data'
import AgencyCard from '../components/AgencyCard'
import AuthModal from '../components/AuthModal'
import JourneyTimeline from '../components/JourneyTimeline'
import Sheet from '../components/Sheet'
import Pressable from '../components/Pressable'
import { GlassCard, Reveal } from '../components/glass/Glass'
import { confirmDialog, haptic } from '../native'
import usePullToRefresh from '../hooks/usePullToRefresh'
import PullIndicator from '../components/PullIndicator'
import './Profile.css'
import './ProfileGlass.css'

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
  { icon: Path, title: 'Явц хянах', text: 'Элсэлтийн алхам бүр' },
  { icon: Bell, title: 'Мэдэгдэл', text: 'Статус солигдоход' },
  { icon: QrCode, title: 'QPay', text: 'Шууд суудал авах' },
]

/** iOS-style grouped list row with a coloured icon squircle. */
function Row({ icon: Icon, tone = 'ink', label, value, to, href, onClick, danger, external }) {
  const inner = (
    <>
      <span className={`pf-row__icon pf-row__icon--${tone}`}>
        <Icon size={17} weight="fill" aria-hidden />
      </span>
      <span className="pf-row__label">{label}</span>
      {value ? <span className="pf-row__value">{value}</span> : null}
      {danger ? null : external ? (
        <ArrowUpRight size={15} weight="bold" className="pf-row__chev" aria-hidden />
      ) : (
        <CaretRight size={15} weight="bold" className="pf-row__chev" aria-hidden />
      )}
    </>
  )
  const cls = danger ? 'pf-row is-danger' : 'pf-row'
  if (to) {
    return (
      <Pressable as={Link} to={to} scale={0.985} className={cls}>
        {inner}
      </Pressable>
    )
  }
  if (href) {
    return (
      <Pressable
        as="a"
        href={href}
        scale={0.985}
        className={cls}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {inner}
      </Pressable>
    )
  }
  return (
    <Pressable scale={0.985} className={cls} onClick={onClick}>
      {inner}
    </Pressable>
  )
}

function Group({ title, children }) {
  return (
    <section className="pf-group">
      {title ? <h3>{title}</h3> : null}
      <div className="pf-group__list">{children}</div>
    </section>
  )
}

function HelpRows() {
  return (
    <>
      <Row icon={GlobeHemisphereEast} tone="red" label="Au Pair улсууд" to="/countries" />
      <Row icon={ChatsCircle} tone="ink" label="Тусламж ба холбоо" to="/me/help" />
      <Row icon={Phone} tone="green" label="Залгах" value={social.phone} href={`tel:${social.phoneTel}`} />
      <Row icon={Globe} tone="ink" label="Албан ёсны вэбсайт" href={org.website} external />
      <Row icon={ShieldCheck} tone="grey" label="Нууцлалын бодлого" to="/privacy" />
    </>
  )
}

function LoggedOut() {
  const location = useLocation()
  const navigate = useNavigate()
  const [auth, setAuth] = useState(() => location.state?.auth || 'login')

  // Profile / avatar дарсан үед login|register modal нээнэ
  useEffect(() => {
    const next = location.state?.auth
    if (next === 'login' || next === 'register') {
      setAuth(next)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, navigate])

  return (
    <>
      <section className="rh pf-rh">
        <div className="container rh__inner pf-gst">
          <span className="pf-gst__logo">
            <img src="/logo.png" alt="" />
          </span>
          <h1>Элсэлтээ утаснаасаа хяна</h1>
          <p className="rh__lead">Нэвтрээд явц, төлбөр, зөвлөгөөг нэг дороос.</p>
          <div className="pf-gst__actions">
            <Pressable
              className="pf-btn pf-btn--white"
              onClick={() => setAuth('login')}
            >
              <SignIn weight="bold" size={18} aria-hidden /> Нэвтрэх
            </Pressable>
            <Pressable className="pf-btn pf-btn--glass" onClick={() => setAuth('register')}>
              Бүртгэл үүсгэх
            </Pressable>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="pf-perks">
          {PERKS.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} i={i}>
              <GlassCard className="pf-perk">
                <span className="pf-perk__icon">
                  <Icon weight="fill" size={20} aria-hidden />
                </span>
                <strong>{title}</strong>
                <small>{text}</small>
              </GlassCard>
            </Reveal>
          ))}
        </div>

        <section className="pf-group">
          <h3>Байгууллага</h3>
          <AgencyCard compact />
        </section>

        <Group title="Цэс">
          <HelpRows />
        </Group>

        <p className="pf-version">Mongolian Au Pair · {org.since} оноос</p>
      </div>

      <AuthModal open={Boolean(auth)} mode={auth || 'login'} onClose={() => setAuth(null)} />
    </>
  )
}

function EnrollmentCard({ item, i }) {
  const cancelled = item.status === 'cancelled'
  const paid = item.status === 'paid'
  const step = paid ? 1 : ENROLL_STEPS.indexOf(item.status)
  const pct = cancelled ? 0 : Math.max(0.12, (step + 1) / ENROLL_STEPS.length)
  const to = item.kind === 'country' ? `/countries/${item.courseId}` : `/learn/course/${item.courseId}`
  return (
    <Reveal i={i}>
      <Pressable as={Link} to={to} scale={0.985} className={`pf-enroll${cancelled ? ' is-cancelled' : ''}`}>
        <div className="pf-enroll__head">
          <span className={`pf-enroll__kind pf-enroll__kind--${item.kind === 'country' ? 'ink' : 'red'}`}>
            {item.kind === 'country' ? (
              <GlobeHemisphereEast size={18} weight="fill" aria-hidden />
            ) : (
              <BookOpenText size={18} weight="fill" aria-hidden />
            )}
          </span>
          <span className="pf-enroll__title">
            <strong>{item.courseTitle}</strong>
            <small>
              {formatDate(item.createdAt)} · #{String(item.id).slice(-6)}
            </small>
          </span>
          <span className={`pf-status pf-status--${item.status}`}>
            {STATUS_LABELS.enrollments[item.status] || item.status}
          </span>
        </div>
        {!cancelled ? (
          <div className="pf-enroll__track">
            <span className="pf-enroll__bar">
              <motion.i
                initial={{ width: 0 }}
                whileInView={{ width: `${pct * 100}%` }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 90, damping: 20, delay: 0.1 }}
              />
            </span>
            <ol>
              {ENROLL_STEPS.map((s, idx) => (
                <li key={s} className={idx <= step ? 'is-done' : ''}>
                  {STATUS_LABELS.enrollments[s]}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </Pressable>
    </Reveal>
  )
}

/** What should this user do next? Drives the black "next step" card. */
function nextStep(user, enrollments) {
  const waiting = enrollments.find((e) => e.status === 'pending_payment')
  if (waiting) {
    return {
      tone: 'wait',
      kicker: 'Дараагийн алхам',
      title: 'Төлбөрөө төлж суудлаа баталгаажуул',
      sub: waiting.courseTitle,
      to: `/learn/course/${waiting.courseId}`,
      cta: 'QPay-аар төлөх',
    }
  }
  if (user.inProgram) {
    return {
      tone: 'ok',
      kicker: 'Au Pair хөтөлбөр',
      title: 'Бичиг баримтаа бүрдүүлэх',
      sub: 'Checklist-ээ шалгаад баримтаа илгээ',
      to: '/me/program',
      cta: 'Checklist нээх',
    }
  }
  const accepted = enrollments.find((e) => e.status === 'accepted' || e.status === 'paid')
  if (accepted) {
    return {
      tone: 'ok',
      kicker: 'Суудал баталгаажсан',
      title: accepted.courseTitle,
      sub: 'Хуваарь, ангийн чат нээлттэй',
      to: '/learn',
      cta: 'Анги руу орох',
    }
  }
  if (enrollments.length) {
    return {
      tone: 'idle',
      kicker: 'Хүсэлт илгээгдсэн',
      title: 'Бид удахгүй холбогдоно',
      sub: 'Ажлын 1–2 өдөрт',
      to: '/me/help',
      cta: 'Асуулт байна уу?',
    }
  }
  return {
    tone: 'idle',
    kicker: 'Эхний алхам',
    title: 'Түвшиндээ тохирох ангиа сонго',
    sub: '2027.01.25 элсэлт нээлттэй',
    to: '/learn',
    cta: 'Анги сонгох',
  }
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

  async function onLogout() {
    const ok = await confirmDialog('Та гарахдаа итгэлтэй байна уу?', {
      title: 'Гарах',
      okTitle: 'Гарах',
      cancelTitle: 'Болих',
    })
    if (ok) {
      haptic('light')
      logout()
    }
  }

  const enrollments = data?.enrollments || []
  const orders = data?.orders || []
  const contacts = data?.contacts || []
  const next = nextStep(user, enrollments)
  const level = GERMAN_LEVEL_LABELS[user.germanLevel] || '—'

  return (
    <>
      <PullIndicator {...ptr} />

      <section className="rh pf-rh">
        <div className="container rh__inner">
          <div className="pf-me">
            <span className="pf-me__avatar">{initials(user.name)}</span>
            <span className="pf-me__text">
              <h1>{displayName(user.name)}</h1>
              <small>
                {user.phone}
                {user.age ? ` · ${user.age} нас` : ''}
              </small>
            </span>
            <Pressable className="pf-me__edit" onClick={() => setSheet('edit')} aria-label="Засах">
              <PencilSimple size={18} weight="bold" aria-hidden />
            </Pressable>
          </div>
          <div className="pf-chips">
            <span>
              <Translate size={14} weight="bold" aria-hidden /> Герман: {level}
            </span>
            {user.inProgram ? (
              <span>
                <SealCheck size={14} weight="fill" aria-hidden /> Au Pair хөтөлбөрт
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <div className="container">
        <div className="pf-stats">
          {[
            ['Элсэлт', enrollments.length],
            ['Захиалга', orders.length],
            ['Хүсэлт', contacts.length],
          ].map(([label, n]) => (
            <div key={label}>
              <strong>{data ? n : '–'}</strong>
              <small>{label}</small>
            </div>
          ))}
        </div>

        {error && <div className="alert alert-err pf-gap">{error}</div>}

        {data ? (
          <Reveal>
            <GlassCard as={Link} to={next.to} tone="ink" className="pf-next">
              <span className="pf-next__top">
                <span className={`pf-next__dot pf-next__dot--${next.tone}`} aria-hidden />
                {next.kicker}
              </span>
              <strong>{next.title}</strong>
              {next.sub ? <small>{next.sub}</small> : null}
              {user.inProgram ? (
                <div className="pf-next__timeline">
                  <JourneyTimeline user={user} mode="program" compact />
                </div>
              ) : null}
              <span className="pf-next__cta">
                {next.cta} <ArrowRight size={15} weight="bold" aria-hidden />
              </span>
            </GlassCard>
          </Reveal>
        ) : null}

        <section className="pf-group">
          <h3>Миний элсэлт</h3>
          {!data ? (
            <div className="pf-enroll pf-skeleton" aria-label="Ачаалж байна">
              <div className="skeleton" style={{ height: 16, width: '60%' }} />
              <div className="skeleton" style={{ height: 12, width: '100%' }} />
              <div className="skeleton" style={{ height: 12, width: '40%' }} />
            </div>
          ) : enrollments.length === 0 ? (
            <div className="pf-empty">
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
            <div className="pf-list">
              {enrollments.map((item, i) => (
                <EnrollmentCard key={item.id} item={item} i={i} />
              ))}
            </div>
          )}
        </section>

        {orders.length > 0 && (
          <Group title="Миний захиалга">
            {orders.map((order) => (
              <div key={order.id} className="pf-row pf-row--static">
                <span className="pf-row__icon pf-row__icon--ink">
                  <Package size={17} weight="fill" aria-hidden />
                </span>
                <span className="pf-row__label">
                  {(order.items || []).map((i) => i.name).join(', ')}
                  <small>{formatDate(order.createdAt)}</small>
                </span>
                <span className={`pf-status pf-status--${order.status}`}>
                  {STATUS_LABELS.orders[order.status] || order.status}
                </span>
              </div>
            ))}
          </Group>
        )}

        {contacts.length > 0 && (
          <Group title="Миний хүсэлт">
            {contacts.map((c) => (
              <div key={c.id} className="pf-row pf-row--static">
                <span className="pf-row__icon pf-row__icon--red">
                  <ChatsCircle size={17} weight="fill" aria-hidden />
                </span>
                <span className="pf-row__label">
                  {INTEREST_LABELS[c.interest] || c.interest}
                  <small>{formatDate(c.createdAt)}</small>
                </span>
                <span className={`pf-status pf-status--${c.status}`}>
                  {STATUS_LABELS.contacts[c.status] || c.status}
                </span>
              </div>
            ))}
          </Group>
        )}

        <Group title="Бүртгэл">
          <Row icon={UserCircle} tone="red" label="Хувийн мэдээлэл" onClick={() => setSheet('edit')} />
          <Row icon={LockKey} tone="ink" label="Нууц үг солих" onClick={() => setSheet('password')} />
          {user.inProgram ? (
            <Row icon={ListChecks} tone="green" label="Миний аялал · checklist" to="/me/program" />
          ) : null}
        </Group>

        <section className="pf-group">
          <h3>Байгууллага</h3>
          <AgencyCard compact />
        </section>

        <Group title="Тусламж">
          <HelpRows />
        </Group>

        <Group>
          <Row icon={SignOut} tone="grey" label="Гарах" onClick={onLogout} danger />
        </Group>

        <p className="pf-version">Mongolian Au Pair · {org.since} оноос</p>
      </div>

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

  return <div className="profile-page pf">{user ? <Dashboard /> : <LoggedOut />}</div>
}

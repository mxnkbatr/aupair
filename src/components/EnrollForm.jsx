import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowRight,
  ArrowsClockwise,
  CalendarBlank,
  CaretDown,
  Check,
  CheckCircle,
  Copy,
  DeviceMobile,
  LinkSimple,
  LockSimple,
  Phone,
  QrCode,
  SealCheck,
} from '@phosphor-icons/react'
import { api } from '../api'
import { useAuth } from '../auth'
import { GERMAN_LEVEL_LABELS, formatMnt, social } from '../data'
import { celebrate } from '../confetti'
import { haptic } from '../native'
import { Stepper } from './glass/Glass'
import './EnrollForm.css'
import './Checkout.css'

const STEPS = ['Мэдээлэл', 'Төлбөр', 'Баталгаа']
const POLL_MS = 4000

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

const digits = (v) => String(v || '').replace(/\D/g, '')

function validate(form) {
  const errs = {}
  if (form.name.trim().length < 2) errs.name = 'Нэрээ бүтэн бичнэ үү'
  if (digits(form.phone).length !== 8) errs.phone = '8 оронтой утасны дугаар'
  const age = Number(form.age)
  if (!Number.isInteger(age) || age < 16 || age > 45) errs.age = '16–45 нас'
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Имэйл буруу байна'
  return errs
}

function isTouchDevice() {
  return typeof window !== 'undefined' && window.matchMedia?.('(hover: none)').matches
}

function useCopy() {
  const [copied, setCopied] = useState(false)
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(String(text))
      setCopied(true)
      haptic('light')
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard blocked */
    }
  }
  return [copied, copy]
}

/* ------------------------------------------------------------------ */

function OrderCard({ course }) {
  const level = String(course.level || course.hsk || '').replace(/^DE\s*/i, '')
  return (
    <div className="ck-order">
      {course.image ? (
        <img
          className="ck-order__img"
          src={course.image}
          alt=""
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/cover.jpg'
          }}
        />
      ) : (
        <span className="ck-order__img ck-order__img--blank">
          <SealCheck size={22} weight="fill" aria-hidden />
        </span>
      )}
      <span className="ck-order__text">
        <strong>{course.title}</strong>
        <small>
          {course.schedule ? (
            <>
              <CalendarBlank size={13} weight="bold" aria-hidden /> {course.schedule}
            </>
          ) : (
            course.duration || course.subtitle || ''
          )}
        </small>
      </span>
      {level ? <span className="ck-order__level">{level}</span> : null}
    </div>
  )
}

function Field({ label, error, valid, children }) {
  return (
    <label className={`ck-field${error ? ' has-error' : ''}${valid ? ' is-valid' : ''}`}>
      <span className="ck-field__label">{label}</span>
      <span className="ck-field__control">
        {children}
        {valid ? (
          <span className="ck-field__ok" aria-hidden>
            <Check size={12} weight="bold" />
          </span>
        ) : null}
      </span>
      {error ? <span className="ck-field__err">{error}</span> : null}
    </label>
  )
}

/* ------------------------------------------------------------------ */

function InfoStep({ course, user, onDone }) {
  const [form, setForm] = useState(() => initialForm(user))
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [more, setMore] = useState(false)

  const hasSeats = typeof course.seatsLeft === 'number'
  const full = hasSeats && course.seatsLeft <= 0
  const priceLabel = course.priceLabel || (course.priceMnt ? formatMnt(course.priceMnt) : '')
  const paid = Boolean(course.priceMnt)
  const confirmMode = Boolean(user?.name && user?.phone && Number(user?.age))
  const errs = useMemo(() => validate(form), [form])
  const valid = Object.keys(errs).length === 0
  const show = (k) => (touched[k] ? errs[k] : '')

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }))

  async function submit(e) {
    e.preventDefault()
    if (!valid) {
      setTouched({ name: true, phone: true, age: true, email: true })
      haptic('error')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await api.enroll({ ...form, phone: digits(form.phone), courseId: course.id })
      haptic('success')
      onDone(res, form)
    } catch (err) {
      setError(err.message)
      haptic('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="ck-step" onSubmit={submit} noValidate>
      <OrderCard course={course} />

      {hasSeats && !full && course.seatsLeft <= 10 ? (
        <p className="ck-urgent">
          <i aria-hidden /> Зөвхөн {course.seatsLeft} суудал үлдлээ
        </p>
      ) : null}

      <section className="ck-card">
        <h4>Таны мэдээлэл</h4>
        {confirmMode ? (
          <div className="ck-me">
            <span className="ck-me__avatar">{String(user.name).trim()[0]}</span>
            <span className="ck-me__text">
              <strong>{user.name}</strong>
              <small>
                {user.phone} · {user.age} нас
              </small>
            </span>
            <SealCheck size={20} weight="fill" className="ck-me__ok" aria-hidden />
          </div>
        ) : (
          <div className="ck-fields">
            <Field label="Овог нэр" error={show('name')} valid={!errs.name && form.name}>
              <input
                value={form.name}
                onChange={set('name')}
                onBlur={blur('name')}
                placeholder="Бат-Эрдэнэ Сараа"
                autoComplete="name"
              />
            </Field>
            <div className="ck-row">
              <Field label="Утас" error={show('phone')} valid={!errs.phone}>
                <span className="ck-prefix">+976</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: digits(e.target.value).slice(0, 8) }))}
                  onBlur={blur('phone')}
                  placeholder="8811 2233"
                  autoComplete="tel-national"
                />
              </Field>
              <Field label="Нас" error={show('age')} valid={!errs.age}>
                <input
                  type="number"
                  inputMode="numeric"
                  min="16"
                  max="45"
                  value={form.age}
                  onChange={set('age')}
                  onBlur={blur('age')}
                  placeholder="20"
                />
              </Field>
            </div>
          </div>
        )}

        <button type="button" className="ck-more" onClick={() => setMore((v) => !v)} aria-expanded={more}>
          Нэмэлт мэдээлэл (заавал биш)
          <CaretDown size={14} weight="bold" className={more ? 'is-open' : ''} aria-hidden />
        </button>
        <AnimatePresence initial={false}>
          {more ? (
            <motion.div
              className="ck-fields ck-fields--more"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              {!confirmMode ? (
                <>
                  <Field label="Герман хэлний түвшин">
                    <select value={form.germanLevel} onChange={set('germanLevel')}>
                      {Object.entries(GERMAN_LEVEL_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Имэйл" error={show('email')}>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      onBlur={blur('email')}
                      placeholder="name@mail.com"
                      autoComplete="email"
                    />
                  </Field>
                </>
              ) : null}
              <Field label="Тэмдэглэл">
                <textarea rows={2} value={form.note} onChange={set('note')} placeholder="Асуух зүйл, тохиромжтой цаг…" />
              </Field>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      {paid ? (
        <section className="ck-card ck-bill">
          <div>
            <span>Сургалтын төлбөр</span>
            <span>{priceLabel}</span>
          </div>
          <div>
            <span>Шимтгэл</span>
            <span>₮0</span>
          </div>
          <div className="ck-bill__total">
            <span>Нийт</span>
            <strong>{priceLabel}</strong>
          </div>
        </section>
      ) : null}

      <ul className="ck-trust">
        <li>
          <LockSimple size={14} weight="fill" aria-hidden /> QPay · аюулгүй төлбөр
        </li>
        <li>
          <SealCheck size={14} weight="fill" aria-hidden /> Суудал автоматаар
        </li>
      </ul>

      {error ? <div className="alert alert-err">{error}</div> : null}

      <div className="ck-dock">
        {paid ? (
          <span className="ck-dock__sum">
            <small>Нийт</small>
            <strong>{priceLabel}</strong>
          </span>
        ) : null}
        <button type="submit" className="ck-pay" disabled={loading || full}>
          {full ? (
            'Суудал дууссан'
          ) : loading ? (
            <>
              <span className="ck-spin" aria-hidden /> Бэлдэж байна…
            </>
          ) : paid ? (
            <>
              QPay-аар төлөх <ArrowRight size={16} weight="bold" aria-hidden />
            </>
          ) : (
            <>
              Хүсэлт илгээх <ArrowRight size={16} weight="bold" aria-hidden />
            </>
          )}
        </button>
      </div>
    </form>
  )
}

/* ------------------------------------------------------------------ */

function PayStep({ done, phone, onUpdate }) {
  const payment = done.payment
  const enrollmentId = done.enrollment?.id
  const touch = isTouchDevice()
  const banks = Array.isArray(payment?.urls) ? payment.urls : []
  const [showQr, setShowQr] = useState(!touch || banks.length === 0)
  const [checking, setChecking] = useState(false)
  const [msg, setMsg] = useState('')
  const [copied, copy] = useCopy()

  const qrSrc = payment?.qrImage
    ? payment.qrImage.startsWith('data:')
      ? payment.qrImage
      : `data:image/png;base64,${payment.qrImage}`
    : null

  async function check(silent) {
    if (!enrollmentId) return
    if (!silent) {
      setChecking(true)
      setMsg('')
    }
    try {
      const res = await api.checkEnrollmentPayment(enrollmentId, { phone })
      onUpdate(res)
      if (res.paid) {
        haptic('success')
        celebrate()
      } else if (!silent) {
        setMsg('Төлбөр хараахан ороогүй байна. Төлсний дараа хэдэн секунд хүлээнэ үү.')
        haptic('selection')
      }
    } catch (e) {
      if (!silent) {
        setMsg(e.message)
        haptic('error')
      }
    } finally {
      if (!silent) setChecking(false)
    }
  }

  useEffect(() => {
    if (!enrollmentId) return undefined
    const id = setInterval(() => check(true), POLL_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentId, phone])

  return (
    <div className="ck-step">
      <section className="ck-amount">
        <span className="ck-live">
          <i aria-hidden /> Төлбөр хүлээж байна
        </span>
        <strong>{formatMnt(payment.amount)}</strong>
        <small>{done.courseTitle}</small>
      </section>

      {banks.length > 0 ? (
        <section className="ck-card">
          <h4>
            <DeviceMobile size={16} weight="fill" aria-hidden /> Банкны аппаар төлөх
          </h4>
          <p className="ck-hint">Аппаа сонгоход төлбөр бэлэн болж нээгдэнэ</p>
          <div className="ck-banks">
            {banks.slice(0, 12).map((bank, i) => (
              <a key={`${bank.name || "bank"}-${i}`} href={bank.link} target="_blank" rel="noreferrer" onClick={() => haptic('light')}>
                {bank.logo ? <img src={bank.logo} alt="" loading="lazy" /> : <span>{(bank.name || 'Б')[0]}</span>}
                <small>{bank.description || bank.name || 'Банк'}</small>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="ck-card">
        <button
          type="button"
          className="ck-qr-toggle"
          onClick={() => setShowQr((v) => !v)}
          aria-expanded={showQr}
        >
          <QrCode size={18} weight="bold" aria-hidden />
          <span>
            <strong>QR код уншуулах</strong>
            <small>Өөр утас эсвэл компьютерээс</small>
          </span>
          <CaretDown size={14} weight="bold" className={showQr ? 'is-open' : ''} aria-hidden />
        </button>
        <AnimatePresence initial={false}>
          {showQr ? (
            <motion.div
              className="ck-qr"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.24 }}
            >
              {qrSrc ? (
                <span className="ck-qr__frame">
                  <img src={qrSrc} alt="QPay QR" />
                  <i className="ck-qr__scan" aria-hidden />
                </span>
              ) : (
                <p className="ck-hint">QR үүсээгүй — банкны апп эсвэл холбоос ашиглана уу.</p>
              )}
              {payment.shortUrl ? (
                <a className="ck-link" href={payment.shortUrl} target="_blank" rel="noreferrer">
                  <LinkSimple size={15} weight="bold" aria-hidden /> QPay холбоос нээх
                </a>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      <section className="ck-card ck-ref">
        <span>
          <small>Захиалгын код</small>
          <strong>{enrollmentId}</strong>
        </span>
        <button type="button" onClick={() => copy(enrollmentId)} aria-label="Хуулах">
          {copied ? <Check size={16} weight="bold" aria-hidden /> : <Copy size={16} weight="bold" aria-hidden />}
          {copied ? 'Хуулсан' : 'Хуулах'}
        </button>
      </section>

      {msg ? <p className="ck-msg">{msg}</p> : null}

      <div className="ck-dock">
        <button type="button" className="ck-pay ck-pay--ghost" disabled={checking} onClick={() => check(false)}>
          {checking ? (
            <>
              <span className="ck-spin ck-spin--dark" aria-hidden /> Шалгаж байна…
            </>
          ) : (
            <>
              <ArrowsClockwise size={16} weight="bold" aria-hidden /> Төлсөн · шалгах
            </>
          )}
        </button>
      </div>
      <p className="ck-foot">
        Төлбөр ормогц автоматаар шалгаж суудлыг бүртгэнэ · Асуудал гарвал{' '}
        <a href={`tel:${social.phoneTel}`}>{social.phone}</a>
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function DoneStep({ done, user, paid }) {
  const [copied, copy] = useCopy()
  const when = new Date().toLocaleString('mn-MN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  return (
    <div className="ck-step ck-done">
      <motion.span
        className="ck-done__check"
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 18 }}
      >
        <CheckCircle size={44} weight="fill" aria-hidden />
      </motion.span>
      <h3>{paid ? 'Суудал баталгаажлаа!' : 'Хүсэлт илгээгдлээ'}</h3>
      <p>{paid ? 'Төлбөр амжилттай. Хуваарь, ангийн чат нээгдлээ.' : 'Бид ажлын 1–2 өдөрт тантай холбогдоно.'}</p>

      <section className="ck-card ck-receipt">
        <div>
          <span>Хөтөлбөр</span>
          <strong>{done.courseTitle}</strong>
        </div>
        {paid && done.payment?.amount ? (
          <div>
            <span>Төлсөн</span>
            <strong>{formatMnt(done.payment.amount)}</strong>
          </div>
        ) : null}
        {paid ? (
          <div>
            <span>Төлбөрийн хэрэгсэл</span>
            <strong>QPay</strong>
          </div>
        ) : null}
        <div>
          <span>Огноо</span>
          <strong>{when}</strong>
        </div>
        <div>
          <span>Код</span>
          <button type="button" className="ck-receipt__code" onClick={() => copy(done.enrollment?.id)}>
            {done.enrollment?.id}
            {copied ? <Check size={13} weight="bold" aria-hidden /> : <Copy size={13} weight="bold" aria-hidden />}
          </button>
        </div>
      </section>

      <div className="ck-done__actions">
        {user ? (
          <Link to={paid ? '/learn' : '/me'} className="ck-pay">
            {paid ? 'Миний анги руу' : 'Явцаа харах'} <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
        ) : (
          <Link to="/me" state={{ auth: 'register' }} className="ck-pay">
            Профайл үүсгээд хянах <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
        )}
        <a href={`tel:${social.phoneTel}`} className="ck-pay ck-pay--ghost">
          <Phone size={16} weight="fill" aria-hidden /> {social.phone}
        </a>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export default function EnrollForm({ course, onSuccess, steps = STEPS }) {
  const { user } = useAuth()
  const [done, setDone] = useState(null)
  const [phone, setPhone] = useState(user?.phone || '')

  const paidStatus =
    done &&
    (done.paid || done.enrollment?.status === 'accepted' || done.enrollment?.status === 'paid')
  const needsPay = Boolean(done?.payment) && !paidStatus
  const step = !done ? 0 : needsPay ? 1 : 2

  return (
    <div className="ck">
      <Stepper steps={steps} current={step === 2 ? 3 : step} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 0 ? (
            <InfoStep
              course={course}
              user={user}
              onDone={(res, form) => {
                setPhone(digits(form.phone))
                setDone({ ...res, courseTitle: course.title })
                if (!res.payment) celebrate()
                onSuccess?.(res)
              }}
            />
          ) : step === 1 ? (
            <PayStep
              done={done}
              phone={phone}
              onUpdate={(res) => {
                setDone((prev) => ({
                  ...prev,
                  ...res,
                  courseTitle: prev.courseTitle,
                  enrollment: { ...(prev.enrollment || {}), ...(res.enrollment || {}) },
                  payment: res.payment || prev.payment,
                }))
                onSuccess?.(res)
              }}
            />
          ) : (
            <DoneStep done={done} user={user} paid={Boolean(done?.payment) || paidStatus} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

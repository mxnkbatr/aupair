import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CaretLeft, Eye, EyeSlash, MessengerLogo, Phone, X } from '@phosphor-icons/react'
import { useAuth } from '../auth'
import { GERMAN_LEVEL_LABELS, social } from '../data'
import { celebrate } from '../confetti'
import { haptic } from '../native'
import './AuthModal.css'

const REG_STEPS = [
  { id: 'name', title: 'Нэр чинь хэн бэ?', sub: 'Бүртгэлд харагдах овог нэр' },
  { id: 'phone', title: 'Утасны дугаар', sub: 'Нэвтрэх болон бидэнтэй холбогдоход ашиглана' },
  { id: 'password', title: 'Нууц үг тохируул', sub: 'Хамгийн багадаа 6 тэмдэгт' },
  { id: 'about', title: 'Бараг боллоо!', sub: 'Нас болон герман хэлний түвшин' },
]

/** Local 8-digit Mongolian number from whatever the user typed/pasted. */
function localDigits(value) {
  let digits = String(value).replace(/\D/g, '')
  if (digits.startsWith('976') && digits.length > 8) digits = digits.slice(3)
  return digits.slice(0, 8)
}

const toPhone = (digits) => `+976 ${digits}`

function PhoneField({ value, onChange, autoFocus }) {
  return (
    <label className="field auth__field">
      <span>Утасны дугаар</span>
      <div className="auth__phone">
        <b>+976</b>
        <input
          required
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(localDigits(e.target.value))}
          placeholder="8811 2233"
          maxLength={8}
        />
      </div>
    </label>
  )
}

function PasswordField({ value, onChange, label = 'Нууц үг', autoComplete, autoFocus, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <label className="field auth__field">
      <span>{label}</span>
      <div className="auth__password">
        <input
          required
          type={show ? 'text' : 'password'}
          minLength={6}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="auth__eye"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Нууц үг нуух' : 'Нууц үг харах'}
        >
          {show ? <EyeSlash size={22} /> : <Eye size={22} />}
        </button>
      </div>
    </label>
  )
}

/**
 * Fullscreen auth: login form + 4-step register wizard.
 * Props: { open, mode: 'login' | 'register', onClose, onSuccess }
 */
export default function AuthModal({ open, mode: initialMode = 'login', onClose, onSuccess }) {
  const { login, register } = useAuth()
  const reduce = useReducedMotion()
  const [mode, setMode] = useState(initialMode)
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [showForgot, setShowForgot] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    age: '',
    germanLevel: 'none',
  })
  const bodyRef = useRef(null)

  // Reset to the requested mode the moment the modal opens (during render, so there is no flash).
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setMode(initialMode)
      setStep(0)
      setError('')
      setShowForgot(false)
    }
  }

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }))

  function switchMode(next) {
    haptic('selection')
    setMode(next)
    setStep(0)
    setError('')
    setShowForgot(false)
  }

  async function submitLogin(e) {
    e.preventDefault()
    if (form.phone.length < 8) {
      setError('Утасны дугаараа 8 оронтой оруулна уу')
      haptic('error')
      return
    }
    setError('')
    setLoading(true)
    try {
      await login({ phone: toPhone(form.phone), password: form.password })
      haptic('success')
      onSuccess?.()
      onClose?.()
    } catch (err) {
      setError(err.message)
      haptic('error')
    } finally {
      setLoading(false)
    }
  }

  function validateStep() {
    const id = REG_STEPS[step].id
    if (id === 'name' && form.name.trim().length < 2) return 'Нэрээ оруулна уу'
    if (id === 'phone' && form.phone.length < 8) return 'Утасны дугаараа 8 оронтой оруулна уу'
    if (id === 'password' && form.password.length < 6) return 'Нууц үг хамгийн багадаа 6 тэмдэгт'
    if (id === 'about') {
      const age = Number.parseInt(form.age, 10)
      if (!Number.isInteger(age) || age < 16 || age > 45) return 'Насаа зөв оруулна уу (16–45)'
    }
    return ''
  }

  async function submitRegister(e) {
    e.preventDefault()
    const problem = validateStep()
    if (problem) {
      setError(problem)
      haptic('error')
      return
    }
    setError('')
    if (step < REG_STEPS.length - 1) {
      haptic('selection')
      setDir(1)
      setStep(step + 1)
      return
    }
    setLoading(true)
    try {
      await register({
        name: form.name.trim(),
        phone: toPhone(form.phone),
        password: form.password,
        age: form.age,
        germanLevel: form.germanLevel,
      })
      haptic('success')
      celebrate({ big: true })
      onSuccess?.()
      onClose?.()
    } catch (err) {
      setError(err.message)
      haptic('error')
      // Phone already taken etc. — send them back to the relevant step.
      if (/утас/i.test(err.message)) {
        setDir(-1)
        setStep(1)
      }
    } finally {
      setLoading(false)
    }
  }

  function back() {
    haptic('light')
    setError('')
    if (mode === 'register' && step > 0) {
      setDir(-1)
      setStep(step - 1)
    } else {
      onClose?.()
    }
  }

  const stepMotion = reduce
    ? {}
    : {
        initial: { opacity: 0, x: dir * 36 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: dir * -36 },
        transition: { type: 'spring', stiffness: 420, damping: 38 },
      }

  const regStep = REG_STEPS[step]

  const content = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="auth"
          role="dialog"
          aria-modal="true"
          aria-label={mode === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
          initial={reduce ? false : { y: '100%' }}
          animate={{ y: 0 }}
          exit={reduce ? { opacity: 0 } : { y: '100%' }}
          transition={{ type: 'spring', stiffness: 360, damping: 38 }}
        >
          <div className="auth__top">
            <button type="button" className="auth__icon" onClick={back} aria-label="Буцах">
              {mode === 'register' && step > 0 ? <CaretLeft weight="bold" size={22} /> : <X weight="bold" size={22} />}
            </button>
            {mode === 'register' ? (
              <div className="auth__dots" aria-label={`Алхам ${step + 1} / ${REG_STEPS.length}`}>
                {REG_STEPS.map((s, i) => (
                  <i key={s.id} className={i < step ? 'is-done' : i === step ? 'is-now' : ''} />
                ))}
              </div>
            ) : (
              <span />
            )}
            <span className="auth__icon" aria-hidden />
          </div>

          <div className="auth__body" ref={bodyRef}>
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              {mode === 'login' ? (
                <motion.form
                  key="login"
                  className="auth__form"
                  onSubmit={submitLogin}
                  {...stepMotion}
                >
                  <img className="auth__logo" src="/logo.png" alt="" />
                  <h1>Тавтай морил!</h1>
                  <p className="auth__sub">Утас, нууц үгээрээ нэвтэрч Au Pair аяллаа үргэлжлүүл.</p>

                  <PhoneField value={form.phone} onChange={set('phone')} />
                  <PasswordField
                    value={form.password}
                    onChange={set('password')}
                    autoComplete="current-password"
                  />

                  {error && <div className="alert alert-err">{error}</div>}

                  <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? 'Түр хүлээнэ үү...' : 'Нэвтрэх'}
                  </button>

                  <button
                    type="button"
                    className="auth__link"
                    onClick={() => setShowForgot((s) => !s)}
                  >
                    Нууц үгээ мартсан уу?
                  </button>
                  {showForgot && (
                    <div className="auth__forgot">
                      <p>Нууц үгийг бид шууд сэргээж өгнө. Холбогдоорой:</p>
                      <a className="btn btn-ghost btn-block" href={`tel:${social.phoneTel}`}>
                        <Phone weight="fill" size={18} /> {social.phone}
                      </a>
                      <a
                        className="btn btn-ghost btn-block"
                        href={social.messenger}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessengerLogo weight="fill" size={18} /> Messenger
                      </a>
                    </div>
                  )}

                  <p className="auth__switch">
                    Шинэ хэрэглэгч үү?{' '}
                    <button type="button" onClick={() => switchMode('register')}>
                      Бүртгүүлэх
                    </button>
                  </p>
                </motion.form>
              ) : (
                <motion.form
                  key={`reg-${step}`}
                  className="auth__form"
                  onSubmit={submitRegister}
                  {...stepMotion}
                >
                  <span className="auth__step">
                    Алхам {step + 1} / {REG_STEPS.length}
                  </span>
                  <h1>{regStep.title}</h1>
                  <p className="auth__sub">{regStep.sub}</p>

                  {regStep.id === 'name' && (
                    <label className="field auth__field">
                      <span>Овог нэр</span>
                      <input
                        required
                        autoFocus
                        value={form.name}
                        onChange={(e) => set('name')(e.target.value)}
                        placeholder="Таны нэр"
                        autoComplete="name"
                      />
                    </label>
                  )}

                  {regStep.id === 'phone' && (
                    <PhoneField value={form.phone} onChange={set('phone')} autoFocus />
                  )}

                  {regStep.id === 'password' && (
                    <PasswordField
                      value={form.password}
                      onChange={set('password')}
                      autoComplete="new-password"
                      autoFocus
                      placeholder="Хамгийн багадаа 6 тэмдэгт"
                    />
                  )}

                  {regStep.id === 'about' && (
                    <>
                      <label className="field auth__field">
                        <span>Нас</span>
                        <input
                          required
                          autoFocus
                          type="number"
                          inputMode="numeric"
                          min="16"
                          max="45"
                          value={form.age}
                          onChange={(e) => set('age')(e.target.value)}
                          placeholder="20"
                        />
                      </label>
                      <div className="auth__chips" role="radiogroup" aria-label="Герман хэлний түвшин">
                        {Object.entries(GERMAN_LEVEL_LABELS).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={form.germanLevel === value}
                            className={`chip${form.germanLevel === value ? ' is-active' : ''}`}
                            onClick={() => set('germanLevel')(value)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {error && <div className="alert alert-err">{error}</div>}

                  <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading
                      ? 'Түр хүлээнэ үү...'
                      : step < REG_STEPS.length - 1
                        ? 'Үргэлжлүүлэх'
                        : 'Бүртгэл үүсгэх'}
                  </button>

                  {step === 0 && (
                    <p className="auth__switch">
                      Бүртгэлтэй юу?{' '}
                      <button type="button" onClick={() => switchMode('login')}>
                        Нэвтрэх
                      </button>
                    </p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}

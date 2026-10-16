import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  AirplaneTilt,
  CaretLeft,
  CheckCircle,
  HandsClapping,
  Heart,
  House,
  PiggyBank,
  Translate,
} from '@phosphor-icons/react'
import { countries, GERMAN_LEVEL_LABELS, org, social } from '../data'
import { celebrate } from '../confetti'
import { haptic, isNative } from '../native'
import './Onboarding.css'

const DONE_STORAGE = 'aupair-onboarded'
const PREFS_STORAGE = 'aupair-prefs'

const GOALS = [
  { id: 'language', icon: Translate, title: 'Герман хэл', text: 'A1 · A2 түвшин' },
  { id: 'culture', icon: AirplaneTilt, title: 'Европт амьдрах', text: 'Шинэ соёл, найзууд' },
  { id: 'kids', icon: Heart, title: 'Хүүхэдтэй ажиллах', text: 'Гэр бүлд дэмжлэг' },
  { id: 'savings', icon: PiggyBank, title: 'Туршлага + мөнгө', text: 'Хоол, байр орно' },
]

const INTRO = [
  {
    id: 'welcome',
    image: '/cover.jpg',
    icon: House,
    kicker: `${org.since} оноос · IAPA`,
    title: 'Европ руу хаалга',
    text: 'Албан ёсны Au Pair хөтөлбөр. Хэл сурч, гэр бүлд амьдарч, туршлага хуримтлуулна.',
  },
  {
    id: 'trust',
    image: countries.find((c) => c.id === 'germany')?.image || '/cover.jpg',
    icon: HandsClapping,
    kicker: `${social.placed}+ оролцогч`,
    title: 'Найдвартай замнал',
    text: `${social.years} жилийн туршлага. Виза, гэр бүл, хэлний бэлтгэлийг нэг дороос.`,
  },
]

const STEP_COUNT = 4 // intro0, intro1, goal, ready (level folded into goal flow → actually: welcome, trust, goal, prefs+ready)

function shouldShow() {
  try {
    if (localStorage.getItem(DONE_STORAGE)) return false
  } catch {
    return false
  }
  return isNative || window.matchMedia('(max-width: 899px)').matches
}

export default function Onboarding() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(() => pathname !== '/admin' && shouldShow())
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [prefs, setPrefs] = useState({ goal: '', level: 'none', countries: [] })
  const celebrated = useRef(false)
  const touch = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (open && step === STEP_COUNT - 1 && !celebrated.current) {
      celebrated.current = true
      haptic('success')
      celebrate({ big: true })
    }
  }, [open, step])

  if (!open) return null

  function go(next) {
    const clamped = Math.max(0, Math.min(STEP_COUNT - 1, next))
    if (clamped === step) return
    haptic('selection')
    setDir(clamped > step ? 1 : -1)
    setStep(clamped)
  }

  function finish(to, state) {
    try {
      localStorage.setItem(DONE_STORAGE, '1')
      localStorage.setItem(PREFS_STORAGE, JSON.stringify({ ...prefs, savedAt: Date.now() }))
    } catch {
      // storage unavailable
    }
    haptic('light')
    setOpen(false)
    if (to) navigate(to, state ? { state } : undefined)
  }

  function toggleCountry(id) {
    haptic('selection')
    setPrefs((p) => ({
      ...p,
      countries: p.countries.includes(id) ? p.countries.filter((c) => c !== id) : [...p.countries, id],
    }))
  }

  function onTouchStart(e) {
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    touch.current = { x: t.clientX, y: t.clientY, t: Date.now() }
  }

  function onTouchEnd(e) {
    const g = touch.current
    touch.current = null
    if (!g || step >= 2) return // only swipe on intro pages
    const t = e.changedTouches[0]
    const dx = t.clientX - g.x
    const dy = t.clientY - g.y
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.2) return
    if (Date.now() - g.t > 600) return
    if (dx < 0) go(step + 1)
    else go(step - 1)
  }

  const slide = reduce
    ? {}
    : {
        initial: { opacity: 0, x: dir * 48 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: dir * -36 },
        transition: { type: 'spring', stiffness: 420, damping: 36, mass: 0.85 },
      }

  const goalLabel = GOALS.find((g) => g.id === prefs.goal)?.title
  const last = step === STEP_COUNT - 1
  const intro = INTRO[step]

  return (
    <div className="onb" role="dialog" aria-modal="true" aria-label="Танилцуулга">
      <header className="onb__chrome">
        {step > 0 && !last ? (
          <button type="button" className="onb__icon-btn" onClick={() => go(step - 1)} aria-label="Буцах">
            <CaretLeft weight="bold" size={22} />
          </button>
        ) : (
          <span className="onb__icon-btn" aria-hidden />
        )}
        <div className="onb__dots" aria-hidden>
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <i key={i} className={i === step ? 'is-now' : i < step ? 'is-done' : ''} />
          ))}
        </div>
        {!last ? (
          <button type="button" className="onb__skip" onClick={() => finish()}>
            Алгасах
          </button>
        ) : (
          <span className="onb__skip" aria-hidden />
        )}
      </header>

      <div className="onb__stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          {step < 2 && intro ? (
            <motion.section key={intro.id} className="onb__page onb__page--hero" {...slide}>
              <div className="onb__hero">
                <img src={intro.image} alt="" draggable={false} />
                <span className="onb__hero-shade" aria-hidden />
                <span className="onb__hero-badge">
                  <intro.icon weight="fill" size={22} aria-hidden />
                </span>
              </div>
              <div className="onb__copy">
                <span className="onb__kicker">{intro.kicker}</span>
                <h1>{intro.title}</h1>
                <p>{intro.text}</p>
              </div>
            </motion.section>
          ) : null}

          {step === 2 ? (
            <motion.section key="goal" className="onb__page" {...slide}>
              <div className="onb__copy onb__copy--plain">
                <span className="onb__kicker">Хувийн тохиргоо</span>
                <h1>Чиний зорилго?</h1>
                <p>Дараа нь танд тохирсон зүйлийг түрүүнд харуулъя.</p>
              </div>
              <div className="onb__goals" role="radiogroup" aria-label="Зорилго">
                {GOALS.map(({ id, icon: Icon, title, text }) => {
                  const active = prefs.goal === id
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className={`onb__goal${active ? ' is-active' : ''}`}
                      onClick={() => {
                        haptic('selection')
                        setPrefs((p) => ({ ...p, goal: id }))
                      }}
                    >
                      <span className="onb__goal-icon">
                        <Icon weight="duotone" size={26} aria-hidden />
                      </span>
                      <span className="onb__goal-text">
                        <strong>{title}</strong>
                        <small>{text}</small>
                      </span>
                      {active ? <CheckCircle weight="fill" size={24} className="onb__goal-check" aria-hidden /> : null}
                    </button>
                  )
                })}
              </div>
            </motion.section>
          ) : null}

          {step === 3 ? (
            <motion.section key="ready" className="onb__page" {...slide}>
              <div className="onb__copy onb__copy--plain">
                <span className="onb__kicker">Сүүлийн алхам</span>
                <h1>Түвшин · улс</h1>
                <p>
                  {goalLabel ? `Зорилго: ${goalLabel}. ` : ''}
                  Одоогийн герман хэл болон сонирхсон улсаа сонго.
                </p>
              </div>

              <h3 className="onb__section-label">Герман хэл</h3>
              <div className="onb__chips" role="radiogroup" aria-label="Түвшин">
                {Object.entries(GERMAN_LEVEL_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={prefs.level === value}
                    className={`onb__chip${prefs.level === value ? ' is-active' : ''}`}
                    onClick={() => {
                      haptic('selection')
                      setPrefs((p) => ({ ...p, level: value }))
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <h3 className="onb__section-label">Сонирхсон улс</h3>
              <div className="onb__chips">
                {countries.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={prefs.countries.includes(c.id)}
                    className={`onb__chip${prefs.countries.includes(c.id) ? ' is-active' : ''}`}
                    onClick={() => toggleCountry(c.id)}
                  >
                    {c.nameMn}
                  </button>
                ))}
              </div>

              <div className="onb__ready-card">
                <img src="/logo.png" alt="" width={48} height={48} />
                <div>
                  <strong>Бэлэн боллоо</strong>
                  <span>Бүртгүүлээд явцаа утаснаасаа хянаарай</span>
                </div>
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>

      <footer className="onb__footer">
        {last ? (
          <>
            <button
              type="button"
              className="onb__cta"
              onClick={() => finish('/me', { auth: 'register' })}
            >
              Бүртгүүлэх
            </button>
            <button type="button" className="onb__cta onb__cta--ghost" onClick={() => finish()}>
              Эхлээд үзэх
            </button>
          </>
        ) : (
          <button
            type="button"
            className="onb__cta"
            disabled={step === 2 && !prefs.goal}
            onClick={() => go(step + 1)}
          >
            {step === 0 ? 'Эхэлцгээе' : 'Үргэлжлүүлэх'}
          </button>
        )}
      </footer>
    </div>
  )
}

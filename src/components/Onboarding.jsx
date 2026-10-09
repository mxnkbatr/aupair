import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Airplane, CaretLeft, CheckCircle, Heart, PiggyBank, Translate } from '@phosphor-icons/react'
import { countries, feed, GERMAN_LEVEL_LABELS, social } from '../data'
import { celebrate } from '../confetti'
import { haptic, isNative } from '../native'
import './Onboarding.css'

const DONE_STORAGE = 'aupair-onboarded'
const PREFS_STORAGE = 'aupair-prefs'

const GOALS = [
  { id: 'language', icon: Translate, title: 'Герман хэл сурах', text: 'Хэлээ чанга болгоё' },
  { id: 'culture', icon: Airplane, title: 'Европт амьдрах', text: 'Шинэ соёл, шинэ найзууд' },
  { id: 'kids', icon: Heart, title: 'Хүүхэдтэй ажиллах', text: 'Гэр бүлд дэмжлэг болох' },
  { id: 'savings', icon: PiggyBank, title: 'Туршлага + халаасны мөнгө', text: 'Хоол, байр, мөнгө' },
]

const STEP_COUNT = 4

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
    haptic('selection')
    setDir(next > step ? 1 : -1)
    setStep(next)
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

  const slide = reduce
    ? {}
    : {
        initial: { opacity: 0, x: dir * 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: dir * -40 },
        transition: { type: 'spring', stiffness: 380, damping: 38 },
      }

  const goalLabel = GOALS.find((g) => g.id === prefs.goal)?.title
  const last = step === STEP_COUNT - 1

  return (
    <div className="onb" role="dialog" aria-modal="true" aria-label="Танилцуулга">
      <div className="onb__bars" aria-hidden>
        {Array.from({ length: STEP_COUNT }, (_, i) => (
          <i key={i} className={i < step ? 'is-done' : i === step ? 'is-now' : ''} />
        ))}
      </div>

      <div className="onb__top">
        {step > 0 && !last ? (
          <button type="button" className="onb__back" onClick={() => go(step - 1)} aria-label="Буцах">
            <CaretLeft weight="bold" size={22} />
          </button>
        ) : (
          <span />
        )}
        {!last && (
          <button type="button" className="onb__skip" onClick={() => finish()}>
            Алгасах
          </button>
        )}
      </div>

      <div className="onb__stage">
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && (
            <motion.section key="proof" className="onb__step" {...slide}>
              <div className="onb__collage" aria-hidden>
                <img src={feed.featured.image} alt="" />
                <img src={countries.find((c) => c.id === 'austria')?.image || countries[0].image} alt="" />
                <img src={countries.find((c) => c.id === 'switzerland')?.image || countries[0].image} alt="" />
              </div>
              <span className="onb__kicker">{social.since} оноос</span>
              <h2>{social.placed} залуу Европ руу явсан</h2>
              <p>Албан ёсны Au Pair хөтөлбөр, 1969 оны конвенцийн дагуу. Чи дараагийнх нь болоорой.</p>
              <ul className="onb__stats">
                <li>
                  <strong>7</strong>
                  <span>улс</span>
                </li>
                <li>
                  <strong>A1–B1</strong>
                  <span>хэлний анги</span>
                </li>
                <li>
                  <strong>0₮</strong>
                  <span>зөвлөгөө</span>
                </li>
              </ul>
            </motion.section>
          )}

          {step === 1 && (
            <motion.section key="goal" className="onb__step" {...slide}>
              <span className="onb__kicker">1 / 2</span>
              <h2>Чиний зорилго юу вэ?</h2>
              <p>Дараа нь танд тохирсон зүйлийг түрүүнд харуулъя.</p>
              <div className="onb__goals" role="radiogroup" aria-label="Зорилго">
                {GOALS.map(({ id, icon: Icon, title, text }) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={prefs.goal === id}
                    className={`onb__goal${prefs.goal === id ? ' is-active' : ''}`}
                    onClick={() => {
                      haptic('selection')
                      setPrefs((p) => ({ ...p, goal: id }))
                    }}
                  >
                    <Icon weight="duotone" size={28} aria-hidden />
                    <span>
                      <strong>{title}</strong>
                      <small>{text}</small>
                    </span>
                    {prefs.goal === id && <CheckCircle weight="fill" size={22} aria-hidden />}
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section key="level" className="onb__step" {...slide}>
              <span className="onb__kicker">2 / 2</span>
              <h2>Герман хэл, улсууд</h2>
              <p>Одоогийн түвшингээ сонгоод, сонирхсон улсуудаа тэмдэглэ.</p>
              <h3>Герман хэлний түвшин</h3>
              <div className="onb__chips" role="radiogroup" aria-label="Түвшин">
                {Object.entries(GERMAN_LEVEL_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={prefs.level === value}
                    className={`chip${prefs.level === value ? ' is-active' : ''}`}
                    onClick={() => {
                      haptic('selection')
                      setPrefs((p) => ({ ...p, level: value }))
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <h3>Сонирхсон улс</h3>
              <div className="onb__chips">
                {countries.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={prefs.countries.includes(c.id)}
                    className={`chip${prefs.countries.includes(c.id) ? ' is-active' : ''}`}
                    onClick={() => toggleCountry(c.id)}
                  >
                    {c.nameMn}
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {step === 3 && (
            <motion.section key="ready" className="onb__step onb__step--ready" {...slide}>
              <div className="onb__badge" aria-hidden>
                <img src="/logo.png" alt="" />
              </div>
              <h2>Бүх зүйл бэлэн!</h2>
              <p>
                {goalLabel ? `Чиний зорилго: ${goalLabel}. ` : ''}
                Профайл үүсгээд элсэлтээ хянаж, өдөр бүр герман үг дасгалаарай.
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <div className="onb__footer">
        {last ? (
          <>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => finish('/me', { auth: 'register' })}
            >
              Бүртгүүлэх
            </button>
            <button type="button" className="btn btn-ghost btn-block" onClick={() => finish()}>
              Эхлээд үзэх
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-primary btn-block" onClick={() => go(step + 1)}>
            {step === 0 ? 'Эхэлцгээе' : 'Үргэлжлүүлэх'}
          </button>
        )}
      </div>
    </div>
  )
}

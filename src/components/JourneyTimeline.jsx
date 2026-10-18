import { Check } from '@phosphor-icons/react'
import { PROGRAM_STAGES } from '../data/program'
import './JourneyTimeline.css'

/** Legacy 6-step labels (non-program / marketing). */
export const JOURNEY_STEPS = [
  { id: 'account', label: 'Бүртгэл', short: 'Бүртгэл', hint: 'Профайл үүсгэх' },
  { id: 'request', label: 'Хүсэлт илгээх', short: 'Хүсэлт', hint: 'Анги эсвэл улсаа сонгох' },
  { id: 'consult', label: 'Зөвлөгөө', short: 'Зөвлөгөө', hint: 'Бид тантай холбогдоно' },
  { id: 'language', label: 'Хэлний бэлтгэл', short: 'Хэл', hint: 'Герман хэл A1 · A2' },
  { id: 'visa', label: 'Баримт · виз', short: 'Виз', hint: 'Анкет, ярилцлага' },
  { id: 'family', label: 'Гэр бүл · нислэг', short: 'Нислэг', hint: 'Европ руу!' },
]

const PROGRAM_SHORT = ['Ангилал', 'Профайл', 'Айл', 'Виз', 'Герман']

/** Index for marketing journey (0–5). */
export function journeyIndex(user, enrollments = []) {
  if (!user) return 0
  const live = enrollments.filter((e) => e.status !== 'cancelled')
  if (live.length === 0) return 1
  if (live.some((e) => e.status === 'accepted')) return 4
  if (live.some((e) => e.status === 'contacted')) return 3
  return 2
}

/** Current program stage index 0–4 from admin-set programStage 1–5. */
export function programStageIndex(user) {
  if (!user?.inProgram) return 0
  const stage = Math.min(5, Math.max(1, Number(user.programStage) || 1))
  return stage - 1
}

/**
 * Au Pair journey.
 * - `mode="program"`: 5 MAPA stages (admin-driven)
 * - default: legacy marketing steps from enrollments
 */
export default function JourneyTimeline({
  user,
  enrollments,
  compact = false,
  mode = 'auto',
  /** Optional country-specific / mock stages (same shape as PROGRAM_STAGES). */
  stages: stagesOverride,
}) {
  const isProgram = mode === 'program' || (mode === 'auto' && user?.inProgram)
  const programSource = stagesOverride?.length ? stagesOverride : PROGRAM_STAGES
  const steps = isProgram
    ? programSource.map((s, i) => ({
        id: String(s.id),
        label: s.label,
        short: s.short || PROGRAM_SHORT[i] || s.label,
        hint: s.hint,
      }))
    : JOURNEY_STEPS
  const current = isProgram ? programStageIndex(user) : journeyIndex(user, enrollments)
  const n = steps.length
  const progress = n <= 1 ? 0 : Math.min(1, Math.max(0, current / (n - 1)))

  if (compact) {
    return (
      <div
        className="jt jt--compact"
        role="list"
        aria-label="Au Pair аялал"
        style={{ '--jt-n': n, '--jt-progress': progress }}
      >
        <span className="jt__track" aria-hidden />
        <span className="jt__fill" aria-hidden />
        {steps.map((step, i) => (
          <div
            key={step.id}
            role="listitem"
            className={`jt__step${i < current ? ' is-done' : i === current ? ' is-now' : ''}`}
            aria-current={i === current ? 'step' : undefined}
            title={step.label}
          >
            <i>{i < current ? <Check weight="bold" size={10} /> : null}</i>
            <span className="jt__label">{step.short || step.label}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <ol className="jt jt--list" aria-label="Au Pair аялал">
      {steps.map((step, i) => (
        <li
          key={step.id}
          className={i < current ? 'is-done' : i === current ? 'is-now' : ''}
          aria-current={i === current ? 'step' : undefined}
        >
          <i>{i < current ? <Check weight="bold" size={12} /> : i + 1}</i>
          <div>
            <strong>{step.label}</strong>
            <span>
              {i === current ? 'Одоо энд байна · ' : ''}
              {step.hint}
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}

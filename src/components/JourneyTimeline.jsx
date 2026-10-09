import { Check } from '@phosphor-icons/react'
import './JourneyTimeline.css'

export const JOURNEY_STEPS = [
  { id: 'account', label: 'Бүртгэл', hint: 'Профайл үүсгэх' },
  { id: 'request', label: 'Хүсэлт илгээх', hint: 'Анги эсвэл улсаа сонгох' },
  { id: 'consult', label: 'Зөвлөгөө', hint: 'Бид тантай холбогдоно' },
  { id: 'language', label: 'Хэлний бэлтгэл', hint: 'Герман хэл A1 · A2' },
  { id: 'visa', label: 'Баримт · виз', hint: 'Анкет, ярилцлага' },
  { id: 'family', label: 'Гэр бүл · нислэг', hint: 'Европ руу!' },
]

/** Index of the step the user is currently on (0–5), derived from account + enrollment status. */
export function journeyIndex(user, enrollments = []) {
  if (!user) return 0
  const live = enrollments.filter((e) => e.status !== 'cancelled')
  if (live.length === 0) return 1
  if (live.some((e) => e.status === 'accepted')) return 4
  if (live.some((e) => e.status === 'contacted')) return 3
  return 2
}

/**
 * Au Pair journey. `compact` renders a horizontal strip for cards; default is a vertical list.
 */
export default function JourneyTimeline({ user, enrollments, compact = false }) {
  const current = journeyIndex(user, enrollments)
  const steps = JOURNEY_STEPS

  if (compact) {
    return (
      <div className="jt jt--compact" role="list" aria-label="Au Pair аялал">
        {steps.map((step, i) => (
          <div
            key={step.id}
            role="listitem"
            className={`jt__dot${i < current ? ' is-done' : i === current ? ' is-now' : ''}`}
            aria-current={i === current ? 'step' : undefined}
            title={step.label}
          >
            <i>{i < current ? <Check weight="bold" size={10} /> : null}</i>
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
            <span>{i === current ? 'Одоо энд байна · ' : ''}{step.hint}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}

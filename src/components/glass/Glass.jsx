import { useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import Pressable from '../Pressable'
import { haptic } from '../../native'
import './Glass.css'

/**
 * Interactive glass surface: a soft specular highlight follows the finger / pointer.
 * Pass `as={Link}` + `to` to make it tappable (uses Pressable for spring + haptic).
 */
export function GlassCard({ as, className = '', tone, children, ...rest }) {
  const ref = useRef(null)

  function onMove(e) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
  }

  const cls = ['gx', tone ? `gx--${tone}` : '', className].filter(Boolean).join(' ')
  const shared = { ref, className: cls, onPointerMove: onMove, onPointerDown: onMove, ...rest }

  if (as) {
    return (
      <Pressable as={as} scale={0.97} {...shared}>
        <span className="gx__sheen" aria-hidden />
        {children}
      </Pressable>
    )
  }
  return (
    <div {...shared}>
      <span className="gx__sheen" aria-hidden />
      {children}
    </div>
  )
}

/** Fade + lift into view once, staggered by `i`. */
export function Reveal({ i = 0, className, children, as = 'div' }) {
  const reduce = useReducedMotion()
  const Tag = motion[as] || motion.div
  if (reduce) return <Tag className={className}>{children}</Tag>
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ type: 'spring', stiffness: 260, damping: 28, delay: Math.min(i, 6) * 0.05 }}
    >
      {children}
    </Tag>
  )
}

/** Section header: title + optional "Бүгд" link. */
export function SectionHead({ title, action, className = '' }) {
  return (
    <div className={`gx-head container ${className}`}>
      <h2>{title}</h2>
      {action}
    </div>
  )
}

/** Thin animated progress bar. value 0..1 */
export function GlassProgress({ value = 0, label }) {
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="gx-progress" role="progressbar" aria-valuenow={Math.round(v * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <motion.i
        initial={{ width: 0 }}
        whileInView={{ width: `${v * 100}%` }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 90, damping: 20, delay: 0.15 }}
      />
    </div>
  )
}

/** Horizontal steps indicator for multi-step flows. */
export function Stepper({ steps, current }) {
  return (
    <ol className="gx-stepper" aria-label="Алхам">
      {steps.map((s, i) => (
        <li key={s} className={i < current ? 'is-done' : i === current ? 'is-now' : ''}>
          <span className="gx-stepper__dot">{i < current ? '✓' : i + 1}</span>
          <span className="gx-stepper__label">{s}</span>
        </li>
      ))}
    </ol>
  )
}

/** Red brand header that continues under the red navbar (tab roots). */
export function RedHero({ kicker, title, lead, mark, children }) {
  return (
    <section className="rh">
      {mark ? (
        <span className="rh__mark" aria-hidden>
          {mark}
        </span>
      ) : null}
      <div className="container rh__inner">
        {kicker ? <p className="rh__kicker">{kicker}</p> : null}
        <h1>{title}</h1>
        {lead ? <p className="rh__lead">{lead}</p> : null}
        {children}
      </div>
    </section>
  )
}

/** Horizontal chip filter — active chip is black with a sliding spring pill. */
export function GlassChips({ items, value, onChange, layoutId, label, overlap = false }) {
  return (
    <div className={overlap ? 'gchips gchips--overlap' : 'gchips'} role="tablist" aria-label={label}>
      {items.map((c) => (
        <button
          key={c.id}
          type="button"
          role="tab"
          aria-selected={value === c.id}
          className={value === c.id ? 'gchip is-on' : 'gchip'}
          onClick={() => {
            if (value !== c.id) haptic('selection')
            onChange(c.id)
          }}
        >
          {value === c.id ? (
            <motion.i
              layoutId={layoutId}
              className="gchip__bg"
              transition={{ type: 'spring', stiffness: 520, damping: 38 }}
            />
          ) : null}
          <span>{c.label}</span>
        </button>
      ))}
    </div>
  )
}

/**
 * Vertical numbered timeline — explains a process step by step.
 * steps: [{ title, text, icon?: PhosphorIcon }]
 */
export function StepsTimeline({ steps, current = -1 }) {
  return (
    <ol className="gsteps">
      {steps.map((s, i) => {
        const Icon = s.icon
        const state = i < current ? 'is-done' : i === current ? 'is-now' : ''
        return (
          <motion.li
            key={s.title}
            className={state}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '0px 0px -30px 0px' }}
            transition={{ type: 'spring', stiffness: 300, damping: 28, delay: i * 0.06 }}
          >
            <span className="gsteps__node">{Icon ? <Icon size={16} weight="fill" aria-hidden /> : i + 1}</span>
            <span className="gsteps__text">
              <strong>{s.title}</strong>
              {s.text ? <small>{s.text}</small> : null}
            </span>
          </motion.li>
        )
      })}
    </ol>
  )
}

/** Clean iOS-style large title for tab roots (no colour block). */
export function PageTitle({ title, lead, children }) {
  return (
    <header className="container ptitle">
      <h1>{title}</h1>
      {lead ? <p>{lead}</p> : null}
      {children}
    </header>
  )
}

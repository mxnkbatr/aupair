import { motion, useReducedMotion } from 'motion/react'
import { haptic } from '../native'

const cache = new Map()

function getMotion(as) {
  if (typeof as === 'string') return motion[as] || motion.create(as)
  if (!cache.has(as)) cache.set(as, motion.create(as))
  return cache.get(as)
}

/**
 * Tappable surface: scales to 0.96 on press and fires a light haptic.
 * `as` can be a tag name ('button', 'a', 'div') or a component (react-router `Link`).
 */
export default function Pressable({
  as = 'button',
  scale = 0.96,
  haptics = 'light',
  onClick,
  children,
  ...rest
}) {
  const reduce = useReducedMotion()
  const Tag = getMotion(as)
  const extra = as === 'button' && !rest.type ? { type: 'button' } : {}

  return (
    <Tag
      data-pressable=""
      whileTap={reduce ? undefined : { scale }}
      transition={{ type: 'spring', stiffness: 520, damping: 30 }}
      onClick={(e) => {
        if (haptics) haptic(haptics)
        onClick?.(e)
      }}
      {...extra}
      {...rest}
    >
      {children}
    </Tag>
  )
}

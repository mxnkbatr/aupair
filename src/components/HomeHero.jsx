import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react'
import { ArrowRight } from '@phosphor-icons/react'
import { haptic } from '../native'
import './HomeHero.css'

const AUTO_MS = 5200

function useCountdown(iso) {
  const target = iso ? new Date(`${iso}T15:00:00`).getTime() : 0
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!target) return undefined
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])
  const ms = Math.max(0, target - now)
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor(ms / 3600000) % 24,
    m: Math.floor(ms / 60000) % 60,
    s: Math.floor(ms / 1000) % 60,
  }
}

/** One digit group that rolls when the value changes. */
function Roll({ value, label }) {
  const text = String(value).padStart(2, '0')
  return (
    <span className="hh-cd__cell">
      <span className="hh-cd__num">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.b
            key={text}
            initial={{ y: '-60%', opacity: 0, filter: 'blur(4px)' }}
            animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: '60%', opacity: 0, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            {text}
          </motion.b>
        </AnimatePresence>
      </span>
      <small>{label}</small>
    </span>
  )
}

function Countdown({ iso }) {
  const t = useCountdown(iso)
  return (
    <div className="hh-cd" aria-label={`${t.d} хоног үлдлээ`}>
      <Roll value={t.d} label="хоног" />
      <Roll value={t.h} label="цаг" />
      <Roll value={t.m} label="мин" />
      <Roll value={t.s} label="сек" />
    </div>
  )
}

function Slide({ slide, index, x, width }) {
  // Parallax: the photo drifts slower than the card while dragging.
  const imgX = useTransform(x, (v) => (v + index * width) * -0.18)
  return (
    <div className={`hh-slide hh-slide--${slide.tone}`} aria-roledescription="slide">
      {slide.image ? (
        <motion.img className="hh-slide__img" src={slide.image} alt="" style={{ x: imgX }} draggable={false} />
      ) : null}
      <span className="hh-slide__shade" aria-hidden />
      <span className="hh-slide__glow" aria-hidden />
      <div className="hh-slide__body">
        {slide.countdown ? (
          <>
            <h2>{slide.title}</h2>
            <div className="hh-row">
              <Countdown iso={slide.countdown} />
              <Link to={slide.to} state={slide.state} className="hh-cta" draggable={false} aria-label={slide.cta}>
                <ArrowRight size={18} weight="bold" aria-hidden />
              </Link>
            </div>
          </>
        ) : (
          <div className="hh-row hh-row--title">
            <h2>{slide.title}</h2>
            <Link to={slide.to} state={slide.state} className="hh-cta" draggable={false} aria-label={slide.cta}>
              <ArrowRight size={18} weight="bold" aria-hidden />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Swipeable featured carousel ("Today" cards): drag + snap,
 * photo parallax, auto-advance with progress pills, pauses while touched.
 */
export default function HomeHero({ slides }) {
  const reduce = useReducedMotion()
  const wrap = useRef(null)
  const dragged = useRef(false)
  const [width, setWidth] = useState(340)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const x = useMotionValue(0)
  const count = slides.length

  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return undefined
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const go = useCallback(
    (next, fromUser = false) => {
      const i = ((next % count) + count) % count
      setIndex(i)
      if (fromUser) haptic('selection')
      animate(x, -i * width, reduce ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 34 })
    },
    [count, width, x, reduce],
  )

  // Keep position aligned on resize.
  useEffect(() => {
    x.set(-index * width)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width])

  useEffect(() => {
    if (paused || reduce || count < 2) return undefined
    const id = setTimeout(() => go(index + 1), AUTO_MS)
    return () => clearTimeout(id)
  }, [index, paused, reduce, count, go])

  return (
    <section className="hh" aria-roledescription="carousel" aria-label="Онцлох">
      <div
        className="hh-viewport"
        ref={wrap}
        onPointerDown={() => {
          dragged.current = false
          setPaused(true)
        }}
        onPointerUp={() => setPaused(false)}
        onPointerCancel={() => setPaused(false)}
        onClickCapture={(e) => {
          // A swipe must not open the slide's link.
          if (dragged.current) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        <motion.div
          className="hh-track"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -(count - 1) * width, right: 0 }}
          dragElastic={0.18}
          dragMomentum={false}
          onDragStart={() => {
            dragged.current = true
          }}
          onDragEnd={(_, info) => {
            const swipe = info.offset.x + info.velocity.x * 0.2
            if (swipe < -width * 0.18) go(Math.min(index + 1, count - 1), true)
            else if (swipe > width * 0.18) go(Math.max(index - 1, 0), true)
            else go(index)
          }}
        >
          {slides.map((s, i) => (
            <Slide key={s.id} slide={s} index={i} x={x} width={width} />
          ))}
        </motion.div>
      </div>

      <div className="hh-dots" role="tablist" aria-label="Слайд">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={s.title}
            className={i === index ? 'is-on' : ''}
            onClick={() => go(i, true)}
          >
            {i === index ? (
              <motion.i
                key={`${index}-${paused}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: paused || reduce ? 0.15 : 1 }}
                transition={{ duration: paused || reduce ? 0.2 : AUTO_MS / 1000, ease: 'linear' }}
              />
            ) : null}
          </button>
        ))}
      </div>
    </section>
  )
}

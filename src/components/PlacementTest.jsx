import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  CheckCircle,
  Exam,
  Timer,
  X,
} from '@phosphor-icons/react'
import {
  PLACEMENT_QUESTIONS,
  levelFromPlacementScore,
  placementCopy,
  placementPercent,
} from '../features/german/placementQuestions'
import { api } from '../api'
import Pressable from './Pressable'
import { haptic } from '../native'
import './PlacementTest.css'

const TOTAL = PLACEMENT_QUESTIONS.length

function useQuiz(courses) {
  const [phase, setPhase] = useState('start') // start | quiz | result
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [assign, setAssign] = useState(null)
  const [assignErr, setAssignErr] = useState('')

  const q = PLACEMENT_QUESTIONS[index]
  const percent = placementPercent(score, TOTAL)
  const level = levelFromPlacementScore(score, TOTAL)
  const copy = placementCopy(level)
  const recommendLevel = level
  const matched = (courses || []).filter((c) => {
    const lv = String(c.level || '').replace(/^DE\s*/i, '').toUpperCase()
    return lv === recommendLevel || lv.startsWith(recommendLevel)
  })

  const reset = useCallback(() => {
    setPhase('start')
    setIndex(0)
    setPicked(null)
    setScore(0)
    setAssign(null)
    setAssignErr('')
  }, [])

  const start = useCallback(() => {
    haptic('light')
    setPhase('quiz')
    setIndex(0)
    setPicked(null)
    setScore(0)
    setAssign(null)
    setAssignErr('')
  }, [])

  function choose(option) {
    if (picked !== null) return
    const ok = option === q.answer
    setPicked(option)
    haptic(ok ? 'success' : 'error')
    if (ok) setScore((s) => s + 1)
  }

  async function finish(finalScore) {
    const pct = placementPercent(finalScore, TOTAL)
    setPhase('result')
    try {
      const res = await api.placementAssign({ percent: pct })
      setAssign(res)
      haptic('success')
    } catch (err) {
      setAssignErr(err.message || 'Ангид элсүүлэхэд алдаа гарлаа')
    }
  }

  function next() {
    haptic('selection')
    if (index + 1 >= TOTAL) {
      void finish(score)
      return
    }
    setIndex((i) => i + 1)
    setPicked(null)
  }

  return {
    phase,
    index,
    picked,
    score,
    percent,
    q,
    level,
    copy,
    matched,
    assign,
    assignErr,
    reset,
    start,
    choose,
    next,
  }
}

function QuizBody({ quiz, onClose, reduce }) {
  const {
    phase,
    index,
    picked,
    score,
    percent,
    q,
    copy,
    matched,
    assign,
    assignErr,
    start,
    choose,
    next,
    reset,
  } = quiz

  const slide = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { type: 'spring', stiffness: 420, damping: 34 },
      }

  if (phase === 'start') {
    return (
      <motion.div key="start" className="pt__start" {...slide}>
        <span className="pt__start-icon" aria-hidden>
          <Exam weight="fill" size={36} />
        </span>
        <h2>Түвшин тогтоох тест</h2>
        <p>6 асуулт · 75%+ бол A2, бага бол A1 ангид автоматаар элсэнэ.</p>
        <ul className="pt__meta">
          <li>
            <Timer size={16} weight="bold" aria-hidden /> ~3 минут
          </li>
          <li>
            <CheckCircle size={16} weight="bold" aria-hidden /> A1 · A2
          </li>
        </ul>
        <button type="button" className="pt__primary" onClick={start}>
          Тест эхлүүлэх
        </button>
        {onClose ? (
          <button type="button" className="pt__ghost" onClick={onClose}>
            Дараа
          </button>
        ) : null}
      </motion.div>
    )
  }

  if (phase === 'result') {
    const courseId = assign?.course?.id || matched[0]?.id
    return (
      <motion.div key="result" className="pt__body pt__result" {...slide}>
        <div className="pt__score-ring" aria-hidden>
          <strong>{percent}%</strong>
          <span>
            {score}/{TOTAL}
          </span>
        </div>
        <h2>{copy.title}</h2>
        <p>{copy.text}</p>
        {assign?.ok ? (
          <p className="pt__assigned">
            {assign.already
              ? 'Та аль хэдийн ангид бүртгэлтэй байна.'
              : `${assign.level} ангид элслээ · бүлгийн чат нээгдлээ.`}
          </p>
        ) : null}
        {assignErr ? <p className="pt__empty">{assignErr}</p> : null}

        <h3 className="pt__rec-label">Миний анги</h3>
        {courseId ? (
          <Pressable as={Link} to="/learn?tab=schedule" className="pt__rec" onClick={onClose}>
            <span className="pt__rec-lv">{assign?.level || level}</span>
            <span>
              <strong>{assign?.course?.title || matched[0]?.title || 'Сургалт'}</strong>
              <small>Хуваарь · чат</small>
            </span>
            <ArrowRight weight="bold" size={16} aria-hidden />
          </Pressable>
        ) : (
          <p className="pt__empty">Одоогоор тохирох анги байхгүй байна.</p>
        )}

        <button type="button" className="pt__primary" onClick={reset}>
          Дахин өгөх
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div key={q.id} className="pt__body" {...slide}>
      <p className="pt__prompt">{q.prompt}</p>
      <div className="pt__options">
        {q.options.map((opt, i) => {
          const letter = String.fromCharCode(65 + i)
          const isPick = picked === opt
          const isAns = opt === q.answer
          let cls = 'pt__opt'
          if (picked !== null) {
            if (isAns) cls += ' is-correct'
            else if (isPick) cls += ' is-wrong'
          } else if (isPick) cls += ' is-picked'
          return (
            <button
              key={opt}
              type="button"
              className={cls}
              disabled={picked !== null}
              onClick={() => choose(opt)}
            >
              <i>{letter}</i>
              <span>{opt}</span>
            </button>
          )
        })}
      </div>
      {picked !== null ? (
        <button type="button" className="pt__primary" onClick={next}>
          {index + 1 >= TOTAL ? 'Үр дүн харах' : 'Дараах'}
          <ArrowRight weight="bold" size={16} aria-hidden />
        </button>
      ) : (
        <p className="pt__hint">Хариултаа сонгоно уу</p>
      )}
    </motion.div>
  )
}

/**
 * Placement quiz — `variant="page"` for Learn Test tab, `variant="sheet"` for overlay.
 */
export default function PlacementTest({ open = true, onClose, courses = [], variant = 'sheet' }) {
  const reduce = useReducedMotion()
  const quiz = useQuiz(courses)
  const { phase, index, picked, reset } = quiz

  useEffect(() => {
    if (variant === 'sheet' && !open) reset()
    // Reset only when sheet closes — avoid resetting mid-quiz on remount
  }, [open, variant, reset])

  if (variant === 'sheet' && !open) return null

  const progress =
    phase === 'quiz' ? ((index + (picked !== null ? 1 : 0)) / TOTAL) * 100 : phase === 'result' ? 100 : 0

  const inner = (
    <>
      {phase !== 'start' ? (
        <header className="pt__head">
          <div>
            <strong>{phase === 'result' ? 'Үр дүн' : 'Түвшин тогтоох'}</strong>
            {phase === 'quiz' ? <span>{index + 1} / {TOTAL}</span> : <span>Герман хэл</span>}
          </div>
          {variant === 'sheet' && onClose ? (
            <button
              type="button"
              className="pt__x"
              onClick={() => {
                reset()
                onClose()
              }}
              aria-label="Хаах"
            >
              <X size={18} weight="bold" />
            </button>
          ) : null}
        </header>
      ) : variant === 'sheet' && onClose ? (
        <header className="pt__head pt__head--start">
          <div />
          <button
            type="button"
            className="pt__x"
            onClick={() => {
              reset()
              onClose()
            }}
            aria-label="Хаах"
          >
            <X size={18} weight="bold" />
          </button>
        </header>
      ) : null}

      {phase === 'quiz' || phase === 'result' ? (
        <div className="pt__progress" aria-hidden>
          <i style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
        <QuizBody key={phase === 'quiz' ? quiz.q?.id : phase} quiz={quiz} onClose={onClose} reduce={reduce} />
      </AnimatePresence>
    </>
  )

  if (variant === 'page') {
    return <div className="pt pt--page">{inner}</div>
  }

  return (
    <div className="pt" role="dialog" aria-modal="true" aria-label="Түвшин тогтоох тест">
      <button
        type="button"
        className="pt__backdrop"
        aria-label="Хаах"
        onClick={() => {
          reset()
          onClose?.()
        }}
      />
      <div className="pt__panel">
        <div className="pt__handle" aria-hidden />
        {inner}
      </div>
    </div>
  )
}

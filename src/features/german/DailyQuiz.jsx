import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Fire, Lightning, CheckCircle, XCircle, ArrowRight } from '@phosphor-icons/react'
import { celebrate } from '../../confetti'
import { haptic } from '../../native'
import { buildQuiz, wordOfDay } from './wordBank'
import { levelFromXp, recordQuiz, useGermanProgress } from './progress'
import './DailyQuiz.css'

const QUESTIONS = 5

export default function DailyQuiz() {
  const progress = useGermanProgress()
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState('intro') // intro | play | done
  const [attempt, setAttempt] = useState(0)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [result, setResult] = useState(null)

  const quiz = useMemo(() => buildQuiz(new Date(), QUESTIONS, attempt), [attempt])
  const question = quiz[index]
  const word = wordOfDay()
  const lvl = levelFromXp(progress.xp)

  function start() {
    haptic('selection')
    setIndex(0)
    setScore(0)
    setPicked(null)
    setResult(null)
    setPhase('play')
  }

  function choose(option) {
    if (picked !== null) return
    const correct = option === question.answer
    setPicked(option)
    haptic(correct ? 'success' : 'error')
    if (correct) setScore((s) => s + 1)
  }

  function next() {
    const correctNow = picked === question.answer
    if (index + 1 < quiz.length) {
      setIndex(index + 1)
      setPicked(null)
      return
    }
    const finalScore = score
    const res = recordQuiz(finalScore, quiz.length)
    setResult({ ...res, score: finalScore, perfect: correctNow && finalScore === quiz.length })
    setPhase('done')
    if (finalScore >= Math.ceil(quiz.length * 0.8)) celebrate({ big: finalScore === quiz.length })
  }

  function retry() {
    setAttempt((a) => a + 1)
    setTimeout(start, 0)
  }

  const slide = reduce
    ? {}
    : {
        initial: { opacity: 0, x: 24 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -24 },
        transition: { type: 'spring', stiffness: 420, damping: 36 },
      }

  return (
    <section className="dq">
      <div className="dq-stats" aria-label="Явц">
        <div className="dq-stat">
          <Fire weight="fill" size={22} className="dq-stat__fire" />
          <strong>{progress.liveStreak}</strong>
          <span>өдөр дараалсан</span>
        </div>
        <div className="dq-stat">
          <Lightning weight="fill" size={22} className="dq-stat__xp" />
          <strong>{progress.xp}</strong>
          <span>XP · Lv {lvl.level}</span>
        </div>
      </div>
      <div className="dq-level" aria-hidden>
        <i style={{ width: `${lvl.into}%` }} />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {phase === 'intro' && (
          <motion.div key="intro" className="dq-card" {...slide}>
            <span className="dq-kicker">Өдрийн үг</span>
            <h3 className="dq-word">{word.de}</h3>
            <p className="dq-mn">{word.mn}</p>
            <p className="dq-example">
              {word.example}
              <small>{word.exampleMn}</small>
            </p>
            <button type="button" className="btn btn-primary btn-block" onClick={start}>
              {progress.today ? 'Дахин дасгалах' : `${QUESTIONS} асуулттай дасгал эхлэх`}
            </button>
            {progress.today ? (
              <p className="dq-note">Өнөөдрийн streak аль хэдийн хадгалагдсан</p>
            ) : (
              <p className="dq-note">Өдөр бүр дасгалаад streak-ээ хадгал</p>
            )}
          </motion.div>
        )}

        {phase === 'play' && question && (
          <motion.div key={`q-${index}-${attempt}`} className="dq-card" {...slide}>
            <div className="dq-progress" aria-label={`${index + 1} / ${quiz.length}`}>
              {quiz.map((_, i) => (
                <i key={i} className={i < index ? 'is-done' : i === index ? 'is-now' : ''} />
              ))}
            </div>
            <span className="dq-kicker">
              {question.dir === 'de-mn' ? 'Монгол хэлээр юу вэ?' : 'Герман хэлээр юу вэ?'}
            </span>
            <h3 className="dq-word">{question.prompt}</h3>
            <div className="dq-options" role="group">
              {question.options.map((option) => {
                const state =
                  picked === null
                    ? ''
                    : option === question.answer
                      ? 'is-right'
                      : option === picked
                        ? 'is-wrong'
                        : 'is-dim'
                return (
                  <button
                    key={option}
                    type="button"
                    className={`dq-option ${state}`}
                    onClick={() => choose(option)}
                    disabled={picked !== null}
                  >
                    <span>{option}</span>
                    {state === 'is-right' && <CheckCircle weight="fill" size={22} />}
                    {state === 'is-wrong' && <XCircle weight="fill" size={22} />}
                  </button>
                )
              })}
            </div>
            {picked !== null && (
              <button type="button" className="btn btn-primary btn-block dq-next" onClick={next}>
                {index + 1 < quiz.length ? 'Үргэлжлүүлэх' : 'Дүн харах'}
                <ArrowRight weight="bold" size={18} />
              </button>
            )}
          </motion.div>
        )}

        {phase === 'done' && result && (
          <motion.div key="done" className="dq-card dq-card--done" {...slide}>
            <span className="dq-kicker">Дүн</span>
            <h3 className="dq-score">
              {result.score}/{quiz.length}
            </h3>
            <p className="dq-mn">
              {result.score === quiz.length
                ? 'Төгс! Чи бол од.'
                : result.score >= 3
                  ? 'Сайн байна, үргэлжлүүл!'
                  : 'Дахин оролдоод үз — чадна!'}
            </p>
            <div className="dq-gain">
              <span>
                <Lightning weight="fill" size={18} /> +{result.xpGained} XP
              </span>
              <span>
                <Fire weight="fill" size={18} /> {result.streak} өдөр
              </span>
            </div>
            <button type="button" className="btn btn-primary btn-block" onClick={retry}>
              Дахин оролдох
            </button>
            <button type="button" className="btn btn-ghost btn-block" onClick={() => setPhase('intro')}>
              Болсон
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

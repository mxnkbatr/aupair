import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, GlobeHemisphereEast, Sparkle } from '@phosphor-icons/react'
import { countries } from '../data'
import {
  COUNTRY_MATCH_QUESTIONS,
  rankCountriesFromAnswers,
} from '../data/countryMatch'
import Pressable from './Pressable'
import { haptic } from '../native'
import './CountryMatch.css'

export default function CountryMatch({ onDone }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [done, setDone] = useState(false)

  const q = COUNTRY_MATCH_QUESTIONS[index]
  const ranked = useMemo(() => {
    if (!done) return []
    const ranks = rankCountriesFromAnswers(answers)
    return ranks
      .map((r) => ({ ...r, country: countries.find((c) => c.id === r.id) }))
      .filter((r) => r.country)
      .slice(0, 3)
  }, [answers, done])

  function pick(optId) {
    haptic('selection')
    const next = { ...answers, [q.id]: optId }
    setAnswers(next)
    if (index + 1 >= COUNTRY_MATCH_QUESTIONS.length) {
      setDone(true)
      haptic('success')
      return
    }
    setIndex((i) => i + 1)
  }

  function reset() {
    setIndex(0)
    setAnswers({})
    setDone(false)
  }

  if (done) {
    return (
      <section className="cmatch" aria-label="Улс тохируулах үр дүн">
        <header className="cmatch__head">
          <Sparkle weight="fill" size={22} aria-hidden />
          <div>
            <h2>Танд тохирох улс</h2>
            <p>Хариултад үндэслэсэн санал — хүсэлт илгээнэ үү.</p>
          </div>
        </header>
        <ul className="cmatch__list">
          {ranked.map((r, i) => (
            <li key={r.id}>
              <Pressable as={Link} to={`/countries/${r.id}`} className="cmatch__card" onClick={onDone}>
                <em>{i + 1}</em>
                <div>
                  <strong>
                    {r.country.nameMn} Au Pair
                  </strong>
                  <small>
                    {r.country.language} · {r.country.duration}
                  </small>
                </div>
                <ArrowRight weight="bold" size={18} aria-hidden />
              </Pressable>
            </li>
          ))}
        </ul>
        {ranked.length === 0 ? <p className="cmatch__empty">Тохирох улс олдсонгүй</p> : null}
        <button type="button" className="cmatch__again" onClick={reset}>
          Дахин тохируулах
        </button>
      </section>
    )
  }

  return (
    <section className="cmatch" aria-label="Улс тохируулах асуулт">
      <header className="cmatch__head">
        <GlobeHemisphereEast weight="fill" size={22} aria-hidden />
        <div>
          <p className="cmatch__kicker">
            Асуулт {index + 1}/{COUNTRY_MATCH_QUESTIONS.length}
          </p>
          <h2>{q.prompt}</h2>
        </div>
      </header>
      <div className="cmatch__opts">
        {q.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={answers[q.id] === opt.id ? 'is-on' : ''}
            onClick={() => pick(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </section>
  )
}

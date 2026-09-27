import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { countries, feed, social } from '../data'
import { haptic, isNative } from '../native'
import './Onboarding.css'

const DONE_STORAGE = 'aupair-onboarded'

const SLIDES = [
  {
    image: feed.featured.image,
    eyebrow: 'Хэлний бэлтгэл',
    title: 'Герман хэлний A1, A2 анги',
    text: 'Анхан шатнаас эхэлж, Au Pair ярилцлага, визэндээ бэлтгэнэ.',
  },
  {
    image: countries.find((c) => c.id === 'austria')?.image || countries[0].image,
    eyebrow: 'Зуучлал',
    title: 'Европын 7 улс руу Au Pair',
    text: `Гэр бүлд амьдарч, хэл соёл сурна. ${social.since} оноос ${social.placed} залуус.`,
  },
  {
    image: null,
    eyebrow: 'Апп',
    title: 'Элсэлтээ утаснаасаа хяна',
    text: 'Профайл үүсгээд бүртгэл, элсэлтийнхээ явцыг хүссэн үедээ харна.',
  },
]

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
  const [open, setOpen] = useState(() => pathname !== '/admin' && shouldShow())
  const [index, setIndex] = useState(0)
  const track = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const last = index === SLIDES.length - 1

  function finish(to) {
    try {
      localStorage.setItem(DONE_STORAGE, '1')
    } catch {
      // storage unavailable
    }
    haptic()
    setOpen(false)
    if (to) navigate(to)
  }

  function goTo(i) {
    const el = track.current
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  function onScroll(e) {
    const el = e.currentTarget
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== index) {
      setIndex(i)
      haptic()
    }
  }

  return (
    <div className="onb" role="dialog" aria-modal="true" aria-label="Танилцуулга">
      <button type="button" className="onb__skip" onClick={() => finish()}>
        Алгасах
      </button>

      <div className="onb__track" ref={track} onScroll={onScroll}>
        {SLIDES.map((slide) => (
          <section key={slide.title} className="onb__slide">
            <div className="onb__media">
              {slide.image ? (
                <img src={slide.image} alt="" />
              ) : (
                <div className="onb__brand">
                  <img src="/logo.png" alt="" />
                </div>
              )}
            </div>
            <div className="onb__copy">
              <span className="eyebrow">{slide.eyebrow}</span>
              <h2>{slide.title}</h2>
              <p>{slide.text}</p>
            </div>
          </section>
        ))}
      </div>

      <div className="onb__footer">
        <div className="onb__dots" aria-hidden>
          {SLIDES.map((slide, i) => (
            <i key={slide.title} className={i === index ? 'is-active' : ''} />
          ))}
        </div>
        {last ? (
          <div className="onb__actions">
            <button type="button" className="btn btn-primary btn-block" onClick={() => finish('/profile')}>
              Бүртгүүлэх
            </button>
            <button type="button" className="btn btn-ghost btn-block" onClick={() => finish()}>
              Эхлээд үзэх
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-primary btn-block" onClick={() => goTo(index + 1)}>
            Дараах
          </button>
        )}
      </div>
    </div>
  )
}

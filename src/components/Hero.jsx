import { Link } from 'react-router-dom'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero__banner">
          <img
            className="hero__photo"
            src="/cover.jpg"
            alt="Ханз Академи — хятад хэлний сургалт"
          />
          <div className="hero__shade" aria-hidden />

          <div className="hero__content">
            <p className="hero__live fade-up">
              <i /> Элсэлт авч байна · HSK 1–5
            </p>

            <h1 className="hero__title fade-up-delay">
              Хятад хэлээ
              <span> жинхэнээсээ </span>
              сур.
            </h1>

            <p className="hero__lead fade-up-2">
              Туршлагатай багш · HSK бэлтгэл · тохилог орчин
            </p>

            <div className="hero__actions fade-up-3">
              <Link to="/courses" className="btn btn-primary hero__cta">
                Элсэлт үзэх
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

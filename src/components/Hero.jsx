import { Link } from 'react-router-dom'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero__banner">
          <img
            className="hero__photo"
            src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1800&q=80"
            alt="Mongolian Au Pair — Европ руу соёл солилцоо"
            onError={(e) => {
              e.currentTarget.src = '/cover.jpg'
            }}
          />
          <div className="hero__shade" aria-hidden />

          <div className="hero__content">
            <p className="hero__live fade-up">
              <i /> Элсэлт авч байна
            </p>

            <h1 className="hero__title fade-up-delay">
              Au Pair-аар
              <span> Европ </span>
              руу
            </h1>

            <p className="hero__lead fade-up-2">
              Гэр бүлд амьдарч, хэл сурна.
            </p>

            <div className="hero__actions fade-up-3">
              <Link to="/universities" className="btn btn-primary hero__cta">
                Элсэх
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

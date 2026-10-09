import { Link } from 'react-router-dom'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero__banner">
          <img
            className="hero__photo"
            src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1800&q=80"
            alt="Mongolian Au Pair — Герман руу соёл солилцоо"
            onError={(e) => {
              e.currentTarget.src = '/cover.jpg'
            }}
          />
          <div className="hero__shade" aria-hidden />

          <div className="hero__content">
            <p className="hero__live fade-up">
              <i /> Элсэлт авч байна · Герман хэл A1, A2
            </p>

            <h1 className="hero__title fade-up-delay">
              Соёл солилцоогоор
              <span> дэлхийд </span>
              хөл тавь.
            </h1>

            <p className="hero__lead fade-up-2">
              2005 оноос хойш · Герман · Франц · Австри · Швейцарь · Бельги · Нидерланд · Дани
            </p>

            <div className="hero__actions fade-up-3">
              <Link to="/learn" className="btn btn-primary hero__cta">
                Хэлний ангид бүртгүүлэх
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

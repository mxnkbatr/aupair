import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import { countries, coursesFallback, social } from '../data'
import './Home.css'

const SHORTCUTS = [
  { to: '/courses', label: 'Хөтөлбөр' },
  { to: '/universities', label: 'Улс орнууд' },
  { to: '/shop', label: 'Дэлгүүр' },
  { to: '/profile', label: 'Холбоо' },
]

export default function Home() {
  return (
    <div className="home">
      <Hero />

      <section className="home-shortcuts home-shortcuts--mobile">
        <div className="container">
          <div className="home-shortcuts__grid">
            {SHORTCUTS.map((item) => (
              <Link key={item.to} to={item.to} className="home-shortcut">
                <strong>{item.label}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-block">
        <div className="container">
          <div className="block-head">
            <h2>Улсаа сонго</h2>
            <Link to="/universities" className="link-more">
              Бүгд →
            </Link>
          </div>

          <div className="home-unis">
            {countries.slice(0, 4).map((uni) => (
              <Link key={uni.id} to={`/universities/${uni.id}`} className="home-uni">
                <div className="home-uni__media">
                  <img
                    src={uni.image}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/cover.jpg'
                    }}
                  />
                </div>
                <div className="home-uni__body">
                  <strong>{uni.nameMn}</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-block">
        <div className="container">
          <div className="block-head">
            <h2>Хэлний бэлтгэл</h2>
            <Link to="/courses" className="link-more">
              Бүгд →
            </Link>
          </div>

          <div className="home-courses">
            {coursesFallback.slice(0, 3).map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="home-course"
              >
                <div className="home-course__art" aria-hidden>
                  <span>{course.hsk}</span>
                </div>
                <div className="home-course__body">
                  <h3>{course.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-block home-block--end home-visit">
        <div className="container">
          <div className="home-visit__card">
            <div>
              <h2>Холбоо барих</h2>
              <div className="home-visit__actions">
                <a href={`tel:${social.phoneTel}`} className="btn btn-primary">
                  {social.phone}
                </a>
                <a
                  href={social.map}
                  className="btn btn-ghost"
                  target="_blank"
                  rel="noreferrer"
                >
                  Газрын зураг
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

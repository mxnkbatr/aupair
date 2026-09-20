import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import PortalFeed from '../components/PortalFeed'
import { countries, products, coursesFallback, social } from '../data'
import './Home.css'

const SHORTCUTS = [
  { to: '/courses', label: 'Хөтөлбөр', hint: 'Хэл + элсэлт' },
  { to: '/universities', label: 'Улс орнууд', hint: '7 улс' },
  { to: '/shop', label: 'Дэлгүүр', hint: 'Ном · материал' },
  { to: '/profile', label: 'Холбоо', hint: '7711-6906' },
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
                <span>{item.hint}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PortalFeed />

      <section className="home-block">
        <div className="container">
          <div className="block-head">
            <div>
              <span className="eyebrow">Хөтөлбөр</span>
              <h2>Одоо нээлттэй элсэлт</h2>
            </div>
            <Link to="/courses" className="link-more">
              Бүгдийг үзэх →
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
                  <span className="tag">{course.level}</span>
                  <h3>{course.title}</h3>
                  <strong>{course.mode}</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-block">
        <div className="container">
          <div className="block-head">
            <div>
              <span className="eyebrow">Дэлгүүр</span>
              <h2>Ном · материал</h2>
            </div>
            <Link to="/shop" className="link-more">
              Бүгдийг үзэх →
            </Link>
          </div>

          <div className="home-courses">
            {products.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                to={`/shop/${item.id}`}
                className="home-course"
              >
                <div className="home-course__art" aria-hidden>
                  <span>{item.tag}</span>
                </div>
                <div className="home-course__body">
                  <span className="tag">{item.blurb}</span>
                  <h3>{item.name}</h3>
                  <strong>{item.price}</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-block">
        <div className="container">
          <div className="block-head">
            <div>
              <span className="eyebrow">Зуучлал</span>
              <h2>Au Pair улс орнууд</h2>
            </div>
            <Link to="/universities" className="link-more">
              Жагсаалт →
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
                  <strong>{uni.city}</strong>
                  <span>{uni.nameMn}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-block home-visit">
        <div className="container">
          <div className="home-visit__card">
            <div>
              <span className="eyebrow">Ирж үзээрэй</span>
              <h2>New Residence · 726-1</h2>
              <p>{social.address}</p>
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
            <div className="home-visit__meta">
              <strong>{social.email}</strong>
              <span>Имэйл</span>
              <a href={`mailto:${social.emailAlt}`}>{social.emailAlt}</a>
            </div>
          </div>
        </div>
      </section>

      <section className="home-block home-block--end home-fb-wrap">
        <div className="container">
          <a
            className="home-fb"
            href={social.facebook}
            target="_blank"
            rel="noreferrer"
          >
            <div>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Албан ёсны хуудас · {social.since} оноос
              </span>
              <strong>facebook.com/MongolianAuPair</strong>
            </div>
            <span>Нээх →</span>
          </a>
        </div>
      </section>
    </div>
  )
}

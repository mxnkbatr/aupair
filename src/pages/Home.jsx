import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import PortalFeed from '../components/PortalFeed'
import { universities, videos, coursesFallback, social } from '../data'
import './Home.css'

const SHORTCUTS = [
  { to: '/courses', label: 'Сургалт', hint: 'HSK 1–5' },
  { to: '/videos', label: 'Бичлэг', hint: 'Хичээл' },
  { to: '/universities', label: 'Зуучлал', hint: 'Их сургууль' },
  { to: '/profile', label: 'Холбоо', hint: '9999-1573' },
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
              <span className="eyebrow">Сургалт</span>
              <h2>Одоо нээлттэй ангиуд</h2>
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
              <span className="eyebrow">Бичлэг</span>
              <h2>Хичээлийн видео</h2>
            </div>
            <Link to="/videos" className="link-more">
              Бүгдийг үзэх →
            </Link>
          </div>

          <div className="home-videos">
            {videos.slice(0, 3).map((video) => (
              <Link key={video.id} to="/videos" className="home-video">
                <div className="home-video__thumb">
                  <img src={video.thumb} alt="" loading="lazy" />
                  <span className="home-video__shade" aria-hidden />
                  <span className="home-video__play" aria-hidden>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M9 7.2v9.6l8.2-4.8L9 7.2Z" />
                    </svg>
                  </span>
                  <span className="home-video__views">{video.views}</span>
                </div>
                <div className="home-video__meta">
                  <span className="home-video__cat">{video.category}</span>
                  <h3>{video.title}</h3>
                  <small>Facebook · HanzAcademy</small>
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
              <h2>Их сургуулиуд</h2>
            </div>
            <Link to="/universities" className="link-more">
              Жагсаалт →
            </Link>
          </div>

          <div className="home-unis">
            {universities.slice(0, 4).map((uni) => (
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
              <h2>Union Building · 1204</h2>
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
              <strong>{social.phoneAlt}</strong>
              <span>Нэмэлт утас</span>
              <a href={`mailto:${social.email}`}>{social.email}</a>
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
                Албан ёсны хуудас · {social.followers} дагагч
              </span>
              <strong>facebook.com/HanzAcademy</strong>
            </div>
            <span>Нээх →</span>
          </a>
        </div>
      </section>
    </div>
  )
}

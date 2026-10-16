import { Link } from 'react-router-dom'
import { CaretRight } from '@phosphor-icons/react'
import { newsItems } from '../data'
import Pressable from '../components/Pressable'
import './News.css'

export default function News() {
  const [hero, ...rest] = newsItems

  return (
    <div className="news">
      <header className="news-hero container">
        <h1>Мэдээ</h1>
        <p>Элсэлт · сургалт · зар</p>
      </header>

      {hero ? (
        <div className="container">
          <Pressable as={Link} to={`/news/${hero.id}`} className="news-hero-card">
            <img
              src={hero.image}
              alt=""
              loading="eager"
              onError={(e) => {
                e.currentTarget.src = '/cover.jpg'
              }}
            />
            <span className="news-hero-card__shade" aria-hidden />
            <span className="news-hero-card__body">
              <em>{hero.tag}</em>
              <strong>{hero.title}</strong>
              <small>{hero.dateLabel}</small>
            </span>
          </Pressable>
        </div>
      ) : null}

      <section className="container news-section" aria-label="Бүх мэдээ">
        <h2 className="news-section__title">Сүүлийн мэдээ</h2>
        <ul className="news-inset">
          {rest.map((item, i) => (
            <li key={item.id}>
              <Pressable as={Link} to={`/news/${item.id}`} className="news-row">
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/cover.jpg'
                  }}
                />
                <div className="news-row__text">
                  <em>{item.tag}</em>
                  <strong>{item.title}</strong>
                  <span>{item.excerpt}</span>
                  <time dateTime={item.date}>{item.dateLabel}</time>
                </div>
                <CaretRight className="news-row__chev" size={16} weight="bold" aria-hidden />
              </Pressable>
              {i < rest.length - 1 ? <hr className="news-inset__rule" /> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

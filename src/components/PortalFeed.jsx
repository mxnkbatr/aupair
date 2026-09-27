import { Link } from 'react-router-dom'
import { feed, social } from '../data'
import './PortalFeed.css'

export default function PortalFeed() {
  const { featured } = feed

  return (
    <section className="portal">
      <div className="container">
        <div className="block-head">
          <div>
            <span className="eyebrow">Мэдээлэл</span>
            <h2>Шинэ зар</h2>
          </div>
          <a
            href={social.facebook}
            className="link-more"
            target="_blank"
            rel="noreferrer"
          >
            Facebook →
          </a>
        </div>

        <div className="portal__layout">
          <Link to={featured.to} className="portal__featured">
            {featured.image ? (
              <img
                className="portal__featured-img"
                src={featured.image}
                alt=""
                loading="lazy"
              />
            ) : (
              <div className="portal__featured-bg" />
            )}
            <div className="portal__featured-shade" aria-hidden />
            <div className="portal__featured-body">
              <span className="tag">{featured.tag}</span>
              <h3>{featured.title}</h3>
              <span className="portal__meta">{featured.meta}</span>
              {featured.source ? (
                <small className="portal__source">{featured.source}</small>
              ) : null}
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}

import { useMemo, useState } from 'react'
import { videos, social } from '../data'
import PageHeader from '../components/PageHeader'
import StoriesRow from '../components/StoriesRow'
import './Videos.css'

const FILTERS = [
  { id: 'all', label: 'Бүгд' },
  { id: 'Элсэлт', label: 'Элсэлт' },
  { id: 'Герман', label: 'Герман' },
  { id: 'Reel', label: 'Reel' },
  { id: 'Мэдээ', label: 'Мэдээ' },
]

export default function Videos() {
  const [filter, setFilter] = useState('all')
  const list = useMemo(
    () =>
      filter === 'all' ? videos : videos.filter((v) => v.category === filter),
    [filter],
  )

  return (
    <div className="videos-page screen fade-up">
      <div className="container">
        <PageHeader
          title="Түүх"
          text="Au Pair-уудын түүх, бичлэг — Facebook & Instagram"
          right={
            <a
              className="btn btn-ghost videos-all"
              href={social.facebook}
              target="_blank"
              rel="noreferrer"
            >
              Бүгд →
            </a>
          }
        />

        <StoriesRow className="videos-stories" />

        <div className="page-filters" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={
                filter === f.id ? 'page-filters__btn is-active' : 'page-filters__btn'
              }
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="videos-empty">Энэ ангилалд бичлэг алга.</p>
        ) : (
          <div className="reel-grid">
            {list.map((video) => (
              <a
                key={video.id}
                className="reel-card"
                href={video.href || social.facebook}
                target="_blank"
                rel="noreferrer"
              >
                <div className="reel-card__media">
                  <img src={video.thumb} alt="" loading="lazy" />
                  <span className="reel-card__play" aria-hidden>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M9 7.2v9.6l8.2-4.8L9 7.2Z" />
                    </svg>
                  </span>
                  <span className="reel-card__views">{video.views}</span>
                </div>
                <div className="reel-card__body">
                  <span className="tag">{video.category}</span>
                  <h2>{video.title}</h2>
                  <span className="reel-card__meta">Facebook · MongolianAuPair</span>
                </div>
              </a>
            ))}
          </div>
        )}

        <a
          className="btn btn-primary videos-fb"
          href={social.facebook}
          target="_blank"
          rel="noreferrer"
        >
          facebook.com/MongolianAuPair
        </a>
      </div>
    </div>
  )
}

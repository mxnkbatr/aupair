import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarBlank, ChatCircle, PaperPlaneTilt } from '@phosphor-icons/react'
import { newsItems } from '../data'
import { useAuth } from '../auth'
import Pressable from '../components/Pressable'
import { haptic } from '../native'
import './News.css'

const COMMENTS_KEY = 'aupair-news-comments'

function loadComments(newsId) {
  try {
    const all = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}')
    return Array.isArray(all[newsId]) ? all[newsId] : []
  } catch {
    return []
  }
}

function saveComments(newsId, list) {
  try {
    const all = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}')
    all[newsId] = list.slice(0, 80)
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(all))
  } catch {
    // ignore
  }
}

const SEED = {
  n1: [
    {
      id: 'c1',
      name: 'Сараа',
      text: 'Элсэлт хэзээ хаагдах вэ?',
      at: '2026-03-12T10:00:00.000Z',
    },
    {
      id: 'c2',
      name: 'Бат',
      text: 'Зөвлөгөө авсан, маш ойлгомжтой байсан.',
      at: '2026-03-13T08:30:00.000Z',
    },
  ],
  n2: [
    {
      id: 'c3',
      name: 'Анги',
      text: 'A1 ангид суудал үлдсэн үү?',
      at: '2026-03-06T12:00:00.000Z',
    },
  ],
}

function relative(iso) {
  if (!iso) return ''
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'саяхан'
  if (mins < 60) return `${mins} мин`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h} цаг`
  return new Date(iso).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })
}

export default function NewsDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const item = newsItems.find((n) => n.id === id)
  const related = useMemo(() => {
    const rest = newsItems.filter((n) => n.id !== id)
    const sameTag = item ? rest.filter((n) => n.tag === item.tag) : []
    return [...sameTag, ...rest.filter((n) => !sameTag.includes(n))].slice(0, 4)
  }, [id, item])

  const paragraphs = item?.body?.length ? item.body : item ? [item.excerpt] : []

  const [comments, setComments] = useState([])
  const [text, setText] = useState('')

  useEffect(() => {
    if (!id) return
    const stored = loadComments(id)
    setComments(stored.length ? stored : SEED[id] || [])
    setText('')
  }, [id])

  if (!item) {
    return (
      <div className="news-detail">
        <div className="container news-detail__miss">
          <h1>Олдсонгүй</h1>
          <p>Энэ мэдээ байхгүй байна.</p>
          <Link to="/news">Мэдээ рүү</Link>
        </div>
      </div>
    )
  }

  function postComment(e) {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    const next = [
      {
        id: `c-${Date.now()}`,
        name: user?.name || 'Зочин',
        text: value.slice(0, 400),
        at: new Date().toISOString(),
      },
      ...comments,
    ]
    setComments(next)
    saveComments(id, next)
    setText('')
    haptic('success')
  }

  return (
    <div className="news-detail">
      <div className="news-detail__cover">
        <img
          src={item.image}
          alt=""
          onError={(e) => {
            e.currentTarget.src = '/cover.jpg'
          }}
        />
        <span className="news-detail__veil" aria-hidden />
        <span className="news-detail__tag">{item.tag}</span>
      </div>

      <div className="container news-detail__body">
        <article className="news-detail__card">
          <div className="news-detail__meta">
            <CalendarBlank size={14} weight="bold" aria-hidden />
            <time dateTime={item.date}>{item.dateLabel}</time>
          </div>
          <h1>{item.title}</h1>
          <p className="news-detail__lead">{item.excerpt}</p>
          {paragraphs.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </article>

        <section className="news-comments" aria-label="Сэтгэгдэл">
          <h2>
            <ChatCircle weight="fill" size={18} aria-hidden /> Сэтгэгдэл
            <em>{comments.length}</em>
          </h2>

          <form className="news-comments__form" onSubmit={postComment}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Сэтгэгдэл үлдээх…"
              maxLength={400}
              aria-label="Сэтгэгдэл"
            />
            <button type="submit" aria-label="Илгээх" disabled={!text.trim()}>
              <PaperPlaneTilt weight="fill" size={18} aria-hidden />
            </button>
          </form>

          {comments.length === 0 ? (
            <p className="news-comments__empty">Анхны сэтгэгдэл үлдээгээрэй.</p>
          ) : (
            <ul className="news-comments__list">
              {comments.map((c) => (
                <li key={c.id}>
                  <span className="news-comments__avatar" aria-hidden>
                    {String(c.name || '?')
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                  <div>
                    <strong>
                      {c.name} <time>{relative(c.at)}</time>
                    </strong>
                    <p>{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {related.length > 0 ? (
          <section className="news-related" aria-label="Бусад мэдээ">
            <h2>Бусад мэдээ</h2>
            <ul>
              {related.map((n) => (
                <li key={n.id}>
                  <Pressable as={Link} to={`/news/${n.id}`} className="news-related__row">
                    <img
                      src={n.image}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/cover.jpg'
                      }}
                    />
                    <div>
                      <em>{n.tag}</em>
                      <strong>{n.title}</strong>
                    </div>
                  </Pressable>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { stories } from '../data'
import { haptic } from '../native'
import { getSeenStories, STORIES_SEEN_EVENT } from '../storiesStore'
import StoryViewer from './StoryViewer'
import './StoriesRow.css'

/** Horizontal story circles; unseen = brand ring, seen = grey. */
export default function StoriesRow({ className = '' }) {
  const [seen, setSeen] = useState(getSeenStories)
  const [openAt, setOpenAt] = useState(null)

  useEffect(() => {
    const sync = () => setSeen(getSeenStories())
    window.addEventListener(STORIES_SEEN_EVENT, sync)
    return () => window.removeEventListener(STORIES_SEEN_EVENT, sync)
  }, [])

  return (
    <>
      <div className={`stories-row ${className}`} aria-label="Түүхүүд">
        {stories.map((story, i) => {
          const isSeen = seen.includes(story.id)
          return (
            <button
              key={story.id}
              type="button"
              className={`stories-row__item${isSeen ? ' is-seen' : ''}`}
              onClick={() => {
                haptic('light')
                setOpenAt(i)
              }}
            >
              <span className="stories-row__ring">
                <img src={story.cover} alt="" loading="lazy" />
              </span>
              <span className="stories-row__label">{story.title}</span>
            </button>
          )
        })}
      </div>
      {openAt !== null && (
        <StoryViewer stories={stories} startIndex={openAt} onClose={() => setOpenAt(null)} />
      )}
    </>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { X } from '@phosphor-icons/react'
import { haptic } from '../native'
import { markStorySeen } from '../storiesStore'
import './StoryViewer.css'

/**
 * Fullscreen Instagram-style story viewer.
 * Tap right/left = next/prev, hold = pause, swipe down = close. Marks each story seen.
 */
export default function StoryViewer({ stories, startIndex = 0, onClose }) {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [storyIndex, setStoryIndex] = useState(startIndex)
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)

  const story = stories[storyIndex]
  const slides = story?.slides || []
  const current = slides[slide]

  useEffect(() => {
    if (story) markStorySeen(story.id)
  }, [story])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const next = useCallback(() => {
    if (slide + 1 < slides.length) {
      setSlide(slide + 1)
    } else if (storyIndex + 1 < stories.length) {
      setStoryIndex(storyIndex + 1)
      setSlide(0)
    } else {
      onClose()
    }
  }, [slide, slides.length, storyIndex, stories.length, onClose])

  const prev = useCallback(() => {
    if (slide > 0) {
      setSlide(slide - 1)
    } else if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1)
      setSlide(0)
    }
  }, [slide, storyIndex])

  if (!story || !current) return null

  return createPortal(
    <motion.div
      className="story-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={story.title}
      initial={reduce ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      drag="y"
      dragDirectionLock
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.7 }}
      onDragEnd={(_e, info) => {
        if (info.offset.y > 120 || info.velocity.y > 700) {
          haptic('light')
          onClose()
        }
      }}
    >
      <img key={`${story.id}-${slide}`} className="story-viewer__img" src={current.image} alt="" draggable={false} />
      <div className="story-viewer__shade" aria-hidden />

      <div className="story-viewer__top">
        <div className="story-viewer__bars" aria-hidden>
          {slides.map((_, i) => (
            <span key={`${story.id}-${i}`} className="story-viewer__bar">
              <i
                className={
                  i < slide
                    ? 'is-full'
                    : i === slide
                      ? `is-run${paused ? ' is-paused' : ''}${reduce ? ' is-full' : ''}`
                      : ''
                }
                onAnimationEnd={i === slide && !reduce ? next : undefined}
              />
            </span>
          ))}
        </div>
        <div className="story-viewer__head">
          <img src={story.cover} alt="" />
          <strong>{story.title}</strong>
          <button type="button" className="story-viewer__close" onClick={onClose} aria-label="Хаах">
            <X weight="bold" size={22} />
          </button>
        </div>
      </div>

      <div className="story-viewer__zones">
        <motion.button
          type="button"
          className="story-viewer__zone story-viewer__zone--prev"
          aria-label="Өмнөх"
          onTap={() => {
            haptic('selection')
            prev()
          }}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onPointerCancel={() => setPaused(false)}
        />
        <motion.button
          type="button"
          className="story-viewer__zone story-viewer__zone--next"
          aria-label="Дараах"
          onTap={() => {
            haptic('selection')
            next()
          }}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onPointerCancel={() => setPaused(false)}
        />
      </div>

      <div className="story-viewer__caption">
        <h2>{current.title}</h2>
        <p>{current.text}</p>
        {current.cta ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onClose()
              navigate(current.cta.to)
            }}
          >
            {current.cta.label}
          </button>
        ) : null}
      </div>
    </motion.div>,
    document.body,
  )
}

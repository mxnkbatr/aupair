import { useState } from 'react'
import { haptic, shareLink } from '../native'
import { social } from '../data'
import './ShareButton.css'

export default function ShareButton({ title, text, className = '' }) {
  const [copied, setCopied] = useState(false)

  async function onClick() {
    haptic()
    const res = await shareLink({ title, text: `${text || title} · ${social.phone}` })
    if (res === 'copied') {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <button
      type="button"
      className={`share-btn ${className}`}
      onClick={onClick}
      aria-label="Хуваалцах"
    >
      {copied ? (
        <span className="share-btn__copied">Хуулсан</span>
      ) : (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden>
          <path
            d="M12 3.5v11M7.5 8 12 3.5 16.5 8M5 13.5v4.2A1.8 1.8 0 0 0 6.8 19.5h10.4a1.8 1.8 0 0 0 1.8-1.8v-4.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}

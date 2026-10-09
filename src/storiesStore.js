const SEEN_KEY = 'aupair-stories-seen'
const EVENT = 'aupair:stories-seen'

export function getSeenStories() {
  try {
    const raw = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export function markStorySeen(id) {
  const seen = getSeenStories()
  if (seen.includes(id)) return
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, id]))
  } catch {
    // storage unavailable
  }
  window.dispatchEvent(new Event(EVENT))
}

export const STORIES_SEEN_EVENT = EVENT

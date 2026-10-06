import { useEffect, useState } from 'react'
import { dayKey } from './wordBank'

const KEY = 'aupair-german-progress'
const EVENT = 'aupair:german-progress'
const XP_PER_CORRECT = 10
const DAILY_BONUS = 20

const EMPTY = { xp: 0, streak: 0, best: 0, lastDay: '', days: {}, played: 0 }

export function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null')
    return raw && typeof raw === 'object' ? { ...EMPTY, ...raw } : { ...EMPTY }
  } catch {
    return { ...EMPTY }
  }
}

function save(progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress))
  } catch {
    // storage unavailable
  }
  window.dispatchEvent(new Event(EVENT))
}

function daysBetween(a, b) {
  const toMs = (s) => {
    const [y, m, d] = s.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((toMs(b) - toMs(a)) / 86400000)
}

/** Streak shown to the user: broken if the last practice day is older than yesterday. */
export function liveStreak(progress = loadProgress(), today = dayKey()) {
  if (!progress.lastDay) return 0
  return daysBetween(progress.lastDay, today) <= 1 ? progress.streak : 0
}

export function practicedToday(progress = loadProgress(), today = dayKey()) {
  return progress.lastDay === today
}

/** Record a finished quiz. Returns { xpGained, streak, firstToday }. */
export function recordQuiz(score, total, today = dayKey()) {
  const p = loadProgress()
  const firstToday = p.lastDay !== today
  let streak = p.streak
  if (firstToday) {
    streak = p.lastDay && daysBetween(p.lastDay, today) === 1 ? p.streak + 1 : 1
  }
  const xpGained = score * XP_PER_CORRECT + (firstToday ? DAILY_BONUS : 0)
  save({
    ...p,
    xp: p.xp + xpGained,
    streak,
    best: Math.max(p.best, streak),
    lastDay: today,
    played: p.played + 1,
    days: { ...p.days, [today]: Math.max(p.days[today] || 0, Math.round((score / total) * 100)) },
  })
  return { xpGained, streak, firstToday }
}

export function levelFromXp(xp) {
  const level = Math.floor(xp / 100) + 1
  return { level, into: xp % 100, next: 100 }
}

/** React hook: always the latest progress, synced across screens. */
export function useGermanProgress() {
  const [progress, setProgress] = useState(loadProgress)
  useEffect(() => {
    const sync = () => setProgress(loadProgress())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  return { ...progress, liveStreak: liveStreak(progress), today: practicedToday(progress) }
}

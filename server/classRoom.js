/** Shared classroom schedule + chat helpers. */

export const WEEKDAY_LABELS = {
  1: 'Даваа',
  2: 'Мягмар',
  3: 'Лхагва',
  4: 'Пүрэв',
  5: 'Баасан',
  6: 'Бямба',
  0: 'Ням',
}

export function normalizeWeekdays(list) {
  if (!Array.isArray(list)) return []
  return [...new Set(list.map((n) => Number(n)).filter((n) => n >= 0 && n <= 6))].sort()
}

export function normalizeSchedule(raw = {}) {
  const time = String(raw.time || '').trim()
  const okTime = /^\d{1,2}:\d{2}$/.test(time) ? time.slice(0, 5) : ''
  return {
    weekdays: normalizeWeekdays(raw.weekdays),
    time: okTime,
    teacherName: String(raw.teacherName || '').trim().slice(0, 80),
    room: String(raw.room || '').trim().slice(0, 80),
    note: String(raw.note || '').trim().slice(0, 200),
  }
}

export function formatSchedule(schedule) {
  if (!schedule?.time || !schedule.weekdays?.length) return ''
  const days = schedule.weekdays.map((d) => WEEKDAY_LABELS[d] || d).join(', ')
  return `${days} · ${schedule.time}`
}

/** Next occurrence of schedule from `from` (Date). */
export function nextClassAt(schedule, from = new Date()) {
  if (!schedule?.time || !schedule.weekdays?.length) return null
  const [hh, mm] = schedule.time.split(':').map((n) => Number(n))
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null

  for (let add = 0; add < 8; add += 1) {
    const d = new Date(from)
    d.setDate(d.getDate() + add)
    d.setSeconds(0, 0)
    if (!schedule.weekdays.includes(d.getDay())) continue
    d.setHours(hh, mm, 0, 0)
    if (d.getTime() > from.getTime() - 60_000) return d
  }
  return null
}

export function isClassSoon(schedule, withinMs = 2 * 60 * 60 * 1000) {
  const next = nextClassAt(schedule)
  if (!next) return false
  const diff = next.getTime() - Date.now()
  return diff >= -15 * 60_000 && diff <= withinMs
}

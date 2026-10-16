/**
 * Сургалтын хуваарь + ирц mock.
 * Бодит өгөгдөл: classGroups.schedule / enrollment.attendanceCount / homework (API).
 * Mock унтраах: CLASS_PROGRESS_USE_MOCK = false
 */

export const CLASS_PROGRESS_USE_MOCK = true

const DAY = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба']

/** Даваа=1, Лхагва=3, Баасан=5 · 18:00 */
export const CLASS_SCHEDULE_MOCK = {
  source: 'mock',
  weekdays: [1, 3, 5],
  time: '18:00',
  teacherName: 'Б. Саруул',
  room: 'Zoom · A1 анги',
  scheduleLabel: 'Даваа, Лхагва, Баасан · 18:00',
  nextHint: 'Дараагийн хичээл: Даваа 18:00',
}

export const CLASS_ATTENDANCE_MOCK = {
  source: 'mock',
  count: 6,
  totalSessions: 12,
  rate: 50,
  sessions: [
    { id: 'a1', date: '2026-03-02', label: 'Даваа 3/2', status: 'present', topic: 'Мэндчилгээ · танилцах' },
    { id: 'a2', date: '2026-03-04', label: 'Лхагва 3/4', status: 'present', topic: 'Үйл үг sein' },
    { id: 'a3', date: '2026-03-06', label: 'Баасан 3/6', status: 'absent', topic: 'Гэр бүл' },
    { id: 'a4', date: '2026-03-09', label: 'Даваа 3/9', status: 'present', topic: 'Тоо · цаг' },
    { id: 'a5', date: '2026-03-11', label: 'Лхагва 3/11', status: 'present', topic: 'Хоол · ресторан' },
    { id: 'a6', date: '2026-03-13', label: 'Баасан 3/13', status: 'late', topic: 'Ярианы дасгал' },
    { id: 'a7', date: '2026-03-16', label: 'Даваа 3/16', status: 'present', topic: 'Ажил · мэргэжил' },
    { id: 'a8', date: '2026-03-18', label: 'Лхагва 3/18', status: 'present', topic: 'Чөлөөт цаг' },
  ],
}

export const CLASS_HOMEWORK_MOCK = [
  { id: 'hw-m1', title: 'Үгсийн жагсаалт цээжлэх', hint: 'Хичээл 1–2 · 20 үг', status: 'done' },
  { id: 'hw-m2', title: 'Ярианы дасгал', hint: '1 мин бичлэг илгээх', status: 'done' },
  { id: 'hw-m3', title: 'Дүрмийн worksheet', hint: 'sein / haben', status: 'pending' },
  { id: 'hw-m4', title: 'Богино захидал', hint: 'Гэр бүлийнхээ тухай 5 өгүүлбэр', status: 'pending' },
]

export function formatWeekdays(weekdays = []) {
  return weekdays.map((d) => DAY[d] || '').filter(Boolean).join(', ')
}

/**
 * @returns schedule view-model (API эсвэл mock)
 */
export function resolveClassSchedule({ meta, group } = {}) {
  const apiLabel = meta?.scheduleLabel
  const apiSched = group?.schedule
  if (apiLabel || apiSched?.time) {
    return {
      source: 'api',
      scheduleLabel:
        apiLabel ||
        `${formatWeekdays(apiSched.weekdays || [])} · ${apiSched.time}`,
      nextClassAt: meta?.nextClassAt || null,
      soon: Boolean(meta?.soon),
      teacherName: group?.teacherName || apiSched?.teacherName || '',
      room: apiSched?.room || '',
      nextHint: null,
    }
  }
  if (!CLASS_PROGRESS_USE_MOCK) return null
  return { ...CLASS_SCHEDULE_MOCK }
}

/**
 * Merge enrollment with mock attendance/homework when API хоосон.
 */
export function resolveClassProgress(enroll) {
  if (!enroll) return null
  const apiHw = Array.isArray(enroll.homework) ? enroll.homework : []
  const hasHw = apiHw.length > 0
  const hasAtt = typeof enroll.attendanceCount === 'number' && enroll.attendanceCount > 0

  // Багш тавьсан бодит даалгавар байвал түүнийг үргэлж харуулна
  if (hasHw) {
    return {
      source: 'api',
      attendanceCount: hasAtt
        ? enroll.attendanceCount
        : CLASS_PROGRESS_USE_MOCK
          ? CLASS_ATTENDANCE_MOCK.count
          : enroll.attendanceCount ?? 0,
      totalSessions: hasAtt ? null : CLASS_PROGRESS_USE_MOCK ? CLASS_ATTENDANCE_MOCK.totalSessions : null,
      rate: hasAtt ? null : CLASS_PROGRESS_USE_MOCK ? CLASS_ATTENDANCE_MOCK.rate : null,
      sessions: hasAtt ? [] : CLASS_PROGRESS_USE_MOCK ? CLASS_ATTENDANCE_MOCK.sessions : [],
      homework: apiHw,
    }
  }

  if (!CLASS_PROGRESS_USE_MOCK) {
    return {
      source: 'api',
      attendanceCount: enroll.attendanceCount ?? 0,
      homework: apiHw,
      sessions: [],
      rate: null,
      totalSessions: null,
    }
  }

  return {
    source: 'mock',
    attendanceCount: hasAtt ? enroll.attendanceCount : CLASS_ATTENDANCE_MOCK.count,
    totalSessions: CLASS_ATTENDANCE_MOCK.totalSessions,
    rate: CLASS_ATTENDANCE_MOCK.rate,
    sessions: CLASS_ATTENDANCE_MOCK.sessions,
    homework: CLASS_HOMEWORK_MOCK,
  }
}

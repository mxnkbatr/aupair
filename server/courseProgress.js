/** Default homework seeded when a language course enrollment is accepted. */

export const HW_STATUSES = ['pending', 'done']

export function defaultHomework(courseId = '') {
  const id = String(courseId || '')
  const base = [
    { title: 'Үгсийн жагсаалт цээжлэх', hint: 'Хичээлийн шинэ үгс' },
    { title: 'Ярианы дасгал', hint: 'Богино бичлэг илгээх' },
    { title: 'Дүрмийн дасгал', hint: 'Ном / worksheet' },
  ]
  if (id.includes('a2') || id.includes('A2')) {
    base.push({ title: 'Goethe A2 дасгал', hint: 'Шалгалтын жишээ' })
  }
  return base.map((item, i) => ({
    id: `hw-${i + 1}`,
    title: item.title,
    hint: item.hint,
    status: 'pending',
    note: '',
    updatedAt: null,
  }))
}

export function normalizeHomework(list) {
  if (!Array.isArray(list)) return []
  return list
    .map((item, i) => ({
      id: cleanId(item?.id) || `hw-${i + 1}`,
      title: String(item?.title || '').trim().slice(0, 120) || `Даалгавар ${i + 1}`,
      hint: String(item?.hint || '').trim().slice(0, 160),
      status: HW_STATUSES.includes(item?.status) ? item.status : 'pending',
      note: String(item?.note || '').trim().slice(0, 300),
      updatedAt: item?.updatedAt || null,
    }))
    .slice(0, 20)
}

function cleanId(value) {
  return value == null ? '' : String(value).trim().slice(0, 40)
}

export function homeworkSummary(list) {
  const homework = normalizeHomework(list)
  const done = homework.filter((h) => h.status === 'done').length
  return { total: homework.length, done, pending: homework.length - done }
}

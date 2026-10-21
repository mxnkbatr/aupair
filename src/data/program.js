/** Client-side labels mirroring server/program.js */

export const PROGRAM_CATEGORY_LABELS = {
  vip: 'VIP (2 талын тийз)',
  bonus: 'Bonus (1 талын тийз)',
  standard: 'Стандарт',
}

export const PROGRAM_STAGES = [
  { id: 1, label: 'Бичиг баримт', hint: 'Паспорт · CV · зураг', short: 'Баримт' },
  { id: 2, label: 'Тохироо', hint: 'Профайл · гэр бүл хайх', short: 'Тохироо' },
  { id: 3, label: 'Ярилцлага', hint: 'Ярилцлага · гэрээ', short: 'Ярилцлага' },
  { id: 4, label: 'Виз', hint: 'Виз · даатгал · тов', short: 'Виз' },
  { id: 5, label: 'Баталгаажсан', hint: 'Тийз · явах бэлтгэл', short: 'Батлагдсан' },
]

export const DOC_STATUS_LABELS = {
  empty: 'Илгээгээгүй',
  submitted: 'Шалгуулж байна',
  approved: 'Зөвшөөрсөн',
  rejected: 'Засах хэрэгтэй',
}

export const ATTENDANCE_STATUS_LABELS = {
  present: 'Ирсэн',
  late: 'Хоцорсон',
  absent: 'Тасалсан',
  leave: 'Чөлөө',
}

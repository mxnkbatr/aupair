/** Client-side labels mirroring server/program.js (for UI without waiting on API). */

export const PROGRAM_CATEGORY_LABELS = {
  vip: 'VIP (2 талын тийз)',
  bonus: 'Bonus (1 талын тийз)',
  standard: 'Стандарт',
}

export const PROGRAM_STAGES = [
  { id: 1, label: 'Ангилал', hint: 'Баримт · эрүүл мэнд · хэлний түвшин' },
  { id: 2, label: 'Профайл бэлтгэл', hint: 'Collage · видео · orientation · checklist' },
  { id: 3, label: 'Зочин айл', hint: 'Санал · ярилцлага · гэрээ' },
  { id: 4, label: 'Виз', hint: 'A1/A2 · ЭСЯ · виз мэдүүлэг' },
  { id: 5, label: 'Германд', hint: 'Бүртгэл · курс · гэрээний дүрэм' },
]

export const DOC_STATUS_LABELS = {
  empty: 'Илгээгээгүй',
  submitted: 'Шалгуулж байна',
  approved: 'Зөвшөөрсөн',
  rejected: 'Засах хэрэгтэй',
}

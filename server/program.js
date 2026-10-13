/** Ayusa / MAPA program checklist + stage labels (admin-gated enrollment). */

export const PROGRAM_CATEGORIES = ['vip', 'bonus', 'standard']

export const PROGRAM_CATEGORY_LABELS = {
  vip: 'VIP (2 талын тийз)',
  bonus: 'Bonus (1 талын тийз)',
  standard: 'Стандарт',
}

/** 5 stages from client process architecture */
export const PROGRAM_STAGES = [
  { id: 1, label: 'Ангилал', hint: 'Баримт · эрүүл мэнд · хэлний түвшин' },
  { id: 2, label: 'Профайл бэлтгэл', hint: 'Collage · видео · orientation · checklist' },
  { id: 3, label: 'Зочин айл', hint: 'Санал · ярилцлага · гэрээ' },
  { id: 4, label: 'Виз', hint: 'A1/A2 · ЭСЯ · виз мэдүүлэг' },
  { id: 5, label: 'Германд', hint: 'Бүртгэл · курс · гэрээний дүрэм' },
]

export const DOC_STATUSES = ['empty', 'submitted', 'approved', 'rejected']

/** 13 materials from Checklist_Ayusa_App.xlsx */
export const PROGRAM_DOCS = [
  { key: 'photos', label: 'Profile зураг', hint: '3–5 чанартай зураг (линк эсвэл Drive)' },
  { key: 'application', label: 'Au pair application PDF', hint: 'Writable PDF digital бөглөсөн' },
  { key: 'letter', label: 'Host family letter', hint: '1 нүүр захидал' },
  { key: 'collage', label: 'Photo collage', hint: '2 нүүр · ≥4 хүүхэдтэй зураг' },
  { key: 'video', label: 'Au pair video', hint: '≤2 мин · YouTube unlisted линк' },
  { key: 'medical', label: 'Medical form', hint: 'Эмч гарын үсэг · тамга' },
  { key: 'childcare1', label: 'Childcare reference #1', hint: 'Хүүхэд асарсан лавлагаа' },
  { key: 'childcare2', label: 'Childcare reference #2', hint: 'Хоёр дахь лавлагаа' },
  { key: 'character', label: 'Character reference', hint: 'Хамаатан биш' },
  { key: 'background', label: 'Ял шийтгэлгүй тодорхойлолт', hint: 'eMongolia / цагдаа' },
  { key: 'license', label: 'Жолооны үнэмлэх', hint: 'Зөвхөн байвал' },
  { key: 'passport', label: 'Паспортын хуулбар', hint: '+6 сар хүчинтэй' },
  { key: 'german', label: 'Герман хэлний сертификат', hint: 'A1+ · match/визийн өмнө' },
]

export function emptyChecklist() {
  return PROGRAM_DOCS.map((d) => ({
    key: d.key,
    label: d.label,
    hint: d.hint,
    link: '',
    note: '',
    status: 'empty',
    adminNote: '',
    updatedAt: null,
  }))
}

export function mergeChecklist(existing) {
  const byKey = new Map((existing || []).map((d) => [d.key, d]))
  return PROGRAM_DOCS.map((meta) => {
    const prev = byKey.get(meta.key)
    if (!prev) {
      return {
        key: meta.key,
        label: meta.label,
        hint: meta.hint,
        link: '',
        note: '',
        status: 'empty',
        adminNote: '',
        updatedAt: null,
      }
    }
    return {
      key: meta.key,
      label: meta.label,
      hint: meta.hint,
      link: String(prev.link || ''),
      note: String(prev.note || ''),
      status: DOC_STATUSES.includes(prev.status) ? prev.status : 'empty',
      adminNote: String(prev.adminNote || ''),
      updatedAt: prev.updatedAt || null,
    }
  })
}

export function checklistSummary(checklist) {
  const list = checklist || []
  const approved = list.filter((d) => d.status === 'approved').length
  const submitted = list.filter((d) => d.status === 'submitted').length
  const rejected = list.filter((d) => d.status === 'rejected').length
  return { total: list.length, approved, submitted, rejected }
}

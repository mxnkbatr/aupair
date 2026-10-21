/** Au Pair program checklist + stage labels (admin-gated enrollment). */

export const PROGRAM_CATEGORIES = ['vip', 'bonus', 'standard']

export const PROGRAM_CATEGORY_LABELS = {
  vip: 'VIP (2 талын тийз)',
  bonus: 'Bonus (1 талын тийз)',
  standard: 'Стандарт',
}

/** Гол процесс: Бичиг баримт → Тохироо → Ярилцлага → Виз → Баталгаажсан */
export const PROGRAM_STAGES = [
  { id: 1, label: 'Бичиг баримт', hint: 'Паспорт · CV · зураг' },
  { id: 2, label: 'Тохироо', hint: 'Профайл · гэр бүл хайх' },
  { id: 3, label: 'Ярилцлага', hint: 'Ярилцлага · гэрээ' },
  { id: 4, label: 'Виз', hint: 'Виз · даатгал · тов' },
  { id: 5, label: 'Баталгаажсан', hint: 'Тийз · явах бэлтгэл' },
]

export const DOC_STATUSES = ['empty', 'submitted', 'approved', 'rejected']

export const ATTENDANCE_STATUSES = ['present', 'late', 'absent', 'leave']

export const ATTENDANCE_STATUS_LABELS = {
  present: 'Ирсэн',
  late: 'Хоцорсон',
  absent: 'Тасалсан',
  leave: 'Чөлөө',
}

/**
 * Materials by stage. `stage` = when this doc unlocks / is required.
 * Legacy Ayusa keys kept so old checklists still merge.
 */
export const PROGRAM_DOCS = [
  { key: 'passport', label: 'Паспортын хуулбар', hint: '+6 сар хүчинтэй', stage: 1, required: true },
  { key: 'cv', label: 'CV / намтар', hint: 'PDF эсвэл Drive линк', stage: 1, required: true },
  { key: 'photos', label: 'Profile зураг', hint: '3–5 чанартай зураг', stage: 1, required: true },
  { key: 'application', label: 'Au pair application', hint: 'Бөглөсөн маягт', stage: 2, required: true },
  { key: 'letter', label: 'Host family letter', hint: '1 нүүр захидал', stage: 2, required: true },
  { key: 'collage', label: 'Photo collage', hint: 'Хүүхэдтэй зураг', stage: 2, required: false },
  { key: 'video', label: 'Au pair video', hint: '≤2 мин · YouTube линк', stage: 2, required: true },
  { key: 'medical', label: 'Medical form', hint: 'Эмч гарын үсэг', stage: 2, required: true },
  { key: 'childcare1', label: 'Childcare reference #1', hint: 'Лавлагаа', stage: 2, required: true },
  { key: 'childcare2', label: 'Childcare reference #2', hint: 'Хоёр дахь лавлагаа', stage: 2, required: false },
  { key: 'character', label: 'Character reference', hint: 'Хамаатан биш', stage: 2, required: false },
  { key: 'background', label: 'Ял шийтгэлгүй тодорхойлолт', hint: 'eMongolia / цагдаа', stage: 2, required: true },
  { key: 'license', label: 'Жолооны үнэмлэх', hint: 'Зөвхөн байвал', stage: 2, required: false },
  { key: 'german', label: 'Хэлний сертификат', hint: 'A1+ (улсаас хамаарна)', stage: 3, required: true },
  { key: 'visa', label: 'Визний мэдүүлэг', hint: 'ЭСЯ / виз баримт', stage: 4, required: true },
  { key: 'insurance', label: 'Даатгал', hint: 'Эрүүл мэнд / аялал', stage: 4, required: true },
  { key: 'ticket', label: 'Тийз / нислэг', hint: 'Баталгаажсан захиалга', stage: 5, required: true },
]

export function emptyChecklist() {
  return PROGRAM_DOCS.map((d) => ({
    key: d.key,
    label: d.label,
    hint: d.hint,
    stage: d.stage,
    required: Boolean(d.required),
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
        stage: meta.stage,
        required: Boolean(meta.required),
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
      stage: meta.stage,
      required: Boolean(meta.required),
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

/** Current stage-ийн required docs бүгд approved бол дараагийн шат. */
export function nextStageAfterChecklist(checklist, currentStage = 1) {
  const stage = Math.min(5, Math.max(1, Number(currentStage) || 1))
  if (stage >= 5) return 5
  const docs = mergeChecklist(checklist).filter((d) => d.stage === stage && d.required)
  if (docs.length === 0) return stage
  const allOk = docs.every((d) => d.status === 'approved')
  return allOk ? stage + 1 : stage
}

/** Placement % → A1/A2 (75+ = A2). */
export function courseLevelFromPlacementPercent(percent) {
  const p = Number(percent)
  if (!Number.isFinite(p)) return 'A1'
  return p >= 75 ? 'A2' : 'A1'
}

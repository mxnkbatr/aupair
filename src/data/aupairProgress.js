/**
 * Au Pair үйл явц — улс бүрийн шат + mock.
 * Бодит өгөгдөл: user.inProgram + programChecklist / programStage (API).
 * Mock-ийг унтраах: AUPAIR_PROGRESS_USE_MOCK = false
 */

import { PROGRAM_STAGES as DEFAULT_STAGES } from './program'

/** true = Австри mock харуулна (админ/API бэлэн болохоос өмнө). */
export const AUPAIR_PROGRESS_USE_MOCK = true

const DOC_LABELS = [
  { key: 'photos', label: 'Profile зураг' },
  { key: 'application', label: 'Au pair application PDF' },
  { key: 'letter', label: 'Host family letter' },
  { key: 'collage', label: 'Photo collage' },
  { key: 'video', label: 'Au pair video' },
  { key: 'medical', label: 'Medical form' },
  { key: 'childcare1', label: 'Childcare reference #1' },
  { key: 'childcare2', label: 'Childcare reference #2' },
  { key: 'character', label: 'Character reference' },
  { key: 'background', label: 'Ял шийтгэлгүй тодорхойлолт' },
  { key: 'license', label: 'Жолооны үнэмлэх' },
  { key: 'passport', label: 'Паспортын хуулбар' },
  { key: 'german', label: 'Герман хэлний сертификат' },
]

function stagesForCountry(countryId) {
  const dest =
    countryId === 'austria'
      ? 'Австрид'
      : countryId === 'germany'
        ? 'Германд'
        : countryId === 'france'
          ? 'Францад'
          : 'Европт'

  const shorts = ['Ангилал', 'Профайл', 'Айл', 'Виз', dest.replace(/д$/, '') || dest]
  return DEFAULT_STAGES.map((s, i) =>
    s.id === 5
      ? { ...s, label: dest, short: shorts[i], hint: `Бүртгэл · курс · гэрээний дүрэм · ${dest}` }
      : { ...s, short: shorts[i] },
  )
}

/** Австри — UI preview mock (дараа API-аас солино). */
export const AUSTRIA_PROGRESS_MOCK = {
  countryId: 'austria',
  countryTitle: 'Австри Au Pair',
  source: 'mock',
  stage: 2,
  category: 'standard',
  note: 'Orientation уулзалт: Даваа 18:00 · Zoom',
  scheduleLabel: 'Даваа, Пүрэв · 18:00',
  stages: stagesForCountry('austria'),
  docs: [
    { key: 'photos', label: 'Profile зураг', status: 'approved' },
    { key: 'application', label: 'Au pair application PDF', status: 'approved' },
    { key: 'letter', label: 'Host family letter', status: 'submitted' },
    { key: 'collage', label: 'Photo collage', status: 'submitted' },
    { key: 'video', label: 'Au pair video', status: 'empty' },
    { key: 'medical', label: 'Medical form', status: 'empty' },
    { key: 'childcare1', label: 'Childcare reference #1', status: 'empty' },
    { key: 'childcare2', label: 'Childcare reference #2', status: 'empty' },
    { key: 'character', label: 'Character reference', status: 'empty' },
    { key: 'background', label: 'Ял шийтгэлгүй тодорхойлолт', status: 'empty' },
    { key: 'license', label: 'Жолооны үнэмлэх', status: 'empty' },
    { key: 'passport', label: 'Паспортын хуулбар', status: 'rejected' },
    { key: 'german', label: 'Герман хэлний сертификат', status: 'empty' },
  ],
}

function summarize(docs) {
  const total = docs.length
  let approved = 0
  let submitted = 0
  let rejected = 0
  for (const d of docs) {
    if (d.status === 'approved') approved += 1
    else if (d.status === 'submitted') submitted += 1
    else if (d.status === 'rejected') rejected += 1
  }
  return { total, approved, submitted, rejected }
}

function hasLiveProgress(user) {
  if (!user?.inProgram) return false
  const list = user.programChecklist || []
  if (list.some((d) => d.status && d.status !== 'empty')) return true
  if (Number(user.programStage) > 1) return true
  if (user.programNote) return true
  return false
}

function fromUser(user, countryId, countryTitle) {
  const id = countryId || 'germany'
  const stages = stagesForCountry(id)
  const stage = Math.min(5, Math.max(1, Number(user.programStage) || 1))
  const docs = (user.programChecklist || []).map((d) => ({
    key: d.key,
    label: d.label || DOC_LABELS.find((x) => x.key === d.key)?.label || d.key,
    status: d.status || 'empty',
    link: d.link,
    note: d.note,
    adminNote: d.adminNote,
  }))
  const filled =
    docs.length > 0
      ? docs
      : DOC_LABELS.map((d) => ({ ...d, status: 'empty' }))

  return {
    countryId: id,
    countryTitle: countryTitle || `${id} Au Pair`,
    source: 'api',
    stage,
    category: user.programCategory || 'standard',
    note: user.programNote || '',
    scheduleLabel: '',
    stages,
    docs: filled,
    summary: user.programSummary || summarize(filled),
  }
}

/**
 * @returns {null | object} progress view-model
 * Зочин / зөвшөөрөөгүй улс → null (mock ч харуулахгүй).
 */
export function resolveAuPairProgress({ user, enrollments = [] } = {}) {
  const countryEnroll = enrollments.find(
    (e) => e.kind === 'country' && e.status === 'accepted',
  )
  const enrolled = Boolean(countryEnroll || user?.inProgram)
  if (!enrolled) return null

  const countryId = countryEnroll?.courseId || null
  const countryTitle = countryEnroll?.courseTitle || null

  if (hasLiveProgress(user)) {
    return fromUser(user, countryId || 'germany', countryTitle)
  }

  // Элссэн боловч API checklist хоосон үед Австри mock (preview)
  if (AUPAIR_PROGRESS_USE_MOCK && (countryId === 'austria' || !countryId)) {
    const mock = { ...AUSTRIA_PROGRESS_MOCK }
    mock.summary = summarize(mock.docs)
    if (countryTitle) mock.countryTitle = countryTitle
    return mock
  }

  return fromUser(user || { inProgram: true, programStage: 1 }, countryId, countryTitle)
}

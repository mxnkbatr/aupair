/**
 * Au Pair улс тохируулах асуулга — хариултаар Герман / АНУ / Австри гэх мэт санал болгоно.
 */

export const COUNTRY_MATCH_QUESTIONS = [
  {
    id: 'lang',
    prompt: 'Аль хэлийг голлон сурах / ашиглах вэ?',
    options: [
      { id: 'de', label: 'Герман хэл', tags: { germany: 3, austria: 3, switzerland: 2 } },
      { id: 'en', label: 'Англи хэл', tags: { usa: 3, netherlands: 2, denmark: 2 } },
      { id: 'fr', label: 'Франц хэл', tags: { france: 3, belgium: 2, switzerland: 1 } },
      { id: 'any', label: 'Хамаагүй / олон хэл', tags: { germany: 1, usa: 1, austria: 1, france: 1 } },
    ],
  },
  {
    id: 'budget',
    prompt: 'Зардлын хүлээлт?',
    options: [
      { id: 'low', label: 'Бага зардал (хоол байр + халаасны мөнгө)', tags: { germany: 2, austria: 2, france: 1 } },
      { id: 'med', label: 'Дунд (хэлний курс + визний зардалтай)', tags: { germany: 2, usa: 1, austria: 2 } },
      { id: 'high', label: 'Өндөр (АНУ / нэмэлт төлбөртэй хөтөлбөр)', tags: { usa: 3, switzerland: 2 } },
    ],
  },
  {
    id: 'kids',
    prompt: 'Хүүхэд харах туршлага / хүсэл?',
    options: [
      { id: 'exp', label: 'Туршлагатай (нялх/сургуулийн нас)', tags: { germany: 2, usa: 2, austria: 2 } },
      { id: 'learn', label: 'Сурах хүсэлтэй', tags: { germany: 1, austria: 1, france: 1 } },
      { id: 'older', label: 'Том хүүхэд илүү тохиромжтой', tags: { usa: 2, netherlands: 1, denmark: 1 } },
    ],
  },
  {
    id: 'visa',
    prompt: 'Виз / хугацаа?',
    options: [
      { id: 'eu6', label: '6–12 сар Европын виз', tags: { germany: 3, austria: 3, france: 2, netherlands: 1 } },
      { id: 'us1y', label: 'АНУ ~1 жил (J-1 төрөл)', tags: { usa: 4 } },
      { id: 'flex', label: 'Уян хатан', tags: { germany: 1, austria: 1, usa: 1 } },
    ],
  },
  {
    id: 'life',
    prompt: 'Амьдралын хэв маяг?',
    options: [
      { id: 'city', label: 'Том хот (Берлин, Вена, Нью-Йорк…)', tags: { germany: 2, austria: 2, usa: 2, france: 2 } },
      { id: 'calm', label: 'Амар тайван / жижиг хот', tags: { austria: 2, denmark: 2, switzerland: 2, netherlands: 1 } },
      { id: 'adventure', label: 'Адал явдал / шинэ соёл', tags: { usa: 3, france: 1, germany: 1 } },
    ],
  },
]

/** @returns {{ id: string, score: number }[]} sorted best-first */
export function rankCountriesFromAnswers(answers) {
  const scores = Object.create(null)
  for (const q of COUNTRY_MATCH_QUESTIONS) {
    const pickedId = answers[q.id]
    const opt = q.options.find((o) => o.id === pickedId)
    if (!opt) continue
    for (const [countryId, pts] of Object.entries(opt.tags || {})) {
      scores[countryId] = (scores[countryId] || 0) + pts
    }
  }
  return Object.entries(scores)
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score)
}

export function placementLevelFromPercent(percent) {
  return Number(percent) >= 75 ? 'A2' : 'A1'
}

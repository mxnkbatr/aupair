import { dailyWords } from '../../data'

/** Extra Au Pair-flavoured vocabulary for quizzes (German / Mongolian). */
const EXTRA = [
  { de: 'das Baby', mn: 'нялх хүүхэд' },
  { de: 'die Mutter', mn: 'ээж' },
  { de: 'der Vater', mn: 'аав' },
  { de: 'der Bruder', mn: 'ах / дүү (эр)' },
  { de: 'die Schwester', mn: 'эгч / дүү (эм)' },
  { de: 'essen', mn: 'идэх' },
  { de: 'trinken', mn: 'уух' },
  { de: 'schlafen', mn: 'унтах' },
  { de: 'kochen', mn: 'хоол хийх' },
  { de: 'aufräumen', mn: 'цэвэрлэх, эмхлэх' },
  { de: 'waschen', mn: 'угаах' },
  { de: 'das Abendessen', mn: 'оройн хоол' },
  { de: 'das Mittagessen', mn: 'үдийн хоол' },
  { de: 'der Spielplatz', mn: 'тоглоомын талбай' },
  { de: 'das Spielzeug', mn: 'тоглоом' },
  { de: 'das Buch', mn: 'ном' },
  { de: 'der Arzt', mn: 'эмч' },
  { de: 'krank', mn: 'өвчтэй' },
  { de: 'müde', mn: 'ядарсан' },
  { de: 'glücklich', mn: 'аз жаргалтай' },
  { de: 'heute', mn: 'өнөөдөр' },
  { de: 'morgen', mn: 'маргааш' },
  { de: 'gestern', mn: 'өчигдөр' },
  { de: 'Wie viel Uhr ist es?', mn: 'Хэдэн цаг болж байна вэ?' },
  { de: 'Entschuldigung', mn: 'уучлаарай' },
  { de: 'Ich verstehe nicht', mn: 'Би ойлгохгүй байна' },
  { de: 'Können Sie das wiederholen?', mn: 'Дахиад хэлж өгөөч?' },
  { de: 'das Visum', mn: 'виз' },
  { de: 'der Flughafen', mn: 'нисэх онгоцны буудал' },
  { de: 'das Taschengeld', mn: 'халаасны мөнгө' },
]

export const WORD_BANK = [
  ...dailyWords.map(({ de, mn }) => ({ de, mn })),
  ...EXTRA,
].filter((w, i, all) => all.findIndex((x) => x.de === w.de) === i)

export const dayKey = (date = new Date()) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function dayNumber(date = new Date()) {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000,
  )
}

/** Same word all day, rotates daily. */
export function wordOfDay(date = new Date()) {
  return dailyWords[dayNumber(date) % dailyWords.length]
}

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle(list, rand) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Build a quiz. `seed` varies per attempt so a retry gets different questions
 * but the first attempt of a day is stable.
 * Question: { word, dir: 'de-mn' | 'mn-de', prompt, answer, options[] }
 */
export function buildQuiz(date = new Date(), count = 5, attempt = 0) {
  const rand = mulberry32(dayNumber(date) * 31 + attempt * 7919 + 17)
  const picked = shuffle(WORD_BANK, rand).slice(0, count)
  return picked.map((word, i) => {
    const dir = i % 2 === 0 ? 'de-mn' : 'mn-de'
    const key = dir === 'de-mn' ? 'mn' : 'de'
    const distractors = shuffle(
      WORD_BANK.filter((w) => w.de !== word.de),
      rand,
    )
      .slice(0, 3)
      .map((w) => w[key])
    return {
      word,
      dir,
      prompt: dir === 'de-mn' ? word.de : word.mn,
      answer: word[key],
      options: shuffle([word[key], ...distractors], rand),
    }
  })
}

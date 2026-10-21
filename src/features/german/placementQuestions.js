/** Short CEFR-style placement quiz (6 Q). Score → recommended level. */

export const PLACEMENT_QUESTIONS = [
  {
    id: 'q1',
    prompt: '„Wie heißt du?“ гэж юу гэсэн үг вэ?',
    options: ['Чи хаана амьдардаг вэ?', 'Чамайг хэн гэдэг вэ?', 'Чи хэдэн настай вэ?', 'Чи юу хийдэг вэ?'],
    answer: 'Чамайг хэн гэдэг вэ?',
    level: 'A1',
  },
  {
    id: 'q2',
    prompt: '„Ich komme aus …“ — хоосон зайг бөглө.',
    options: ['Mongolei', 'Mongolei kommen', 'aus Mongolei ich', 'kommen Mongolei'],
    answer: 'Mongolei',
    level: 'A1',
  },
  {
    id: 'q3',
    prompt: '„Guten Morgen“ хэзээ хэлэх вэ?',
    options: ['Орой', 'Шөнө', 'Өглөө', 'Баяртай гэж'],
    answer: 'Өглөө',
    level: 'A1',
  },
  {
    id: 'q4',
    prompt: '„Ich habe einen Termin um 15 Uhr.“ — юу гэсэн үг вэ?',
    options: [
      'Би 15 цагт цаг авсан',
      'Би 15 цагт хооллоно',
      'Би 15 цагт явахгүй',
      'Би 15 нас хүрсэн',
    ],
    answer: 'Би 15 цагт цаг авсан',
    level: 'A2',
  },
  {
    id: 'q5',
    prompt: '„Können Sie mir bitte helfen?“ — зөв орчуулга?',
    options: [
      'Та надад тусалж чадах уу?',
      'Би танд тусалъя',
      'Та хаана амьдардаг вэ?',
      'Би явах хэрэгтэй',
    ],
    answer: 'Та надад тусалж чадах уу?',
    level: 'A2',
  },
  {
    id: 'q6',
    prompt: '„Wenn ich Zeit habe, lerne ich Deutsch.“ — ямар бүтэц вэ?',
    options: ['Зөвхөн одоо цаг', 'Нөхцөл + одоо цаг', 'Зөвхөн тушаал', 'Зөвхөн тэмдэг нэр'],
    answer: 'Нөхцөл + одоо цаг',
    level: 'B1',
  },
]

/**
 * Placement дүрэм: 75%+ → A2, бага → A1
 * @param {number} correctCount
 * @param {number} [total=6]
 * @returns {'A1' | 'A2'}
 */
export function levelFromPlacementScore(correctCount, total = 6) {
  const percent = total > 0 ? (Number(correctCount) / total) * 100 : 0
  return percent >= 75 ? 'A2' : 'A1'
}

export function placementPercent(correctCount, total = 6) {
  if (!total) return 0
  return Math.round((Number(correctCount) / total) * 100)
}

export function placementCopy(level) {
  if (level === 'A2') {
    return {
      title: 'Танд A2 тохироно',
      text: 'Оношлогоо 75%+. A2 ангид автоматаар элсэж, бүлгийн чат нээгдэнэ.',
    }
  }
  return {
    title: 'Танд A1 тохироно',
    text: 'Суурь түвшин. A1 ангид автоматаар элсэж, бүлгийн чат нээгдэнэ.',
  }
}

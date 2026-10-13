/**
 * Mongolian header date, e.g. "10 сарын 13, Мягмар"
 * Forces Latin digits — mn-MN otherwise may emit Roman month numerals (X).
 */
export function formatMnHeaderDate(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('mn-MN-u-nu-latn', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'long',
    })
      .formatToParts(date)
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, p.value]),
  )

  const month = String(Number(parts.month) || date.getMonth() + 1)
  const day = String(Number(parts.day) || date.getDate())
  const weekday = String(parts.weekday || '')
    .replace(/\s*гараг$/iu, '')
    .trim()
    .replace(/^./u, (c) => c.toLocaleUpperCase('mn-MN'))

  return `${month} сарын ${day}, ${weekday}`
}

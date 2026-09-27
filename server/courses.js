import { coursesFallback, countries } from '../src/data.js'

export const courses = [
  ...coursesFallback.map((course) => ({ ...course, kind: 'course' })),
  ...countries.map((country) => ({
    id: country.id,
    kind: 'country',
    type: 'country',
    level: 'Au Pair',
    hsk: country.short,
    title: `${country.nameMn} Au Pair`,
    subtitle: country.focus,
    duration: country.duration,
    mode: 'Соёл солилцоо',
    schedule: country.intake,
    priceLabel: country.priceLabel,
    seats: null,
    points: country.points,
    badge: country.badge,
    description: country.description,
  })),
]

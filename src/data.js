export const navLinks = [
  { to: '/', label: 'Нүүр' },
  { to: '/courses', label: 'Хөтөлбөр' },
  { to: '/universities', label: 'Улс орнууд' },
  { to: '/shop', label: 'Дэлгүүр' },
  { to: '/profile', label: 'Профайл' },
]

export const social = {
  facebook: 'https://www.facebook.com/MongolianAuPair',
  messenger: 'https://m.me/MongolianAuPair',
  instagram: 'https://www.instagram.com/mongolian.aupair',
  website: 'https://mongolianaupair.com/',
  email: 'office@mongolianaupair.com',
  emailAlt: 'info@mongolianaupair.com',
  phone: '+976 7711-6906',
  phoneAlt: '+976 7711-6906',
  phoneTel: '+97677116906',
  phoneAltTel: '+97677116906',
  address:
    'Улаанбаатар хот, Сүхбаатар дүүрэг, 11-р хороо, 7-р хороолол, Нью Резиденс хотхон, 726-р байр, 1 тоот',
  city: 'Улаанбаатар',
  map: 'https://maps.google.com/maps?q=New+Residence+Sukhbaatar+Ulaanbaatar',
  followers: 'Албан ёсны',
  recommend: '1969 оны конвенц',
  hours: 'Нээлттэй',
  since: '2005',
  placed: '3,000+',
}

export const GERMAN_LEVEL_LABELS = {
  none: 'Сураагүй',
  A1: 'A1',
  A2: 'A2',
  'B1+': 'B1 ба түүнээс дээш',
}

export const STATUS_LABELS = {
  enrollments: {
    pending: 'Шинэ',
    contacted: 'Холбогдсон',
    accepted: 'Элсүүлсэн',
    cancelled: 'Цуцалсан',
  },
  contacts: {
    pending: 'Шинэ',
    contacted: 'Холбогдсон',
    done: 'Шийдвэрлэсэн',
  },
  orders: {
    pending: 'Шинэ',
    contacted: 'Холбогдсон',
    done: 'Хүргэсэн',
    cancelled: 'Цуцалсан',
  },
}

export const INTEREST_LABELS = {
  country: 'Au Pair улс',
  'german-a1': 'Герман хэл A1',
  'german-a2': 'Герман хэл A2',
  course: 'Хэлний анги',
  other: 'Бусад',
}

export const feed = {
  featured: {
    tag: 'Элсэлт авч байна',
    title: 'Герман хэлний A1, A2 анги',
    meta: 'Au Pair-т бэлтгэх · бүртгэл нээлттэй',
    to: '/courses',
    image:
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1400&q=80',
    source: 'Mongolian AuPair',
  },
}

export const coursesFallback = [
  {
    id: 'german-a1',
    type: 'language',
    level: 'A1',
    hsk: 'DE A1',
    title: 'Герман хэлний анхан шат',
    subtitle: 'Герман, Австри, Швейцарьт бэлтгэх',
    duration: '3 сар',
    mode: 'Танхим',
    schedule: 'Өдөр / Орой',
    priceLabel: 'Зөвлөгөө аваарай',
    seats: 14,
    points: ['A1 яриа, сонсох', 'Хүүхэд харах үгийн сан', 'Визийн ярилцлага'],
    badge: 'Элсэлт нээлттэй',
    description:
      'Герман хэлтэй орнуудад Au Pair хийх суурь бэлтгэл. Өдөр тутмын яриа, гэр бүлийн орчин, энгийн дүрэм.',
  },
  {
    id: 'german-a2',
    type: 'language',
    level: 'A2',
    hsk: 'DE A2',
    title: 'Герман хэл A2',
    subtitle: 'Гэр бүл, сургууль, өдөр тутмын харилцаа',
    duration: '3 сар',
    mode: 'Танхим',
    schedule: 'Оройн анги',
    priceLabel: 'Зөвлөгөө аваарай',
    seats: 12,
    points: ['A2 түвшин', 'Хүүхэдтэй харилцах', 'Бичиг баримтын хэл'],
    badge: 'Элсэлт нээлттэй',
    description: 'Герман Au Pair-т шаардлагатай A2 түвшинд бэлтгэнэ. Goethe A2 шалгалтад бэлтгэнэ.',
  },
]

export const courses = coursesFallback.map((c) => ({
  ...c,
  price: c.priceLabel,
}))

export const countries = [
  {
    id: 'germany',
    name: 'Germany',
    nameMn: 'Герман',
    short: 'DE',
    city: 'Берлин',
    region: 'Төв Европ',
    language: 'Герман хэл',
    langGroup: 'german',
    focus: 'Au Pair · хэл, соёл',
    intake: 'Элсэлт нээлттэй',
    hsk: 'A1–A2',
    duration: '6–12 сар',
    tuition: 'Хоол, байр + халаасны мөнгө',
    priceLabel: 'Зөвлөгөө үнэгүй',
    badge: 'Эрэлттэй',
    featured: true,
    open: true,
    image:
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1400&q=80',
    description:
      'Герман дахь албан ёсны Au Pair хөтөлбөр. Гэр бүлд амьдарч, хүүхэд харан, герман хэл, соёлыг өдөр тутмын орчинд сурна.',
    points: [
      'Европын хамгийн том Au Pair зах зээл',
      'Хэлний курс + халаасны мөнгө',
      'Виза, гэр бүлтэй тохирох процессыг бид хамт хийнэ',
    ],
    requirements: [
      '18–30 нас',
      'Паспорт',
      'Герман хэл A1-ээс',
      'Хүүхэд харах сонирхол, туршлага',
      'Эрүүл мэндийн үзлэг',
    ],
    why: 'Герман хэл сурч, Европын төвд соёл солилцоо хийхийг хүсвэл эхний сонголт.',
  },
  {
    id: 'france',
    name: 'France',
    nameMn: 'Франц',
    short: 'FR',
    city: 'Парис',
    region: 'Баруун Европ',
    language: 'Франц хэл',
    langGroup: 'french',
    focus: 'Au Pair · гэр бүл',
    intake: 'Элсэлт нээлттэй',
    hsk: 'A1+',
    duration: '12 сар',
    tuition: 'Хоол, байр + халаасны мөнгө',
    priceLabel: 'Зөвлөгөө үнэгүй',
    badge: null,
    featured: false,
    open: true,
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80',
    description:
      'Францын гэр бүлд Au Pair-аар амьдарч, франц хэл, соёлтой танилцана.',
    points: [
      'Парис болон бусад хотууд',
      'Alliance Française-тай хамтын ажиллагаа',
      'Франц хэлний орчин',
    ],
    requirements: [
      '18–30 нас',
      'Паспорт',
      'Франц хэлний анхан шат (суралцаж болно)',
      'Хүүхэд харах хүсэл',
      'Бүртгэлийн маягт',
    ],
    why: 'Францад нэг жил амьдарч, франц хэл сурахыг хүсвэл.',
  },
  {
    id: 'austria',
    name: 'Austria',
    nameMn: 'Австри',
    short: 'AT',
    city: 'Вена',
    region: 'Төв Европ',
    language: 'Герман хэл',
    langGroup: 'german',
    focus: 'Au Pair · гэр бүл',
    intake: 'Элсэлт нээлттэй',
    hsk: 'A1–A2',
    duration: '6–12 сар',
    tuition: 'Хоол, байр + халаасны мөнгө',
    priceLabel: 'Зөвлөгөө үнэгүй',
    badge: null,
    featured: true,
    open: true,
    image:
      'https://images.unsplash.com/photo-1609856878074-cf31e21ccb6b?auto=format&fit=crop&w=1400&q=80',
    description:
      'Австрийн гэр бүлд Au Pair-аар амьдарч, герман хэл, Альпийн соёлтой танилцана.',
    points: [
      'Вена болон бусад хотууд',
      'Герман хэлний орчин',
      'Аюулгүй, тохилог гэр бүлүүд',
    ],
    requirements: [
      '18–30 нас',
      'Паспорт',
      'Герман хэл A1+',
      'Хүүхэд харах туршлага',
      'Эрүүл мэндийн үзлэг',
    ],
    why: 'Герман хэлтэй, аюулгүй орчинд Au Pair хийхийг хүсвэл Австри тохиромжтой.',
  },
  {
    id: 'switzerland',
    name: 'Switzerland',
    nameMn: 'Швейцарь',
    short: 'CH',
    city: 'Цюрих',
    region: 'Төв Европ',
    language: 'Герман / Франц',
    langGroup: 'german',
    focus: 'Au Pair · олон хэл',
    intake: 'Элсэлт нээлттэй',
    hsk: 'A2+',
    duration: '6–12 сар',
    tuition: 'Хоол, байр + халаасны мөнгө',
    priceLabel: 'Зөвлөгөө үнэгүй',
    badge: null,
    featured: true,
    open: true,
    image:
      'https://images.unsplash.com/photo-1527668752968-14dc70a27c10?auto=format&fit=crop&w=1400&q=80',
    description:
      'Швейцарьт герман эсвэл франц хэлтэй гэр бүлд Au Pair хийж, олон хэл, өндөр амьдралын орчинд суралцана.',
    points: ['Олон хэлний орчин', 'Өндөр амьжиргаа', 'Уулын болон хотын гэр бүл'],
    requirements: [
      '18–30 нас',
      'Паспорт',
      'Герман эсвэл франц A2+',
      'Хүүхэд харах туршлага',
      'Санхүүгийн баталгаа (зарим тохиолдолд)',
    ],
    why: 'Олон хэл, өндөр амьдралын орчинд соёл солилцоо хийхийг хүсвэл.',
  },
  {
    id: 'belgium',
    name: 'Belgium',
    nameMn: 'Бельги',
    short: 'BE',
    city: 'Брюссель',
    region: 'Баруун Европ',
    language: 'Франц / Нидерланд',
    langGroup: 'french',
    focus: 'Au Pair · Европын төв',
    intake: 'Элсэлт нээлттэй',
    hsk: 'A1+',
    duration: '6–12 сар',
    tuition: 'Хоол, байр + халаасны мөнгө',
    priceLabel: 'Зөвлөгөө үнэгүй',
    badge: null,
    featured: false,
    open: true,
    image:
      'https://images.unsplash.com/photo-1559113202-c916b8e44373?auto=format&fit=crop&w=1400&q=80',
    description:
      'Бельгид франц эсвэл нидерланд хэлтэй гэр бүлд Au Pair хийж, Европын зүрхэнд амьдарна.',
    points: ['Брюссель — Европын төв', 'Франц / нидерланд хэл', 'Олон улсын орчин'],
    requirements: [
      '18–30 нас',
      'Паспорт',
      'Франц эсвэл нидерланд хэлний суурь',
      'Хүүхэд харах хүсэл',
      'Эрүүл мэндийн үзлэг',
    ],
    why: 'Европын төвд, франц хэлтэй орчинд Au Pair хийхийг хүсвэл.',
  },
  {
    id: 'netherlands',
    name: 'Netherlands',
    nameMn: 'Нидерланд',
    short: 'NL',
    city: 'Амстердам',
    region: 'Баруун Европ',
    language: 'Нидерланд / Англи',
    langGroup: 'north',
    focus: 'Au Pair · нээлттэй соёл',
    intake: 'Элсэлт нээлттэй',
    hsk: 'A1+',
    duration: '6–12 сар',
    tuition: 'Хоол, байр + халаасны мөнгө',
    priceLabel: 'Зөвлөгөө үнэгүй',
    badge: null,
    featured: true,
    open: true,
    image:
      'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?auto=format&fit=crop&w=1400&q=80',
    description:
      'Нидерландад Au Pair-аар амьдарч, дугуй, нээлттэй соёл, англи/нидерланд хэлтэй өдөр тутмын орчинд суралцана.',
    points: ['Англи хэлтэй орчин', 'Аюулгүй, нээлттэй нийгэм', 'Хэлний курс'],
    requirements: [
      '18–30 нас',
      'Паспорт',
      'Англи хэлний суурь',
      'Хүүхэд харах туршлага',
      'Эрүүл мэндийн үзлэг',
    ],
    why: 'Англи хэлтэй, нээлттэй орчинд Европын амьдралыг мэдрэхийг хүсвэл.',
  },
  {
    id: 'denmark',
    name: 'Denmark',
    nameMn: 'Дани',
    short: 'DK',
    city: 'Копенгаген',
    region: 'Хойд Европ',
    language: 'Дани / Англи',
    langGroup: 'north',
    focus: 'Au Pair · Скандинав',
    intake: 'Элсэлт нээлттэй',
    hsk: 'A1+',
    duration: '6–12 сар',
    tuition: 'Хоол, байр + халаасны мөнгө',
    priceLabel: 'Зөвлөгөө үнэгүй',
    badge: 'Скандинав',
    featured: false,
    open: true,
    image:
      'https://images.unsplash.com/photo-1513622470522-26c3e3b0c1a6?auto=format&fit=crop&w=1400&q=80',
    description:
      'Дани улсад Au Pair хийж, Скандинавын гэр бүл, англи хэлтэй орчин, өндөр амьдралын хэв маягтай танилцана.',
    points: ['Скандинав амьдрал', 'Англи хэлтэй гэр бүл', 'Аюулгүй орчин'],
    requirements: [
      '18–30 нас',
      'Паспорт',
      'Англи хэлний суурь',
      'Хүүхэд харах хүсэл',
      'Эрүүл мэндийн үзлэг',
    ],
    why: 'Хойд Европын аюулгүй, англи хэлтэй орчинд Au Pair хийхийг хүсвэл.',
  },
]

export const universities = countries

export const videos = [
  {
    id: 'r1',
    href: 'https://www.facebook.com/MongolianAuPair',
    title: 'Герман хэлний анги · элсэлт',
    category: 'Элсэлт',
    views: 'Шинэ',
    thumb:
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'r2',
    href: 'https://www.facebook.com/MongolianAuPair',
    title: 'Герман дахь Au Pair амьдрал',
    category: 'Герман',
    views: 'Reel',
    thumb:
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'r3',
    href: 'https://www.facebook.com/MongolianAuPair',
    title: 'Соёл солилцоогоор дэлхийд',
    category: 'Мэдээ',
    views: 'Page',
    thumb:
      'https://images.unsplash.com/photo-1527668752968-14dc70a27c10?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'r4',
    href: 'https://www.instagram.com/mongolian.aupair',
    title: 'Instagram · mongolian.aupair',
    category: 'Reel',
    views: 'IG',
    thumb:
      'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?auto=format&fit=crop&w=800&q=80',
  },
]

export const products = [
  {
    id: 'p1',
    name: 'Герман хэлний анхан шатны ном',
    price: 'Зөвлөгөө',
    tag: 'Хэл',
    blurb: 'Au Pair бэлтгэл',
    description: 'Герман Au Pair-т зориулсан анхан шатны материал.',
    points: ['A1 үгс', 'Гэр бүлийн яриа', 'Практик'],
  },
  {
    id: 'p2',
    name: 'Герман хэлний A2 ном',
    price: 'Зөвлөгөө',
    tag: 'Хэл',
    blurb: 'Goethe A2 бэлтгэл',
    description: 'Герман хэлний A2 түвшний сурах бичиг, дасгал.',
    points: ['A2 үгс', 'Дүрэм', 'Шалгалтын дасгал'],
  },
  {
    id: 'p3',
    name: 'Бичиг баримтын чеклист',
    price: 'Үнэгүй',
    tag: 'Виза',
    blurb: 'Элсэлтийн жагсаалт',
    description: 'Паспорт, анкет, эрүүл мэнд — Au Pair бүртгэлийн чеклист.',
    points: ['Виза', 'Гэр бүл', 'Хэлний үнэмлэх'],
  },
]

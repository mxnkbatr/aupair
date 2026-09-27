import express from 'express'
import cors from 'cors'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { courses } from './courses.js'
import { GERMAN_LEVEL_LABELS, products } from '../src/data.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data')
const FILES = {
  enrollments: path.join(DATA_DIR, 'enrollments.json'),
  contacts: path.join(DATA_DIR, 'contacts.json'),
  orders: path.join(DATA_DIR, 'orders.json'),
}
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000

const STATUSES = {
  enrollments: ['pending', 'contacted', 'accepted', 'cancelled'],
  contacts: ['pending', 'contacted', 'done'],
  orders: ['pending', 'contacted', 'done', 'cancelled'],
}

const GERMAN_LEVELS = Object.keys(GERMAN_LEVEL_LABELS)

const PORT = process.env.PORT || 3001
const IS_PROD = process.env.NODE_ENV === 'production'
const ADMIN_KEY = process.env.ADMIN_KEY || (IS_PROD ? '' : 'aupair-admin')

if (!ADMIN_KEY) {
  console.warn('ADMIN_KEY тохируулаагүй тул админ хуудас хаалттай.')
}

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
for (const file of [...Object.values(FILES), USERS_FILE]) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]', 'utf8')
}

function loadSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET
  const file = path.join(DATA_DIR, 'secret.key')
  if (!fs.existsSync(file)) fs.writeFileSync(file, crypto.randomBytes(32).toString('hex'), 'utf8')
  return fs.readFileSync(file, 'utf8').trim()
}

const AUTH_SECRET = loadSecret()

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return []
  }
}

function writeJson(file, data) {
  const tmp = `${file}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8')
  fs.renameSync(tmp, file)
}

function id() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function clean(value, max = 500) {
  return value == null ? '' : String(value).trim().slice(0, max)
}

function validPhone(phone) {
  return phone.replace(/\D/g, '').length >= 8
}

function validEmail(email) {
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function phoneKey(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('976') ? digits.slice(3) : digits
}

function parseAge(value) {
  if (value === '' || value == null) return null
  const age = Number.parseInt(value, 10)
  return Number.isInteger(age) && age >= 16 && age <= 45 ? age : undefined
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function checkPassword(password, stored) {
  const [salt, hash] = String(stored || '').split(':')
  if (!salt || !hash) return false
  const expected = Buffer.from(hash, 'hex')
  const actual = crypto.scryptSync(password, salt, 64)
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
}

function sign(payload) {
  return crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url')
}

function createToken(user) {
  const payload = Buffer.from(
    JSON.stringify({ uid: user.id, v: user.tokenVersion || 0, exp: Date.now() + TOKEN_TTL_MS }),
  ).toString('base64url')
  return `${payload}.${sign(payload)}`
}

function authUser(req) {
  const header = String(req.headers.authorization || '')
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  const expected = Buffer.from(sign(payload))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null
  let data
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (!data.exp || data.exp < Date.now()) return null
  const user = readJson(USERS_FILE).find((u) => u.id === data.uid)
  if (!user || (user.tokenVersion || 0) !== data.v) return null
  return user
}

function requireUser(req, res, next) {
  const user = authUser(req)
  if (!user) return res.status(401).json({ error: 'Дахин нэвтэрнэ үү' })
  req.user = user
  next()
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email || '',
    age: user.age ?? null,
    germanLevel: user.germanLevel || 'none',
    createdAt: user.createdAt,
  }
}

const authAttempts = new Map()
function limitAuth(req, res, next) {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000
  const recent = (authAttempts.get(req.ip) || []).filter((t) => now - t < windowMs)
  if (recent.length >= 20) {
    return res.status(429).json({ error: 'Хэт олон оролдлого. 15 минутын дараа дахин оролдоно уу.' })
  }
  recent.push(now)
  authAttempts.set(req.ip, recent)
  next()
}

function seatsLeft(courseId) {
  const course = courses.find((c) => c.id === courseId)
  if (!course || !course.seats) return null
  const enrolled = readJson(FILES.enrollments).filter(
    (e) => e.courseId === courseId && e.status !== 'cancelled',
  ).length
  return Math.max(0, course.seats - enrolled)
}

function isAdmin(req) {
  if (!ADMIN_KEY) return false
  const given = Buffer.from(String(req.headers['x-admin-key'] || ''))
  const expected = Buffer.from(ADMIN_KEY)
  return given.length === expected.length && crypto.timingSafeEqual(given, expected)
}

function requireAdmin(req, res, next) {
  if (!ADMIN_KEY) return res.status(503).json({ error: 'Админ хаалттай байна' })
  if (!isAdmin(req)) return res.status(401).json({ error: 'Нууц үг буруу байна' })
  next()
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'mongolian-aupair-api' })
})

app.get('/api/courses', (_req, res) => {
  res.json(courses.map((course) => ({ ...course, seatsLeft: seatsLeft(course.id) })))
})

app.get('/api/courses/:id', (req, res) => {
  const course = courses.find((c) => c.id === req.params.id)
  if (!course) return res.status(404).json({ error: 'Хөтөлбөр олдсонгүй' })
  res.json({ ...course, seatsLeft: seatsLeft(course.id) })
})

app.post('/api/enrollments', (req, res) => {
  const body = req.body || {}
  const name = clean(body.name, 120)
  const phone = clean(body.phone, 40)
  const email = clean(body.email, 120)
  const note = clean(body.note, 1000)
  const courseId = clean(body.courseId, 60)
  const age = Number.parseInt(body.age, 10)
  const germanLevel = GERMAN_LEVELS.includes(body.germanLevel) ? body.germanLevel : 'none'

  if (!name || !phone || !courseId) {
    return res.status(400).json({ error: 'Нэр, утас заавал бөглөнө үү' })
  }
  if (!validPhone(phone)) {
    return res.status(400).json({ error: 'Утасны дугаар буруу байна' })
  }
  if (!validEmail(email)) {
    return res.status(400).json({ error: 'Имэйл хаяг буруу байна' })
  }
  if (!Number.isInteger(age) || age < 16 || age > 45) {
    return res.status(400).json({ error: 'Насаа зөв оруулна уу' })
  }

  const course = courses.find((c) => c.id === courseId)
  if (!course) return res.status(404).json({ error: 'Хөтөлбөр олдсонгүй' })

  const user = authUser(req)
  const key = phoneKey(phone)
  const duplicate = readJson(FILES.enrollments).some(
    (e) =>
      e.courseId === courseId &&
      e.status !== 'cancelled' &&
      ((user && e.userId === user.id) || phoneKey(e.phone) === key),
  )
  if (duplicate) {
    return res.status(409).json({ error: 'Та энэ хөтөлбөрт аль хэдийн бүртгүүлсэн байна' })
  }

  const left = seatsLeft(courseId)
  if (left !== null && left <= 0) {
    return res.status(409).json({ error: 'Энэ ангийн суудал дууссан байна' })
  }

  const enrollment = {
    id: id(),
    userId: user?.id || null,
    kind: course.kind,
    courseId,
    courseTitle: course.title,
    name,
    phone,
    email,
    age,
    germanLevel,
    note,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  const all = readJson(FILES.enrollments)
  all.unshift(enrollment)
  writeJson(FILES.enrollments, all)

  res.status(201).json({
    ok: true,
    enrollment: { id: enrollment.id },
    seatsLeft: seatsLeft(courseId),
    message: 'Бүртгэл амжилттай. Бид удахгүй холбогдоно.',
  })
})

app.post('/api/contacts', (req, res) => {
  const body = req.body || {}
  const name = clean(body.name, 120)
  const phone = clean(body.phone, 40)
  if (!name || !phone) {
    return res.status(400).json({ error: 'Нэр, утас заавал бөглөнө үү' })
  }
  if (!validPhone(phone)) {
    return res.status(400).json({ error: 'Утасны дугаар буруу байна' })
  }

  const item = {
    id: id(),
    userId: authUser(req)?.id || null,
    name,
    phone,
    email: clean(body.email, 120),
    interest: clean(body.interest, 40) || 'other',
    message: clean(body.message, 1000),
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  const all = readJson(FILES.contacts)
  all.unshift(item)
  writeJson(FILES.contacts, all)
  res.status(201).json({ ok: true, message: 'Хүсэлт хүлээн авлаа. Удахгүй холбогдоно.' })
})

app.post('/api/orders', (req, res) => {
  const body = req.body || {}
  const name = clean(body.name, 120)
  const phone = clean(body.phone, 40)
  const items = (Array.isArray(body.items) ? body.items.slice(0, 50) : [])
    .map((item) => products.find((p) => p.id === item?.id))
    .filter(Boolean)
    .map((p) => ({ id: p.id, name: p.name, price: p.price }))
  if (!name || !phone || !items.length) {
    return res.status(400).json({ error: 'Нэр, утас, бараа заавал' })
  }
  if (!validPhone(phone)) {
    return res.status(400).json({ error: 'Утасны дугаар буруу байна' })
  }

  const order = {
    id: id(),
    userId: authUser(req)?.id || null,
    name,
    phone,
    items,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  const all = readJson(FILES.orders)
  all.unshift(order)
  writeJson(FILES.orders, all)
  res.status(201).json({ ok: true, order: { id: order.id }, message: 'Захиалга бүртгэгдлээ' })
})

app.post('/api/auth/register', limitAuth, (req, res) => {
  const body = req.body || {}
  const name = clean(body.name, 120)
  const phone = clean(body.phone, 40)
  const email = clean(body.email, 120)
  const password = String(body.password || '')
  const age = parseAge(body.age)
  const germanLevel = GERMAN_LEVELS.includes(body.germanLevel) ? body.germanLevel : 'none'

  if (!name || !phone) return res.status(400).json({ error: 'Нэр, утас заавал бөглөнө үү' })
  if (!validPhone(phone)) return res.status(400).json({ error: 'Утасны дугаар буруу байна' })
  if (!validEmail(email)) return res.status(400).json({ error: 'Имэйл хаяг буруу байна' })
  if (age === undefined) return res.status(400).json({ error: 'Насаа зөв оруулна уу (16-45)' })
  if (password.length < 6 || password.length > 100) {
    return res.status(400).json({ error: 'Нууц үг хамгийн багадаа 6 тэмдэгт байна' })
  }

  const users = readJson(USERS_FILE)
  const key = phoneKey(phone)
  if (users.some((u) => u.phoneKey === key)) {
    return res.status(409).json({ error: 'Энэ утасны дугаараар бүртгэл үүссэн байна. Нэвтэрнэ үү.' })
  }

  const user = {
    id: id(),
    name,
    phone,
    phoneKey: key,
    email,
    age,
    germanLevel,
    passwordHash: hashPassword(password),
    tokenVersion: 0,
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  writeJson(USERS_FILE, users)
  res.status(201).json({ token: createToken(user), user: publicUser(user) })
})

app.post('/api/auth/login', limitAuth, (req, res) => {
  const body = req.body || {}
  const key = phoneKey(body.phone)
  const password = String(body.password || '')
  const user = readJson(USERS_FILE).find((u) => u.phoneKey === key)
  if (!user || !checkPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Утас эсвэл нууц үг буруу байна' })
  }
  res.json({ token: createToken(user), user: publicUser(user) })
})

app.get('/api/me', requireUser, (req, res) => {
  const mine = (file) => readJson(file).filter((x) => x.userId === req.user.id)
  res.json({
    user: publicUser(req.user),
    enrollments: mine(FILES.enrollments),
    contacts: mine(FILES.contacts),
    orders: mine(FILES.orders),
  })
})

app.patch('/api/me', requireUser, (req, res) => {
  const body = req.body || {}
  const users = readJson(USERS_FILE)
  const user = users.find((u) => u.id === req.user.id)
  if (!user) return res.status(401).json({ error: 'Дахин нэвтэрнэ үү' })

  if (body.name !== undefined) {
    const name = clean(body.name, 120)
    if (!name) return res.status(400).json({ error: 'Нэр хоосон байж болохгүй' })
    user.name = name
  }
  if (body.email !== undefined) {
    const email = clean(body.email, 120)
    if (!validEmail(email)) return res.status(400).json({ error: 'Имэйл хаяг буруу байна' })
    user.email = email
  }
  if (body.age !== undefined) {
    const age = parseAge(body.age)
    if (age === undefined) return res.status(400).json({ error: 'Насаа зөв оруулна уу (16-45)' })
    user.age = age
  }
  if (body.germanLevel !== undefined) {
    if (!GERMAN_LEVELS.includes(body.germanLevel)) {
      return res.status(400).json({ error: 'Хэлний түвшин буруу байна' })
    }
    user.germanLevel = body.germanLevel
  }

  let token
  if (body.newPassword !== undefined) {
    const newPassword = String(body.newPassword)
    if (!checkPassword(String(body.currentPassword || ''), user.passwordHash)) {
      return res.status(400).json({ error: 'Одоогийн нууц үг буруу байна' })
    }
    if (newPassword.length < 6 || newPassword.length > 100) {
      return res.status(400).json({ error: 'Шинэ нууц үг хамгийн багадаа 6 тэмдэгт байна' })
    }
    user.passwordHash = hashPassword(newPassword)
    user.tokenVersion = (user.tokenVersion || 0) + 1
    token = createToken(user)
  }

  user.updatedAt = new Date().toISOString()
  writeJson(USERS_FILE, users)
  res.json({ user: publicUser(user), token })
})

app.get('/api/admin/data', requireAdmin, (_req, res) => {
  res.json({
    enrollments: readJson(FILES.enrollments),
    contacts: readJson(FILES.contacts),
    orders: readJson(FILES.orders),
    users: readJson(USERS_FILE).map(publicUser),
  })
})

app.patch('/api/admin/:collection/:id', requireAdmin, (req, res) => {
  const { collection, id: itemId } = req.params
  if (!Object.hasOwn(FILES, collection)) return res.status(404).json({ error: 'Олдсонгүй' })
  const file = FILES[collection]

  const status = clean(req.body?.status, 20)
  if (!STATUSES[collection].includes(status)) {
    return res.status(400).json({ error: 'Төлөв буруу байна' })
  }

  const all = readJson(file)
  const item = all.find((x) => x.id === itemId)
  if (!item) return res.status(404).json({ error: 'Олдсонгүй' })

  item.status = status
  item.updatedAt = new Date().toISOString()
  writeJson(file, all)
  res.json({ ok: true, item })
})

const DIST = path.join(__dirname, '../dist')
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST, { index: false }))
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(DIST, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Au Pair API → http://localhost:${PORT}`)
  if (fs.existsSync(DIST)) {
    console.log(`Au Pair Web → http://localhost:${PORT}`)
  }
}).on('error', (err) => {
  console.error('API listen error:', err.message)
  process.exit(1)
})

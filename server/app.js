import express from 'express'
import cors from 'cors'
import crypto from 'node:crypto'
import { courses } from './courses.js'
import { createStore } from './store.js'
import { GERMAN_LEVEL_LABELS, products } from '../src/data.js'

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000

const STATUSES = {
  enrollments: ['pending', 'contacted', 'accepted', 'cancelled'],
  contacts: ['pending', 'contacted', 'done'],
  orders: ['pending', 'contacted', 'done', 'cancelled'],
}

const GERMAN_LEVELS = Object.keys(GERMAN_LEVEL_LABELS)

const IS_PROD = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL)
const ADMIN_KEY = process.env.ADMIN_KEY || (IS_PROD ? '' : 'aupair-admin')

if (!ADMIN_KEY) {
  console.warn('ADMIN_KEY тохируулаагүй тул админ хуудас хаалттай.')
}

const store = await createStore()
let authSecret = process.env.AUTH_SECRET || ''

async function getSecret() {
  if (!authSecret) authSecret = await store.secret()
  return authSecret
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

async function sign(payload) {
  return crypto.createHmac('sha256', await getSecret()).update(payload).digest('base64url')
}

async function createToken(user) {
  const payload = Buffer.from(
    JSON.stringify({ uid: user.id, v: user.tokenVersion || 0, exp: Date.now() + TOKEN_TTL_MS }),
  ).toString('base64url')
  return `${payload}.${await sign(payload)}`
}

async function authUser(req) {
  const header = String(req.headers.authorization || '')
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  const expected = Buffer.from(await sign(payload))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null
  let data
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (!data.exp || data.exp < Date.now()) return null
  const user = await store.one('users', { id: data.uid })
  if (!user || (user.tokenVersion || 0) !== data.v) return null
  return user
}

async function requireUser(req, res, next) {
  const user = await authUser(req)
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

async function activeEnrollments(courseId) {
  return (await store.all('enrollments', { courseId })).filter((e) => e.status !== 'cancelled')
}

async function seatsLeft(courseId) {
  const course = courses.find((c) => c.id === courseId)
  if (!course || !course.seats) return null
  return Math.max(0, course.seats - (await activeEnrollments(courseId)).length)
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
app.set('trust proxy', 1)
app.use(cors())
app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'mongolian-aupair-api', store: store.kind })
})

app.get('/api/courses', async (_req, res) => {
  const list = await Promise.all(
    courses.map(async (course) => ({ ...course, seatsLeft: await seatsLeft(course.id) })),
  )
  res.json(list)
})

app.get('/api/courses/:id', async (req, res) => {
  const course = courses.find((c) => c.id === req.params.id)
  if (!course) return res.status(404).json({ error: 'Хөтөлбөр олдсонгүй' })
  res.json({ ...course, seatsLeft: await seatsLeft(course.id) })
})

app.post('/api/enrollments', async (req, res) => {
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

  const user = await authUser(req)
  const key = phoneKey(phone)
  const active = await activeEnrollments(courseId)
  const duplicate = active.some(
    (e) => (user && e.userId === user.id) || phoneKey(e.phone) === key,
  )
  if (duplicate) {
    return res.status(409).json({ error: 'Та энэ хөтөлбөрт аль хэдийн бүртгүүлсэн байна' })
  }
  if (course.seats && active.length >= course.seats) {
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
  await store.insert('enrollments', enrollment)

  res.status(201).json({
    ok: true,
    enrollment: { id: enrollment.id },
    seatsLeft: await seatsLeft(courseId),
    message: 'Бүртгэл амжилттай. Бид удахгүй холбогдоно.',
  })
})

app.post('/api/contacts', async (req, res) => {
  const body = req.body || {}
  const name = clean(body.name, 120)
  const phone = clean(body.phone, 40)
  if (!name || !phone) {
    return res.status(400).json({ error: 'Нэр, утас заавал бөглөнө үү' })
  }
  if (!validPhone(phone)) {
    return res.status(400).json({ error: 'Утасны дугаар буруу байна' })
  }

  await store.insert('contacts', {
    id: id(),
    userId: (await authUser(req))?.id || null,
    name,
    phone,
    email: clean(body.email, 120),
    interest: clean(body.interest, 40) || 'other',
    message: clean(body.message, 1000),
    status: 'pending',
    createdAt: new Date().toISOString(),
  })
  res.status(201).json({ ok: true, message: 'Хүсэлт хүлээн авлаа. Удахгүй холбогдоно.' })
})

app.post('/api/orders', async (req, res) => {
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
    userId: (await authUser(req))?.id || null,
    name,
    phone,
    items,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  await store.insert('orders', order)
  res.status(201).json({ ok: true, order: { id: order.id }, message: 'Захиалга бүртгэгдлээ' })
})

app.post('/api/auth/register', limitAuth, async (req, res) => {
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

  const key = phoneKey(phone)
  const taken = () =>
    res.status(409).json({ error: 'Энэ утасны дугаараар бүртгэл үүссэн байна. Нэвтэрнэ үү.' })
  if (await store.one('users', { phoneKey: key })) return taken()

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
  try {
    await store.insert('users', user)
  } catch (err) {
    if (err?.code === 11000) return taken()
    throw err
  }
  res.status(201).json({ token: await createToken(user), user: publicUser(user) })
})

app.post('/api/auth/login', limitAuth, async (req, res) => {
  const body = req.body || {}
  const key = phoneKey(body.phone)
  const password = String(body.password || '')
  const user = key ? await store.one('users', { phoneKey: key }) : null
  if (!user || !checkPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Утас эсвэл нууц үг буруу байна' })
  }
  res.json({ token: await createToken(user), user: publicUser(user) })
})

app.get('/api/me', requireUser, async (req, res) => {
  const mine = { userId: req.user.id }
  const [enrollments, contacts, orders] = await Promise.all([
    store.all('enrollments', mine),
    store.all('contacts', mine),
    store.all('orders', mine),
  ])
  res.json({ user: publicUser(req.user), enrollments, contacts, orders })
})

app.patch('/api/me', requireUser, async (req, res) => {
  const body = req.body || {}
  const user = req.user
  const patch = {}

  if (body.name !== undefined) {
    const name = clean(body.name, 120)
    if (!name) return res.status(400).json({ error: 'Нэр хоосон байж болохгүй' })
    patch.name = name
  }
  if (body.email !== undefined) {
    const email = clean(body.email, 120)
    if (!validEmail(email)) return res.status(400).json({ error: 'Имэйл хаяг буруу байна' })
    patch.email = email
  }
  if (body.age !== undefined) {
    const age = parseAge(body.age)
    if (age === undefined) return res.status(400).json({ error: 'Насаа зөв оруулна уу (16-45)' })
    patch.age = age
  }
  if (body.germanLevel !== undefined) {
    if (!GERMAN_LEVELS.includes(body.germanLevel)) {
      return res.status(400).json({ error: 'Хэлний түвшин буруу байна' })
    }
    patch.germanLevel = body.germanLevel
  }

  if (body.newPassword !== undefined) {
    const newPassword = String(body.newPassword)
    if (!checkPassword(String(body.currentPassword || ''), user.passwordHash)) {
      return res.status(400).json({ error: 'Одоогийн нууц үг буруу байна' })
    }
    if (newPassword.length < 6 || newPassword.length > 100) {
      return res.status(400).json({ error: 'Шинэ нууц үг хамгийн багадаа 6 тэмдэгт байна' })
    }
    patch.passwordHash = hashPassword(newPassword)
    patch.tokenVersion = (user.tokenVersion || 0) + 1
  }

  patch.updatedAt = new Date().toISOString()
  const updated = await store.update('users', user.id, patch)
  if (!updated) return res.status(401).json({ error: 'Дахин нэвтэрнэ үү' })
  const token = patch.passwordHash ? await createToken(updated) : undefined
  res.json({ user: publicUser(updated), token })
})

app.delete('/api/me', requireUser, async (req, res) => {
  const user = req.user
  const key = phoneKey(user.phone)

  for (const name of ['enrollments', 'contacts', 'orders']) {
    const rows = await store.all(name)
    await Promise.all(
      rows
        .filter((row) => row.userId === user.id || (key && phoneKey(row.phone) === key))
        .map((row) => store.remove(name, row.id)),
    )
  }

  const removed = await store.remove('users', user.id)
  if (!removed) return res.status(401).json({ error: 'Дахин нэвтэрнэ үү' })
  res.json({ ok: true, message: 'Бүртгэл устгагдлаа' })
})

app.get('/api/admin/data', requireAdmin, async (_req, res) => {
  const [enrollments, contacts, orders, users] = await Promise.all([
    store.all('enrollments'),
    store.all('contacts'),
    store.all('orders'),
    store.all('users'),
  ])
  res.json({ enrollments, contacts, orders, users: users.map(publicUser) })
})

app.patch('/api/admin/:collection/:id', requireAdmin, async (req, res) => {
  const { collection, id: itemId } = req.params
  if (!Object.hasOwn(STATUSES, collection)) return res.status(404).json({ error: 'Олдсонгүй' })

  const status = clean(req.body?.status, 20)
  if (!STATUSES[collection].includes(status)) {
    return res.status(400).json({ error: 'Төлөв буруу байна' })
  }

  const item = await store.update(collection, itemId, {
    status,
    updatedAt: new Date().toISOString(),
  })
  if (!item) return res.status(404).json({ error: 'Олдсонгүй' })
  res.json({ ok: true, item })
})

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Олдсонгүй' })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Серверийн алдаа гарлаа' })
})

export default app

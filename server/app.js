import express from 'express'
import cors from 'cors'
import crypto from 'node:crypto'
import { courses } from './courses.js'
import { createStore } from './store.js'
import { GERMAN_LEVEL_LABELS, products } from '../src/data.js'
import {
  PROGRAM_CATEGORIES,
  PROGRAM_CATEGORY_LABELS,
  PROGRAM_STAGES,
  DOC_STATUSES,
  emptyChecklist,
  mergeChecklist,
  checklistSummary,
} from './program.js'
import { sendPushToTokens } from './fcm.js'
import {
  defaultHomework,
  homeworkSummary,
  normalizeHomework,
  HW_STATUSES,
} from './courseProgress.js'
import {
  formatSchedule,
  isClassSoon,
  nextClassAt,
  normalizeSchedule,
  WEEKDAY_LABELS,
} from './classRoom.js'

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

function publicUser(user, { includeChecklist = false } = {}) {
  const inProgram = Boolean(user.inProgram)
  const checklist = inProgram ? mergeChecklist(user.programChecklist) : []
  const base = {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email || '',
    age: user.age ?? null,
    germanLevel: user.germanLevel || 'none',
    createdAt: user.createdAt,
    inProgram,
    programCategory: inProgram && PROGRAM_CATEGORIES.includes(user.programCategory)
      ? user.programCategory
      : null,
    programStage: inProgram ? Math.min(5, Math.max(1, Number(user.programStage) || 1)) : null,
    programNote: inProgram ? String(user.programNote || '') : '',
    programSummary: inProgram ? checklistSummary(checklist) : null,
  }
  if (includeChecklist && inProgram) base.programChecklist = checklist
  return base
}

function adminUser(user) {
  const base = publicUser(user, { includeChecklist: true })
  const tokens = Array.isArray(user.pushTokens) ? user.pushTokens : []
  return {
    ...base,
    programEnrolledAt: user.programEnrolledAt || null,
    programNote: String(user.programNote || ''),
    pushTokenCount: tokens.length,
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
    attendanceCount: 0,
    homework: course.kind === 'course' ? [] : undefined,
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
  const [enrollments, contacts, orders, allGroups, allNotifs] = await Promise.all([
    store.all('enrollments', mine),
    store.all('contacts', mine),
    store.all('orders', mine),
    store.all('classGroups'),
    store.all('notifications'),
  ])
  const acceptedIds = new Set(
    enrollments.filter((e) => e.status === 'accepted').map((e) => e.courseId),
  )
  const classGroups = (allGroups || []).filter((g) => acceptedIds.has(g.courseId || g.id))
  const notifications = (allNotifs || [])
    .filter((n) => {
      if (n.userId && n.userId === req.user.id) return true
      if (n.audience === 'all') return true
      if (n.audience === 'students') {
        return enrollments.some((e) => e.kind === 'course' && e.status === 'accepted')
      }
      if (n.audience === 'aupair') {
        return (
          req.user.inProgram ||
          enrollments.some((e) => e.kind === 'country' && e.status === 'accepted')
        )
      }
      return false
    })
    .slice(0, 40)
  res.json({
    user: publicUser(req.user, { includeChecklist: true }),
    enrollments,
    contacts,
    orders,
    classGroups,
    notifications,
    programMeta: {
      stages: PROGRAM_STAGES,
      categories: PROGRAM_CATEGORY_LABELS,
      weekdays: WEEKDAY_LABELS,
    },
  })
})

async function userAcceptedForCourse(userId, courseId) {
  const list = await store.all('enrollments', { userId })
  return list.some((e) => e.courseId === courseId && e.status === 'accepted')
}

async function upsertClassGroup(courseId, patch) {
  const course = courses.find((c) => c.id === courseId)
  if (!course) return null
  const id = courseId
  const prev = await store.one('classGroups', { id })
  const schedule = normalizeSchedule(patch.schedule ?? prev?.schedule ?? {})
  const doc = {
    id,
    courseId,
    kind: course.kind,
    courseTitle: course.title,
    schedule,
    teacherName: clean(patch.teacherName ?? schedule.teacherName ?? prev?.teacherName, 80),
    homeworkBank:
      patch.homeworkBank !== undefined
        ? patch.homeworkBank
        : Array.isArray(prev?.homeworkBank)
          ? prev.homeworkBank
          : [],
    updatedAt: new Date().toISOString(),
    createdAt: prev?.createdAt || new Date().toISOString(),
  }
  if (prev) return store.update('classGroups', id, doc)
  return store.insert('classGroups', doc)
}

async function pushToCourseEnrolled(courseId, { title, body, url }) {
  const enrolled = (await store.all('enrollments', { courseId })).filter(
    (e) => e.status === 'accepted' && e.userId,
  )
  const userIds = [...new Set(enrolled.map((e) => e.userId))]
  const users = (
    await Promise.all(userIds.map((uid) => store.one('users', { id: uid })))
  ).filter(Boolean)
  const tokens = users.flatMap((u) => (u.pushTokens || []).map((t) => t.token)).filter(Boolean)
  if (!tokens.length) return { sent: 0, failed: 0, recipients: users.length, tokens: 0 }
  const result = await sendPushToTokens(tokens, { title, body, url })
  return { ...result, recipients: users.length, tokens: tokens.length }
}

/** Classroom schedule for an enrolled student. */
app.get('/api/me/classes/:courseId', requireUser, async (req, res) => {
  const courseId = clean(req.params.courseId, 60)
  if (!(await userAcceptedForCourse(req.user.id, courseId))) {
    return res.status(403).json({ error: 'Энэ ангид бүртгэлгүй байна' })
  }
  const group = (await store.one('classGroups', { id: courseId })) || null
  const next = group?.schedule ? nextClassAt(group.schedule) : null
  res.json({
    group,
    scheduleLabel: group?.schedule ? formatSchedule(group.schedule) : '',
    nextClassAt: next ? next.toISOString() : null,
    soon: group?.schedule ? isClassSoon(group.schedule) : false,
  })
})

/** Group chat messages — only accepted classmates. */
app.get('/api/me/classes/:courseId/messages', requireUser, async (req, res) => {
  const courseId = clean(req.params.courseId, 60)
  if (!(await userAcceptedForCourse(req.user.id, courseId))) {
    return res.status(403).json({ error: 'Энэ ангид бүртгэлгүй байна' })
  }
  const all = await store.all('classMessages', { courseId })
  const messages = all
    .sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')))
    .slice(-100)
  res.json({ messages })
})

app.post('/api/me/classes/:courseId/messages', requireUser, async (req, res) => {
  const courseId = clean(req.params.courseId, 60)
  if (!(await userAcceptedForCourse(req.user.id, courseId))) {
    return res.status(403).json({ error: 'Энэ ангид бүртгэлгүй байна' })
  }
  const text = clean(req.body?.text, 1000)
  if (!text) return res.status(400).json({ error: 'Зурвас хоосон байна' })

  const msg = {
    id: id(),
    courseId,
    userId: req.user.id,
    userName: req.user.name || 'Сурагч',
    role: 'student',
    text,
    createdAt: new Date().toISOString(),
  }
  await store.insert('classMessages', msg)
  res.status(201).json({ ok: true, message: msg })
})

/** User submits / updates one checklist item (link + note). Only when inProgram. */
app.patch('/api/me/program-docs/:key', requireUser, async (req, res) => {
  const user = req.user
  if (!user.inProgram) {
    return res.status(403).json({ error: 'Та хөтөлбөрт ороогүй байна' })
  }
  const key = clean(req.params.key, 40)
  const checklist = mergeChecklist(user.programChecklist)
  const idx = checklist.findIndex((d) => d.key === key)
  if (idx < 0) return res.status(404).json({ error: 'Баримт олдсонгүй' })

  const link = clean(req.body?.link, 500)
  const note = clean(req.body?.note, 500)
  if (!link && !note) {
    return res.status(400).json({ error: 'Линк эсвэл тайлбар оруулна уу' })
  }

  checklist[idx] = {
    ...checklist[idx],
    link,
    note,
    status: 'submitted',
    updatedAt: new Date().toISOString(),
  }

  const updated = await store.update('users', user.id, {
    programChecklist: checklist,
    updatedAt: new Date().toISOString(),
  })
  if (!updated) return res.status(401).json({ error: 'Дахин нэвтэрнэ үү' })
  res.json({ user: publicUser(updated, { includeChecklist: true }), item: checklist[idx] })
})

/** Save / refresh FCM device token for the signed-in user. */
app.post('/api/me/push-token', requireUser, async (req, res) => {
  const token = clean(req.body?.token, 4096)
  const platform = clean(req.body?.platform, 20) || 'unknown'
  if (!token) return res.status(400).json({ error: 'Token шаардлагатай' })

  const existing = Array.isArray(req.user.pushTokens) ? req.user.pushTokens : []
  const next = [
    { token, platform, updatedAt: new Date().toISOString() },
    ...existing.filter((t) => t.token !== token),
  ].slice(0, 8)

  const updated = await store.update('users', req.user.id, {
    pushTokens: next,
    updatedAt: new Date().toISOString(),
  })
  if (!updated) return res.status(401).json({ error: 'Дахин нэвтэрнэ үү' })
  res.json({ ok: true, count: next.length })
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
  const mapped = users.map(adminUser)
  const programUsers = mapped.filter((u) => u.inProgram)
  const pendingDocs = programUsers.reduce(
    (n, u) => n + (u.programSummary?.submitted || 0),
    0,
  )
  res.json({
    enrollments,
    contacts,
    orders,
    users: mapped,
    program: {
      users: programUsers,
      pendingDocs,
      enrolled: programUsers.length,
    },
    programMeta: {
      stages: PROGRAM_STAGES,
      categories: PROGRAM_CATEGORY_LABELS,
      docStatuses: DOC_STATUSES,
    },
  })
})

/** Admin enrolls / updates program fields for a user. */
app.patch('/api/admin/users/:id/program', requireAdmin, async (req, res) => {
  const user = await store.one('users', { id: req.params.id })
  if (!user) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' })

  const body = req.body || {}
  const patch = { updatedAt: new Date().toISOString() }

  if (body.inProgram !== undefined) {
    const on = Boolean(body.inProgram)
    patch.inProgram = on
    if (on) {
      patch.programStage = Math.min(5, Math.max(1, Number(body.programStage) || user.programStage || 1))
      patch.programCategory = PROGRAM_CATEGORIES.includes(body.programCategory)
        ? body.programCategory
        : user.programCategory || 'standard'
      patch.programChecklist = mergeChecklist(
        body.resetChecklist ? emptyChecklist() : user.programChecklist?.length ? user.programChecklist : emptyChecklist(),
      )
      if (body.programNote !== undefined) patch.programNote = clean(body.programNote, 500)
      if (!user.programEnrolledAt) patch.programEnrolledAt = new Date().toISOString()
    } else {
      patch.programStage = null
      patch.programCategory = null
      // keep checklist history on user for audit; hide via inProgram flag
    }
  } else if (user.inProgram) {
    if (body.programStage !== undefined) {
      const stage = Number(body.programStage)
      if (!Number.isInteger(stage) || stage < 1 || stage > 5) {
        return res.status(400).json({ error: 'Шат 1–5 байна' })
      }
      patch.programStage = stage
    }
    if (body.programCategory !== undefined) {
      if (!PROGRAM_CATEGORIES.includes(body.programCategory)) {
        return res.status(400).json({ error: 'Ангилал буруу байна' })
      }
      patch.programCategory = body.programCategory
    }
    if (body.programNote !== undefined) patch.programNote = clean(body.programNote, 500)
    if (body.resetChecklist) {
      patch.programChecklist = emptyChecklist()
    }
  } else {
    return res.status(400).json({ error: 'Эхлээд хөтөлбөрт оруулна уу' })
  }

  const updated = await store.update('users', user.id, patch)
  if (!updated) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' })
  res.json({ ok: true, user: adminUser(updated) })
})

/** Admin reviews / edits one checklist document. */
app.patch('/api/admin/users/:id/program-docs/:key', requireAdmin, async (req, res) => {
  const user = await store.one('users', { id: req.params.id })
  if (!user) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' })
  if (!user.inProgram) return res.status(400).json({ error: 'Хэрэглэгч хөтөлбөрт ороогүй' })

  const key = clean(req.params.key, 40)
  const body = req.body || {}
  const status = body.status !== undefined ? clean(body.status, 20) : undefined
  if (status !== undefined && !DOC_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Төлөв буруу байна' })
  }

  const checklist = mergeChecklist(user.programChecklist)
  const idx = checklist.findIndex((d) => d.key === key)
  if (idx < 0) return res.status(404).json({ error: 'Баримт олдсонгүй' })

  const next = { ...checklist[idx], updatedAt: new Date().toISOString() }
  if (status !== undefined) next.status = status
  if (body.adminNote !== undefined) next.adminNote = clean(body.adminNote, 500)
  if (body.link !== undefined) next.link = clean(body.link, 500)
  if (body.note !== undefined) next.note = clean(body.note, 500)
  if (status === 'empty') {
    next.link = body.link !== undefined ? next.link : ''
    next.note = body.note !== undefined ? next.note : ''
    next.adminNote = body.adminNote !== undefined ? next.adminNote : ''
  }
  checklist[idx] = next

  const updated = await store.update('users', user.id, {
    programChecklist: checklist,
    updatedAt: new Date().toISOString(),
  })
  if (!updated) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' })
  res.json({ ok: true, user: adminUser(updated), item: checklist[idx] })
})

app.patch('/api/admin/:collection/:id', requireAdmin, async (req, res) => {
  const { collection, id: itemId } = req.params
  if (!Object.hasOwn(STATUSES, collection)) return res.status(404).json({ error: 'Олдсонгүй' })

  const status = clean(req.body?.status, 20)
  if (!STATUSES[collection].includes(status)) {
    return res.status(400).json({ error: 'Төлөв буруу байна' })
  }

  const patch = {
    status,
    updatedAt: new Date().toISOString(),
  }

  if (collection === 'enrollments' && status === 'accepted') {
    const prev = await store.one(collection, { id: itemId })
    if (prev?.kind === 'course') {
      const hw = normalizeHomework(prev.homework)
      if (hw.length === 0) patch.homework = defaultHomework(prev.courseId)
      if (typeof prev.attendanceCount !== 'number') patch.attendanceCount = 0
    }
    // Au Pair улсын элсэлт зөвшөөрөгдөхөд автоматаар хөтөлбөрт оруулна
    if (prev?.kind === 'country' && prev.userId) {
      const enrollee = await store.one('users', { id: prev.userId })
      if (enrollee && !enrollee.inProgram) {
        await store.update('users', enrollee.id, {
          inProgram: true,
          programStage: Number(enrollee.programStage) || 1,
          programCategory: PROGRAM_CATEGORIES.includes(enrollee.programCategory)
            ? enrollee.programCategory
            : 'standard',
          programChecklist: mergeChecklist(
            enrollee.programChecklist?.length ? enrollee.programChecklist : emptyChecklist(),
          ),
          programEnrolledAt: enrollee.programEnrolledAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    }
  }

  const item = await store.update(collection, itemId, patch)
  if (!item) return res.status(404).json({ error: 'Олдсонгүй' })
  res.json({ ok: true, item })
})

/** Admin: change enrollment type (course ↔ country) and target program. */
app.patch('/api/admin/enrollments/:id/assign', requireAdmin, async (req, res) => {
  const prev = await store.one('enrollments', { id: req.params.id })
  if (!prev) return res.status(404).json({ error: 'Олдсонгүй' })

  const body = req.body || {}
  const patch = { updatedAt: new Date().toISOString() }

  if (body.kind !== undefined) {
    if (body.kind !== 'course' && body.kind !== 'country') {
      return res.status(400).json({ error: 'Төрөл буруу (course | country)' })
    }
    patch.kind = body.kind
  }

  if (body.courseId !== undefined) {
    const courseId = clean(body.courseId, 60)
    const course = courses.find((c) => c.id === courseId)
    if (!course) return res.status(404).json({ error: 'Хөтөлбөр олдсонгүй' })
    const nextKind = patch.kind || prev.kind
    if (course.kind !== nextKind) {
      return res.status(400).json({
        error:
          nextKind === 'course'
            ? 'Сургалтын анги сонгоно уу'
            : 'Au Pair улс сонгоно уу',
      })
    }
    patch.courseId = course.id
    patch.courseTitle = course.title
    patch.kind = course.kind
  }

  if (body.courseTitle !== undefined && body.courseId === undefined) {
    patch.courseTitle = clean(body.courseTitle, 160)
  }

  // Switching to course: ensure progress fields exist
  const finalKind = patch.kind || prev.kind
  if (finalKind === 'course') {
    if (typeof prev.attendanceCount !== 'number' && patch.attendanceCount === undefined) {
      patch.attendanceCount = prev.attendanceCount ?? 0
    }
    if (!Array.isArray(prev.homework) && patch.homework === undefined) {
      patch.homework = []
    }
  }

  const item = await store.update('enrollments', prev.id, patch)
  if (!item) return res.status(404).json({ error: 'Олдсонгүй' })
  res.json({ ok: true, item })
})

/** Admin: attendance + homework for a course enrollment. */
app.patch('/api/admin/enrollments/:id/progress', requireAdmin, async (req, res) => {
  const prev = await store.one('enrollments', { id: req.params.id })
  if (!prev) return res.status(404).json({ error: 'Олдсонгүй' })
  if (prev.kind !== 'course') {
    return res.status(400).json({ error: 'Зөвхөн хэлний сургалтын бүртгэлд ашиглана' })
  }

  const body = req.body || {}
  const patch = { updatedAt: new Date().toISOString() }

  if (body.attendanceCount !== undefined) {
    const n = Number.parseInt(body.attendanceCount, 10)
    if (!Number.isInteger(n) || n < 0 || n > 999) {
      return res.status(400).json({ error: 'Ирцийн тоо буруу' })
    }
    patch.attendanceCount = n
  }

  if (body.homework !== undefined) {
    patch.homework = normalizeHomework(body.homework)
  }

  if (body.addHomework) {
    const title = clean(
      typeof body.addHomework === 'string' ? body.addHomework : body.addHomework.title,
      120,
    )
    if (!title) return res.status(400).json({ error: 'Даалгаврын нэр оруулна уу' })
    const list = normalizeHomework(prev.homework)
    list.push({
      id: id(),
      title,
      hint: clean(typeof body.addHomework === 'object' ? body.addHomework.hint : '', 160),
      status: 'pending',
      note: '',
      updatedAt: new Date().toISOString(),
    })
    patch.homework = list
  }

  if (body.homeworkId && body.homeworkStatus) {
    if (!HW_STATUSES.includes(body.homeworkStatus)) {
      return res.status(400).json({ error: 'Даалгаврын төлөв буруу' })
    }
    const list = normalizeHomework(prev.homework)
    const idx = list.findIndex((h) => h.id === clean(body.homeworkId, 40))
    if (idx < 0) return res.status(404).json({ error: 'Даалгавар олдсонгүй' })
    list[idx] = {
      ...list[idx],
      status: body.homeworkStatus,
      updatedAt: new Date().toISOString(),
    }
    patch.homework = list
  }

  const item = await store.update('enrollments', prev.id, patch)
  if (!item) return res.status(404).json({ error: 'Олдсонгүй' })
  res.json({
    ok: true,
    item,
    homeworkSummary: homeworkSummary(item.homework),
  })
})

/** Student: mark own homework done / pending. */
app.patch('/api/me/enrollments/:id/homework/:hwId', async (req, res) => {
  const user = await authUser(req)
  if (!user) return res.status(401).json({ error: 'Нэвтэрнэ үү' })

  const prev = await store.one('enrollments', { id: req.params.id })
  if (!prev || prev.userId !== user.id) {
    return res.status(404).json({ error: 'Бүртгэл олдсонгүй' })
  }

  const status = clean(req.body?.status, 20)
  if (!HW_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Төлөв буруу' })
  }

  const list = normalizeHomework(prev.homework)
  const idx = list.findIndex((h) => h.id === clean(req.params.hwId, 40))
  if (idx < 0) return res.status(404).json({ error: 'Даалгавар олдсонгүй' })

  list[idx] = { ...list[idx], status, updatedAt: new Date().toISOString() }
  const item = await store.update('enrollments', prev.id, {
    homework: list,
    updatedAt: new Date().toISOString(),
  })
  res.json({ ok: true, item, homeworkSummary: homeworkSummary(list) })
})

/** Admin: set classroom schedule (shared by all accepted students in courseId). */
app.put('/api/admin/classes/:courseId', requireAdmin, async (req, res) => {
  const courseId = clean(req.params.courseId, 60)
  const group = await upsertClassGroup(courseId, {
    schedule: req.body?.schedule,
    teacherName: req.body?.teacherName,
  })
  if (!group) return res.status(404).json({ error: 'Хөтөлбөр олдсонгүй' })
  res.json({ ok: true, group, scheduleLabel: formatSchedule(group.schedule) })
})

/**
 * Багш/админ: ангийн бүх элссэн сурагчид даалгавар тавих.
 * body: { title, hint? }
 */
app.post('/api/admin/classes/:courseId/homework', requireAdmin, async (req, res) => {
  const courseId = clean(req.params.courseId, 60)
  const course = courses.find((c) => c.id === courseId)
  if (!course) return res.status(404).json({ error: 'Хөтөлбөр олдсонгүй' })
  if (course.kind === 'country') {
    return res.status(400).json({ error: 'Зөвхөн хэлний ангид даалгавар тавина' })
  }

  const title = clean(req.body?.title, 120)
  const hint = clean(req.body?.hint, 160)
  if (!title) return res.status(400).json({ error: 'Даалгаврын нэр оруулна уу' })

  const hwId = id()
  const now = new Date().toISOString()
  const hwItem = {
    id: hwId,
    title,
    hint,
    status: 'pending',
    note: '',
    updatedAt: now,
    assignedAt: now,
  }

  const enrolled = (await store.all('enrollments', { courseId })).filter(
    (e) => e.status === 'accepted' && e.kind === 'course',
  )
  let updated = 0
  for (const e of enrolled) {
    const list = normalizeHomework(e.homework)
    list.push({ ...hwItem })
    await store.update('enrollments', e.id, {
      homework: list,
      updatedAt: now,
    })
    updated += 1
  }

  // classGroup дээр жагсаалт хадгална (админ харах)
  const group = (await store.one('classGroups', { id: courseId })) || {
    id: courseId,
    courseId,
    kind: 'course',
    courseTitle: course.title,
  }
  const bank = Array.isArray(group.homeworkBank) ? group.homeworkBank : []
  bank.unshift({ id: hwId, title, hint, createdAt: now })
  await upsertClassGroup(courseId, {
    homeworkBank: bank.slice(0, 40),
    teacherName: group.teacherName,
    schedule: group.schedule,
  })

  // Сурагчдад push (байвал)
  await pushToCourseEnrolled(courseId, {
    title: `${course.title} · шинэ даалгавар`,
    body: title + (hint ? ` — ${hint}` : ''),
    url: '/learn?tab=schedule',
  }).catch(() => null)

  res.status(201).json({ ok: true, homework: hwItem, assignedTo: updated })
})

/** Admin: push class reminder to all accepted students in a course/country. */
app.post('/api/admin/classes/:courseId/notify', requireAdmin, async (req, res) => {
  const courseId = clean(req.params.courseId, 60)
  const course = courses.find((c) => c.id === courseId)
  if (!course) return res.status(404).json({ error: 'Хөтөлбөр олдсонгүй' })

  const group = (await store.one('classGroups', { id: courseId })) || null
  const label = group?.schedule ? formatSchedule(group.schedule) : ''
  const isAuPair = course.kind === 'country'
  const title =
    clean(req.body?.title, 120) ||
    (isAuPair ? `${course.title} · уулзалт` : `${course.title} · хичээл`)
  const body =
    clean(req.body?.body, 500) ||
    (label
      ? `${label}${group?.schedule?.room ? ` · ${group.schedule.room}` : ''}${group?.teacherName ? ` · ${group.teacherName}` : ''}`
      : 'Удахгүй эхэлнэ. Апп руу орж шалгаарай.')
  const url = isAuPair ? '/countries' : '/learn?tab=myclass'

  const result = await pushToCourseEnrolled(courseId, { title, body, url })
  if (result.error) return res.status(503).json({ error: result.error })
  if (!result.tokens) {
    return res.status(400).json({ error: 'Энэ ангийн сурагчдад push token алга' })
  }
  res.json({ ok: true, ...result })
})

/** Admin: post as teacher in class chat. */
app.post('/api/admin/classes/:courseId/messages', requireAdmin, async (req, res) => {
  const courseId = clean(req.params.courseId, 60)
  const course = courses.find((c) => c.id === courseId)
  if (!course) return res.status(404).json({ error: 'Хөтөлбөр олдсонгүй' })
  const text = clean(req.body?.text, 1000)
  if (!text) return res.status(400).json({ error: 'Зурвас хоосон байна' })
  const teacherName = clean(req.body?.teacherName, 80) || 'Багш'

  const msg = {
    id: id(),
    courseId,
    userId: 'teacher',
    userName: teacherName,
    role: 'teacher',
    text,
    createdAt: new Date().toISOString(),
  }
  await store.insert('classMessages', msg)
  res.status(201).json({ ok: true, message: msg })
})

/** Cron-friendly: notify classes starting within the next `withinHours` (default 2). */
app.post('/api/admin/notify-upcoming-classes', requireAdmin, async (req, res) => {
  const withinHours = Math.min(12, Math.max(1, Number(req.body?.withinHours) || 2))
  const groups = await store.all('classGroups')
  const results = []
  for (const group of groups) {
    if (!isClassSoon(group.schedule, withinHours * 60 * 60 * 1000)) continue
    const label = formatSchedule(group.schedule)
    const isAuPair = group.kind === 'country'
    const result = await pushToCourseEnrolled(group.courseId, {
      title: isAuPair ? `${group.courseTitle} · уулзалт` : `${group.courseTitle} · хичээл эхэлнэ`,
      body: `${label}${group.schedule?.room ? ` · ${group.schedule.room}` : ''}`,
      url: isAuPair ? '/countries' : '/learn?tab=myclass',
    })
    results.push({ courseId: group.courseId, ...result })
  }
  res.json({ ok: true, withinHours, notified: results.length, results })
})

/**
 * Admin → хүүхдүүд рүү мэдэгдэл.
 * audience: all | students | aupair | user (userId шаардлагатай)
 * In-app хадгална; push token байвал FCM илгээнэ.
 */
app.post('/api/admin/notify', requireAdmin, async (req, res) => {
  const title = clean(req.body?.title, 120)
  const body = clean(req.body?.body, 500)
  const url = clean(req.body?.url, 200)
  const userId = clean(req.body?.userId, 80)
  const audience = clean(req.body?.audience, 20) || (userId ? 'user' : 'all')
  if (!title || !body) {
    return res.status(400).json({ error: 'Гарчиг болон мессеж оруулна уу' })
  }
  if (!['all', 'students', 'aupair', 'user'].includes(audience)) {
    return res.status(400).json({ error: 'Хүлээн авагч буруу (all|students|aupair|user)' })
  }
  if (audience === 'user' && !userId) {
    return res.status(400).json({ error: 'Хэрэглэгч сонгоно уу' })
  }

  const allUsers = await store.all('users')
  const enrollments = await store.all('enrollments')
  const acceptedByUser = new Map()
  for (const e of enrollments) {
    if (e.status !== 'accepted' || !e.userId) continue
    const list = acceptedByUser.get(e.userId) || []
    list.push(e)
    acceptedByUser.set(e.userId, list)
  }

  let users = []
  if (audience === 'user') {
    users = allUsers.filter((u) => u.id === userId)
    if (!users.length) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' })
  } else if (audience === 'students') {
    users = allUsers.filter((u) =>
      (acceptedByUser.get(u.id) || []).some((e) => e.kind === 'course'),
    )
  } else if (audience === 'aupair') {
    users = allUsers.filter(
      (u) =>
        u.inProgram || (acceptedByUser.get(u.id) || []).some((e) => e.kind === 'country'),
    )
  } else {
    users = allUsers
  }

  if (!users.length) {
    return res.status(400).json({ error: 'Энэ бүлэгт хэрэглэгч алга' })
  }

  const now = new Date().toISOString()
  const batchId = crypto.randomUUID()

  // Broadcast нэг бичлэг (all/students/aupair) эсвэл user бүрт
  if (audience === 'user') {
    await store.insert('notifications', {
      id: crypto.randomUUID(),
      batchId,
      userId: users[0].id,
      audience: 'user',
      title,
      body,
      url: url || '',
      createdAt: now,
    })
  } else {
    await store.insert('notifications', {
      id: crypto.randomUUID(),
      batchId,
      audience,
      title,
      body,
      url: url || '',
      createdAt: now,
    })
  }

  const tokens = users.flatMap((u) => (u.pushTokens || []).map((t) => t.token)).filter(Boolean)
  let push = { sent: 0, failed: 0, tokens: tokens.length }
  if (tokens.length) {
    const result = await sendPushToTokens(tokens, { title, body, url: url || undefined })
    if (result.error) {
      push = { ...push, error: result.error, sent: 0 }
    } else {
      push = { ...push, ...result }
    }
  }

  res.json({
    ok: true,
    recipients: users.length,
    inApp: true,
    ...push,
  })
})

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Олдсонгүй' })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Серверийн алдаа гарлаа' })
})

export default app

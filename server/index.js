import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { courses } from './courses.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const ENROLLMENTS_FILE = path.join(DATA_DIR, 'enrollments.json')
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')

const PORT = process.env.PORT || 3001
const ADMIN_KEY = process.env.ADMIN_KEY || 'aupair-admin'

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
for (const file of [ENROLLMENTS_FILE, CONTACTS_FILE, ORDERS_FILE]) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]', 'utf8')
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return []
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
}

function id() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function seatsLeft(courseId) {
  const course = courses.find((c) => c.id === courseId)
  if (!course) return 0
  const enrolled = readJson(ENROLLMENTS_FILE).filter(
    (e) => e.courseId === courseId && e.status !== 'cancelled',
  ).length
  return Math.max(0, course.seats - enrolled - (course.reserved || 0))
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'mongolian-aupair-api' })
})

app.get('/api/courses', (_req, res) => {
  const list = courses.map((course) => ({
    ...course,
    seatsLeft: seatsLeft(course.id),
  }))
  res.json(list)
})

app.get('/api/courses/:id', (req, res) => {
  const course = courses.find((c) => c.id === req.params.id)
  if (!course) return res.status(404).json({ error: 'Хөтөлбөр олдсонгүй' })
  res.json({ ...course, seatsLeft: seatsLeft(course.id) })
})

app.post('/api/enrollments', (req, res) => {
  const { name, phone, email, courseId, note, level } = req.body || {}

  if (!name?.trim() || !phone?.trim() || !courseId) {
    return res.status(400).json({
      error: 'Нэр, утас, хөтөлбөр заавал бөглөнө үү',
    })
  }

  const course = courses.find((c) => c.id === courseId)
  if (!course) return res.status(404).json({ error: 'Хөтөлбөр олдсонгүй' })

  const left = seatsLeft(courseId)
  if (left <= 0) {
    return res.status(409).json({ error: 'Энэ хөтөлбөрийн суудал дууссан байна' })
  }

  const enrollment = {
    id: id(),
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: email ? String(email).trim() : '',
    courseId,
    courseTitle: course.title,
    level: level ? String(level).trim() : course.level,
    note: note ? String(note).trim() : '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  const all = readJson(ENROLLMENTS_FILE)
  all.unshift(enrollment)
  writeJson(ENROLLMENTS_FILE, all)

  res.status(201).json({
    ok: true,
    enrollment,
    seatsLeft: seatsLeft(courseId),
    message: 'Бүртгэл амжилттай. Бид удахгүй холбогдоно.',
  })
})

app.get('/api/enrollments', (req, res) => {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Зөвшөөрөлгүй' })
  }
  res.json(readJson(ENROLLMENTS_FILE))
})

app.post('/api/contacts', (req, res) => {
  const { name, phone, email, interest, message } = req.body || {}
  if (!name?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: 'Нэр, утас заавал' })
  }

  const item = {
    id: id(),
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: email ? String(email).trim() : '',
    interest: interest || 'other',
    message: message ? String(message).trim() : '',
    createdAt: new Date().toISOString(),
  }

  const all = readJson(CONTACTS_FILE)
  all.unshift(item)
  writeJson(CONTACTS_FILE, all)
  res.status(201).json({ ok: true, message: 'Хүсэлт хүлээн авлаа' })
})

app.post('/api/orders', (req, res) => {
  const { name, phone, items } = req.body || {}
  if (!name?.trim() || !phone?.trim() || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: 'Нэр, утас, бараа заавал' })
  }

  const order = {
    id: id(),
    name: String(name).trim(),
    phone: String(phone).trim(),
    items,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  const all = readJson(ORDERS_FILE)
  all.unshift(order)
  writeJson(ORDERS_FILE, all)
  res.status(201).json({ ok: true, order, message: 'Захиалга бүртгэгдлээ' })
})

const DIST = path.join(__dirname, '../dist')
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST, { index: false }))
  app.get(/^(?!\/api).*/, (req, res) => {
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

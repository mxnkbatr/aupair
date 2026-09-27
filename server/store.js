import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const COLLECTIONS = ['users', 'enrollments', 'contacts', 'orders']

const MONGODB_URI = process.env.MONGODB_URI || ''
const MONGODB_DB = process.env.MONGODB_DB || 'mongolian_aupair'

function matches(item, query) {
  return Object.entries(query).every(([key, value]) => item[key] === value)
}

function newestFirst(a, b) {
  return String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
}

function createFileStore() {
  const dir =
    process.env.DATA_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'data')
  const fileOf = (name) => path.join(dir, `${name}.json`)

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  for (const name of COLLECTIONS) {
    if (!fs.existsSync(fileOf(name))) fs.writeFileSync(fileOf(name), '[]', 'utf8')
  }

  const read = (name) => {
    try {
      return JSON.parse(fs.readFileSync(fileOf(name), 'utf8'))
    } catch {
      return []
    }
  }
  const write = (name, data) => {
    const tmp = `${fileOf(name)}.tmp`
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8')
    fs.renameSync(tmp, fileOf(name))
  }

  return {
    kind: 'file',
    async all(name, query = {}) {
      return read(name).filter((x) => matches(x, query)).sort(newestFirst)
    },
    async one(name, query) {
      return read(name).find((x) => matches(x, query)) || null
    },
    async insert(name, doc) {
      const list = read(name)
      list.unshift(doc)
      write(name, list)
      return doc
    },
    async update(name, id, patch) {
      const list = read(name)
      const item = list.find((x) => x.id === id)
      if (!item) return null
      Object.assign(item, patch)
      write(name, list)
      return item
    },
    async secret() {
      const file = path.join(dir, 'secret.key')
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, crypto.randomBytes(32).toString('hex'), 'utf8')
      }
      return fs.readFileSync(file, 'utf8').trim()
    },
  }
}

async function createMongoStore() {
  const { MongoClient } = await import('mongodb')
  globalThis.__aupairMongo ??= new MongoClient(MONGODB_URI, { maxPoolSize: 5 }).connect()
  const client = await globalThis.__aupairMongo
  const db = client.db(MONGODB_DB)
  const col = (name) => db.collection(name)
  const hideId = { projection: { _id: 0 } }

  await Promise.all([
    col('users').createIndex({ id: 1 }, { unique: true }),
    col('users').createIndex({ phoneKey: 1 }, { unique: true }),
    col('enrollments').createIndex({ courseId: 1 }),
    ...['enrollments', 'contacts', 'orders'].flatMap((name) => [
      col(name).createIndex({ id: 1 }, { unique: true }),
      col(name).createIndex({ userId: 1 }),
    ]),
  ]).catch((err) => console.warn('Mongo index:', err.message))

  return {
    kind: 'mongo',
    all(name, query = {}) {
      return col(name).find(query, hideId).sort({ createdAt: -1 }).toArray()
    },
    one(name, query) {
      return col(name).findOne(query, hideId)
    },
    async insert(name, doc) {
      await col(name).insertOne({ ...doc })
      return doc
    },
    update(name, id, patch) {
      return col(name).findOneAndUpdate(
        { id },
        { $set: patch },
        { ...hideId, returnDocument: 'after' },
      )
    },
    async secret() {
      const meta = col('meta')
      await meta.updateOne(
        { _id: 'auth-secret' },
        { $setOnInsert: { value: crypto.randomBytes(32).toString('hex') } },
        { upsert: true },
      )
      return (await meta.findOne({ _id: 'auth-secret' })).value
    },
  }
}

function createMissingStore() {
  const fail = async () => {
    throw Object.assign(new Error('MONGODB_URI тохируулаагүй байна'), { status: 503 })
  }
  return { kind: 'missing', all: fail, one: fail, insert: fail, update: fail, secret: fail }
}

export async function createStore() {
  if (MONGODB_URI) return createMongoStore()
  if (process.env.VERCEL) return createMissingStore()
  return createFileStore()
}

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Load repo-root .env into process.env (does not override existing keys). */
export function loadEnv() {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
  const file = path.join(root, '.env')
  if (!fs.existsSync(file)) return
  const text = fs.readFileSync(file, 'utf8')
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const i = line.indexOf('=')
    if (i <= 0) continue
    const key = line.slice(0, i).trim()
    let value = line.slice(i + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

loadEnv()

/** Firebase Cloud Messaging helpers (optional — needs service account). */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

let messaging = null
let initTried = false

function loadCredential() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || ''
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      try {
        return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'))
      } catch {
        /* fall through */
      }
    }
  }

  const file =
    process.env.FIREBASE_SERVICE_ACCOUNT_FILE ||
    path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'firebase-adminsdk.json')
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    /* ignore */
  }
  return null
}

export async function getMessaging() {
  if (messaging) return messaging
  if (initTried) return null
  initTried = true

  const cred = loadCredential()
  if (!cred) {
    console.warn('FIREBASE_SERVICE_ACCOUNT_JSON тохируулаагүй — push илгээх боломжгүй')
    return null
  }

  const { cert, getApps, initializeApp } = await import('firebase-admin/app')
  const { getMessaging: getFcm } = await import('firebase-admin/messaging')

  if (!getApps().length) {
    initializeApp({ credential: cert(cred) })
  }
  messaging = getFcm()
  return messaging
}

export async function sendPushToTokens(tokens, { title, body, url } = {}) {
  const list = [...new Set((tokens || []).filter(Boolean))]
  if (!list.length) return { sent: 0, failed: 0, skipped: true }

  const msg = await getMessaging()
  if (!msg) return { sent: 0, failed: list.length, error: 'FCM тохируулаагүй' }

  const res = await msg.sendEachForMulticast({
    tokens: list,
    notification: {
      title: String(title || 'Au Pair Mongolia').slice(0, 120),
      body: String(body || '').slice(0, 500),
    },
    data: url ? { url: String(url).slice(0, 200) } : undefined,
    android: {
      priority: 'high',
      notification: { channelId: 'default' },
    },
  })

  return {
    sent: res.successCount,
    failed: res.failureCount,
  }
}

/**
 * QPay merchant API (v2) — invoice create + payment check.
 * Env: QPAY_INVOICE_CODE, QPAY_CLIENT_NAME, QPAY_PASSWORD, QPAY_API_BASE_URL, QPAY_CALLBACK_URL
 */

let tokenCache = null

export function getQPayConfig() {
  const baseUrl = (process.env.QPAY_API_BASE_URL || 'https://merchant.qpay.mn').replace(/\/$/, '')
  const invoiceCode = process.env.QPAY_INVOICE_CODE || 'MUNKHBAATAR_INVOICE'
  const clientName = process.env.QPAY_CLIENT_NAME || 'MUNKHBAATAR'
  const password = process.env.QPAY_PASSWORD
  const authUrl = (process.env.QPAY_AUTH_URL || `${baseUrl}/v2/auth/token`).replace(/\/$/, '')

  const appUrl =
    process.env.QPAY_PUBLIC_URL ||
    process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  let callbackUrl = process.env.QPAY_CALLBACK_URL || (appUrl ? `${appUrl}/api/qpay/callback` : '')
  if (callbackUrl && !callbackUrl.endsWith('/')) callbackUrl = `${callbackUrl}/`

  if (!invoiceCode || !password) {
    throw new Error('QPay тохиргоо дутуу: QPAY_INVOICE_CODE, QPAY_PASSWORD')
  }
  if (!callbackUrl) {
    throw new Error('QPAY_CALLBACK_URL эсвэл VERCEL_URL тохируулна уу')
  }

  return { baseUrl, authUrl, invoiceCode, clientName, password, callbackUrl }
}

export function isQPayConfigured() {
  try {
    getQPayConfig()
    return true
  } catch {
    return false
  }
}

function storeToken(data) {
  const now = Date.now()
  const safetyMs = 30_000
  tokenCache = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    accessExpiresAt: now + Math.max((data.expires_in || 3600) * 1000 - safetyMs, 0),
    refreshExpiresAt: now + Math.max((data.refresh_expires_in || 86400) * 1000 - safetyMs, 0),
  }
  return tokenCache
}

async function authenticate() {
  const { authUrl, clientName, password } = getQPayConfig()
  const basic = Buffer.from(`${clientName}:${password}`).toString('base64')
  const res = await fetch(authUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`QPay auth алдаа (${res.status}): ${body}`)
  }
  const data = await res.json()
  return storeToken(data).accessToken
}

async function refreshAccessToken(refreshToken) {
  const { baseUrl } = getQPayConfig()
  const res = await fetch(`${baseUrl}/v2/auth/refresh`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${refreshToken}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    tokenCache = null
    return authenticate()
  }
  const data = await res.json()
  return storeToken(data).accessToken
}

async function getQPayAccessToken() {
  const now = Date.now()
  if (tokenCache && tokenCache.accessExpiresAt > now) return tokenCache.accessToken
  if (tokenCache && tokenCache.refreshExpiresAt > now) {
    return refreshAccessToken(tokenCache.refreshToken)
  }
  return authenticate()
}

async function qpayFetch(path, init, retry = true) {
  const { baseUrl } = getQPayConfig()
  const token = await getQPayAccessToken()
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  })
  if (res.status === 401 && retry) {
    tokenCache = null
    return qpayFetch(path, init, false)
  }
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`QPay ${path} алдаа (${res.status}): ${body}`)
  }
  return res.json()
}

export async function createQPayInvoice({ senderInvoiceNo, description, amountMnt }) {
  const { invoiceCode, callbackUrl } = getQPayConfig()
  return qpayFetch('/v2/invoice', {
    method: 'POST',
    body: JSON.stringify({
      invoice_code: invoiceCode,
      sender_invoice_no: senderInvoiceNo,
      invoice_receiver_code: 'terminal',
      invoice_description: description.slice(0, 250),
      amount: amountMnt,
      callback_url: callbackUrl,
    }),
  })
}

export async function checkQPayInvoicePayment(invoiceId) {
  return qpayFetch('/v2/payment/check', {
    method: 'POST',
    body: JSON.stringify({
      object_type: 'INVOICE',
      object_id: invoiceId,
      offset: { page_number: 1, page_limit: 10 },
    }),
  })
}

export function isInvoicePaid(result) {
  return Boolean(
    result &&
      result.count > 0 &&
      Array.isArray(result.rows) &&
      result.rows.some((row) => row.payment_status === 'PAID'),
  )
}

export function publicPaymentPayload(enrollment) {
  const p = enrollment?.payment
  if (!p) return null
  return {
    invoiceId: p.invoiceId || null,
    amount: p.amount || null,
    qrImage: p.qrImage || null,
    qrText: p.qrText || null,
    shortUrl: p.shortUrl || null,
    urls: p.urls || [],
    status: p.status || enrollment.status,
  }
}

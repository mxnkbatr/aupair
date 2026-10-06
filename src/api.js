import { social } from './data'

const ENV_API = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

/** Web: `/api` (Vite proxy / Express). Native: set `VITE_API_URL` to your deployed server origin. */
const API_BASE = ENV_API ? `${ENV_API}/api` : '/api'
const TIMEOUT_MS = 15000

const TOKEN_STORAGE = 'aupair-token'

export const OFFLINE_MESSAGE = `Сервертэй холбогдож чадсангүй. Интернэтээ шалгаад дахин оролдоно уу, эсвэл ${social.phone} утсаар холбогдоно уу.`

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE) || ''
  } catch {
    return ''
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE, token)
    else localStorage.removeItem(TOKEN_STORAGE)
  } catch {
    // storage unavailable (private mode)
  }
}

async function request(path, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const token = getToken()
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      signal: controller.signal,
    })
  } catch {
    throw new Error(OFFLINE_MESSAGE)
  } finally {
    clearTimeout(timer)
  }

  const data = await res.json().catch(() => null)
  if (!res.ok || data === null) {
    const error = new Error(data?.error || OFFLINE_MESSAGE)
    error.status = res.status
    throw error
  }
  return data
}

function post(path, payload, headers) {
  return request(path, { method: 'POST', body: JSON.stringify(payload), headers })
}

export const api = {
  getCourses: () => request('/courses'),
  getCourse: (id) => request(`/courses/${id}`),
  enroll: (payload) => post('/enrollments', payload),
  contact: (payload) => post('/contacts', payload),
  order: (payload) => post('/orders', payload),
  register: (payload) => post('/auth/register', payload),
  login: (payload) => post('/auth/login', payload),
  me: () => request('/me'),
  updateMe: (payload) => request('/me', { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteMe: () => request('/me', { method: 'DELETE' }),
  adminData: (key) => request('/admin/data', { headers: { 'x-admin-key': key } }),
  adminSetStatus: (key, collection, id, status) =>
    request(`/admin/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      headers: { 'x-admin-key': key },
    }),
}

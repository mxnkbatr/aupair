import { Capacitor } from '@capacitor/core'
import { social } from './data'

const ENV_API = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
/** Bundled Capacitor shell cannot use relative `/api` — hit the deployed origin. */
const NATIVE_API_ORIGIN = 'https://aupair-app.vercel.app'

/**
 * Web: `/api` (Vite proxy / Express).
 * Native: `VITE_API_URL` or production Vercel origin.
 */
const API_ORIGIN = ENV_API || (Capacitor.isNativePlatform() ? NATIVE_API_ORIGIN : '')
const API_BASE = API_ORIGIN ? `${API_ORIGIN}/api` : '/api'
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
  mirrorToken(token)
}

/**
 * Native only: WKWebView can purge localStorage, so the token is mirrored to
 * Capacitor Preferences (Keychain/UserDefaults-backed). localStorage stays the sync source of truth.
 */
function mirrorToken(token) {
  if (!Capacitor.isNativePlatform()) return
  import('@capacitor/preferences')
    .then(({ Preferences }) =>
      token
        ? Preferences.set({ key: TOKEN_STORAGE, value: token })
        : Preferences.remove({ key: TOKEN_STORAGE }),
    )
    .catch(() => {})
}

/** Call once before first render: restores the token from Preferences if localStorage lost it. */
export async function hydrateToken() {
  if (!Capacitor.isNativePlatform() || getToken()) return
  try {
    const { Preferences } = await import('@capacitor/preferences')
    const { value } = await Preferences.get({ key: TOKEN_STORAGE })
    if (value) localStorage.setItem(TOKEN_STORAGE, value)
  } catch {
    // preferences unavailable
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
  submitProgramDoc: (key, payload) =>
    request(`/me/program-docs/${key}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  registerPushToken: (payload) =>
    request('/me/push-token', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  adminData: (key) => request('/admin/data', { headers: { 'x-admin-key': key } }),
  adminNotify: (key, payload) =>
    request('/admin/notify', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'x-admin-key': key },
    }),
  adminSetStatus: (key, collection, id, status) =>
    request(`/admin/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      headers: { 'x-admin-key': key },
    }),
  adminUpdateEnrollment: (key, id, payload) =>
    request(`/admin/enrollments/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: { 'x-admin-key': key },
    }),
  adminEnrollmentProgress: (key, id, payload) =>
    request(`/admin/enrollments/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: { 'x-admin-key': key },
    }),
  adminSetProgram: (key, userId, payload) =>
    request(`/admin/users/${userId}/program`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: { 'x-admin-key': key },
    }),
  adminReviewDoc: (key, userId, docKey, payload) =>
    request(`/admin/users/${userId}/program-docs/${docKey}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: { 'x-admin-key': key },
    }),
  markHomework: (enrollmentId, hwId, status) =>
    request(`/me/enrollments/${enrollmentId}/homework/${hwId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getClass: (courseId) => request(`/me/classes/${courseId}`),
  getClassMessages: (courseId) => request(`/me/classes/${courseId}/messages`),
  postClassMessage: (courseId, text) =>
    request(`/me/classes/${courseId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  adminSetClass: (key, courseId, payload) =>
    request(`/admin/classes/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: { 'x-admin-key': key },
    }),
  adminNotifyClass: (key, courseId, payload = {}) =>
    request(`/admin/classes/${courseId}/notify`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'x-admin-key': key },
    }),
  adminClassMessage: (key, courseId, payload) =>
    request(`/admin/classes/${courseId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'x-admin-key': key },
    }),
  adminAssignHomework: (key, courseId, payload) =>
    request(`/admin/classes/${courseId}/homework`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'x-admin-key': key },
    }),
  placementAssign: (payload) =>
    request('/me/placement-assign', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getDm: () => request('/me/dm'),
  postDm: (payload) =>
    request('/me/dm', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  adminDm: (key, userId, payload) =>
    request(`/admin/dm/${userId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'x-admin-key': key },
    }),
  adminVisaAppointment: (key, userId, payload) =>
    request(`/admin/users/${userId}/visa-appointment`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'x-admin-key': key },
    }),
}

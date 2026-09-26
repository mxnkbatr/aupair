const ENV_API = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

/** Web: `/api` (Vite proxy / Express). Native: set `VITE_API_URL` to your deployed server origin. */
const API_BASE = ENV_API ? `${ENV_API}/api` : '/api'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Алдаа гарлаа. Дахин оролдоно уу.')
  }
  return data
}

export const api = {
  getCourses: () => request('/courses'),
  getCourse: (id) => request(`/courses/${id}`),
  enroll: (payload) =>
    request('/enrollments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  contact: (payload) =>
    request('/contacts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  order: (payload) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

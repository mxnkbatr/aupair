const API_BASE = '/api'

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

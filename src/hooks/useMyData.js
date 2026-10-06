import { useEffect, useState } from 'react'
import { useAuth } from '../auth'

/** The signed-in user's enrollments / orders / contacts (from GET /api/me). */
export default function useMyData() {
  const { user, refresh } = useAuth()
  const userId = user?.id
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!userId) {
      setData(null)
      return undefined
    }
    let alive = true
    const load = () =>
      refresh()
        .then((res) => {
          if (alive && res) setData(res)
        })
        .catch(() => {})
    load()
    window.addEventListener('app:refresh', load)
    return () => {
      alive = false
      window.removeEventListener('app:refresh', load)
    }
  }, [userId, refresh])

  return data
}

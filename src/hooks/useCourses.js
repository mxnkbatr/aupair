import { useEffect, useState } from 'react'
import { api } from '../api'
import { coursesFallback } from '../data'

/**
 * Courses from the API with the static list as a fallback.
 * `loading` is true until the first response (or failure) so screens can show skeletons.
 */
export default function useCourses() {
  const [list, setList] = useState(null)

  useEffect(() => {
    let alive = true
    const load = () =>
      api
        .getCourses()
        .then((data) => {
          if (alive) setList(Array.isArray(data) ? data : coursesFallback)
        })
        .catch(() => {
          if (alive) setList((prev) => prev || coursesFallback)
        })
    load()
    window.addEventListener('app:refresh', load)
    return () => {
      alive = false
      window.removeEventListener('app:refresh', load)
    }
  }, [])

  const courses = (list || []).filter((c) => c.type !== 'country')
  return { courses, loading: list === null }
}

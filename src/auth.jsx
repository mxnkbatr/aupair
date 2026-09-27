import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, getToken, setToken } from './api'

const USER_STORAGE = 'aupair-user'
const AuthContext = createContext(null)

function loadCachedUser() {
  if (!getToken()) return null
  try {
    return JSON.parse(localStorage.getItem(USER_STORAGE) || 'null')
  } catch {
    return null
  }
}

function cacheUser(user) {
  try {
    if (user) localStorage.setItem(USER_STORAGE, JSON.stringify(user))
    else localStorage.removeItem(USER_STORAGE)
  } catch {
    // storage unavailable (private mode)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadCachedUser)

  const applySession = useCallback((res) => {
    if (res.token) setToken(res.token)
    if (res.user) {
      cacheUser(res.user)
      setUser(res.user)
    }
    return res
  }, [])

  const logout = useCallback(() => {
    setToken('')
    cacheUser(null)
    setUser(null)
  }, [])

  const refresh = useCallback(async () => {
    if (!getToken()) return null
    try {
      const res = await api.me()
      applySession(res)
      return res
    } catch (err) {
      if (err.status === 401) logout()
      throw err
    }
  }, [applySession, logout])

  useEffect(() => {
    refresh().catch(() => {})
  }, [refresh])

  const value = useMemo(
    () => ({
      user,
      login: (payload) => api.login(payload).then(applySession),
      register: (payload) => api.register(payload).then(applySession),
      update: (payload) => api.updateMe(payload).then(applySession),
      refresh,
      logout,
    }),
    [user, applySession, refresh, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

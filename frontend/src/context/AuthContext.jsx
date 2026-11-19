import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import api, { TOKEN_KEY, USER_KEY } from '../api/axios'

const AuthContext = createContext(null)

// Pulihkan sesi dari localStorage saat halaman dimuat ulang.
function readStoredUser() {
  try {
    const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null')
    return localStorage.getItem(TOKEN_KEY) && user ? user : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem(TOKEN_KEY, data.data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.data.user))
    setUser(data.data.user)
    return data.data.user
  }, [])

  // Logout = hapus token di frontend, tanpa panggilan API (K8).
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch }
      localStorage.setItem(USER_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const value = useMemo(() => ({ user, login, logout, updateUser }), [user, login, logout, updateUser])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

// eslint-disable-next-line react-refresh/only-export-components
export const dashboardPath = (role) => `/${role}/dashboard`

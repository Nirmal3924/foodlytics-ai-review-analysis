import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('zl_user')
    const token  = localStorage.getItem('zl_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
      api.setToken(token)
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password })
    api.setToken(data.access_token)
    localStorage.setItem('zl_token', data.access_token)
    localStorage.setItem('zl_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const signup = async (name, email, password) => {
    const data = await api.post('/auth/signup', { name, email, password, role: 'user' })
    api.setToken(data.access_token)
    localStorage.setItem('zl_token', data.access_token)
    localStorage.setItem('zl_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('zl_token')
    localStorage.removeItem('zl_user')
    api.setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

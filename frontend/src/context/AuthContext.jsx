import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await authAPI.getMe()
        setUser(response.data)
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password })
    const { access_token } = response.data
    localStorage.setItem('token', access_token)

    const userResponse = await authAPI.getMe()
    setUser(userResponse.data)
    localStorage.setItem('user', JSON.stringify(userResponse.data))

    return userResponse.data
  }

  const register = async (userData) => {
    const response = await authAPI.register(userData)
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

import { createContext, useContext, useState } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem('token')
  )

  const login = async (email, password) => {
    const data = await authService.login(email, password)

    localStorage.setItem('token', data.token)
    setToken(data.token)

    return data
  }

  const register = async (email, password) => {
    return await authService.register(email, password)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
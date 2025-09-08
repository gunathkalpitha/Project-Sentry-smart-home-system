import React, { createContext, useContext, useEffect, useState } from 'react'
import { jwtDecode } from "jwt-decode"; 


const AuthCtx = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!token) return setUser(null)
    try {
      const payload = jwtDecode(token)
      setUser({ id: payload.sub, email: payload.email, role: payload.role })
    } catch {
      setUser(null)
    }
  }, [token])

  const login = (t) => { localStorage.setItem('token', t); setToken(t) }
  const logout = () => { localStorage.removeItem('token'); setToken(null) }

  return <AuthCtx.Provider value={{ token, user, login, logout }}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  return useContext(AuthCtx)
}

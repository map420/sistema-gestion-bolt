import { createContext, useContext, useState, type ReactNode } from 'react'
import { getSession, setSession, loginUser, registerUser, setCurrentUser } from '../storage'

export interface AuthUser {
  id: string
  nombre: string
}

interface AuthContextValue {
  user: AuthUser | null
  login: (nombre: string, password: string) => { ok: boolean; error?: string }
  register: (nombre: string, password: string) => { ok: boolean; error?: string }
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function initUser(): AuthUser | null {
  const session = getSession()
  if (session) {
    setCurrentUser(session.id)
    return session
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(initUser)

  const login = (nombre: string, password: string): { ok: boolean; error?: string } => {
    const result = loginUser(nombre, password)
    if (!result.ok || !result.user) return { ok: false, error: result.error }
    setCurrentUser(result.user.id)
    setSession(result.user)
    setUser(result.user)
    return { ok: true }
  }

  const register = (nombre: string, password: string): { ok: boolean; error?: string } => {
    const result = registerUser(nombre, password)
    if (!result.ok) return { ok: false, error: result.error }
    // Auto-login after register
    return login(nombre, password)
  }

  const logout = () => {
    setCurrentUser(null)
    setSession(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

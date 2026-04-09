import { createContext, useContext, useState, type ReactNode } from 'react'
import { getSession, setSession, type SessionData } from '../storage'
import { getToken, setToken, apiRegister, apiLogin } from '../lib/api'
import { getTrialStatus } from '../utils'

export interface AuthUser {
  id: string
  nombre: string
}

export interface TrialStatus {
  paid: boolean
  inTrial: boolean
  expired: boolean
  daysRemaining: number
}

interface AuthContextValue {
  user: AuthUser | null
  trialStatus: TrialStatus | null
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; userId?: string }>
  register: (email: string, password: string) => Promise<{ ok: boolean; error?: string; userId?: string }>
  logout: () => void
  confirmPayment: (sessionId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function initUser(): AuthUser | null {
  if (!getToken()) return null
  const session = getSession()
  if (!session) return null
  return { id: session.id, nombre: session.nombre }
}

function initTrialStatus(): TrialStatus | null {
  if (!getToken()) return null
  const session = getSession()
  if (!session) return null
  return getTrialStatus(session)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(initUser)
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(initTrialStatus)

  const login = async (email: string, password: string): Promise<{ ok: boolean; error?: string; userId?: string }> => {
    const result = await apiLogin(email, password)
    if (!result.ok || !result.user) return { ok: false, error: result.error }

    const session: SessionData = {
      id: result.user.id,
      nombre: result.user.nombre,
      creadoEn: result.user.creadoEn,
      paidAt: result.user.paidAt,
    }
    setSession(session)
    setUser({ id: session.id, nombre: session.nombre })
    setTrialStatus(getTrialStatus(session))
    return { ok: true, userId: session.id }
  }

  const register = async (email: string, password: string): Promise<{ ok: boolean; error?: string; userId?: string }> => {
    const result = await apiRegister(email, password)
    if (!result.ok || !result.user) return { ok: false, error: result.error }

    const session: SessionData = {
      id: result.user.id,
      nombre: result.user.nombre,
      creadoEn: result.user.creadoEn,
    }
    setSession(session)
    setUser({ id: session.id, nombre: session.nombre })
    setTrialStatus(getTrialStatus(session))
    return { ok: true, userId: session.id }
  }

  const logout = () => {
    setToken(null)
    setSession(null)
    setUser(null)
    setTrialStatus(null)
  }

  const confirmPayment = async (sessionId: string): Promise<void> => {
    const uid = user?.id ?? getSession()?.id
    if (!uid) throw new Error('no user')

    const res = await fetch('/api/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, userId: uid }),
    })
    if (!res.ok) throw new Error('verify failed')
    const data = await res.json() as { paid: boolean }
    if (!data.paid) throw new Error('not paid')

    // Update local session and trial status
    const session = getSession()
    if (session) {
      const updated = { ...session, paidAt: new Date().toISOString() }
      setSession(updated)
      setTrialStatus(getTrialStatus(updated))
    }
  }

  return (
    <AuthContext.Provider value={{ user, trialStatus, login, register, logout, confirmPayment }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

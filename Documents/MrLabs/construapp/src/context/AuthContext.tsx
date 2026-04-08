import { createContext, useContext, useState, type ReactNode } from 'react'
import { getSession, setSession, loginUser, registerUser, setCurrentUser, getFullUser, markUserAsPaid } from '../storage'
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
  login: (email: string, password: string) => { ok: boolean; error?: string; userId?: string }
  register: (email: string, password: string) => { ok: boolean; error?: string; userId?: string }
  logout: () => void
  confirmPayment: (sessionId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function computeTrialStatus(userId: string): TrialStatus {
  const fullUser = getFullUser(userId)
  if (!fullUser) return { paid: false, inTrial: true, expired: false, daysRemaining: 15 }
  return getTrialStatus(fullUser)
}

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
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(() => {
    const session = getSession()
    if (session) return computeTrialStatus(session.id)
    return null
  })

  const login = (email: string, password: string): { ok: boolean; error?: string; userId?: string } => {
    const result = loginUser(email, password)
    if (!result.ok || !result.user) return { ok: false, error: result.error }
    setCurrentUser(result.user.id)
    setSession(result.user)
    setUser(result.user)
    setTrialStatus(computeTrialStatus(result.user.id))
    return { ok: true, userId: result.user.id }
  }

  const register = (email: string, password: string): { ok: boolean; error?: string; userId?: string } => {
    const result = registerUser(email, password)
    if (!result.ok) return { ok: false, error: result.error }
    // Auto-login after register
    return login(email, password)
  }

  const logout = () => {
    setCurrentUser(null)
    setSession(null)
    setUser(null)
    setTrialStatus(null)
  }

  const confirmPayment = async (sessionId: string): Promise<void> => {
    const res = await fetch(`/api/verify-session?sessionId=${sessionId}`)
    if (!res.ok) throw new Error('verify failed')
    const data = await res.json() as { paid: boolean; userId?: string }
    if (!data.paid) throw new Error('not paid')
    const uid = user?.id
    if (!uid) throw new Error('no user')
    markUserAsPaid(uid, sessionId)
    setTrialStatus(computeTrialStatus(uid))
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

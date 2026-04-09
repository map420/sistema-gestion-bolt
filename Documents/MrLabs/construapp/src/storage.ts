// Session management only — user data is stored in Supabase via API calls

export const TRIAL_DAYS = 15

const SESSION_KEY = 'construapp_session'

export interface SessionData {
  id: string
  nombre: string
  creadoEn: string
  paidAt?: string
}

export function getSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SessionData
  } catch {
    return null
  }
}

export function setSession(data: SessionData | null): void {
  if (data) localStorage.setItem(SESSION_KEY, JSON.stringify(data))
  else localStorage.removeItem(SESSION_KEY)
}

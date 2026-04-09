import type { AppData, Config } from '../types'

const TOKEN_KEY = 'construapp_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  const base: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) base['Authorization'] = `Bearer ${token}`
  return base
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUserResult {
  id: string
  nombre: string
  email: string
  creadoEn: string
  paidAt?: string
}

export async function apiRegister(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string; user?: AuthUserResult; token?: string }> {
  const res = await fetch('/api/auth-register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json() as { ok: boolean; error?: string; user?: AuthUserResult; token?: string }
  if (data.token) setToken(data.token)
  return data
}

export async function apiLogin(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string; user?: AuthUserResult; token?: string }> {
  const res = await fetch('/api/auth-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json() as { ok: boolean; error?: string; user?: AuthUserResult; token?: string }
  if (data.token) setToken(data.token)
  return data
}

// ─── App data ─────────────────────────────────────────────────────────────────

const DEFAULT_DATA: AppData = { trabajadores: [], registros: [], pagos: [], proyectos: [] }

export async function apiGetData(): Promise<AppData> {
  try {
    const res = await fetch('/api/user-data', { headers: authHeaders() })
    if (!res.ok) return { ...DEFAULT_DATA }
    const data = await res.json() as Partial<AppData>
    return {
      trabajadores: data.trabajadores ?? [],
      registros: data.registros ?? [],
      pagos: data.pagos ?? [],
      proyectos: data.proyectos ?? [],
    }
  } catch {
    return { ...DEFAULT_DATA }
  }
}

export async function apiSaveData(data: AppData): Promise<void> {
  try {
    await fetch('/api/user-data', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
  } catch {
    // Silently fail — data is still in memory
  }
}

// ─── Config ───────────────────────────────────────────────────────────────────

export async function apiGetConfig(): Promise<Partial<Config>> {
  try {
    const res = await fetch('/api/user-config', { headers: authHeaders() })
    if (!res.ok) return {}
    return res.json()
  } catch {
    return {}
  }
}

export async function apiSaveConfig(config: Config): Promise<void> {
  try {
    await fetch('/api/user-config', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(config),
    })
  } catch {
    // Silently fail
  }
}

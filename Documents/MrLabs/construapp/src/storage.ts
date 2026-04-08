import type { AppData, Config, Usuario } from './types'

export const TRIAL_DAYS = 15

// ─── Current user (module-level) ─────────────────────────────────────────────
let _currentUserId: string | null = null

export function setCurrentUser(id: string | null): void {
  _currentUserId = id
}

function dataKey(): string {
  return _currentUserId ? `construapp_data_${_currentUserId}` : 'construapp_data'
}

function configKey(): string {
  return _currentUserId ? `construapp_config_${_currentUserId}` : 'construapp_config'
}

// ─── App data ─────────────────────────────────────────────────────────────────
const defaultData: AppData = { trabajadores: [], registros: [], pagos: [], proyectos: [] }

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(dataKey())
    if (!raw) return structuredClone(defaultData)
    const parsed = JSON.parse(raw) as AppData
    // Ensure proyectos array exists for older saved data
    if (!parsed.proyectos) parsed.proyectos = []
    return parsed
  } catch {
    return structuredClone(defaultData)
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(dataKey(), JSON.stringify(data))
}

export function getData(): AppData {
  return loadData()
}

export function updateData(updater: (data: AppData) => AppData): AppData {
  const current = loadData()
  const next = updater(current)
  saveData(next)
  return next
}

// ─── Config ───────────────────────────────────────────────────────────────────
const defaultConfig: Config = {
  nombreEmpresa: '',
  logoDataUrl: '',
  idioma: 'es',
  moneda: { codigo: 'PEN', simbolo: 'S/', nombre: 'Sol peruano' },
}

export function loadConfig(): Config {
  try {
    const raw = localStorage.getItem(configKey())
    if (!raw) return { ...defaultConfig }
    return { ...defaultConfig, ...JSON.parse(raw) }
  } catch {
    return { ...defaultConfig }
  }
}

export function saveConfig(config: Config): void {
  localStorage.setItem(configKey(), JSON.stringify(config))
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
const USERS_KEY = 'construapp_users'
const SESSION_KEY = 'construapp_session'

function hashPassword(password: string): string {
  return btoa('construapp:' + password)
}

export function getUsers(): Usuario[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Usuario[]
  } catch {
    return []
  }
}

function saveUsers(users: Usuario[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getSession(): { id: string; nombre: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setSession(user: { id: string; nombre: string } | null): void {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function registerUser(email: string, password: string): { ok: boolean; error?: string } {
  const email_trim = email.trim().toLowerCase()
  if (!email_trim || !password) return { ok: false, error: 'errRequired' }
  if (!isValidEmail(email_trim)) return { ok: false, error: 'errInvalidEmail' }

  const users = getUsers()
  const exists = users.some(u => (u.email ?? u.nombre).toLowerCase() === email_trim)
  if (exists) return { ok: false, error: 'errUserExists' }

  const newUser: Usuario = {
    id: crypto.randomUUID(),
    nombre: email_trim.split('@')[0],
    email: email_trim,
    passwordHash: hashPassword(password),
    creadoEn: new Date().toISOString(),
  }

  // Migrate old non-namespaced data if it exists
  const oldData = localStorage.getItem('construapp_data')
  const oldConfig = localStorage.getItem('construapp_config')
  if (oldData) {
    localStorage.setItem(`construapp_data_${newUser.id}`, oldData)
    localStorage.removeItem('construapp_data')
  }
  if (oldConfig) {
    localStorage.setItem(`construapp_config_${newUser.id}`, oldConfig)
    localStorage.removeItem('construapp_config')
  }

  users.push(newUser)
  saveUsers(users)
  return { ok: true }
}

export function loginUser(email: string, password: string): { ok: boolean; user?: { id: string; nombre: string }; error?: string } {
  const email_trim = email.trim().toLowerCase()
  if (!email_trim || !password) return { ok: false, error: 'errRequired' }

  const users = getUsers()
  // Support both email-based (new) and nombre-based (legacy) accounts
  const user = users.find(u => (u.email ?? u.nombre).toLowerCase() === email_trim)
  if (!user) return { ok: false, error: 'errUserNotFound' }

  if (user.passwordHash !== hashPassword(password)) return { ok: false, error: 'errWrongPassword' }

  // Backward compat: give old users a fresh 15-day trial from first login
  if (!user.creadoEn) {
    user.creadoEn = new Date().toISOString()
    saveUsers(users)
  }

  return { ok: true, user: { id: user.id, nombre: user.nombre } }
}

export function getFullUser(id: string): Usuario | null {
  const users = getUsers()
  return users.find(u => u.id === id) ?? null
}

export function markUserAsPaid(userId: string, stripeSessionId: string): void {
  const users = getUsers()
  const user = users.find(u => u.id === userId)
  if (!user) return
  user.paidAt = new Date().toISOString()
  user.stripeSessionId = stripeSessionId
  saveUsers(users)
}

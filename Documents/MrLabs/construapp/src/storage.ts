import type { AppData, Config } from './types'

const KEY = 'construapp_data'

const empty: AppData = { trabajadores: [], registros: [], pagos: [] }

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(empty)
    return JSON.parse(raw) as AppData
  } catch {
    return structuredClone(empty)
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
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

const CONFIG_KEY = 'construapp_config'
const defaultConfig: Config = {
  nombreEmpresa: '',
  logoDataUrl: '',
  idioma: 'es',
  moneda: { codigo: 'PEN', simbolo: 'S/', nombre: 'Sol peruano' },
}

export function loadConfig(): Config {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return { ...defaultConfig }
    // Merge with defaults so configs guardados antes de añadir nuevos campos
    // (idioma, moneda) reciban los valores por defecto en lugar de undefined.
    return { ...defaultConfig, ...JSON.parse(raw) }
  } catch {
    return { ...defaultConfig }
  }
}

export function saveConfig(config: Config): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

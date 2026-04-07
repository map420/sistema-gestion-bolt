import type { AppData } from './types'

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

// src/context/ConfigContext.tsx
import { createContext, useContext, useState } from 'react'
import type { Config } from '../types'
import { loadConfig, saveConfig } from '../storage'

interface ConfigContextValue {
  config: Config
  updateConfig: (next: Config) => void
  fmt: (monto: number) => string
}

const ConfigContext = createContext<ConfigContextValue | null>(null)

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Config>(() => loadConfig())

  function updateConfig(next: Config) {
    saveConfig(next)
    setConfig({ ...next }) // spread fuerza nueva referencia → re-render garantizado
  }

  // fmt se recalcula en cada render con el config actual — sin useCallback ni closure stale
  function fmt(monto: number): string {
    const moneda = config.moneda
    if (!moneda) return `$ ${monto.toFixed(2)}`
    const locale = LOCALE_MAP[moneda.codigo] ?? 'es'
    const formatted = monto.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return `${moneda.simbolo} ${formatted}`
  }

  return (
    <ConfigContext.Provider value={{ config, updateConfig, fmt }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used inside ConfigProvider')
  return ctx
}

const LOCALE_MAP: Record<string, string> = {
  USD: 'en-US',
  EUR: 'es-ES',
  BRL: 'pt-BR',
  PEN: 'es-PE',
  MXN: 'es-MX',
  COP: 'es-CO',
  CLP: 'es-CL',
  ARS: 'es-AR',
  GTQ: 'es-GT',
  BOB: 'es-BO',
  PYG: 'es-PY',
  UYU: 'es-UY',
}

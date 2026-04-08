// src/context/ConfigContext.tsx
import { createContext, useContext, useState, useCallback } from 'react'
import type { Config, Moneda } from '../types'
import { loadConfig, saveConfig } from '../storage'

interface ConfigContextValue {
  config: Config
  updateConfig: (next: Config) => void
  fmt: (monto: number) => string
}

const ConfigContext = createContext<ConfigContextValue | null>(null)

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Config>(() => loadConfig())

  const updateConfig = useCallback((next: Config) => {
    saveConfig(next)
    setConfig(next)
  }, [])

  const fmt = useCallback(
    (monto: number) => formatConMoneda(monto, config.moneda),
    [config.moneda]
  )

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

// ── Formateo con moneda del contexto ─────────────────────────────────────────

function formatConMoneda(monto: number, moneda: Moneda): string {
  const locale = monedaLocale(moneda.codigo)
  const formatted = monto.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${moneda.simbolo} ${formatted}`
}

function monedaLocale(codigo: string): string {
  const map: Record<string, string> = {
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
  return map[codigo] ?? 'es'
}

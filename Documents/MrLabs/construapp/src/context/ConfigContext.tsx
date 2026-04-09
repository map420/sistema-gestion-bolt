// src/context/ConfigContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import type { Config, Idioma } from '../types'
import { apiGetConfig, apiSaveConfig } from '../lib/api'
import i18n from '../i18n'

interface ConfigContextValue {
  config: Config
  updateConfig: (next: Config) => void
  fmt: (monto: number) => string
  fmtFecha: (fecha: string) => string
}

const ConfigContext = createContext<ConfigContextValue | null>(null)

const defaultConfig: Config = {
  nombreEmpresa: '',
  logoDataUrl: '',
  idioma: 'es',
  moneda: { codigo: 'PEN', simbolo: 'S/', nombre: 'Sol peruano' },
}

const LOCALE_MAP: Record<string, string> = {
  USD: 'en-US', EUR: 'es-ES', BRL: 'pt-BR', PEN: 'es-PE',
  MXN: 'es-MX', COP: 'es-CO', CLP: 'es-CL', ARS: 'es-AR',
  GTQ: 'es-GT', BOB: 'es-BO', PYG: 'es-PY', UYU: 'es-UY',
}

const IDIOMA_LOCALE: Record<Idioma, string> = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' }

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Config>(defaultConfig)

  useEffect(() => {
    apiGetConfig().then(saved => {
      if (saved && Object.keys(saved).length > 0) {
        const merged = { ...defaultConfig, ...saved }
        setConfig(merged)
        i18n.changeLanguage(merged.idioma)
      }
    })
  }, [])

  function updateConfig(next: Config) {
    setConfig({ ...next })
    i18n.changeLanguage(next.idioma)
    apiSaveConfig(next) // fire and forget
  }

  function fmt(monto: number): string {
    const moneda = config.moneda
    if (!moneda) return `$ ${monto.toFixed(2)}`
    const locale = LOCALE_MAP[moneda.codigo] ?? 'es-PE'
    return `${moneda.simbolo} ${monto.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  function fmtFecha(fecha: string): string {
    const [y, m, d] = fecha.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    const locale = IDIOMA_LOCALE[config.idioma ?? 'es']
    return date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <ConfigContext.Provider value={{ config, updateConfig, fmt, fmtFecha }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used inside ConfigProvider')
  return ctx
}

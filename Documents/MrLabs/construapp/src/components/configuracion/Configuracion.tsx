// src/components/configuracion/Configuracion.tsx
import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, Upload, X, Check, Globe, DollarSign } from 'lucide-react'
import type { Config, Idioma, Moneda } from '../../types'

interface Props {
  config: Config
  onSave: (config: Config) => void
}

// ── Opciones ──────────────────────────────────────────────────────────────────

const IDIOMAS: { value: Idioma; label: string; flag: string }[] = [
  { value: 'es', label: 'Español',    flag: '🇪🇸' },
  { value: 'en', label: 'English',    flag: '🇺🇸' },
  { value: 'pt', label: 'Português',  flag: '🇧🇷' },
]

const MONEDAS: Moneda[] = [
  { codigo: 'PEN', simbolo: 'S/', nombre: 'Soles (S/)' },
  { codigo: 'USD', simbolo: '$',  nombre: 'Dólares (USD)' },
  { codigo: 'EUR', simbolo: '€',  nombre: 'Euros (EUR)' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function Configuracion({ config, onSave }: Props) {
  const { t } = useTranslation()
  const [nombre, setNombre]     = useState(config.nombreEmpresa)
  const [logoDataUrl, setLogo]  = useState(config.logoDataUrl)
  const [idioma, setIdioma]     = useState<Idioma>(config.idioma ?? 'es')
  const [monedaCodigo, setMonedaCodigo] = useState<string>(config.moneda?.codigo ?? 'PEN')
  const [guardado, setGuardado] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLogo(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleGuardar = () => {
    const moneda = MONEDAS.find(m => m.codigo === monedaCodigo) ?? MONEDAS[0]
    const next: Config = {
      nombreEmpresa: nombre.trim(),
      logoDataUrl,
      idioma,
      moneda,
    }
    onSave(next)  // updateConfig: saves, updates React state, calls i18n.changeLanguage
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  const selectClass = "bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0] transition-colors appearance-none cursor-pointer w-full pr-10"
  const monedaActual = MONEDAS.find(m => m.codigo === monedaCodigo) ?? MONEDAS[0]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-[#f0f0f0] tracking-tight">{t('settings.title')}</h1>
        <p className="text-sm text-[#444] mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col gap-6 max-w-lg">

        {/* Logo */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-[#666] uppercase tracking-widest">{t('settings.logo')}</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              {logoDataUrl
                ? <img src={logoDataUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                : <Building2 size={24} className="text-[#333]" />
              }
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-[#aaa] hover:text-white hover:border-white/20 transition-colors"
              >
                <Upload size={14} /> {t('settings.upload')}
              </button>
              {logoDataUrl && (
                <button
                  onClick={() => setLogo('')}
                  className="flex items-center gap-1.5 text-xs text-[#555] hover:text-[#f87171] transition-colors"
                >
                  <X size={12} /> {t('settings.remove')}
                </button>
              )}
            </div>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          <p className="text-xs text-[#333]">{t('settings.logoHint')}</p>
        </div>

        <div className="border-t border-white/5" />

        {/* Nombre */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#666] uppercase tracking-widest">{t('settings.name')}</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder={t('settings.namePh')}
            className="bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0f0] placeholder-[#333] focus:outline-none focus:border-[#9d7ff0] transition-colors"
          />
        </div>

        <div className="border-t border-white/5" />

        {/* Idioma */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#666] uppercase tracking-widest flex items-center gap-1.5">
            <Globe size={12} className="text-[#555]" /> {t('settings.language')}
          </label>
          <div className="relative">
            <select
              value={idioma}
              onChange={e => setIdioma(e.target.value as Idioma)}
              className={selectClass}
            >
              {IDIOMAS.map(op => (
                <option key={op.value} value={op.value}>{op.flag}  {op.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#555]">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 8L1 3h10L6 8z"/></svg>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5" />

        {/* Moneda */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#666] uppercase tracking-widest flex items-center gap-1.5">
            <DollarSign size={12} className="text-[#555]" /> {t('settings.currency')}
          </label>
          <div className="relative">
            <select
              value={monedaCodigo}
              onChange={e => setMonedaCodigo(e.target.value)}
              className={selectClass}
            >
              {MONEDAS.map(m => (
                <option key={m.codigo} value={m.codigo}>{m.nombre}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#555]">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 8L1 3h10L6 8z"/></svg>
            </div>
          </div>
          {/* Preview */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0d0d0d] border border-white/5 rounded-lg">
            <span className="text-xs text-[#555]">{t('settings.example')}</span>
            <span className="text-sm font-mono text-[#9d7ff0]">
              {monedaActual.simbolo} 1,250.00
            </span>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleGuardar}
          disabled={!nombre.trim() || guardado}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
            guardado
              ? 'bg-[#34d39920] text-[#34d399] border border-[#34d39940]'
              : nombre.trim()
                ? 'bg-[#9d7ff0] hover:bg-[#8b6fd4] text-white'
                : 'bg-[#1a1a1a] text-[#333] cursor-not-allowed'
          }`}
        >
          {guardado
            ? <><Check size={15} /> {t('settings.saved')}</>
            : t('settings.save')}
        </button>
      </div>
    </div>
  )
}

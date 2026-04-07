// src/components/configuracion/Configuracion.tsx
import { useState, useRef } from 'react'
import { Building2, Upload, X, Check } from 'lucide-react'
import type { Config } from '../../types'
import { saveConfig } from '../../storage'

interface Props {
  config: Config
  onSave: (config: Config) => void
}

export default function Configuracion({ config, onSave }: Props) {
  const [nombre, setNombre] = useState(config.nombreEmpresa)
  const [logoDataUrl, setLogoDataUrl] = useState(config.logoDataUrl)
  const [guardado, setGuardado] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLogoDataUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleGuardar = () => {
    const next: Config = { nombreEmpresa: nombre.trim(), logoDataUrl }
    saveConfig(next)
    onSave(next)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-[#f0f0f0] tracking-tight">Configuración</h1>
        <p className="text-sm text-[#444] mt-1">Datos de la empresa que aparecen en los documentos PDF.</p>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col gap-6 max-w-lg">

        {/* Logo */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-[#666] uppercase tracking-widest">Logo de la empresa</label>
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
                <Upload size={14} /> Subir imagen
              </button>
              {logoDataUrl && (
                <button
                  onClick={() => setLogoDataUrl('')}
                  className="flex items-center gap-1.5 text-xs text-[#555] hover:text-[#f87171] transition-colors"
                >
                  <X size={12} /> Quitar logo
                </button>
              )}
            </div>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          <p className="text-xs text-[#333]">PNG, JPG o SVG. Se mostrará en la barra lateral y en los documentos PDF.</p>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5" />

        {/* Nombre */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#666] uppercase tracking-widest">Nombre de la empresa</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej. Constructora López & Hnos."
            className="bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0f0] placeholder-[#333] focus:outline-none focus:border-[#9d7ff0] transition-colors"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleGuardar}
          disabled={!nombre.trim()}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
            guardado
              ? 'bg-[#34d39920] text-[#34d399] border border-[#34d39940]'
              : nombre.trim()
                ? 'bg-[#9d7ff0] hover:bg-[#8b6fd4] text-white'
                : 'bg-[#1a1a1a] text-[#333] cursor-not-allowed'
          }`}
        >
          {guardado ? <><Check size={15} /> Guardado</> : 'Guardar configuración'}
        </button>
      </div>
    </div>
  )
}

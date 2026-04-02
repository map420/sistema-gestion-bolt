'use client'

import { useState, useEffect } from 'react'

type Clinica = {
  nombre: string
  ciudad: string
  telefono: string
  whatsappNumero: string | null
  plan: string
  planActivoHasta: string | null
}

export default function ConfiguracionPage() {
  const [clinica, setClinica] = useState<Clinica | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [nombre, setNombre] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [telefono, setTelefono] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  useEffect(() => {
    fetch('/api/clinica')
      .then(r => r.json())
      .then(d => {
        const c = d.clinica
        setClinica(c)
        setNombre(c.nombre)
        setCiudad(c.ciudad)
        setTelefono(c.telefono)
        setWhatsapp(c.whatsappNumero ?? '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/clinica', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, ciudad, telefono, whatsappNumero: whatsapp || null }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <span className="text-sm text-[#8b90a0]">Cargando...</span>
      </div>
    )
  }

  const planLabel = clinica?.plan === 'TRIAL' ? 'Trial gratuito' : clinica?.plan === 'PRO' ? 'Pro' : 'Starter'
  const planVence = clinica?.planActivoHasta
    ? new Date(clinica.planActivoHasta).toLocaleDateString('es-PE')
    : null

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-[#e2e2e2] mb-8">Configuración</h1>

      <form onSubmit={handleSave} className="space-y-8">

        {/* Clínica */}
        <section className="bg-[#1b1b1b] p-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8b90a0] mb-6">Datos de la clínica</h2>
          <div className="space-y-4">
            <Field label="Nombre de la clínica" value={nombre} onChange={setNombre} placeholder="Clínica Dental García" />
            <Field label="Ciudad" value={ciudad} onChange={setCiudad} placeholder="Ica" />
            <Field label="Teléfono de contacto" value={telefono} onChange={setTelefono} placeholder="+51 956 123 456" />
          </div>
        </section>

        {/* WhatsApp */}
        <section className="bg-[#1b1b1b] p-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8b90a0] mb-6">WhatsApp Business</h2>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#8b90a0] mb-2">Número de la clínica</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="+51 956 123 456"
              className="w-full bg-[#1f1f1f] text-[#e2e2e2] px-4 py-3 text-sm outline-none border-b border-transparent focus:border-b focus:border-[#3cd7ff] transition-colors placeholder:text-[#414755]"
            />
            <p className="text-xs text-[#8b90a0] mt-2">
              DentOS enviará alertas de cancelación a este número.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${whatsapp ? 'bg-[#3de273]' : 'bg-[#414755]'}`} />
              <span className={`text-xs ${whatsapp ? 'text-[#3de273]' : 'text-[#8b90a0]'}`}>
                {whatsapp ? 'Número configurado' : 'Sin configurar'}
              </span>
            </div>
          </div>
        </section>

        {/* Plan */}
        <section className="bg-[#1b1b1b] p-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8b90a0] mb-6">Plan actual</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#e2e2e2] font-semibold">{planLabel}</p>
              {planVence && (
                <p className="text-xs text-[#8b90a0] mt-1">Vence el {planVence}</p>
              )}
            </div>
            {clinica?.plan !== 'PRO' && (
              <button
                type="button"
                className="px-5 py-2.5 border border-[#3cd7ff] text-[#3cd7ff] text-sm uppercase tracking-widest hover:bg-[#3cd7ff] hover:text-[#003642] transition-colors"
              >
                Upgrade a Pro
              </button>
            )}
          </div>
        </section>

        {error && <p className="text-xs text-[#f87171]">{error}</p>}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-[#3cd7ff] to-[#009ebe] text-[#003642] font-semibold text-sm uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {saved && <span className="text-xs text-[#3de273]">✓ Cambios guardados</span>}
        </div>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-[#8b90a0] mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#1f1f1f] text-[#e2e2e2] px-4 py-3 text-sm outline-none border-b border-transparent focus:border-b focus:border-[#3cd7ff] transition-colors placeholder:text-[#414755]"
      />
    </div>
  )
}

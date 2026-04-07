import { useState } from 'react'
import { X } from 'lucide-react'
import type { Trabajador, TipoPago } from '../../types'
import { uuid } from '../../utils'

interface Props {
  inicial?: Trabajador
  onGuardar: (t: Trabajador) => void
  onCerrar: () => void
}

export default function TrabajadorForm({ inicial, onGuardar, onCerrar }: Props) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [oficio, setOficio] = useState(inicial?.oficio ?? '')
  const [tipoPago, setTipoPago] = useState<TipoPago>(inicial?.tipoPago ?? 'dia')
  const [tarifa, setTarifa] = useState(inicial?.tarifa?.toString() ?? '')
  const [telefono, setTelefono] = useState(inicial?.telefono ?? '')
  const [error, setError] = useState('')

  const handleGuardar = () => {
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!oficio.trim()) { setError('El oficio es obligatorio'); return }
    if (!tarifa || isNaN(Number(tarifa)) || Number(tarifa) <= 0) { setError('La tarifa debe ser un número mayor a 0'); return }
    onGuardar({
      id: inicial?.id ?? uuid(),
      nombre: nombre.trim(),
      oficio: oficio.trim(),
      tipoPago,
      tarifa: Number(tarifa),
      telefono: telefono.trim() || undefined,
      activo: inicial?.activo ?? true,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#f0f0f0]">{inicial ? 'Editar trabajador' : 'Nuevo trabajador'}</h2>
          <button onClick={onCerrar} className="text-[#555] hover:text-[#aaa]"><X size={18} /></button>
        </div>

        {error && <p className="text-xs text-[#f87171] bg-[#f8717115] border border-[#f8717130] rounded-lg px-3 py-2">{error}</p>}

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">Nombre *</span>
            <input className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Carlos Méndez" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">Oficio *</span>
            <input className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={oficio} onChange={e => setOficio(e.target.value)} placeholder="Albañil" />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">Tipo de pago *</span>
            <div className="flex gap-2">
              {(['dia', 'hora'] as TipoPago[]).map(t => (
                <button key={t} onClick={() => setTipoPago(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${tipoPago === t ? 'bg-[#9d7ff020] border-[#9d7ff050] text-[#9d7ff0]' : 'bg-[#0d0d0d] border-white/10 text-[#555] hover:text-[#aaa]'}`}>
                  Por {t === 'dia' ? 'día' : 'hora'}
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">Tarifa ($ por {tipoPago === 'dia' ? 'día' : 'hora'}) *</span>
            <input type="number" min="0" className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={tarifa} onChange={e => setTarifa(e.target.value)} placeholder="180" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">Teléfono (opcional)</span>
            <input className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="8888-0000" />
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onCerrar} className="flex-1 py-2 rounded-lg text-sm border border-white/10 text-[#666] hover:text-[#aaa]">Cancelar</button>
          <button onClick={handleGuardar} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[#9d7ff0] text-white hover:bg-[#8b6fd4] transition-colors">Guardar</button>
        </div>
      </div>
    </div>
  )
}

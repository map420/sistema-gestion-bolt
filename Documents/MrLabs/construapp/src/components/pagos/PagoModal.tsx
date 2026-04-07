// src/components/pagos/PagoModal.tsx
import { useState } from 'react'
import { X } from 'lucide-react'
import type { Trabajador, Pago } from '../../types'
import { uuid, hoy, formatMoneda, siguienteFolio } from '../../utils'
import { loadData } from '../../storage'

interface Props {
  trabajador: Trabajador
  saldoPendiente: number
  periodo: { desde: string; hasta: string }
  onGuardar: (pago: Pago) => void
  onCerrar: () => void
}

export default function PagoModal({ trabajador, saldoPendiente, periodo, onGuardar, onCerrar }: Props) {
  const [monto, setMonto] = useState(saldoPendiente.toFixed(2))
  const [notas, setNotas] = useState('')
  const [error, setError] = useState('')

  const handleGuardar = () => {
    const num = Number(monto)
    if (!num || num <= 0) { setError('El monto debe ser mayor a 0'); return }
    const pagos = loadData().pagos
    onGuardar({
      id: uuid(),
      trabajadorId: trabajador.id,
      fecha: hoy(),
      monto: num,
      periodo,
      notas: notas.trim() || undefined,
      folio: siguienteFolio(pagos),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#f0f0f0]">Registrar pago</h2>
          <button onClick={onCerrar} className="text-[#555] hover:text-[#aaa]"><X size={18} /></button>
        </div>
        <p className="text-sm text-[#555]">{trabajador.nombre} · Saldo pendiente: <span className="text-[#f87171] font-semibold">{formatMoneda(saldoPendiente)}</span></p>
        <p className="text-xs text-[#444]">Período: {periodo.desde} al {periodo.hasta}</p>

        {error && <p className="text-xs text-[#f87171] bg-[#f8717115] border border-[#f8717130] rounded-lg px-3 py-2">{error}</p>}

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">Monto a pagar *</span>
            <input type="number" min="0" className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={monto} onChange={e => setMonto(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">Notas (opcional)</span>
            <input className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={notas} onChange={e => setNotas(e.target.value)} placeholder="Ej: Pago semana 1 de abril" />
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onCerrar} className="flex-1 py-2 rounded-lg text-sm border border-white/10 text-[#666] hover:text-[#aaa]">Cancelar</button>
          <button onClick={handleGuardar} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[#9d7ff0] text-white hover:bg-[#8b6fd4] transition-colors">Registrar pago</button>
        </div>
      </div>
    </div>
  )
}

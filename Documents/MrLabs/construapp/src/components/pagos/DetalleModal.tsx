// src/components/pagos/DetalleModal.tsx
import { X } from 'lucide-react'
import type { Trabajador, Registro } from '../../types'
import { formatFecha, formatMoneda } from '../../utils'

interface Props {
  trabajador: Trabajador
  registros: Registro[]
  periodo: { desde: string; hasta: string }
  onCerrar: () => void
}

export default function DetalleModal({ trabajador, registros, periodo, onCerrar }: Props) {
  const etiquetaPeriodo = `${periodo.desde} al ${periodo.hasta}`
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6 flex flex-col gap-4 max-h-[80vh]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#f0f0f0]">{trabajador.nombre}</h2>
            <p className="text-xs text-[#555]">Período: {etiquetaPeriodo}</p>
          </div>
          <button onClick={onCerrar} className="text-[#555] hover:text-[#aaa]"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex flex-col gap-1.5">
          {registros.length === 0 ? (
            <p className="text-sm text-[#555] text-center py-8">Sin registros en este período.</p>
          ) : registros.map(r => (
            <div key={r.id} className="flex items-center gap-3 bg-[#0d0d0d] border border-white/5 rounded-lg px-3 py-2.5">
              <span className="text-xs text-[#555] w-20 shrink-0 capitalize">{formatFecha(r.fecha).split(',')[0]}</span>
              <span className="flex-1 text-sm text-[#aaa] truncate">{r.actividad || '—'}</span>
              <span className="text-xs text-[#555] w-12 text-center shrink-0">{r.cantidad} {trabajador.tipoPago === 'dia' ? 'd' : 'h'}</span>
              <span className="text-sm font-semibold text-[#f0f0f0] w-20 text-right shrink-0">{formatMoneda(r.montoCalculado)}</span>
            </div>
          ))}
        </div>
        {registros.length > 0 && (
          <div className="border-t border-white/5 pt-3 flex justify-between items-center">
            <span className="text-xs text-[#555]">Total devengado</span>
            <span className="font-bold text-[#f0f0f0]">{formatMoneda(registros.reduce((s, r) => s + r.montoCalculado, 0))}</span>
          </div>
        )}
      </div>
    </div>
  )
}

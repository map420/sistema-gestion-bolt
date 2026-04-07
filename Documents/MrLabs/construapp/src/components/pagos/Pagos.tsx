// src/components/pagos/Pagos.tsx
import { useState } from 'react'
import { Eye, DollarSign } from 'lucide-react'
import type { Trabajador, Pago } from '../../types'
import { loadData, updateData } from '../../storage'
import { calcularSaldo, formatMoneda, semanaActual, quincenaActual } from '../../utils'
import PagoModal from './PagoModal'
import DetalleModal from './DetalleModal'

type ModoPeriodo = 'semana' | 'quincena' | 'personalizado'

export default function Pagos() {
  const [data, setData] = useState(() => loadData())
  const [modo, setModo] = useState<ModoPeriodo>('semana')
  const [periodoCustom, setPeriodoCustom] = useState({ desde: '', hasta: '' })
  const [pagoModal, setPagoModal] = useState<Trabajador | null>(null)
  const [detalleModal, setDetalleModal] = useState<Trabajador | null>(null)

  const periodo = modo === 'semana' ? semanaActual() : modo === 'quincena' ? quincenaActual() : periodoCustom
  const trabajadores = data.trabajadores.filter(t => t.activo)

  const guardarPago = (pago: Pago) => {
    const next = updateData(d => { d.pagos.push(pago); return d })
    setData(next)
    setPagoModal(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-[#f0f0f0] tracking-tight">Pagos</h1>

      {/* Period selector */}
      <div className="flex flex-wrap gap-2 items-center">
        {(['semana', 'quincena', 'personalizado'] as ModoPeriodo[]).map(m => (
          <button key={m} onClick={() => setModo(m)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${modo === m ? 'bg-[#9d7ff0] text-white' : 'bg-[#111] border border-white/10 text-[#555] hover:text-[#aaa]'}`}>
            {m}
          </button>
        ))}
        {modo === 'personalizado' && (
          <div className="flex gap-2 items-center mt-1 w-full">
            <input type="date" className="bg-[#111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={periodoCustom.desde} onChange={e => setPeriodoCustom(p => ({ ...p, desde: e.target.value }))} />
            <span className="text-[#555] text-sm">al</span>
            <input type="date" className="bg-[#111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={periodoCustom.hasta} onChange={e => setPeriodoCustom(p => ({ ...p, hasta: e.target.value }))} />
          </div>
        )}
      </div>

      {trabajadores.length === 0 ? (
        <p className="text-[#555] text-sm text-center py-20">No hay trabajadores activos.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {trabajadores.map(t => {
            const { devengado, pagado, pendiente } = calcularSaldo(t.id, periodo, data.registros, data.pagos)
            const sinDeuda = pendiente === 0
            return (
              <div key={t.id} className="bg-[#111] border border-white/5 rounded-xl px-4 py-3.5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#9d7ff020] flex items-center justify-center text-sm font-bold text-[#9d7ff0] shrink-0">
                    {t.nombre.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#f0f0f0] truncate">{t.nombre}</p>
                    <p className="text-xs text-[#555]">{t.oficio}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-[#f0f0f0] tracking-tight">{formatMoneda(devengado)}</p>
                    <span className={`text-xs font-medium ${sinDeuda ? 'text-[#34d399]' : 'text-[#f87171]'}`}>
                      {sinDeuda ? 'Sin deuda' : `Pendiente ${formatMoneda(pendiente)}`}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-white/5 pt-3">
                  <button onClick={() => setDetalleModal(t)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border border-white/10 text-[#555] hover:text-[#aaa]">
                    <Eye size={13} /> Ver detalle
                  </button>
                  <button onClick={() => setPagoModal(t)} disabled={sinDeuda} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${sinDeuda ? 'bg-[#1a1a1a] text-[#333] cursor-not-allowed' : 'bg-[#9d7ff0] text-white hover:bg-[#8b6fd4]'}`}>
                    <DollarSign size={13} /> Registrar pago
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {pagoModal && (
        <PagoModal
          trabajador={pagoModal}
          saldoPendiente={calcularSaldo(pagoModal.id, periodo, data.registros, data.pagos).pendiente}
          periodo={periodo}
          onGuardar={guardarPago}
          onCerrar={() => setPagoModal(null)}
        />
      )}
      {detalleModal && (
        <DetalleModal
          trabajador={detalleModal}
          registros={data.registros.filter(r => r.trabajadorId === detalleModal.id && r.fecha >= periodo.desde && r.fecha <= periodo.hasta)}
          periodo={periodo}
          onCerrar={() => setDetalleModal(null)}
        />
      )}
    </div>
  )
}

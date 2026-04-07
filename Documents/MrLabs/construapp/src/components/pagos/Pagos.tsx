// src/components/pagos/Pagos.tsx
import { useState, useEffect } from 'react'
import { Eye, DollarSign, FileText } from 'lucide-react'
import type { Trabajador, Pago } from '../../types'
import { loadData, updateData } from '../../storage'
import { calcularSaldo, formatMoneda, semanaActual, quincenaActual, siguienteFolio } from '../../utils'
import { usePDF } from '../../hooks/usePDF'
import PagoModal from './PagoModal'
import DetalleModal from './DetalleModal'
import ComprobanteTemplate from '../pdf/ComprobanteTemplate'

type ModoPeriodo = 'semana' | 'quincena' | 'personalizado'

export default function Pagos() {
  const [data, setData] = useState(() => loadData())
  const [modo, setModo] = useState<ModoPeriodo>('semana')
  const [periodoCustom, setPeriodoCustom] = useState({ desde: '', hasta: '' })
  const [pagoModal, setPagoModal] = useState<Trabajador | null>(null)
  const [detalleModal, setDetalleModal] = useState<Trabajador | null>(null)
  const [comprobanteTarget, setComprobanteTarget] = useState<{ trabajador: Trabajador; pago: Pago } | null>(null)
  const { exportar } = usePDF()

  const periodo = modo === 'semana' ? semanaActual() : modo === 'quincena' ? quincenaActual() : periodoCustom
  const trabajadores = data.trabajadores.filter(t => t.activo)

  const guardarPago = (pagoSinFolio: Omit<Pago, 'folio'>) => {
    const next = updateData(d => {
      const folio = siguienteFolio(d.pagos)
      d.pagos.push({ ...pagoSinFolio, folio })
      return d
    })
    setData(next)
    setPagoModal(null)
  }

  useEffect(() => {
    if (!comprobanteTarget) return
    const { trabajador, pago } = comprobanteTarget
    exportar(
      `comprobante-${trabajador.id}`,
      `Comprobante-${trabajador.nombre.replace(/\s+/g, '-')}-Folio${pago.folio}`
    )?.then(() => setComprobanteTarget(null))
  }, [comprobanteTarget, exportar])

  const generarComprobante = (t: Trabajador) => {
    const pagosT = data.pagos
      .filter(p => p.trabajadorId === t.id && p.fecha >= periodo.desde && p.fecha <= periodo.hasta)
      .sort((a, b) => b.folio - a.folio)
    const ultimoPago = pagosT[0]
    if (!ultimoPago) return
    setComprobanteTarget({ trabajador: t, pago: ultimoPago })
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
                    <p className="text-[10px] text-[#555] mt-0.5">
                      Dev {formatMoneda(devengado)} · Pag {formatMoneda(pagado)} · Sal {formatMoneda(pendiente)}
                    </p>
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
                  <button onClick={() => generarComprobante(t)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border border-white/10 text-[#555] hover:text-[#aaa]">
                    <FileText size={13} /> Comprobante
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
          pagos={data.pagos}
          periodo={periodo}
          onCerrar={() => setDetalleModal(null)}
        />
      )}

      {/* Hidden PDF template */}
      {comprobanteTarget && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <ComprobanteTemplate
            id={`comprobante-${comprobanteTarget.trabajador.id}`}
            trabajador={comprobanteTarget.trabajador}
            registros={data.registros.filter(r =>
              r.trabajadorId === comprobanteTarget.trabajador.id &&
              r.fecha >= comprobanteTarget.pago.periodo.desde &&
              r.fecha <= comprobanteTarget.pago.periodo.hasta
            )}
            pago={comprobanteTarget.pago}
          />
        </div>
      )}
    </div>
  )
}

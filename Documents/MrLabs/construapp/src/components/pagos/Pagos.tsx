// src/components/pagos/Pagos.tsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, DollarSign, FileText } from 'lucide-react'
import type { Trabajador, Pago } from '../../types'
import { loadData, updateData } from '../../storage'
import { calcularSaldo, semanaActual, quincenaActual, siguienteFolio } from '../../utils'
import { useConfig } from '../../context/ConfigContext'
import { usePDF } from '../../hooks/usePDF'
import PagoModal from './PagoModal'
import DetalleModal from './DetalleModal'
import ComprobanteTemplate from '../pdf/ComprobanteTemplate'

type ModoPeriodo = 'semana' | 'quincena' | 'personalizado'

interface Props {
  nombreEmpresa: string
}

export default function Pagos({ nombreEmpresa }: Props) {
  const { fmt } = useConfig()
  const { t } = useTranslation()
  const [data, setData] = useState(() => loadData())
  const [modo, setModo] = useState<ModoPeriodo>('semana')
  const [periodoCustom, setPeriodoCustom] = useState({ desde: '', hasta: '' })
  const [pagoModal, setPagoModal] = useState<Trabajador | null>(null)
  const [detalleModal, setDetalleModal] = useState<Trabajador | null>(null)
  const [comprobanteTarget, setComprobanteTarget] = useState<{ trabajador: Trabajador; pago: Pago } | null>(null)
  const { exportar } = usePDF()

  const MODOS: { key: ModoPeriodo; label: string }[] = [
    { key: 'semana',       label: t('payments.week') },
    { key: 'quincena',     label: t('payments.fortnight') },
    { key: 'personalizado',label: t('payments.custom') },
  ]

  const periodo = modo === 'semana' ? semanaActual() : modo === 'quincena' ? quincenaActual() : periodoCustom
  const trabajadores = data.trabajadores.filter(tr => tr.activo)

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

  const generarComprobante = (tr: Trabajador) => {
    const pagosT = data.pagos
      .filter(p => p.trabajadorId === tr.id && p.fecha >= periodo.desde && p.fecha <= periodo.hasta)
      .sort((a, b) => b.folio - a.folio)
    const ultimoPago = pagosT[0]
    if (!ultimoPago) return
    setComprobanteTarget({ trabajador: tr, pago: ultimoPago })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-[#f0f0f0] tracking-tight">{t('payments.title')}</h1>

      {/* Period selector */}
      <div className="flex flex-wrap gap-2 items-center">
        {MODOS.map(({ key, label }) => (
          <button key={key} onClick={() => setModo(key)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${modo === key ? 'bg-[#9d7ff0] text-white' : 'bg-[#111] border border-white/10 text-[#555] hover:text-[#aaa]'}`}>
            {label}
          </button>
        ))}
        {modo === 'personalizado' && (
          <div className="flex gap-2 items-center mt-1 w-full">
            <input type="date" className="bg-[#111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={periodoCustom.desde} onChange={e => setPeriodoCustom(p => ({ ...p, desde: e.target.value }))} />
            <span className="text-[#555] text-sm">{t('payments.to')}</span>
            <input type="date" className="bg-[#111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={periodoCustom.hasta} onChange={e => setPeriodoCustom(p => ({ ...p, hasta: e.target.value }))} />
          </div>
        )}
      </div>

      {trabajadores.length === 0 ? (
        <p className="text-[#555] text-sm text-center py-20">{t('payments.noWorkers')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {trabajadores.map(tr => {
            const { devengado, pagado, pendiente } = calcularSaldo(tr.id, periodo, data.registros, data.pagos)
            const sinDeuda = pendiente === 0
            return (
              <div key={tr.id} className="bg-[#111] border border-white/5 rounded-xl px-4 py-3.5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#9d7ff020] flex items-center justify-center text-sm font-bold text-[#9d7ff0] shrink-0">
                    {tr.nombre.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#f0f0f0] truncate">{tr.nombre}</p>
                    <p className="text-xs text-[#555]">{tr.oficio}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-[#f0f0f0] tracking-tight">{fmt(devengado)}</p>
                    <div className="flex gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-[#555]">{t('payments.earned')} {fmt(devengado)}</span>
                      <span className="text-[10px] text-[#34d399]">{t('payments.paid')} {fmt(pagado)}</span>
                      <span className={`text-[10px] ${pendiente > 0 ? 'text-[#f87171]' : 'text-[#34d399]'}`}>{t('payments.balance')} {fmt(pendiente)}</span>
                    </div>
                    <span className={`text-xs font-medium ${sinDeuda ? 'text-[#34d399]' : 'text-[#f87171]'}`}>
                      {sinDeuda ? t('payments.noDebt') : `${t('payments.pending')} ${fmt(pendiente)}`}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-white/5 pt-3">
                  <button onClick={() => setDetalleModal(tr)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border border-white/10 text-[#555] hover:text-[#aaa]">
                    <Eye size={13} /> <span className="hidden sm:inline">{t('payments.viewDetail')}</span><span className="sm:hidden">{t('payments.detail')}</span>
                  </button>
                  <button onClick={() => setPagoModal(tr)} disabled={sinDeuda} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${sinDeuda ? 'bg-[#1a1a1a] text-[#333] cursor-not-allowed' : 'bg-[#9d7ff0] text-white hover:bg-[#8b6fd4]'}`}>
                    <DollarSign size={13} /> <span className="hidden sm:inline">{t('payments.register')}</span><span className="sm:hidden">{t('payments.pay')}</span>
                  </button>
                  <button onClick={() => generarComprobante(tr)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border border-white/10 text-[#555] hover:text-[#aaa]">
                    <FileText size={13} /> <span className="hidden sm:inline">{t('payments.voucher')}</span><span className="sm:hidden">{t('payments.pdf')}</span>
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
            nombreEmpresa={nombreEmpresa}
            fmt={fmt}
          />
        </div>
      )}
    </div>
  )
}

// src/components/pagos/Pagos.tsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, DollarSign, FileText, TrendingUp } from 'lucide-react'
import type { Trabajador, Pago } from '../../types'
import { useData } from '../../context/DataContext'
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
  const { data, updateData } = useData()
  const [modo, setModo] = useState<ModoPeriodo>('semana')
  const [periodoCustom, setPeriodoCustom] = useState({ desde: '', hasta: '' })
  const [pagoModal, setPagoModal] = useState<Trabajador | null>(null)
  const [detalleModal, setDetalleModal] = useState<Trabajador | null>(null)
  const [comprobanteTarget, setComprobanteTarget] = useState<{ trabajador: Trabajador; pago: Pago } | null>(null)
  const { exportar } = usePDF()

  const MODOS: { key: ModoPeriodo; label: string }[] = [
    { key: 'semana',        label: t('payments.week') },
    { key: 'quincena',      label: t('payments.fortnight') },
    { key: 'personalizado', label: t('payments.custom') },
  ]

  const periodo = modo === 'semana' ? semanaActual() : modo === 'quincena' ? quincenaActual() : periodoCustom
  const trabajadores = data.trabajadores.filter(tr => tr.activo)

  const guardarPago = (pagoSinFolio: Omit<Pago, 'folio'>) => {
    updateData(d => {
      const folio = siguienteFolio(d.pagos)
      d.pagos.push({ ...pagoSinFolio, folio })
      return d
    })
    setPagoModal(null)
  }

  useEffect(() => {
    if (!comprobanteTarget) return
    const { trabajador, pago } = comprobanteTarget
    exportar(`comprobante-${trabajador.id}`, `Comprobante-${trabajador.nombre.replace(/\s+/g, '-')}-Folio${pago.folio}`)
      ?.then(() => setComprobanteTarget(null))
  }, [comprobanteTarget, exportar])

  const generarComprobante = (tr: Trabajador) => {
    const pagosT = data.pagos.filter(p => p.trabajadorId === tr.id && p.fecha >= periodo.desde && p.fecha <= periodo.hasta).sort((a, b) => b.folio - a.folio)
    const ultimoPago = pagosT[0]
    if (!ultimoPago) return
    setComprobanteTarget({ trabajador: tr, pago: ultimoPago })
  }

  // Summary totals
  const totales = trabajadores.reduce((acc, tr) => {
    const { devengado, pagado, pendiente } = calcularSaldo(tr.id, periodo, data.registros, data.pagos)
    return { devengado: acc.devengado + devengado, pagado: acc.pagado + pagado, pendiente: acc.pendiente + pendiente }
  }, { devengado: 0, pagado: 0, pendiente: 0 })

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-[#f2f2f7] tracking-tight">{t('payments.title')}</h1>

      {/* Period selector */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          {MODOS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setModo(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                modo === key
                  ? 'accent-gradient text-white shadow-sm shadow-[#7c5ff030]'
                  : 'bg-[#0f0f13] border border-white/[0.07] text-[#6b6b7a] hover:text-[#a0a0b0]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {modo === 'personalizado' && (
          <div className="flex gap-2 items-center">
            <input
              type="date"
              className="flex-1 bg-[#0f0f13] border border-white/[0.07] rounded-xl px-3 py-2 text-sm text-[#f2f2f7] transition-all"
              value={periodoCustom.desde}
              onChange={e => setPeriodoCustom(p => ({ ...p, desde: e.target.value }))}
            />
            <span className="text-[#6b6b7a] text-sm">{t('payments.to')}</span>
            <input
              type="date"
              className="flex-1 bg-[#0f0f13] border border-white/[0.07] rounded-xl px-3 py-2 text-sm text-[#f2f2f7] transition-all"
              value={periodoCustom.hasta}
              onChange={e => setPeriodoCustom(p => ({ ...p, hasta: e.target.value }))}
            />
          </div>
        )}
      </div>

      {/* Summary strip */}
      {trabajadores.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: t('detail.earned'), value: totales.devengado, color: 'text-[#f2f2f7]' },
            { label: t('detail.paid'),   value: totales.pagado,    color: 'text-[#30d158]' },
            { label: t('detail.pending'), value: totales.pendiente, color: totales.pendiente > 0 ? 'text-[#ffa800]' : 'text-[#30d158]' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#0f0f13] border border-white/[0.06] rounded-2xl px-3 py-3 text-center">
              <p className="text-[10px] text-[#6b6b7a] font-semibold uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-sm font-bold ${color}`}>{fmt(value)}</p>
            </div>
          ))}
        </div>
      )}

      {trabajadores.length === 0 ? (
        <div className="py-24 text-center">
          <TrendingUp size={32} className="text-[#38383f] mx-auto mb-3" />
          <p className="text-[#6b6b7a] text-sm">{t('payments.noWorkers')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {trabajadores.map(tr => {
            const { devengado, pagado, pendiente } = calcularSaldo(tr.id, periodo, data.registros, data.pagos)
            const sinDeuda = pendiente === 0
            return (
              <div key={tr.id} className="bg-[#0f0f13] border border-white/[0.06] rounded-2xl px-4 py-4 flex flex-col gap-3 hover:border-white/[0.10] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl relative flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 accent-gradient opacity-15 rounded-xl" />
                    <span className="text-sm font-bold text-[#a78bfa] relative z-10">
                      {tr.nombre.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#f2f2f7] truncate">{tr.nombre}</p>
                    <p className="text-xs text-[#6b6b7a]">{tr.oficio}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-[#f2f2f7]">{fmt(devengado)}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      sinDeuda ? 'bg-[#30d15820] text-[#30d158]' : 'bg-[#ffa80020] text-[#ffa800]'
                    }`}>
                      {sinDeuda ? t('payments.noDebt') : `${t('payments.pending')} ${fmt(pendiente)}`}
                    </span>
                  </div>
                </div>

                {/* Mini breakdown */}
                <div className="flex gap-3 text-[11px] px-1">
                  <span className="text-[#6b6b7a]">{t('payments.earned')} <span className="text-[#f2f2f7] font-medium">{fmt(devengado)}</span></span>
                  <span className="text-[#6b6b7a]">{t('payments.paid')} <span className="text-[#30d158] font-medium">{fmt(pagado)}</span></span>
                  {pendiente > 0 && <span className="text-[#6b6b7a]">{t('payments.balance')} <span className="text-[#ffa800] font-medium">{fmt(pendiente)}</span></span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-white/[0.05] pt-3">
                  <button
                    onClick={() => setDetalleModal(tr)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs border border-white/[0.07] text-[#6b6b7a] hover:text-[#a0a0b0] hover:border-white/[0.12] transition-all"
                  >
                    <Eye size={13} />
                    <span className="hidden sm:inline">{t('payments.viewDetail')}</span>
                    <span className="sm:hidden">{t('payments.detail')}</span>
                  </button>
                  <button
                    onClick={() => setPagoModal(tr)}
                    disabled={sinDeuda}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      sinDeuda
                        ? 'bg-white/[0.03] text-[#38383f] cursor-not-allowed'
                        : 'accent-gradient text-white hover:opacity-90 shadow-sm shadow-[#7c5ff020]'
                    }`}
                  >
                    <DollarSign size={13} />
                    <span className="hidden sm:inline">{t('payments.register')}</span>
                    <span className="sm:hidden">{t('payments.pay')}</span>
                  </button>
                  <button
                    onClick={() => generarComprobante(tr)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs border border-white/[0.07] text-[#6b6b7a] hover:text-[#a0a0b0] hover:border-white/[0.12] transition-all"
                  >
                    <FileText size={13} />
                    <span className="hidden sm:inline">{t('payments.voucher')}</span>
                    <span className="sm:hidden">{t('payments.pdf')}</span>
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
      {comprobanteTarget && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <ComprobanteTemplate
            id={`comprobante-${comprobanteTarget.trabajador.id}`}
            trabajador={comprobanteTarget.trabajador}
            registros={data.registros.filter(r => r.trabajadorId === comprobanteTarget.trabajador.id && r.fecha >= comprobanteTarget.pago.periodo.desde && r.fecha <= comprobanteTarget.pago.periodo.hasta)}
            pago={comprobanteTarget.pago}
            nombreEmpresa={nombreEmpresa}
            fmt={fmt}
          />
        </div>
      )}
    </div>
  )
}

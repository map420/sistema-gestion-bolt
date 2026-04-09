// src/components/reportes/Reportes.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { calcularSaldo, semanaActual, quincenaActual } from '../../utils'
import { useConfig } from '../../context/ConfigContext'
import { usePDF } from '../../hooks/usePDF'
import PlanillaTemplate from '../pdf/PlanillaTemplate'

type ModoPeriodo = 'semana' | 'quincena' | 'personalizado'
type VistaTab = 'trabajadores' | 'proyectos'

interface Props {
  nombreEmpresa: string
}

export default function Reportes({ nombreEmpresa }: Props) {
  const { fmt } = useConfig()
  const { t } = useTranslation()
  const { data } = useData()
  const [modo, setModo] = useState<ModoPeriodo>('semana')
  const [periodoCustom, setPeriodoCustom] = useState({ desde: '', hasta: '' })
  const [vistaTab, setVistaTab] = useState<VistaTab>('trabajadores')
  const { exportar } = usePDF()

  const MODOS: { key: ModoPeriodo; label: string }[] = [
    { key: 'semana',        label: t('reports.week') },
    { key: 'quincena',      label: t('reports.fortnight') },
    { key: 'personalizado', label: t('reports.custom') },
  ]

  const periodo = modo === 'semana' ? semanaActual() : modo === 'quincena' ? quincenaActual() : periodoCustom
  const trabajadores = data.trabajadores.filter(tr => tr.activo)
  const proyectos = data.proyectos?.filter(p => p.activo) ?? []

  // ── Por Trabajador ────────────────────────────────────────────────────────
  const filas = trabajadores.map(tr => {
    const regs = data.registros.filter(r => r.trabajadorId === tr.id && r.fecha >= periodo.desde && r.fecha <= periodo.hasta)
    const totalCantidad = regs.reduce((s, r) => s + r.cantidad, 0)
    const { devengado, pagado, pendiente } = calcularSaldo(tr.id, periodo, data.registros, data.pagos)
    return { tr, totalCantidad, devengado, pagado, pendiente }
  })

  const conActividad = filas.filter(f => f.devengado > 0)
  const totalDevengado = conActividad.reduce((s, f) => s + f.devengado, 0)
  const totalPagado = conActividad.reduce((s, f) => s + f.pagado, 0)
  const totalPendiente = conActividad.reduce((s, f) => s + f.pendiente, 0)

  // ── Por Proyecto ──────────────────────────────────────────────────────────
  const filasProyecto = proyectos.map(p => {
    const regs = data.registros.filter(
      r => r.proyectoId === p.id && r.fecha >= periodo.desde && r.fecha <= periodo.hasta
    )
    const totalCosto = regs.reduce((s, r) => s + r.montoCalculado, 0)
    const workers = trabajadores.map(tr => {
      const tRegs = regs.filter(r => r.trabajadorId === tr.id)
      const cantidad = tRegs.reduce((s, r) => s + r.cantidad, 0)
      const costo = tRegs.reduce((s, r) => s + r.montoCalculado, 0)
      return { tr, cantidad, costo }
    }).filter(w => w.costo > 0)
    return { p, totalCosto, workers }
  }).filter(x => x.totalCosto > 0)

  const exportarPlanilla = () => {
    exportar('planilla-pdf', `planilla-${periodo.desde}-${periodo.hasta}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[#f0f0f0] tracking-tight">{t('reports.title')}</h1>
        <button
          onClick={exportarPlanilla}
          className="shrink-0 flex items-center gap-2 border border-[#9d7ff050] text-[#9d7ff0] text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#9d7ff010] transition-colors"
        >
          <Download size={15} />
          <span className="hidden sm:inline">{t('reports.export')}</span>
          <span className="sm:hidden">{t('reports.pdf')}</span>
        </button>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 bg-[#111] border border-white/10 p-1 rounded-xl w-fit">
        <button
          onClick={() => setVistaTab('trabajadores')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${vistaTab === 'trabajadores' ? 'bg-[#9d7ff0] text-white' : 'text-[#555] hover:text-[#aaa]'}`}
        >
          {t('reports.byWorker')}
        </button>
        <button
          onClick={() => setVistaTab('proyectos')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${vistaTab === 'proyectos' ? 'bg-[#9d7ff0] text-white' : 'text-[#555] hover:text-[#aaa]'}`}
        >
          {t('reports.byProject')}
        </button>
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap gap-2 items-center">
        {MODOS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setModo(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${modo === key ? 'bg-[#9d7ff0] text-white' : 'bg-[#111] border border-white/10 text-[#555] hover:text-[#aaa]'}`}
          >
            {label}
          </button>
        ))}
        {modo === 'personalizado' && (
          <div className="flex gap-2 items-center mt-1 w-full">
            <input
              type="date"
              className="bg-[#111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]"
              value={periodoCustom.desde}
              onChange={e => setPeriodoCustom(p => ({ ...p, desde: e.target.value }))}
            />
            <span className="text-[#555] text-sm">{t('reports.to')}</span>
            <input
              type="date"
              className="bg-[#111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]"
              value={periodoCustom.hasta}
              onChange={e => setPeriodoCustom(p => ({ ...p, hasta: e.target.value }))}
            />
          </div>
        )}
      </div>

      {/* ── Tab: Por Trabajador ── */}
      {vistaTab === 'trabajadores' && (
        conActividad.length === 0 ? (
          <div className="py-20 text-center text-[#555] text-sm">{t('reports.noRecords')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">{t('reports.worker')}</th>
                  <th className="text-left py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">{t('reports.trade')}</th>
                  <th className="text-right py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">{t('reports.daysHrs')}</th>
                  <th className="text-right py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">{t('reports.earned')}</th>
                  <th className="text-right py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">{t('reports.paid')}</th>
                  <th className="text-right py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">{t('reports.pending')}</th>
                </tr>
              </thead>
              <tbody>
                {conActividad.map(({ tr, totalCantidad, devengado, pagado, pendiente }) => (
                  <tr key={tr.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-3 font-medium text-[#f0f0f0]">{tr.nombre}</td>
                    <td className="py-3 px-3 text-[#555]">{tr.oficio}</td>
                    <td className="py-3 px-3 text-right text-[#aaa]">{totalCantidad}</td>
                    <td className="py-3 px-3 text-right text-[#f0f0f0]">{fmt(devengado)}</td>
                    <td className="py-3 px-3 text-right text-[#34d399]">{fmt(pagado)}</td>
                    <td className={`py-3 px-3 text-right font-semibold ${pendiente > 0 ? 'text-[#f87171]' : 'text-[#34d399]'}`}>{fmt(pendiente)}</td>
                  </tr>
                ))}
                <tr className="border-t border-white/20 bg-white/[0.03]">
                  <td colSpan={3} className="py-3 px-3 text-xs font-bold text-[#555] uppercase tracking-wide text-right">{t('reports.totals')}</td>
                  <td className="py-3 px-3 text-right font-bold text-[#f0f0f0]">{fmt(totalDevengado)}</td>
                  <td className="py-3 px-3 text-right font-bold text-[#34d399]">{fmt(totalPagado)}</td>
                  <td className="py-3 px-3 text-right font-bold text-[#f87171]">{fmt(totalPendiente)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── Tab: Por Proyecto ── */}
      {vistaTab === 'proyectos' && (
        filasProyecto.length === 0 ? (
          <div className="py-20 text-center text-[#555] text-sm">{t('reports.noProjectData')}</div>
        ) : (
          <div className="flex flex-col gap-4">
            {filasProyecto.map(({ p, totalCosto, workers }) => (
              <div key={p.id} className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
                {/* Project header */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5">
                  <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#f0f0f0]">{p.nombre}</p>
                    {p.descripcion && <p className="text-xs text-[#555]">{p.descripcion}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#555] uppercase tracking-wide">{t('reports.totalCost')}</p>
                    <p className="text-base font-bold text-[#9d7ff0]">{fmt(totalCosto)}</p>
                  </div>
                </div>
                {/* Workers breakdown */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-2 px-4 text-xs text-[#555] font-medium">{t('reports.worker')}</th>
                      <th className="text-left py-2 px-4 text-xs text-[#555] font-medium">{t('reports.trade')}</th>
                      <th className="text-right py-2 px-4 text-xs text-[#555] font-medium">{t('reports.daysHrs')}</th>
                      <th className="text-right py-2 px-4 text-xs text-[#555] font-medium">{t('reports.earned')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map(({ tr, cantidad, costo }) => (
                      <tr key={tr.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 text-[#f0f0f0] font-medium">{tr.nombre}</td>
                        <td className="py-2.5 px-4 text-[#555]">{tr.oficio}</td>
                        <td className="py-2.5 px-4 text-right text-[#aaa]">{cantidad}</td>
                        <td className="py-2.5 px-4 text-right text-[#f0f0f0]">{fmt(costo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )
      )}

      {/* Hidden PDF template */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <PlanillaTemplate
          id="planilla-pdf"
          trabajadores={trabajadores}
          registros={data.registros}
          pagos={data.pagos}
          periodo={periodo}
          nombreEmpresa={nombreEmpresa}
          fmt={fmt}
        />
      </div>
    </div>
  )
}

// src/components/reportes/Reportes.tsx
import { useState } from 'react'
import { Download } from 'lucide-react'
import { loadData } from '../../storage'
import { calcularSaldo, semanaActual, quincenaActual } from '../../utils'
import { useConfig } from '../../context/ConfigContext'
import { usePDF } from '../../hooks/usePDF'
import PlanillaTemplate from '../pdf/PlanillaTemplate'

type ModoPeriodo = 'semana' | 'quincena' | 'personalizado'

interface Props {
  nombreEmpresa: string
}

export default function Reportes({ nombreEmpresa }: Props) {
  const { fmt } = useConfig()
  const [data] = useState(() => loadData())
  const [modo, setModo] = useState<ModoPeriodo>('semana')
  const [periodoCustom, setPeriodoCustom] = useState({ desde: '', hasta: '' })
  const { exportar } = usePDF()

  const periodo = modo === 'semana' ? semanaActual() : modo === 'quincena' ? quincenaActual() : periodoCustom
  const trabajadores = data.trabajadores.filter(t => t.activo)

  const filas = trabajadores.map(t => {
    const regs = data.registros.filter(r => r.trabajadorId === t.id && r.fecha >= periodo.desde && r.fecha <= periodo.hasta)
    const totalCantidad = regs.reduce((s, r) => s + r.cantidad, 0)
    const { devengado, pagado, pendiente } = calcularSaldo(t.id, periodo, data.registros, data.pagos)
    return { t, totalCantidad, devengado, pagado, pendiente }
  })

  const conActividad = filas.filter(f => f.devengado > 0)
  const totalDevengado = conActividad.reduce((s, f) => s + f.devengado, 0)
  const totalPagado = conActividad.reduce((s, f) => s + f.pagado, 0)
  const totalPendiente = conActividad.reduce((s, f) => s + f.pendiente, 0)

  const exportarPlanilla = () => {
    exportar('planilla-pdf', `planilla-${periodo.desde}-${periodo.hasta}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[#f0f0f0] tracking-tight">Reportes</h1>
        <button onClick={exportarPlanilla} className="shrink-0 flex items-center gap-2 border border-[#9d7ff050] text-[#9d7ff0] text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#9d7ff010] transition-colors">
          <Download size={15} /> <span className="hidden sm:inline">Exportar planilla PDF</span><span className="sm:hidden">PDF</span>
        </button>
      </div>

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

      {conActividad.length === 0 ? (
        <div className="py-20 text-center text-[#555] text-sm">Sin registros en este período.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">Trabajador</th>
                <th className="text-left py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">Oficio</th>
                <th className="text-right py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">Días/Hrs</th>
                <th className="text-right py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">Devengado</th>
                <th className="text-right py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">Pagado</th>
                <th className="text-right py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">Pendiente</th>
              </tr>
            </thead>
            <tbody>
              {conActividad.map(({ t, totalCantidad, devengado, pagado, pendiente }) => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-medium text-[#f0f0f0]">{t.nombre}</td>
                  <td className="py-3 px-3 text-[#555]">{t.oficio}</td>
                  <td className="py-3 px-3 text-right text-[#aaa]">{totalCantidad}</td>
                  <td className="py-3 px-3 text-right text-[#f0f0f0]">{fmt(devengado)}</td>
                  <td className="py-3 px-3 text-right text-[#34d399]">{fmt(pagado)}</td>
                  <td className={`py-3 px-3 text-right font-semibold ${pendiente > 0 ? 'text-[#f87171]' : 'text-[#34d399]'}`}>{fmt(pendiente)}</td>
                </tr>
              ))}
              <tr className="border-t border-white/20 bg-white/[0.03]">
                <td colSpan={3} className="py-3 px-3 text-xs font-bold text-[#555] uppercase tracking-wide text-right">Totales</td>
                <td className="py-3 px-3 text-right font-bold text-[#f0f0f0]">{fmt(totalDevengado)}</td>
                <td className="py-3 px-3 text-right font-bold text-[#34d399]">{fmt(totalPagado)}</td>
                <td className="py-3 px-3 text-right font-bold text-[#f87171]">{fmt(totalPendiente)}</td>
              </tr>
            </tbody>
          </table>
        </div>
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

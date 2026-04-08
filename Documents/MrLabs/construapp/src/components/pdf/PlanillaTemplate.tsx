// src/components/pdf/PlanillaTemplate.tsx
import { useTranslation } from 'react-i18next'
import type { Trabajador, Registro, Pago } from '../../types'
import { calcularSaldo } from "../../utils"

interface Props {
  id: string
  trabajadores: Trabajador[]
  registros: Registro[]
  pagos: Pago[]
  periodo: { desde: string; hasta: string }
  nombreEmpresa?: string
  fmt: (monto: number) => string
}

export default function PlanillaTemplate({ id, trabajadores, registros, pagos, periodo, nombreEmpresa = 'Constructora', fmt }: Props) {
  const { t } = useTranslation()

  const filas = trabajadores.map(tr => {
    const regs = registros.filter(r => r.trabajadorId === tr.id && r.fecha >= periodo.desde && r.fecha <= periodo.hasta)
    const totalCantidad = regs.reduce((s, r) => s + r.cantidad, 0)
    const { devengado, pagado, pendiente } = calcularSaldo(tr.id, periodo, registros, pagos)
    return { tr, totalCantidad, devengado, pagado, pendiente }
  }).filter(f => f.devengado > 0)

  const totalDevengado = filas.reduce((s, f) => s + f.devengado, 0)
  const totalPagado = filas.reduce((s, f) => s + f.pagado, 0)
  const totalPendiente = filas.reduce((s, f) => s + f.pendiente, 0)

  return (
    <div id={id} style={{ fontFamily: 'Arial, sans-serif', padding: '32px', color: '#111', background: '#fff' }}>
      <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #eee' }}>
        <p style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>{t('pdf.payroll')}</p>
        <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0' }}>{nombreEmpresa} · {t('pdf.period')} {periodo.desde} {t('pdf.to')} {periodo.hasta}</p>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>{t('pdf.worker')}</th>
            <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>{t('pdf.trade')}</th>
            <th style={{ textAlign: 'right', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>{t('pdf.daysHrs')}</th>
            <th style={{ textAlign: 'right', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>{t('pdf.earned')}</th>
            <th style={{ textAlign: 'right', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>{t('pdf.paid')}</th>
            <th style={{ textAlign: 'right', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>{t('pdf.pending')}</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(({ tr, totalCantidad, devengado, pagado, pendiente }, i) => (
            <tr key={tr.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              <td style={{ padding: '7px 8px', border: '1px solid #eee', fontWeight: 600 }}>{tr.nombre}</td>
              <td style={{ padding: '7px 8px', border: '1px solid #eee', color: '#666' }}>{tr.oficio}</td>
              <td style={{ padding: '7px 8px', border: '1px solid #eee', textAlign: 'right' }}>{totalCantidad}</td>
              <td style={{ padding: '7px 8px', border: '1px solid #eee', textAlign: 'right' }}>{fmt(devengado)}</td>
              <td style={{ padding: '7px 8px', border: '1px solid #eee', textAlign: 'right' }}>{fmt(pagado)}</td>
              <td style={{ padding: '7px 8px', border: '1px solid #eee', textAlign: 'right', fontWeight: pendiente > 0 ? 700 : 400 }}>{fmt(pendiente)}</td>
            </tr>
          ))}
          <tr style={{ background: '#f0f0f0', fontWeight: 700 }}>
            <td colSpan={3} style={{ padding: '8px', border: '1px solid #eee', textAlign: 'right' }}>{t('pdf.totals')}</td>
            <td style={{ padding: '8px', border: '1px solid #eee', textAlign: 'right' }}>{fmt(totalDevengado)}</td>
            <td style={{ padding: '8px', border: '1px solid #eee', textAlign: 'right' }}>{fmt(totalPagado)}</td>
            <td style={{ padding: '8px', border: '1px solid #eee', textAlign: 'right' }}>{fmt(totalPendiente)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

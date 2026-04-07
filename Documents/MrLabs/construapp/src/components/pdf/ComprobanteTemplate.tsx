// src/components/pdf/ComprobanteTemplate.tsx
import type { Trabajador, Registro, Pago } from '../../types'
import { formatMoneda } from '../../utils'

interface Props {
  id: string
  trabajador: Trabajador
  registros: Registro[]
  pago: Pago
  nombreEmpresa?: string
}

export default function ComprobanteTemplate({ id, trabajador, registros, pago, nombreEmpresa = 'Constructora' }: Props) {
  return (
    <div id={id} style={{ fontFamily: 'Arial, sans-serif', padding: '32px', color: '#111', background: '#fff', maxWidth: '700px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #eee' }}>
        <div>
          <p style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>COMPROBANTE DE PAGO</p>
          <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0' }}>Folio #{String(pago.folio).padStart(4, '0')} · {pago.fecha}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{nombreEmpresa}</p>
        </div>
      </div>
      {/* Trabajador info */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>Trabajador</p>
        <p style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{trabajador.nombre}</p>
        <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0' }}>{trabajador.oficio} · Período: {pago.periodo.desde} al {pago.periodo.hasta}</p>
      </div>
      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>Fecha</th>
            <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>Actividad</th>
            <th style={{ textAlign: 'right', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>{trabajador.tipoPago === 'dia' ? 'Días' : 'Horas'}</th>
            <th style={{ textAlign: 'right', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>Monto</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((r, i) => (
            <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              <td style={{ padding: '7px 8px', border: '1px solid #eee' }}>{r.fecha}</td>
              <td style={{ padding: '7px 8px', border: '1px solid #eee' }}>{r.actividad || '—'}</td>
              <td style={{ padding: '7px 8px', border: '1px solid #eee', textAlign: 'right' }}>{r.cantidad}</td>
              <td style={{ padding: '7px 8px', border: '1px solid #eee', textAlign: 'right' }}>{formatMoneda(r.montoCalculado)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '12px 20px', textAlign: 'right' }}>
          <p style={{ fontSize: '11px', color: '#888', margin: '0 0 4px' }}>Total pagado</p>
          <p style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{formatMoneda(pago.monto)}</p>
        </div>
      </div>
      {/* Firmas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #eee', fontSize: '11px', color: '#aaa' }}>
        <span>Firma del trabajador: ___________________</span>
        <span>Firma del empleador: ___________________</span>
      </div>
    </div>
  )
}

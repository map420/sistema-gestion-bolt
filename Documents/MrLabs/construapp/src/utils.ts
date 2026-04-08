export function uuid(): string {
  return crypto.randomUUID()
}

export function hoy(): string {
  return new Date().toISOString().split('T')[0]
}

export function formatFecha(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

/** @deprecated usar useConfig().fmt para respetar la moneda configurada */
export function formatMoneda(monto: number): string {
  return `$ ${monto.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function semanaActual(): { desde: string; hasta: string } {
  const hoyDate = new Date()
  const dia = hoyDate.getDay()
  const lunes = new Date(hoyDate)
  lunes.setDate(hoyDate.getDate() - (dia === 0 ? 6 : dia - 1))
  const domingo = new Date(lunes)
  domingo.setDate(lunes.getDate() + 6)
  return {
    desde: lunes.toISOString().split('T')[0],
    hasta: domingo.toISOString().split('T')[0],
  }
}

export function quincenaActual(): { desde: string; hasta: string } {
  const hoyDate = new Date()
  const y = hoyDate.getFullYear()
  const m = hoyDate.getMonth()
  const d = hoyDate.getDate()
  if (d <= 15) {
    return {
      desde: `${y}-${String(m + 1).padStart(2, '0')}-01`,
      hasta: `${y}-${String(m + 1).padStart(2, '0')}-15`,
    }
  }
  const ultimo = new Date(y, m + 1, 0).getDate()
  return {
    desde: `${y}-${String(m + 1).padStart(2, '0')}-16`,
    hasta: `${y}-${String(m + 1).padStart(2, '0')}-${ultimo}`,
  }
}

export function calcularSaldo(
  trabajadorId: string,
  periodo: { desde: string; hasta: string },
  registros: import('./types').Registro[],
  pagos: import('./types').Pago[]
): { devengado: number; pagado: number; pendiente: number } {
  const devengado = registros
    .filter(r => r.trabajadorId === trabajadorId && r.fecha >= periodo.desde && r.fecha <= periodo.hasta)
    .reduce((sum, r) => sum + r.montoCalculado, 0)

  const pagado = pagos
    .filter(p => p.trabajadorId === trabajadorId && p.fecha >= periodo.desde && p.fecha <= periodo.hasta)
    .reduce((sum, p) => sum + p.monto, 0)

  return { devengado, pagado, pendiente: Math.max(0, devengado - pagado) }
}

export function siguienteFolio(pagos: import('./types').Pago[]): number {
  if (pagos.length === 0) return 1
  return Math.max(...pagos.map(p => p.folio)) + 1
}

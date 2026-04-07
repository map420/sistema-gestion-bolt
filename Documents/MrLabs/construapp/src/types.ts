export type TipoPago = 'hora' | 'dia'

export interface Trabajador {
  id: string
  nombre: string
  oficio: string
  tipoPago: TipoPago
  tarifa: number
  telefono?: string
  activo: boolean
}

export interface Registro {
  id: string
  trabajadorId: string
  fecha: string        // YYYY-MM-DD
  cantidad: number     // horas o días
  actividad: string
  montoCalculado: number
}

export interface Pago {
  id: string
  trabajadorId: string
  fecha: string        // YYYY-MM-DD
  monto: number
  periodo: { desde: string; hasta: string }
  notas?: string
  folio: number
}

export interface AppData {
  trabajadores: Trabajador[]
  registros: Registro[]
  pagos: Pago[]
}

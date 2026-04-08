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

export interface Proyecto {
  id: string
  nombre: string
  color: string
  descripcion?: string
  activo: boolean
}

export interface Registro {
  id: string
  trabajadorId: string
  fecha: string        // YYYY-MM-DD
  cantidad: number     // horas o días
  actividad: string
  montoCalculado: number
  proyectoId?: string
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
  proyectos: Proyecto[]
}

export interface Usuario {
  id: string
  nombre: string
  passwordHash: string
}

export type Idioma = 'es' | 'en' | 'pt'

export interface Moneda {
  codigo: string   // USD, PEN, MXN…
  simbolo: string  // $, S/, $…
  nombre: string
}

export interface Config {
  nombreEmpresa: string
  logoDataUrl: string
  idioma: Idioma
  moneda: Moneda
}

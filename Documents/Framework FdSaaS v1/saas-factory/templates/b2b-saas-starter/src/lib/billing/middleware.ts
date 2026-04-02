// Billing Middleware — Guard de acceso por plan
// Usado en API routes y Server Components para proteger features por plan

import { getSubscription } from './mock' // swap: import { getSubscription } from './culqi'
import { getEffectivePlan, canUseFeature, PLAN_LIMITS, type Plan, type PlanLimits } from './plans'

export interface BillingContext {
  plan: Plan
  limits: PlanLimits
  isActive: boolean
  can: (feature: keyof PlanLimits) => boolean
}

/**
 * Obtener el contexto de billing de una clínica
 * Usar en Server Components y API routes
 */
export async function getBillingContext(clinicaId: string): Promise<BillingContext> {
  const subscription = await getSubscription(clinicaId)

  if (!subscription) {
    return buildContext('FREE', 'CANCELED')
  }

  return buildContext(subscription.plan as Plan, subscription.status as any)
}

function buildContext(plan: Plan, status: any): BillingContext {
  const effectivePlan = getEffectivePlan(plan, status)
  const limits = PLAN_LIMITS[effectivePlan]
  const isActive = status === 'TRIALING' || status === 'ACTIVE'

  return {
    plan: effectivePlan,
    limits,
    isActive,
    can: (feature: keyof PlanLimits) => canUseFeature(plan, status, feature),
  }
}

/**
 * Verificar límite de citas del mes
 * Llamar antes de crear una nueva cita
 */
export async function checkCitasLimit(clinicaId: string, citasEstesMes: number): Promise<boolean> {
  const { limits } = await getBillingContext(clinicaId)
  return citasEstesMes < limits.maxCitasMes
}

/**
 * Verificar límite de dentistas
 * Llamar antes de agregar un dentista nuevo
 */
export async function checkDentistasLimit(clinicaId: string, dentistasActuales: number): Promise<boolean> {
  const { limits } = await getBillingContext(clinicaId)
  return dentistasActuales < limits.maxDentistas
}

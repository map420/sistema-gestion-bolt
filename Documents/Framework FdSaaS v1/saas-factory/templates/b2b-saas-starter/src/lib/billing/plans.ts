// Billing Plans — Feature Flags
// Swap-ready: replace mock.ts with culqi.ts or stripe.ts when payment provider is active
// This file does NOT change when swapping providers

export type Plan = 'FREE' | 'STARTER' | 'PRO'
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID'

export interface PlanLimits {
  maxDentistas: number
  maxCitasMes: number
  maxPacientes: number
  historialDias: number
  recordatorio2h: boolean
  dashboardCompleto: boolean
  exportarDatos: boolean
  soportePrioritario: boolean
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    maxDentistas: 1,
    maxCitasMes: 30,
    maxPacientes: 20,
    historialDias: 7,
    recordatorio2h: false,
    dashboardCompleto: false,
    exportarDatos: false,
    soportePrioritario: false,
  },
  STARTER: {
    maxDentistas: 1,
    maxCitasMes: 150,
    maxPacientes: Infinity,
    historialDias: 30,
    recordatorio2h: true,
    dashboardCompleto: true,
    exportarDatos: false,
    soportePrioritario: false,
  },
  PRO: {
    maxDentistas: 3,
    maxCitasMes: Infinity,
    maxPacientes: Infinity,
    historialDias: 90,
    recordatorio2h: true,
    dashboardCompleto: true,
    exportarDatos: true,
    soportePrioritario: true,
  },
}

export const PLAN_PRICES: Record<Plan, number> = {
  FREE: 0,
  STARTER: 29,
  PRO: 49,
}

export function isActivePlan(status: SubscriptionStatus): boolean {
  return status === 'TRIALING' || status === 'ACTIVE'
}

export function getEffectivePlan(plan: Plan, status: SubscriptionStatus): Plan {
  if (isActivePlan(status)) return plan
  if (status === 'PAST_DUE') return 'FREE'
  return 'FREE'
}

export function canUseFeature(
  plan: Plan,
  status: SubscriptionStatus,
  feature: keyof PlanLimits
): boolean {
  const effectivePlan = getEffectivePlan(plan, status)
  const limit = PLAN_LIMITS[effectivePlan][feature]
  return typeof limit === 'boolean' ? limit : (limit as number) > 0
}

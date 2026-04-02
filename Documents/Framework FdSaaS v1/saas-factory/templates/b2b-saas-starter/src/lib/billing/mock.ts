// Billing Mock — MVP sin proveedor de pagos externo
// Gestión manual de planes desde panel admin
// Swap: reemplazar este archivo con culqi.ts o stripe.ts cuando esté listo
// El resto del sistema (plans.ts, middleware) no cambia

import { prisma } from '@/lib/prisma'
import type { Plan, SubscriptionStatus } from './plans'

/**
 * Obtener suscripción activa de una clínica
 */
export async function getSubscription(clinicaId: string) {
  return prisma.subscription.findUnique({
    where: { clinicaId },
    select: {
      plan: true,
      status: true,
      trialEndsAt: true,
      currentPeriodEnd: true,
    },
  })
}

/**
 * Crear suscripción trial al registrar una clínica nueva
 * Trial: 30 días en plan STARTER
 */
export async function createTrialSubscription(clinicaId: string) {
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 30)

  return prisma.subscription.create({
    data: {
      clinicaId,
      stripeCustomerId: `mock_${clinicaId}`, // placeholder — se reemplaza al integrar proveedor real
      plan: 'STARTER',
      status: 'TRIALING',
      trialEndsAt,
      currentPeriodEnd: trialEndsAt,
    },
  })
}

/**
 * Activar plan manualmente (desde panel admin)
 */
export async function activatePlan(clinicaId: string, plan: Plan) {
  const periodEnd = new Date()
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  return prisma.subscription.update({
    where: { clinicaId },
    data: {
      plan,
      status: 'ACTIVE',
      currentPeriodEnd: periodEnd,
    },
  })
}

/**
 * Cancelar suscripción manualmente
 */
export async function cancelSubscription(clinicaId: string) {
  return prisma.subscription.update({
    where: { clinicaId },
    data: {
      status: 'CANCELED',
      plan: 'FREE',
    },
  })
}

/**
 * Verificar si el trial expiró y degradar a FREE si corresponde
 * Ejecutar en cron job diario
 */
export async function checkExpiredTrials() {
  const now = new Date()

  const expired = await prisma.subscription.findMany({
    where: {
      status: 'TRIALING',
      trialEndsAt: { lt: now },
    },
  })

  for (const sub of expired) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'PAST_DUE' },
    })
  }

  return expired.length
}

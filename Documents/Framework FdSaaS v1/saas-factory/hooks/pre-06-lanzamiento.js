/**
 * Hook: Pre-Lanzamiento
 * Propósito: Verificar que todos los sistemas están operativos antes de deploy a producción.
 */
module.exports = async (context, deliverable) => {
  const errors = []
  const {
    allTestsPassing,
    stagingStable,
    monitoringConfigured,
    rollbackPlanDocumented,
    envVarsVerified,
    sslValid,
    stripeWebhookLive,
  } = deliverable

  if (!allTestsPassing) {
    errors.push('⚠️ Tests fallando. No se puede deployar con tests en rojo.')
  }

  if (!stagingStable) {
    errors.push('⚠️ Staging inestable. Verificar que staging refleja producción correctamente.')
  }

  if (!monitoringConfigured) {
    errors.push('⚠️ Sin monitoring configurado. Sentry + alertas de Vercel deben estar activos antes del launch.')
  }

  if (!rollbackPlanDocumented) {
    errors.push('⚠️ Sin plan de rollback documentado. ¿Qué hacemos si algo falla en T+1h?')
  }

  if (!envVarsVerified) {
    errors.push('⚠️ Variables de entorno de producción no verificadas. Revisar en Vercel → Project Settings → Environment Variables.')
  }

  if (!sslValid) {
    errors.push('⚠️ Certificado SSL inválido o próximo a expirar.')
  }

  if (!stripeWebhookLive) {
    errors.push('⚠️ Webhook de Stripe en modo test. Cambiar a producción antes de launch.')
  }

  // ─── SMOKE TEST OBLIGATORIO ──────────────────────────────────────────────────
  // Verificar el flujo crítico end-to-end en producción antes de dar el launch por bueno.
  // No se puede confirmar que el deploy funciona sin pasar por el flujo real.

  const { smokeTestPassed } = deliverable

  if (smokeTestPassed === false) {
    errors.push(
      '⚠️ BLOQUEANTE: Smoke test de producción no ejecutado o fallido. ' +
      'Protocolo mínimo: (1) Registrar usuario nuevo, (2) Completar onboarding, ' +
      '(3) Ejecutar la acción principal del producto, (4) Verificar que los datos persisten en DB. ' +
      'Sin smoke test confirmado, el launch no está completo.'
    )
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true }
}

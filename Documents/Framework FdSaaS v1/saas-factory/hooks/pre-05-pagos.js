/**
 * Hook: Pre-Arquitecto de Pagos
 * Propósito: Determinar el modo de billing antes de construir.
 *
 * PREGUNTA PREDETERMINADA DE ESTA ETAPA:
 * ¿Tienes un proveedor de pagos activo (Stripe, Culqi, Izipay, etc.)?
 *   → SÍ: valida integración real con PCI compliance
 *   → NO: genera billing mock para MVP (simulación sin proveedor)
 *
 * Modo MOCK:
 *   - Sin SDK externo de pagos
 *   - Tabla `subscriptions` en DB con estado manual
 *   - Admin puede activar/desactivar planes manualmente
 *   - Lógica de acceso basada en `plan` y `status` en DB
 *   - Fácil swap a Stripe/Culqi cuando esté listo
 *
 * Modo REAL:
 *   - Valida PCI compliance
 *   - Verifica webhook signature
 *   - Audit trail obligatorio
 */
module.exports = async (context, deliverable) => {
  const errors = []
  const warnings = []
  const { paymentProvider, billingMode } = deliverable

  // ─────────────────────────────────────────
  // PREGUNTA PREDETERMINADA
  // ─────────────────────────────────────────
  if (!billingMode) {
    return {
      valid: false,
      requiresInput: true,
      question: '¿Tienes un proveedor de pagos activo (Stripe, Culqi, Izipay, otro)?',
      options: [
        { value: 'mock', label: 'NO — usar billing simulado para MVP (recomendado si no tienes cuenta activa)' },
        { value: 'stripe', label: 'SÍ — Stripe' },
        { value: 'culqi', label: 'SÍ — Culqi (Perú)' },
        { value: 'other', label: 'SÍ — Otro proveedor' }
      ]
    }
  }

  // ─────────────────────────────────────────
  // MODO MOCK — Sin proveedor externo
  // ─────────────────────────────────────────
  if (billingMode === 'mock') {
    warnings.push('ℹ️ Billing en modo MOCK. Los planes se gestionan manualmente en DB.')
    warnings.push('ℹ️ Diseñado para swap fácil a Stripe/Culqi cuando esté listo.')

    if (!deliverable.mockPlansDefinidos) {
      errors.push('⚠️ Definir los planes y límites del mock antes de construir (ver billing.md).')
    }

    if (errors.length > 0) {
      return { valid: false, errors, warnings }
    }

    return {
      valid: true,
      mode: 'mock',
      warnings,
      message: '✅ Billing mock aprobado. Constructor implementa módulo de simulación.'
    }
  }

  // ─────────────────────────────────────────
  // MODO REAL — Proveedor externo
  // ─────────────────────────────────────────
  const { keysHardcoded, webhookSignatureVerified, auditTrailEnabled, noCardDataStored } = deliverable

  if (keysHardcoded) {
    errors.push('🚨 CRÍTICO: API keys hardcodeadas. Mover a variables de entorno INMEDIATAMENTE.')
  }

  if (!webhookSignatureVerified) {
    errors.push(`⚠️ Webhook de ${paymentProvider} sin verificación de firma. Vulnerabilidad de seguridad.`)
  }

  if (!auditTrailEnabled) {
    errors.push('⚠️ Sin audit trail de transacciones. Cada evento debe loggearse en DB.')
  }

  if (!noCardDataStored) {
    errors.push('🚨 CRÍTICO: Datos de tarjeta almacenados localmente. Violación PCI-DSS.')
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings }
  }

  return {
    valid: true,
    mode: 'real',
    provider: paymentProvider,
    message: `✅ Billing real aprobado. Proveedor: ${paymentProvider}`
  }
}

/**
 * Hook: Pre-Desarrollador (Builder)
 * Propósito: Validar prerequisitos ANTES de empezar construcción y calidad ANTES de commit.
 *
 * Se ejecuta en dos momentos:
 *   1. Al inicio de Fase 06 — verifica que el entorno está listo para construir
 *   2. Antes de cada commit — verifica calidad de código
 */
module.exports = async (context, deliverable) => {
  const errors = []
  const {
    // Prerequisitos de entorno (verificar al inicio de Fase 06)
    credentialsCollected,
    cicdVerified,
    envVarsInVercel,
    localRunPassing,
    // Calidad de código (verificar antes de commit)
    testCoverage,
    lintErrors,
    securityIssues,
    hasTypeErrors,
    migrationsReversible,
    errorHandlingExplicit,
  } = deliverable

  // ─── PREREQUISITOS DE ENTORNO ───────────────────────────────────────────────

  if (credentialsCollected === false) {
    errors.push(
      '⚠️ BLOQUEANTE: Hay integraciones externas sin credenciales recolectadas. ' +
      'Ver `knowledge/integraciones-credenciales.md`. ' +
      'Construir en modo mock o conseguir credenciales antes de continuar.'
    )
  }

  if (cicdVerified === false) {
    errors.push(
      '⚠️ BLOQUEANTE: El pipeline CI/CD de Vercel no está verificado. ' +
      'Hacer un commit de prueba y confirmar que el auto-deploy funciona en <60s. ' +
      'Si falla, diagnosticar antes de escribir código de producción.'
    )
  }

  if (envVarsInVercel === false) {
    errors.push(
      '⚠️ BLOQUEANTE: Las variables de entorno no están configuradas en Vercel. ' +
      'Añadir todas las vars de `.env.local` en Vercel → Project Settings → Environment Variables.'
    )
  }

  if (localRunPassing === false) {
    errors.push(
      '⚠️ BLOQUEANTE: `npm run dev` no levanta limpio. ' +
      'Resolver errores de compilación localmente antes de empezar a construir features.'
    )
  }

  // ─── CALIDAD DE CÓDIGO ───────────────────────────────────────────────────────

  if (testCoverage !== undefined && testCoverage < 80) {
    errors.push(`⚠️ Cobertura de tests ${testCoverage}% — mínimo requerido: 80%.`)
  }

  if (lintErrors && lintErrors > 0) {
    errors.push(`⚠️ ${lintErrors} errores de linting. Limpiar antes de avanzar.`)
  }

  if (securityIssues && securityIssues.critical > 0) {
    errors.push(`⚠️ ${securityIssues.critical} vulnerabilidades críticas (OWASP). Resolver antes de merge.`)
  }

  if (hasTypeErrors) {
    errors.push('⚠️ Errores de TypeScript. Sin `any` implícitos. Corregir tipos.')
  }

  if (migrationsReversible === false) {
    errors.push('⚠️ Migración de DB no reversible. Toda migración debe tener su `down`.')
  }

  if (errorHandlingExplicit === false) {
    errors.push(
      '⚠️ Bloques catch sin manejo explícito del error. ' +
      'Regla: todo catch debe (a) loguear el error real y (b) devolver al usuario el mensaje concreto, no uno genérico. ' +
      'Nunca: `catch { setError("Ocurrió un error") }`. ' +
      'Siempre: `catch (err) { const msg = err instanceof Error ? err.message : String(err); setError(msg) }`'
    )
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true }
}

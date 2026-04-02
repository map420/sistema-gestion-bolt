/**
 * Hook: Pre-Validador de Interfaz (Diseño & UX Premium)
 * Propósito: Validar que diseno.md cumple con el "Efecto WOW" antes de avanzar a Construcción.
 *
 * Se activa cuando:
 *   - diseno.md es actualizado con el output de Stitch 2.0
 *   - El contenido ya no contiene el placeholder "ESPERANDO OUTPUT DE STITCH 2.0"
 *
 * Bloquea el paso 06 (Construcción) si el diseño no aprueba.
 */
module.exports = async (context, deliverable) => {
  const errors = []
  const warnings = []
  const { disenoContent } = deliverable

  // ─────────────────────────────────────────
  // GATE 0: Verificar que diseno.md tiene contenido real
  // ─────────────────────────────────────────
  if (!disenoContent || disenoContent.includes('ESPERANDO OUTPUT DE STITCH 2.0')) {
    errors.push('🚫 diseno.md está vacío o sin actualizar. Pega el output de Stitch 2.0 antes de continuar.')
    return { valid: false, errors }
  }

  if (disenoContent.includes('PEGAR AQUÍ')) {
    errors.push('🚫 diseno.md contiene el placeholder sin reemplazar. El output de Stitch 2.0 no fue pegado correctamente.')
    return { valid: false, errors }
  }

  // ─────────────────────────────────────────
  // GATE 1: Principios de diseño premium
  // ─────────────────────────────────────────
  const requiredSections = ['color', 'typograph', 'component', 'spacing']
  requiredSections.forEach(section => {
    if (!disenoContent.toLowerCase().includes(section)) {
      warnings.push(`⚠️ El diseño no documenta: ${section}. Verificar que Stitch lo incluyó.`)
    }
  })

  // ─────────────────────────────────────────
  // GATE 2: Pantallas mínimas cubiertas
  // ─────────────────────────────────────────
  const requiredScreens = ['login', 'onboarding', 'dashboard', 'agenda', 'settings']
  requiredScreens.forEach(screen => {
    if (!disenoContent.toLowerCase().includes(screen)) {
      errors.push(`⚠️ Pantalla requerida no documentada en diseño: "${screen}". El MVP no está completo sin ella.`)
    }
  })

  // ─────────────────────────────────────────
  // GATE 3: "Aha moment" documentado
  // ─────────────────────────────────────────
  const ahaMomentKeywords = ['dashboard', 'metric', 'confirmacion', 'confirmation', 'revenue', 'recovered']
  const hasAhaMoment = ahaMomentKeywords.some(kw => disenoContent.toLowerCase().includes(kw))
  if (!hasAhaMoment) {
    errors.push('⚠️ El "aha moment" no está visible en el diseño. El dashboard debe mostrar el impacto del producto en menos de 5 segundos.')
  }

  // ─────────────────────────────────────────
  // GATE 4: Consistencia visual
  // ─────────────────────────────────────────
  const hasConsistency = disenoContent.toLowerCase().includes('sidebar') ||
                         disenoContent.toLowerCase().includes('navigation') ||
                         disenoContent.toLowerCase().includes('nav')
  if (!hasConsistency) {
    warnings.push('⚠️ No se detecta navegación persistente (sidebar/nav). Verificar consistencia entre pantallas.')
  }

  // ─────────────────────────────────────────
  // RESULTADO
  // ─────────────────────────────────────────
  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      warnings,
      message: `❌ Diseño bloqueado — ${errors.length} error(es) crítico(s). Resolver antes de avanzar a Construcción.`
    }
  }

  return {
    valid: true,
    warnings,
    message: warnings.length > 0
      ? `✅ Diseño aprobado con ${warnings.length} advertencia(s) menores. Puede avanzar a Construcción.`
      : '✅ Diseño aprobado. Paso 05 Diseño WOW completado. Siguiente: Paso 05.5 Billing.'
  }
}

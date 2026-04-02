/**
 * Hook: Pre-Refinador (Filtro de Negocio)
 * Propósito: Validar que la propuesta tiene tracción inicial y claridad de oferta.
 */
module.exports = async (context, deliverable) => {
  const errors = [];
  const { scores, bestAngle } = deliverable;

  // Validación de filtros Hormozi
  if (scores.problem < 6) {
    errors.push('⚠️ El Problema es demasiado débil. Necesitas encontrar un dolor más agudo antes de avanzar.');
  }

  if (scores.businessViability < 5) {
    errors.push('⚠️ La viabilidad del modelo no es clara. Re-evaluar pricing o nicho.');
  }

  // Validación de apalancamiento Naval
  if (!bestAngle) {
    errors.push('⚠️ Falta definir el "Mejor Ángulo" de posicionamiento para la idea.');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
};

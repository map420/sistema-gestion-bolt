/**
 * Hook: Pre-Arquitecto (Filtro de Stack)
 * Propósito: Asegurar consistencia técnica con la fábrica y el producto activo.
 */
module.exports = async (context, deliverable) => {
  const errors = [];
  const { stack } = deliverable;
  const activeProduct = context.activeProduct;

  // Validación de Stack Estándar (ADR-001)
  if (!stack.framework.includes('Next.js')) {
    errors.push('⚠️ ADR-001 Violado: El framework debe ser Next.js para asegurar SEO y velocidad en B2C.');
  }

  // Validación de Base de Datos
  if (!stack.database.includes('Supabase')) {
    errors.push('⚠️ Se requiere Supabase (ADR-005) para Auth + DB gestionada.');
  }

  // Validación de Multi-tenant (Regla Global Levy)
  if (!deliverable.multiTenant) {
    errors.push('⚠️ Falta confirmación de estrategia Multi-tenant (organization_id). Todas las tablas de dominio deben incluirlo.');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
};

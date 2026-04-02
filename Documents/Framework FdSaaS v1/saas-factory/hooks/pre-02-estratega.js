/**
 * Hook: Pre-Estratega de Producto
 * Propósito: Validar que hay brief claro y modelo de negocio con path a $10K MRR antes de definir arquitectura.
 */
module.exports = async (context, deliverable) => {
  const errors = []
  const { targetMarket, mvpScope, revenueModel, mrrTarget } = deliverable

  if (!targetMarket || targetMarket.length < 10) {
    errors.push('⚠️ Target market no definido. Sin usuario claro, el producto no tiene dirección.')
  }

  if (!mvpScope || !mvpScope.includes) {
    errors.push('⚠️ MVP scope incompleto. Definir qué SÍ y qué NO va en v1.')
  }

  if (!revenueModel) {
    errors.push('⚠️ Sin modelo de revenue. ¿Cómo cobra este producto desde el día 1?')
  }

  if (!mrrTarget) {
    errors.push('⚠️ Sin target MRR. Definir: ¿cuántos clientes × precio = $10K MRR?')
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true }
}

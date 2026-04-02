# /validate-scope [C]

Dispara al QA Auditor para verificar que el MVP no tiene scope creep.

## Uso
```
validate-scope
```

## Protocolo

1. [C] Leer `context/active-product.md` → features del MVP
2. [C] Comparar features contra brief original en `products/<product>/brief.md`
3. [C] Identificar cualquier feature que no estaba en el brief inicial
4. [C] Calcular impacto en timeline si se mantienen los extras
5. Reportar: features aprobadas / features cortadas / justificación

## Criterio de corte

Un feature se corta si:
- No aparece en el brief original
- No tiene métrica de éxito definida
- No tiene usuario que lo haya pedido explícitamente
- Agrega más de 3 días de desarrollo al MVP

## Output esperado

```
[C] Scope Validation — <Producto>
✅ En scope: X features
⚠️  Fuera de scope: Y features → CORTAR
Impacto en timeline: +/- N días
```

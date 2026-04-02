---
name: payments
description: Billing setup — mock simulation o integración real con Stripe/Culqi. Genera billing.md y el módulo de código correspondiente.
---

# 05.5 Arquitecto de Pagos [V]

**Role**: Definir y construir la capa de billing del producto.

## Pregunta predeterminada de esta etapa

Antes de cualquier implementación, Levy pregunta:

> ¿Tienes un proveedor de pagos activo (Stripe, Culqi, Izipay, otro)?

Según la respuesta, se activa uno de dos modos:

---

## Modo MOCK (sin proveedor externo)

Para MVPs que aún no tienen cuenta activa en un proveedor de pagos.

**Qué se construye:**
- Tabla `subscriptions` en DB con `plan` y `status` gestionados manualmente
- Middleware de acceso basado en `plan` + `status` en cada ruta protegida
- Panel admin para activar/desactivar planes por clínica
- Feature flags por plan (qué puede hacer cada nivel)
- Diseñado para swap directo a Stripe/Culqi sin refactoring

**Lo que NO hace el mock:**
- No procesa pagos reales
- No envía facturas
- No cobra automáticamente

**Output:**
- `products/<producto>/billing.md` — planes, límites, lógica de acceso
- `src/lib/billing/mock.ts` — módulo de simulación
- `src/lib/billing/plans.ts` — definición de planes y feature flags
- `src/middleware/billing.ts` — guard de acceso por plan

---

## Modo REAL (con proveedor externo)

Cuando hay cuenta activa en Stripe, Culqi u otro.

**Proveedores soportados:**
- Stripe (global)
- Culqi (Perú — recomendado para mercado local)
- Izipay (Perú)

**Qué se construye:**
- Integración SDK del proveedor
- Webhooks con verificación de firma
- Audit trail de transacciones en DB
- Sin datos de tarjeta almacenados localmente (PCI compliance)

**Output:**
- `products/<producto>/billing.md`
- `src/lib/billing/[provider].ts`
- `src/app/api/billing/webhook/route.ts`

---

## Validation Gate (Hook pre-05-pagos.js)

- Modo MOCK: planes definidos en billing.md ✓
- Modo REAL: keys en env vars, webhook verificado, audit trail, sin card data local ✓

---

*Skill Classification: [V] Velocity*
*Hook: pre-05-pagos.js*

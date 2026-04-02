# Billing — DentOS

*Modo: MOCK (simulación sin proveedor externo)*
*Swap a proveedor real: cuando haya cuenta Culqi o Stripe activa*
*Fecha: 2026-04-01*

---

## Decisión

Sin proveedor de pagos activo en MVP.
Se implementa billing simulado: los planes se gestionan manualmente en DB.
El código está diseñado para swap directo a Culqi/Stripe sin refactoring.

---

## Planes

| Plan | Precio | Dentistas | Citas/mes | Trial |
|------|--------|-----------|-----------|-------|
| FREE | $0 | 1 | 30 | — |
| STARTER | $29/mes | 1 | 150 | 30 días |
| PRO | $49/mes | 3 | Ilimitadas | 30 días |

---

## Feature Flags por Plan

| Feature | FREE | STARTER | PRO |
|---------|------|---------|-----|
| Recordatorio 24h | ✅ | ✅ | ✅ |
| Recordatorio 2h | ❌ | ✅ | ✅ |
| Dashboard de métricas | Básico | Completo | Completo |
| Dentistas | 1 | 1 | 3 |
| Pacientes | 20 | Ilimitados | Ilimitados |
| Citas/mes | 30 | 150 | Ilimitadas |
| Historial de recordatorios | 7 días | 30 días | 90 días |
| Exportar datos | ❌ | ❌ | ✅ |
| Soporte prioritario | ❌ | ❌ | ✅ |

---

## Lógica de Acceso (Mock)

El acceso a features se controla via `src/lib/billing/plans.ts`.
El middleware lee `subscription.plan` + `subscription.status` desde DB en cada request.

**Estados de suscripción:**
- `TRIALING` — acceso completo al plan, trial activo
- `ACTIVE` — acceso completo al plan, pago confirmado (manual en mock)
- `PAST_DUE` — acceso degradado a FREE hasta regularizar
- `CANCELED` — acceso solo a FREE
- `UNPAID` — bloqueado, solo pantalla de upgrade

---

## Activación manual (Mock)

En el panel admin (`/admin/clinicas`):
1. Buscar clínica por nombre o email
2. Seleccionar plan: FREE / STARTER / PRO
3. Seleccionar estado: TRIALING / ACTIVE / CANCELED
4. Guardar — el cambio aplica inmediatamente

---

## Swap a Culqi (cuando esté listo)

Reemplazar `src/lib/billing/mock.ts` con `src/lib/billing/culqi.ts`.
Los feature flags en `plans.ts` no cambian.
El schema de DB no cambia — solo se agrega `culqi_customer_id` y `culqi_subscription_id`.

Culqi es el proveedor recomendado para el mercado peruano:
- Acepta tarjetas peruanas (Visa, MC, Amex)
- Yape y Plin en roadmap
- Soporte en español
- Comisión: 3.49% + S/0.50 por transacción

---

*Propietario: Levy — Arquitecto de Pagos*

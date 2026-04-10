# Adaptadores de integraciones externas — Mr Labs

> Este standard define cómo aislar integraciones externas para que nunca bloqueen
> el flujo de desarrollo ni de demo. **Obligatorio en todo proyecto con SaaS app.**
> No aplica a sitios de landing pura (sin backend).
>
> **No editar este archivo por decisiones de un proyecto concreto.**

---

## Problema que resuelve

Cuando una integración externa falla (credenciales mal configuradas, API caída,
red inestable), bloquea el flujo completo aunque la lógica interna esté perfecta.

La capa de adaptadores desacopla ambas cosas:
- La lógica de negocio nunca sabe si está hablando con el servicio real o un mock
- El desarrollo avanza desde el día 1 sin credenciales
- El swap a producción es un cambio de env var, no de código

---

## Patrón

```
src/lib/adapters/
  email/
    index.ts          ← exporta el adaptador activo según env
    resend.ts         ← implementación real (Resend)
    mock.ts           ← implementación local/dev
  payments/
    index.ts
    stripe.ts
    mock.ts
  auth/
    index.ts
    clerk.ts
    mock.ts
  storage/
    index.ts
    supabase.ts
    mock.ts
```

### Regla de selección automática

```ts
// src/lib/adapters/email/index.ts
import { resendAdapter } from './resend'
import { mockAdapter } from './mock'

export const emailAdapter =
  process.env.RESEND_API_KEY ? resendAdapter : mockAdapter
```

La lógica de negocio solo importa de `adapters/email/index.ts`.
**Nunca importa de Resend, Stripe o Clerk directamente.**

---

## Interfaz por tipo de adaptador

### Email

```ts
// src/lib/adapters/email/types.ts
export interface EmailAdapter {
  send(opts: {
    to: string
    subject: string
    html: string
    from?: string
  }): Promise<{ id: string }>
}
```

### Payments

```ts
// src/lib/adapters/payments/types.ts
export interface PaymentsAdapter {
  createCheckoutSession(opts: {
    customerId?: string
    priceId: string
    successUrl: string
    cancelUrl: string
    trialDays?: number
    metadata?: Record<string, string>
  }): Promise<{ url: string; sessionId: string }>

  createPortalSession(opts: {
    customerId: string
    returnUrl: string
  }): Promise<{ url: string }>

  createCustomer(opts: {
    email: string
    name?: string
    metadata?: Record<string, string>
  }): Promise<{ id: string }>
}
```

### Storage (archivos)

```ts
// src/lib/adapters/storage/types.ts
export interface StorageAdapter {
  upload(opts: {
    bucket: string
    key: string
    file: Buffer | Blob
    contentType: string
  }): Promise<{ url: string }>

  delete(opts: { bucket: string; key: string }): Promise<void>
}
```

---

## Mock estándar por tipo

### Email mock

```ts
// src/lib/adapters/email/mock.ts
import type { EmailAdapter } from './types'

export const mockAdapter: EmailAdapter = {
  async send(opts) {
    console.log('[EMAIL MOCK]', opts.to, opts.subject)
    return { id: `mock_${Date.now()}` }
  },
}
```

### Payments mock

```ts
// src/lib/adapters/payments/mock.ts
import type { PaymentsAdapter } from './types'

export const mockAdapter: PaymentsAdapter = {
  async createCheckoutSession({ successUrl }) {
    console.log('[PAYMENTS MOCK] checkout session created')
    // Simula redirect exitoso directamente
    return { url: successUrl + '?mock=1', sessionId: `mock_${Date.now()}` }
  },
  async createPortalSession({ returnUrl }) {
    return { url: returnUrl }
  },
  async createCustomer({ email }) {
    return { id: `mock_cus_${email.split('@')[0]}` }
  },
}
```

---

## Cuándo generar cada adaptador

| Integración presente en brief | Adaptadores a generar |
|-------------------------------|----------------------|
| Email transaccional           | `email/`             |
| Pagos / suscripciones         | `payments/`          |
| Almacenamiento de archivos    | `storage/`           |
| Notificaciones push / SMS     | `notifications/`     |

Si no hay integración de ese tipo, no generar el adaptador.

---

## Fases de uso

| Fase | Adaptador activo | Env var presente |
|------|-----------------|-----------------|
| Desarrollo local | mock | No |
| Demo / staging | mock o real | Opcional |
| Producción | real | Sí (obligatoria) |

---

## Reglas del standard

1. **La lógica de negocio solo importa de `adapters/*/index.ts`** — nunca del SDK directamente
2. **El mock nunca lanza excepciones** — loguea y retorna datos simulados válidos
3. **La interfaz del adaptador es el contrato** — mock y real deben implementar exactamente la misma interfaz TypeScript
4. **Un adaptador real que falla en producción debe lanzar excepción tipada** — nunca retornar undefined silenciosamente
5. **Los adaptadores no tienen lógica de negocio** — solo traducen entre la app y el servicio externo

---

## Checklist antes de pasar a producción

- [ ] Variable de env configurada en Vercel
- [ ] Adaptador real probado con credenciales de prod
- [ ] Webhook configurado (si aplica)
- [ ] Mock eliminado del `.env.local` (dejar la var vacía)

---

*Última actualización: 2026-04-10*
*Aprobado por: Moises*

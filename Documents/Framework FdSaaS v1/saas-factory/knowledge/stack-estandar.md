# Stack Estándar — SaaS Factory [V]

Fuente de verdad del stack por defecto. Usar este documento como referencia antes de tomar cualquier decisión técnica.
Para casos fuera del estándar, consultar `mapa-tecnologico.md`.

---

## Stack Base (Todos los productos MVP)

| Capa | Herramienta | Versión pinada | Por qué |
|------|-------------|----------------|---------|
| **Framework** | Next.js | `^15.x` (App Router) | SSR + SSG + API routes en un solo repo. SEO crítico en B2C. |
| **Base de datos** | Supabase (PostgreSQL) | Managed latest | Auth integrado, RLS nativo, realtime, storage. Sin ops. |
| **Auth** | `@supabase/ssr` | `^0.5.x` | Compatible con keys JWT format (`eyJ...`). **No usar >0.6 hasta validar compatibilidad de keys.** |
| **ORM** | Prisma | `^5.x` | Type-safe, migraciones versionadas. **No usar v7+ sin validar breaking changes del driver adapter.** |
| **Pagos** | Stripe | `^16.x` | Estándar de la industria. Webhooks, suscripciones, checkout. |
| **Deploy** | Vercel | Latest CLI | CI/CD automático desde GitHub. Edge functions. Preview por PR. |
| **Estilos** | Tailwind CSS | `^3.x` | Utilidades. Sin CSS custom salvo variables de diseño. |
| **Componentes** | shadcn/ui | Latest | Primitivos accesibles, 100% customizables, sin dependencia de versión. |
| **State** | Zustand | `^4.x` | Simple, sin boilerplate. Solo para estado global real. |
| **Data fetching** | TanStack Query | `^5.x` | Cache, refetch, loading states. No usar SWR ni fetch manual. |
| **Validación** | Zod | `^3.x` | Schema validation en frontend y backend. Single source of truth. |
| **Email** | Resend | Latest | API simple, templates React, dominio propio. |
| **Analytics** | PostHog | Latest | Self-hostable, feature flags, funnels, session replay. |
| **Errores** | Sentry | Latest | Error tracking con contexto de usuario. Alertas configuradas. |
| **Testing** | Vitest + Playwright | Latest | Unit + E2E. Sin Jest salvo proyectos legados. |
| **Linting** | ESLint + Prettier | Latest | Configuración estándar Next.js + reglas de seguridad. |

### Notas de Compatibilidad Críticas

- **Prisma v7**: Rompe la sintaxis de `datasource` en `schema.prisma` y requiere `prisma.config.ts` + driver adapter. Usar `^5.x` hasta que la fábrica tenga un template validado para v7.
- **`@supabase/ssr` >0.6**: Cambia el formato de API keys esperado. Usar `^0.5.x` con keys JWT clásicas hasta validar.
- **Supabase Connection Pooler**: El pooler (puerto 6543) **no soporta migraciones**. Usar `DIRECT_URL` (puerto 5432) como `directUrl` en Prisma para correr `prisma migrate`. Ver `knowledge/integraciones-credenciales.md`.
- **Vercel Hobby Plan**: Solo permite 1 cron job con frecuencia máxima de 1 ejecución/día (`0 X * * *`). Para crons frecuentes (cada hora, cada minuto) se requiere plan Pro o integración externa (Upstash QStash).

---

## Extensiones por Tipo de Producto

### Producto con IA Generativa
| Capa | Herramienta | Cuándo usar |
|------|-------------|-------------|
| LLM principal | GPT-4o (OpenAI) | Calidad máxima, razonamiento complejo |
| LLM alternativo | Gemini 1.5 Pro | Contexto largo, costo menor |
| Orquestación IA | Vercel AI SDK | Streaming, tool calls, multi-model |
| Embeddings | OpenAI text-embedding-3-small | Búsqueda semántica |
| Vector DB | Supabase pgvector | Sin infra adicional si ya usas Supabase |

### Producto con Comunicación Automatizada
| Capa | Herramienta | Cuándo usar |
|------|-------------|-------------|
| WhatsApp | Meta Cloud API (WhatsApp Business) | Confirmaciones, notificaciones |
| SMS | Twilio | Fallback si WhatsApp no disponible |
| Push notifications | OneSignal | Apps web/PWA |

### Producto con Real-time
| Capa | Herramienta | Cuándo usar |
|------|-------------|-------------|
| Real-time | Supabase Realtime | Eventos de DB en tiempo real |
| WebSockets | Pusher | Colaboración, chat, live updates complejos |

---

## Reglas del Stack

1. **No agregar dependencias sin justificación documentada en `knowledge/decisions.md`**
2. **Una sola herramienta por capa.** Si hay dos, una sobra.
3. **Stripe Checkout en v1, Stripe Connect solo si hay marketplace.**
4. **Sin microservicios en Fase 1.** Un solo repo Next.js hasta $10K MRR.
5. **Sin bases de datos auto-gestionadas.** Supabase managed siempre.
6. **`organization_id` en toda tabla de dominio.** Multi-tenant desde el día 1.
7. **Variables de entorno solo en `.env.local` (dev) y Vercel (prod).** Nunca hardcoded.
8. **Sin `any` en TypeScript.** Zod valida en los bordes, Prisma tipea el interior.

---

## Estructura de Carpetas Estándar

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Rutas de autenticación
│   ├── (dashboard)/        # Rutas protegidas
│   ├── api/                # API Routes
│   └── layout.tsx
├── components/
│   ├── ui/                 # shadcn/ui primitivos
│   └── [feature]/          # Componentes por feature
├── lib/
│   ├── supabase/           # Cliente Supabase
│   ├── stripe/             # Cliente Stripe + webhooks
│   ├── ai/                 # Clientes IA (si aplica)
│   └── validations/        # Schemas Zod
├── hooks/                  # React hooks custom
├── stores/                 # Zustand stores
└── types/                  # Tipos TypeScript globales
prisma/
├── schema.prisma
└── migrations/
```

---

## Costos Base (MVP activo)

| Servicio | Plan | Costo/mes |
|----------|------|-----------|
| Vercel | Hobby → Pro cuando necesites team | $0 → $20 |
| Supabase | Free → Pro cuando pases 500MB | $0 → $25 |
| OpenAI | Pay-per-use | ~$10-50 según volumen |
| Stripe | 2.9% + $0.30 por transacción | Variable |
| Resend | Free (3K emails/mes) | $0 → $20 |
| PostHog | Free (1M eventos/mes) | $0 |
| Sentry | Free (5K errores/mes) | $0 |
| **Total base** | | **~$0-45/mes hasta primeros $1K MRR** |

---

*Última actualización: 2026-04-01*
*Propietario: Levy — Arquitecto de Sistemas*

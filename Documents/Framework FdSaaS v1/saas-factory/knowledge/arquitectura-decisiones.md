# Architecture Decision Records (ADRs) [C] — Fábrica SaaS

## ADR-001: Next.js 14+ con TypeScript
**Status**: Accepted  
**Date**: 2026-04-02  
**Context**: Necesidad de SEO preventivo en B2C, velocidad de despliegue y unificación de Frontend/Backend en un solo repositorio.  
**Decision**: Adoptar Next.js como framework único para toda la fábrica.  
**Consequences**:
- ✓ SEO nativo (Server Components).
- ✓ Desarrollo full-stack en un solo flujo.
- ✗ Curva de aprendizaje del App Router.

---

## ADR-002: Stripe para Gestión de Revenue
**Status**: Accepted  
**Date**: 2026-04-02  
**Context**: Requerimos cumplimiento PCI-DSS Nivel 1 y gestión de suscripciones robusta desde el día 1.  
**Decision**: Delegar toda la lógica de pagos y planes a Stripe.  
**Consequences**:
- ✓ 0 riesgo de seguridad en tarjetas.
- ✗ Comisión del 2.9% + $0.30.

---

## ADR-003: Supabase para Auth, Database y RLS
**Status**: Accepted  
**Date**: 2026-04-02  
**Context**: Velocidad de lanzamiento crítica para validar el norte de los $10K MRR.  
**Decision**: Repositorio de datos en Supabase (PostgreSQL gestionado) usando **Row Level Security (RLS)** para seguridad multi-tenant.  
**Consequences**:
- ✓ Setup de Auth y DB en < 5 minutos.
- ✓ Seguridad granular por usuario/organización nativa.
- ✗ Dependencia parcial del ecosistema Supabase.

---

## ADR-004: Despliegue en Vercel
**Status**: Accepted  
**Date**: 2026-04-02  
**Context**: Infraestructura que escale sin intervención manual del equipo técnico (Moisés + Levy).  
**Decision**: Despliegue automático de ramas y producción en Vercel.  
**Consequences**:
- ✓ CI/CD integrado.
- ✓ Edge runtime para performance global.
- ✗ Costo por ancho de banda si escalamos masivamente (se optimizará después de $10K MRR).

---

## ADR-005: Aislamiento Multi-tenant (Regla Global)
**Status**: Accepted  
**Date**: 2026-04-02  
**Context**: Cada producto debe estar preparado para escala empresarial y aislamiento de datos estricto.  
**Decision**: Todas las tablas de dominio **deben** incluir la columna `organization_id` y su correspondiente filtro RLS.  
**Consequences**:
- ✓ Seguridad de datos innegociable.
- ✓ Escalabilidad horizontal por cliente.

---

## ADR-006: Flujo de Trabajo de la Fábrica v2
**Status**: Accepted
**Date**: 2026-04-01
**Context**: El flujo anterior mezclaba responsabilidades y no tenía gates de aprobación explícitos por paso.
**Decision**: Adoptar flujo de 8 pasos con aprobación de Moisés en cada uno antes de avanzar: Concepto → Refinado → Estrategia → Plano Tech → Diseño WOW → Billing → Construcción → QA+Launch → Cierre.
**Consequences**:
- ✓ Moisés tiene control total en cada gate.
- ✓ Levy no avanza sin aprobación explícita.
- ✓ Pagos tiene su propio gate (paso 05.5) — no se entierra en producción.
- ✓ Cierre de sesión es paso obligatorio — no se pierde contexto.

---

---

## ADR-007: Supabase Pooler vs Direct URL para Prisma
**Status**: Accepted
**Date**: 2026-04-02
**Context**: Prisma necesita dos tipos de conexión en Supabase: una para queries en runtime (serverless-safe) y otra para correr migraciones.
**Decision**: Siempre configurar dos variables:
- `DATABASE_URL` → Transaction Pooler (puerto 6543, `?pgbouncer=true&connection_limit=1`) — para queries en producción
- `DIRECT_URL` → Conexión directa (puerto 5432) — exclusiva para `prisma migrate`

En `schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```
**Consequences**:
- ✓ Queries serverless estables sin connection exhaustion
- ✓ Migraciones funcionan sin errores de pooler
- ✗ Dos variables de entorno a gestionar en cada entorno

---

## ADR-008: Credenciales primero, código después
**Status**: Accepted
**Date**: 2026-04-02
**Context**: En DentOS, las credenciales de WhatsApp, DB password y Vercel env vars se pidieron a mitad de la construcción, causando bloqueos e interrupciones del flujo.
**Decision**: Al inicio de Fase 06 (Construcción), Levy debe identificar todas las integraciones externas del producto y recolectar sus credenciales ANTES de escribir código. Si una credencial no está disponible, se construye en modo mock y se documenta el pending.
**Consequences**:
- ✓ Sin bloqueos mid-session por credenciales faltantes
- ✓ Modo mock como estándar para integraciones sin credenciales
- ✗ Requiere conversación previa antes de empezar a codificar

---

## ADR-009: Versiones pinadas en dependencias críticas
**Status**: Accepted
**Date**: 2026-04-02
**Context**: Instalar `prisma@latest` instaló v7 (breaking changes en datasource syntax y driver adapter). Instalar `@supabase/ssr@latest` instaló versión incompatible con keys JWT clásicas. Ambos rompieron el build sin warning claro.
**Decision**: Las dependencias críticas del stack deben tener versiones pinadas en el template `package.json`. No usar `latest` ni rangos amplios (`^`) sin validación previa.
- Prisma: `^5.x` (no v7 hasta template validado)
- `@supabase/ssr`: `^0.5.x` (validar compatibilidad antes de subir)
**Consequences**:
- ✓ Builds reproducibles entre productos
- ✓ Sin breaking changes inesperados al instalar dependencias
- ✗ Requiere actualización activa del template al validar nuevas versiones

---

## ADR-010: Verificar CI/CD antes de construir
**Status**: Accepted
**Date**: 2026-04-02
**Context**: En DentOS, el auto-deploy de Vercel estaba roto desde el inicio. Cada fix requería un Redeploy manual desde el dashboard, multiplicando el tiempo de cada iteración. Nunca se diagnosticó la causa raíz.
**Decision**: Antes de iniciar Fase 06, hacer un commit de prueba (ej. cambio en README) y confirmar que Vercel auto-deploya en menos de 60 segundos. Si falla, diagnosticar y resolver antes de escribir código de features.
**Consequences**:
- ✓ Pipeline confiable durante toda la construcción
- ✓ Cada commit desplegado automáticamente
- ✗ +5 minutos al inicio de cada producto nuevo

---

*Last updated: 2026-04-02*

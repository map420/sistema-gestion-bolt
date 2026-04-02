# Session Log — Nutricionista [M]

## Sesión: 2026-04-01 — Arranque Nutricionista

**Fecha:** 2026-04-01
**Participantes:** Moisés + Levy
**Fase:** Planning → Brief

---

## Timeline

### 2026-04-01 — Brief Definido
- Producto: Nutricionista
- Modelo: B2C, $15/mes, freemium
- IA: GPT-4o para generación de planes
- Stack: Next.js 14 + Supabase + Stripe + Vercel
- Status: 🟡 PLANNING

---

## Decisiones Tomadas

| ID | Decisión | Razón |
|----|----------|-------|
| ADR-001 | Next.js sobre React + Fastify separado | B2C necesita SEO, velocidad de lanzamiento, un solo repo |
| ADR-002 | GPT-4o sobre modelos más baratos | Calidad del plan nutricional justifica el costo |
| ADR-003 | Web-first, no app nativa | Velocidad de lanzamiento. PWA si se necesita móvil |
| ADR-004 | Freemium (1 plan gratis) | Reduce fricción de adquisición, demuestra valor antes de cobrar |
| ADR-005 | Supabase para auth + DB | PostgreSQL gestionado + auth integrado, velocidad de setup |

---

## Blockers

*Ninguno activo.*

---

## Próximos Pasos

1. [ ] Arquitectura técnica — schema de datos + estructura de carpetas
2. [ ] Diseño UI/UX — onboarding flow + dashboard
3. [ ] Implementación — empezar por auth + onboarding

---

*Archivar a `context/archive/session-nutricionista-2026-04-01.md` al cerrar sprint*

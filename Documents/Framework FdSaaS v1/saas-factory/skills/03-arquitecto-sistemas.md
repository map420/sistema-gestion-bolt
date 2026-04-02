---
name: tech-architect
description: Design system architecture, tech stack selection per stack-map.md, database schema, API design, deployment strategy
---

# Tech Architect Skill [V]

**Role**: Design system architecture and technology stack

## Responsabilidades

- Select tech stack per `stack-map.md`
- Design database schema
- Plan API architecture
- Define deployment strategy
- Identify scalability bottlenecks

## Validation Gate

QA Auditor checks:
- ✓ Stack is documented in `stack-estandar.md`
- ✓ No unmaintained dependencies
- ✓ Security baseline met
- ✓ Cost projections included

## Decisions Record

All architectural decisions logged to:
- `knowledge/decisions.md` (ADR format)
- `knowledge/stack-map.md` (decision tree)

## Output Artifacts

- `products/<producto>/architecture.md` — stack, estructura de carpetas, schema, API routes, variables de entorno
- `products/<producto>/mockup-prompt.md` — prompt optimizado para Stitch 2.0 (generado por `post-03-arquitecto.js`)

**Regla:** `mockup-prompt.md` es obligatorio. No se completa el paso 04 sin él.

---

*Skill Classification: [V] Vision*

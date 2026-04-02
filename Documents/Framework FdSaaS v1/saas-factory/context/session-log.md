# Session Log [M]

## Sesión: 2026-04-02 — MVP completo + Deploy

**Fecha:** 2026-04-02
**Participantes:** Moisés + Levy
**Fase:** Build completo → Deploy Production

---

## Lo que se construyó hoy

| Módulo | Estado |
|--------|--------|
| Prisma schema (Clinica, Dentista, Paciente, Cita) | ✅ |
| Supabase conectado (adapter-pg, tablas creadas) | ✅ |
| Middleware de auth | ✅ |
| Worker WhatsApp (cron + webhook) | ✅ |
| Vercel Cron configurado | ✅ |
| Configuración conectada a DB | ✅ |
| Pacientes con datos reales | ✅ |
| Agenda con datos reales | ✅ |
| Deploy en Vercel | ✅ |

---

## Decisiones Tomadas

| ID | Decisión | Razón |
|----|----------|-------|
| ADR-007 | Prisma v7 con @prisma/adapter-pg | Prisma 7 requiere driver adapter explícito |
| ADR-008 | prisma.config.ts para URL de DB | Prisma 7 cambió configuración — no va en schema.prisma |
| ADR-009 | SQL manual en Supabase para migración inicial | Transaction pooler no soporta DDL |
| ADR-010 | Vercel Cron diario (hobby plan) + Upstash pendiente para frecuencia horaria | Hobby plan limita a 1 cron/día |
| ADR-011 | Deploy desde GitHub import, no CLI | CLI perdía conexión a build logs |

---

## Producción

- **URL:** https://dentos-maps-projects-9abbc52c.vercel.app
- **Repo:** https://github.com/map420/dentos
- **DB:** Supabase — proyecto uvpisoknjpuztvughuod
- **Cron:** 8am diario (Upstash pendiente para horario)

---

## Próximos pasos

1. [ ] Upstash QStash — cron horario real ($0 hasta 500/mes)
2. [ ] Credenciales WhatsApp Meta Cloud API
3. [ ] Dominio custom (dentos.app o similar)
4. [ ] Primera clínica de pago en Ica

---

*Status: 🟢 PRODUCTION*

# Nutricionista — Product Brief

## Visión

**"El nutricionista IA personal para personas con objetivos físicos específicos."**

No eres un contador de calorías. El usuario no rastrea lo que ya comió.
Recibe un plan listo y ejecutable para llegar a su objetivo.

---

## Problema

Las apps de nutrición actuales (MyFitnessPal, Cronometer) son registros pasivos.
El usuario tiene que saber qué comer, luego registrarlo. Requiere conocimiento nutricional previo y disciplina de seguimiento.

**El 80% de usuarios abandona en las primeras 2 semanas por fricción de registro.**

---

## Solución

IA que genera un plan de alimentación personalizado y ejecutable basado en:
- Objetivo del usuario (bajar grasa, ganar músculo, rendimiento deportivo, etc.)
- Datos físicos (peso, altura, edad, sexo)
- Nivel de actividad
- Preferencias y restricciones alimentarias

El usuario responde un onboarding de 5 minutos y recibe su plan semanal listo.

---

## Mercado Objetivo

**Primario:** Personas activas con objetivos físicos definidos (18-40 años)
- Deportistas amateur (gym, running, crossfit)
- Personas en proceso de cambio corporal (pérdida de grasa, ganancia muscular)

**Secundario:** Personas con restricciones alimentarias que necesitan estructura
- Vegetarianos/veganos activos
- Personas con intolerancias que no saben cómo cubrir macros

---

## Modelo de Negocio

| Tier | Precio | Incluye |
|------|--------|---------|
| Free | $0 | 1 plan generado, sin actualizaciones |
| Pro | $15/mes | Planes ilimitados, ajustes por progreso, lista de compras |

**North Star:** $10K MRR = 667 usuarios Pro activos

---

## MVP — Scope Cerrado

### ✅ IN (MVP)
1. **Onboarding** — objetivo, stats corporales, nivel actividad, preferencias/restricciones
2. **Generación de plan semanal con IA** — desayuno, almuerzo, cena, snacks por día
3. **Lista de compras automática** — generada del plan semanal
4. **Check-in semanal** — el usuario reporta progreso, la IA ajusta el plan
5. **Auth + suscripción** — registro, login, Stripe checkout

### ❌ OUT (no MVP)
- Integración con wearables
- Base de datos de recetas con fotos
- Features sociales / comunidad
- Marketplace de nutricionistas humanos
- Escáner de código de barras
- App móvil nativa (web-first)

---

## Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Prisma
- **Base de datos:** Supabase (PostgreSQL)
- **IA:** OpenAI GPT-4o
- **Pagos:** Stripe
- **Auth:** Supabase Auth
- **Deploy:** Vercel

> Next.js sobre React + Fastify separado porque: B2C necesita SEO, velocidad de lanzamiento y un solo repo.

---

## Métricas de Éxito (MVP)

| Métrica | Target |
|---------|--------|
| Usuarios registrados (mes 1) | 200+ |
| Conversión free → pro | ≥ 10% |
| Retención mes 2 | ≥ 50% |
| Churn mensual | < 8% |
| NPS | > 40 |

---

## Decisiones Clave

- **Web-first, no app nativa** — velocidad de lanzamiento. PWA si se necesita móvil.
- **OpenAI GPT-4o** — calidad de plan justifica el costo vs modelos más baratos
- **Freemium** — el primer plan gratis reduce fricción de adquisición y demuestra valor antes de cobrar
- **Lista de compras** — feature de alto valor percibido, bajo costo de implementar

---

*Creado: 2026-04-01*
*Status: PLANNING*
*Next: Arquitectura técnica + schema de datos*

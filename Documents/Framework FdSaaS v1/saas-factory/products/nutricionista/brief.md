# NutriSync — Product Brief

## Propuesta de Valor

**"IA que genera tu plan de alimentación semanal para ganar músculo — en 5 minutos, sin contar calorías."**

---

## Problema

Las apps de nutrición actuales (MyFitnessPal, Cronometer) son registros pasivos.
El usuario tiene que saber qué comer, luego registrarlo. Requiere conocimiento nutricional previo y disciplina de seguimiento.

**El 80% de usuarios abandona en las primeras 2 semanas por fricción de registro.**

El usuario de gym que quiere ganar músculo no necesita una app de registro — necesita que alguien le diga exactamente qué comer.

---

## Usuario Objetivo

**Perfil principal:** Hombre 20-35 años
- Entrena 3-5 días/semana (gym, pesas)
- Objetivo: ganar masa muscular
- Ya invierte en gym, suplementos y ropa deportiva
- No tiene estructura de alimentación — sabe que debería comer más proteína pero no sabe cómo armar su semana

**Por qué este usuario:** Mayor disposición a pagar, resultado medible en 8-12 semanas, dolor concreto y frecuente.

---

## Solución

IA que genera un plan de alimentación semanal personalizado y ejecutable basado en:
- Objetivo (ganar músculo, recomposición corporal)
- Datos físicos (peso, altura, edad)
- Nivel de actividad y días de entrenamiento
- Preferencias y restricciones alimentarias

El usuario responde un onboarding de 5 minutos y recibe su plan semanal listo con lista de compras incluida.

---

## Modelo de Negocio

### MVP — Sin plataforma de pagos integrada

El MVP valida retención y valor percibido antes de automatizar cobros.
El cobro en el MVP es **manual** — el usuario interesado contacta directamente y paga por transferencia, Yape, PayPal o el método disponible.

| Tier | Precio | Incluye |
|---|---|---|
| Free | $0 | 1 plan de 3 días — lead magnet, no plan completo |
| Pro | $29/mes | Planes ilimitados, lista de compras semanal |

**Integración de pagos (Stripe) se agrega post-MVP**, cuando haya al menos 20 usuarios Pro activos que demuestren retención.

**North Star:** $10K MRR = 345 usuarios Pro × $29/mes

---

## MVP — Scope Cerrado

### ✅ IN (MVP)
1. **Onboarding** — objetivo, stats corporales, nivel de actividad, preferencias/restricciones
2. **Generación de plan semanal con IA** — desayuno, almuerzo, cena, snacks por día
3. **Lista de compras automática** — generada del plan semanal
4. **Auth** — registro y login (Supabase)
5. **Control de acceso manual** — campo `isPro` en DB, activado manualmente por Moisés para usuarios que pagaron

### ❌ OUT (MVP)
- Stripe / integración de pagos automática
- Check-in semanal y ajuste por progreso
- Base de datos de recetas con fotos
- Integración con wearables
- App móvil nativa (web-first)
- Features sociales / comunidad

---

## Stack

- **Framework:** Next.js 15 + TypeScript
- **Base de datos:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **ORM:** Prisma 5.x
- **IA:** OpenAI GPT-4o
- **Estilos:** Tailwind CSS 3.x
- **Deploy:** Vercel
- **Pagos (post-MVP):** Stripe

---

## Métricas de Éxito (MVP)

| Métrica | Target |
|---|---|
| Usuarios registrados (mes 1) | 100+ |
| Usuarios que generan ≥ 2 planes | ≥ 40% |
| Conversión free → Pro (manual) | ≥ 10% |
| Retención semana 4 | ≥ 50% |

**Señal de que el MVP funcionó:** 20 usuarios Pro activos que renovaron el segundo mes.
Con esa señal, se integra Stripe y se escala adquisición.

---

## Riesgos a Monitorear

1. **Calidad del plan generado** — si el plan es genérico, el usuario no renueva. El prompt de IA es el moat real.
2. **Retención temprana** — el valor se percibe en 4-6 semanas. El churn en semana 1-2 indica que el plan no convenció.
3. **Competencia de ChatGPT** — el usuario puede pedirle un plan gratis. El diferenciador es la experiencia UX, no solo el output.

---

## Decisiones Clave

- **Sin Stripe en MVP** — primero validar retención, luego automatizar cobros. Reduce setup time en ~30%.
- **Web-first, no app nativa** — velocidad de lanzamiento. PWA si se necesita móvil.
- **OpenAI GPT-4o** — calidad del plan justifica el costo vs modelos más baratos.
- **Free = 3 días, no 7** — plan semanal completo gratis reduce el incentivo de pagar.
- **`isPro` manual** — control total en etapa de validación, sin depender de webhooks de pago.

---

*Creado: 2026-04-01*
*Actualizado: 2026-04-02*
*Status: BRIEF APROBADO — listo para Plano Técnico*

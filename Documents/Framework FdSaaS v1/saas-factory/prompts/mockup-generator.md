# Prompt Template: Mockup Generator para Stitch 2.0 [V]

**Uso**: Generar el prompt optimizado para Stitch 2.0 a partir del `architecture.md` del producto activo.
**Se activa**: Automáticamente después de generar `architecture.md` (Hook `post-03-arquitecto.js`)
**Output**: `products/<producto>/mockup-prompt.md`

---

## Paso 1 — Hacer las 3 preguntas de referencia

Antes de generar el prompt, Levy hace estas 3 preguntas a Moisés.
Las respuestas se insertan en el template para orientar la creatividad de Stitch 2.0.

### Las 3 preguntas

**P1. Estilo visual**
¿Cómo describes el look que quieres para este producto?
- A) Minimalista y frío (Vercel, Linear)
- B) Profesional y cálido (Notion, Intercom)
- C) Moderno y oscuro (dark mode, dashboard técnico)
- D) Otro — una palabra

**P2. Referencia de app**
¿Hay alguna app que uses o hayas visto cuyo diseño te guste como punto de partida?
(No tiene que ser del mismo nicho — cualquier SaaS vale)

**P3. Sensación del usuario**
Cuando el usuario abre el app por primera vez, ¿qué quieres que sienta?
- A) "Esto es serio y confiable"
- B) "Esto es simple, lo entiendo de inmediato"
- C) "Esto se ve moderno, mejor que lo que usaba"
- D) Otra

---

## Paso 2 — Generar el prompt con las respuestas

Con las 3 respuestas + el `architecture.md` del producto + `brief.md`, Levy genera el siguiente prompt.

**Filosofía del prompt:**
- Describir el FUNCIONAMIENTO y los COMPONENTES, no el visual
- Describir cómo se integran las pantallas entre sí (flujo UX)
- Dar libertad creativa al estilo — solo anclar con las 3 referencias
- No dictar colores, tipografías ni layouts específicos

---

## Template del Prompt (para Stitch 2.0)

```
Design a web app mockup in Spanish for [PRODUCT_NAME].

## What this app does
[PRODUCT_DESCRIPTION]
Target user: [TARGET_USER]

## Design direction
Style: [P1_ESTILO]
Reference app: [P2_REFERENCIA]
First impression: [P3_SENSACION]

Use these as creative direction — interpret freely. Prioritize clarity and usability over decoration.

## How the app works (UX flow)

The user goes through this journey:

1. **Register / Login**
   Entry point. User creates an account or logs in.
   Leads to: Onboarding (first time) or Dashboard (returning user).

2. **Onboarding (3 steps)**
   One-time setup flow. User configures the account before using the app.
   [ONBOARDING_STEPS]
   Each step must show progress. After step 3, goes to Dashboard.

3. **Dashboard**
   Main screen. Shows the user the current state of their business at a glance.
   Key information to display: [DASHBOARD_METRICS]
   Primary action from here: access Agenda or add new appointment.

4. **Agenda**
   Core feature screen. Lists all appointments with their current status.
   User can: filter by date, search, see WhatsApp reminder status per appointment, add new appointment.
   Appointment statuses: [APPOINTMENT_STATUSES]

5. **New Appointment**
   Form to create a new appointment.
   Required fields: [APPOINTMENT_FIELDS]
   After saving: returns to Agenda with the new appointment visible.

6. **Patients**
   List of all registered patients.
   User can: search, view appointment history per patient.

7. **Settings**
   Clinic configuration: name, WhatsApp number connection status, active dentists, billing plan.

## Component integration

- Sidebar (persistent on all dashboard screens): Navigation between Dashboard, Agenda, Patients, Settings
- Appointment card/row: reused in Dashboard (today's view) and Agenda (full list)
- Status badge: consistent across all screens — same colors/labels for each state
- WhatsApp indicator: visible on each appointment showing if reminder was sent/delivered/read
- Plan badge: visible in sidebar — shows current plan and upgrade option

## Core interaction to highlight
The most important moment in the app:
A dentist opens the dashboard in the morning and sees at a glance:
- How many appointments are confirmed for today
- How many no-shows were avoided this week
- How much revenue was recovered

This is the "aha moment" — make it feel rewarding and clear.

## Language
[APP_LANGUAGE]. Use realistic dummy data in the same language.

## Output
- All 7 screens
- Desktop-first (1280px)
- Consistent components across all screens
- Show the app as a coherent product, not isolated screens
```

---

## Variables a reemplazar

| Variable | Fuente |
|----------|--------|
| `[PRODUCT_NAME]` | `brief.md` — nombre |
| `[PRODUCT_DESCRIPTION]` | `brief.md` — tagline + problema |
| `[TARGET_USER]` | `brief.md` — usuario objetivo |
| `[P1_ESTILO]` | Respuesta de Moisés |
| `[P2_REFERENCIA]` | Respuesta de Moisés |
| `[P3_SENSACION]` | Respuesta de Moisés |
| `[ONBOARDING_STEPS]` | `architecture.md` — features MVP onboarding |
| `[DASHBOARD_METRICS]` | `architecture.md` — dashboard features |
| `[APPOINTMENT_STATUSES]` | `architecture.md` — enum EstadoCita |
| `[APPOINTMENT_FIELDS]` | `architecture.md` — modelo Cita |
| `[APP_LANGUAGE]` | `brief.md` — mercado objetivo |

---

*Skill responsable: `03-arquitecto-sistemas.md`*
*Hook: `post-03-arquitecto.js`*
*Última actualización: 2026-04-01*

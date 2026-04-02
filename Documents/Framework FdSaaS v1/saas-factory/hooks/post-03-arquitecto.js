/**
 * Hook: Post-Arquitecto
 * Propósito: Después de generar architecture.md, ejecutar automáticamente:
 *   1. Generar mockup-prompt.md (prompt optimizado para Stitch 2.0)
 *   2. Crear diseno.md con estructura base lista para recibir el output de Stitch 2.0
 *
 * Flujo completo:
 *   architecture.md generado
 *       → mockup-prompt.md (Moisés pega en Stitch 2.0)
 *       → diseno.md creado vacío (Moisés pega resultado de Stitch aquí)
 *       → diseno.md actualizado → pre-04-validador.js se activa
 */
module.exports = async (context, deliverable) => {
  const {
    productName,
    tagline,
    targetMarket,
    visualStyle,
    schema,
    features,
    designAnswers, // { p1_estilo, p2_referencia, p3_sensacion }
    language = 'Spanish'
  } = deliverable

  const dbTables = schema?.models?.map(m => m.name).join(', ') || 'Ver architecture.md'
  const metricCards = features?.dashboardMetrics || [
    'Confirmations today',
    'No-shows avoided this week',
    'Estimated revenue recovered',
    'Appointments pending confirmation'
  ]
  const metricCardsFormatted = metricCards.map(m => `  - ${m}`).join('\n')
  const onboardingSteps = features?.onboardingSteps || [
    'Step 1: Basic info setup',
    'Step 2: Integration/connection setup',
    'Step 3: First record creation'
  ]
  const appointmentStatuses = schema?.enums?.EstadoCita || [
    'Pending', 'Reminder sent', 'Confirmed', 'Canceled', 'Completed', 'No-show'
  ]
  const appointmentFields = schema?.models?.find(m => m.name === 'Cita')?.fields || [
    'Patient', 'Dentist', 'Date', 'Time', 'Reason (optional)'
  ]

  const today = new Date().toISOString().split('T')[0]

  // ─────────────────────────────────────────
  // OUTPUT 1: mockup-prompt.md
  // ─────────────────────────────────────────
  const mockupPrompt = `# Mockup Prompt — ${productName}

*Generado automáticamente por post-03-arquitecto.js*
*Herramienta destino: Stitch 2.0*
*Fecha: ${today}*

---

## Referencias de diseño

| Pregunta | Respuesta |
|----------|-----------|
| Estilo visual | ${designAnswers?.p1_estilo || 'No definido'} |
| App de referencia | ${designAnswers?.p2_referencia || 'No definido'} |
| Sensación del usuario | ${designAnswers?.p3_sensacion || 'No definido'} |

---

## Instrucciones

1. Copia el prompt de abajo
2. Pégalo en Stitch 2.0
3. Cuando Stitch genere el resultado, copia el output completo
4. Pégalo en \`products/${productName.toLowerCase()}/diseno.md\`
5. Levy valida automáticamente el diseño con el Validador de Interfaz

---

## Prompt para Stitch 2.0

\`\`\`
Design a web app mockup in ${language} for ${productName}.

## What this app does
${tagline}
Target user: ${targetMarket}

## Design direction
Style: ${designAnswers?.p1_estilo || 'Minimalist'}
Reference app: ${designAnswers?.p2_referencia || 'N/A'}
First impression: ${designAnswers?.p3_sensacion || 'Modern and trustworthy'}

Use these as creative direction — interpret freely. Prioritize clarity and confidence over decoration.

## How the app works (UX flow)

1. **Register / Login**
   Entry point. User creates account or logs in.
   Leads to: Onboarding (first time) or Dashboard (returning user).

2. **Onboarding (${onboardingSteps.length} steps)**
   One-time setup before accessing the app.
${onboardingSteps.map((s, i) => `   - Step ${i + 1}: ${s}`).join('\n')}
   Progress indicator visible across all steps. After last step: enters Dashboard.

3. **Dashboard**
   Main screen. Shows current state of the business at a glance.
   Key metrics:
${metricCardsFormatted}
   Primary actions: navigate to core feature screen or add new record.

4. **Core Feature Screen**
   Main working screen. Full list with filters (Today / This week / All), search,
   status per record, and integration status indicator.
   Record statuses: ${appointmentStatuses.join(', ')}

5. **New Record Form**
   Fields: ${appointmentFields.join(', ')}
   After saving: returns to core feature screen.

6. **Secondary Entity List**
   Directory of related entities (patients, contacts, etc.)
   Shows key info + history per item.

7. **Settings**
   Account configuration: profile data, integration connection status,
   team/staff list, billing plan and usage.

## Component integration

- Sidebar (persistent across all dashboard screens):
  Navigation between main sections. Shows billing plan + upgrade prompt at bottom.

- Record row/card:
  Reused in Dashboard (snapshot view) and core feature screen (full list).
  Same component, same status indicators everywhere.

- Status badge:
  One consistent visual system for record states across all screens.

- Integration status indicator:
  Visible on every record — shows if automated action was sent/delivered/read.
  This is a key differentiating UI element.

- Primary metric:
  The most important number in the app. Should feel rewarding every time the user sees it.
  This is what justifies the subscription renewal.

## The "aha moment" to highlight
User opens the app and in under 5 seconds sees the impact of the product:
how many problems were prevented and how much value was recovered.
Design this moment to feel satisfying and undeniable.

## Language
${language}. Use realistic dummy data in the same language and local context.

## Output
- All 7 screens
- Desktop-first (1280px)
- Consistent components and visual language across all screens
- Present as a coherent product, not isolated screens
\`\`\`
`

  // ─────────────────────────────────────────
  // OUTPUT 2: diseno.md (estructura base lista para recibir el output de Stitch)
  // ─────────────────────────────────────────
  const disenoBase = `# Diseño — ${productName}

*Este archivo recibe el output de Stitch 2.0.*
*Una vez actualizado con el resultado, el Validador de Interfaz (04) se activa automáticamente.*

**Status: ⏳ ESPERANDO OUTPUT DE STITCH 2.0**

---

## Instrucciones

1. Genera los mockups en Stitch 2.0 usando \`mockup-prompt.md\`
2. Copia el output completo de Stitch 2.0
3. Reemplaza todo el contenido de este archivo con ese output
4. Levy ejecuta la validación automáticamente al detectar el cambio

---

## Referencia de diseño aprobada

| Pregunta | Respuesta |
|----------|-----------|
| Estilo visual | ${designAnswers?.p1_estilo || 'No definido'} |
| App de referencia | ${designAnswers?.p2_referencia || 'No definido'} |
| Sensación del usuario | ${designAnswers?.p3_sensacion || 'No definido'} |

---

## Output de Stitch 2.0

<!-- PEGAR AQUÍ EL RESULTADO COMPLETO DE STITCH 2.0 -->

`

  return {
    valid: true,
    outputs: [
      {
        filename: 'mockup-prompt.md',
        content: mockupPrompt
      },
      {
        filename: 'diseno.md',
        content: disenoBase
      }
    ],
    nextStep: 'Moisés pega el resultado de Stitch 2.0 en diseno.md → pre-04-validador.js se activa'
  }
}

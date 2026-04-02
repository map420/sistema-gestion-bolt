# Mockup Prompt — NutriSync

*Herramienta destino: Stitch 2.0*
*Fecha: 2026-04-02*

---

## Instrucciones

1. Copia el prompt de abajo
2. Pégalo en Stitch 2.0
3. Cuando Stitch genere el resultado, copia el output completo
4. Pégalo en `products/nutricionista/diseno.md`
5. Levy valida el diseño automáticamente

---

## Identidad Visual Definida

| Decisión | Valor |
|---|---|
| Modo | Dark — fondo #0A0A0A, superficies #111111 y #1A1A1A |
| Acento principal | #22C55E (verde energía — progreso, vida, rendimiento) |
| Acento secundario | #3B82F6 (azul datos — macros, métricas informativas) |
| Tipografía headings | Outfit — bold, geométrica, moderna |
| Tipografía body | Inter — legible, neutra, profesional |
| Bordes | #2A2A2A — sutiles, no intrusivos |
| Radio | 12px — suave pero no infantil |
| Grid | 8px base — espaciado consistente |
| Sensación | Premium. Un atleta con acceso a datos de élite. |

---

## Prompt para Stitch 2.0

```
Design a dark mode web app called NutriSync in Spanish.

## What this app does
NutriSync generates personalized weekly meal plans for people who train at the gym and want to gain muscle. It uses AI to create a full 7-day plan with a shopping list, tracks weekly progress, and adjusts the plan each week based on a quick check-in.

Target user: Man, 20-35 years old, trains 3-5 days/week, focused on gaining muscle.

## Visual Identity
- Background: #0A0A0A (OLED black)
- Surfaces: #111111 (cards), #1A1A1A (secondary surfaces)
- Borders: #2A2A2A
- Primary accent: #22C55E (energy green — used for progress, CTAs, key values)
- Secondary accent: #3B82F6 (data blue — used for macros, informational metrics)
- Error/alert: #EF4444
- Text primary: #F5F5F5
- Text muted: #A3A3A3
- Fonts: Outfit (headings, bold) + Inter (body, regular)
- Border radius: 12px on cards, 8px on inputs and buttons
- Spacing: 8px grid system — generous whitespace
- Feel: Premium performance dashboard. Like athlete analytics software. Dense in meaning, not in clutter.

## UX Flow — 7 Screens

### Screen 1: Login / Register
- Centered card on dark background
- NutriSync logo in green (#22C55E) at top
- Tagline below: "Tu plan de alimentación para ganar músculo"
- Two tabs: "Entrar" / "Crear cuenta"
- Email + password fields with subtle green focus border
- Primary CTA: "Crear cuenta gratis" — solid green button, full width
- No decorative images. Typography and spacing carry the premium feel.

### Screen 2: Onboarding — Step 3 of 6
- Progress bar at top (green fill, 50%)
- Step counter: "Paso 3 de 6" in muted text
- Large centered question: "¿Cuántos días por semana entrenás?"
- Large number input with unit (días) — the answer is the hero of the screen
- "Continuar →" button — full width, green
- Back link in muted text
- Nothing else. One question, full focus.

### Screen 3: Generating Plan (Loading state)
- Centered, minimal
- Animated green progress ring or subtle pulsing indicator
- Headline: "Construyendo tu plan"
- Dynamic status messages cycling through:
  - "Calculando tus calorías y macros..."
  - "Estructurando tus 7 días..."
  - "Generando tu lista de compras..."
- Muted note: "Esto toma unos segundos"
- This screen should feel like something valuable is being built, not just loading.

### Screen 4: Dashboard (Home)
- Top: greeting "Hola, Marcos" + subtitle "Semana 3 de tu plan"
- Progress card (prominent, top of page):
  - Weight progress bar: "72kg → 82kg objetivo" with green fill at ~25%
  - "~28 semanas estimadas" in muted text
  - Last week adherence: star rating (4/5 stars in green)
- Current plan card:
  - Week label + date range
  - Two stats side by side: "2,800 kcal/día" and "195g proteína"
  - CTA: "Ver mi plan →" — green outline button
- Check-in banner (if Monday):
  - Subtle green-bordered card
  - "Es lunes — tiempo de tu check-in semanal"
  - CTA: "Hacer check-in →"
- Bottom nav or sidebar with: Inicio / Mi Plan / Check-in

### Screen 5: Weekly Plan
- Header: macro summary row — 4 cards: Calorías / Proteína / Carbos / Grasas
  - Each card: large number in white, unit in muted, label in muted
  - Proteína card has green accent border (it's the hero metric)
- Day selector: horizontal pill tabs (Lun Mar Mié Jue Vie Sáb Dom)
  - Active day: green background, white text
  - Inactive: dark surface, muted text
- Below: 4 meal cards stacked (Desayuno / Almuerzo / Cena / Snack)
  - Each card: meal label (muted, uppercase, small) / meal name (white, medium) / kcal + protein (right-aligned, green for protein)
  - Tap to expand: shows ingredient list with green bullet dots
- Floating button at bottom: "Ver lista de compras"

### Screen 6: Shopping List
- Header: "Lista de compras" + "Copiar lista" action (green text link, top right)
- Grouped by category with muted uppercase labels:
  - Proteínas / Carbohidratos / Vegetales / Lácteos / Otros
- Each item: empty square checkbox (green when tapped) + item name + quantity
- Realistic dummy items (e.g., "Pechuga de pollo — 1kg", "Avena — 560g")
- Clean, list-like, functional. Feels like a premium grocery tool.

### Screen 7: Weekly Check-in
- Header: "Check-in semanal" + "3 preguntas rápidas"
- Question 1: "¿Qué tan bien seguiste el plan?"
  - 5 square buttons labeled 1-5, horizontally arranged
  - Active (4): green background
- Question 2: "¿Cómo estuvo tu energía?"
  - Same 5-button layout
- Question 3: "¿Cuánto pesás hoy?"
  - Large number input + "kg" unit inline
  - Subtle: "Tu próximo plan se ajustará con esta info"
- Optional notes textarea: minimal, placeholder "Algo que quieras contarme sobre tu semana..."
- Primary CTA: "Guardar y generar mi próximo plan →" — full width, solid green
- This screen should feel like talking to a coach, not filling a form.

## Component System
- All cards: background #111111, border 1px #2A2A2A, radius 12px
- All inputs: background #111111, border #2A2A2A, focus border #22C55E
- Primary buttons: background #22C55E, text #0A0A0A, font-weight 600
- Secondary buttons: border #2A2A2A, text #A3A3A3, hover border #F5F5F5
- Green accent buttons: border #22C55E, text #22C55E, hover bg #22C55E/10
- Metric values: Outfit Bold, large (28-36px)
- Labels: Inter, 11px, uppercase, letter-spacing 0.1em, color #A3A3A3
- Body text: Inter, 14px, color #F5F5F5

## Output Requirements
- All 7 screens
- Desktop first (1280px wide)
- Consistent component library across all screens
- Realistic Spanish dummy data throughout (user name: Marcos, weight: 72kg → 82kg goal, week 3)
- Present as a coherent product with unified visual system
- The green accent should feel earned — used for what matters most, not everywhere
```

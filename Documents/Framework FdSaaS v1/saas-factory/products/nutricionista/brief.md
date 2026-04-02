# NutriSync — Product Brief

```
Nombre:  NutriSync
Tagline: Tu plan de alimentación semanal para ganar músculo — generado por IA en 5 minutos.
Estado:  BRIEF APROBADO — listo para Plano Técnico
```

---

## 2. Problema y Usuario

### Problema

Las apps de nutrición actuales (MyFitnessPal, Cronometer) son registros pasivos.
El usuario tiene que saber qué comer, luego registrarlo — requiere conocimiento nutricional previo y disciplina de seguimiento constante.

**El 80% de usuarios abandona en las primeras 2 semanas por fricción de registro.**

El usuario de gym que quiere ganar músculo no necesita una app de registro. Necesita que alguien le diga exactamente qué comer esta semana.

Es un painkiller: sin estructura de alimentación, el entrenamiento produce resultados 40-60% menores de lo posible. El usuario ya lo sabe — por eso busca solución.

### Usuario Objetivo

**Perfil:** Hombre 20-35 años
- Entrena 3-5 días/semana (gym, pesas)
- Objetivo: ganar masa muscular
- Ya invierte en gym ($30-80/mes), suplementos ($40-100/mes) y ropa deportiva
- Sabe que debe comer más proteína pero no sabe cómo estructurar su semana
- Intenta seguir consejos de YouTube o Instagram pero no tiene un plan ejecutable

**Qué usa hoy:** Nada estructurado, o pide un plan a ChatGPT una vez y no lo actualiza.
**Por qué cambiaría:** NutriSync le da un plan nuevo cada semana, ajustado a su progreso real.

---

## 3. Solución y Aha Moment

### Flujo del usuario

```
Registro (email + contraseña)
  ↓
Onboarding — 5 preguntas
  [peso, altura, objetivo, días de entrenamiento, restricciones alimentarias]
  ↓
Plan semanal generado por IA
  [7 días × 4 comidas: desayuno, almuerzo, cena, snack]
  ↓
★ AHA MOMENT — el usuario ve su plan completo, personalizado, listo para ejecutar
  ↓
Lista de compras automática
  [generada del plan, agrupada por categoría de supermercado]
  ↓
Dashboard de progreso
  [peso actual vs objetivo, semanas estimadas, calorías y proteína del plan]
  ↓
Check-in semanal (lunes)
  [3 preguntas: ¿cumpliste el plan? ¿cómo te sentiste? ¿cambió tu peso?]
  ↓
Nuevo plan ajustado para la semana siguiente
```

### Aha Moment

El usuario ve por primera vez un plan de 7 días completo con sus preferencias aplicadas, con calorías y macros calculados, y la lista de compras lista para copiar al supermercado.

Ocurre en la primera sesión, antes de los 5 minutos. Es el momento donde entiende que esto es diferente a pedirle un plan a ChatGPT.

---

## 4. MVP Scope

### Las tres capas

**Capa 1 — Valor core**
Generación de plan semanal personalizado por IA con lista de compras automática.
El usuario entra sin saber qué comer y sale con un plan ejecutable para 7 días.

**Capa 2 — Retención**
Check-in semanal + nuevo plan ajustado cada semana.
El usuario tiene una razón concreta para volver cada lunes. Sin esto es un one-shot — genera el plan una vez y cancela.

**Capa 3 — Diferenciación percibida**
Dashboard de progreso (peso actual vs objetivo, semanas estimadas) + personalización real (el plan cambia según el check-in).
ChatGPT da un plan genérico que no se actualiza. NutriSync da un plan que aprende del usuario semana a semana.

### Features IN

| Feature | Capa | Por qué está en el MVP |
|---|---|---|
| Onboarding (5 preguntas) | 1 | Sin datos del usuario no hay personalización |
| Generación de plan semanal con IA | 1 | Es el producto — la promesa central |
| Lista de compras automática | 1 | Alto valor percibido, bajo costo de implementar |
| Dashboard de progreso | 3 | Hace visible el avance hacia el objetivo — justifica el precio |
| Check-in semanal (3 preguntas) | 2 | Crea el hábito semanal y alimenta el ajuste del plan |
| Nuevo plan ajustado por check-in | 2 | La razón de renovar el mes siguiente |
| Auth (registro + login) | — | Infraestructura base |
| Control de acceso `isPro` manual | — | Cobro manual en MVP, sin Stripe |

### Features OUT

| Feature | Por qué no en MVP |
|---|---|
| Integración Stripe / pagos automáticos | Se agrega post-MVP cuando hay retención comprobada |
| Recetas con fotos y pasos | Alto costo de producción, bajo impacto en retención temprana |
| Integración con wearables | Complejidad innecesaria en fase de validación |
| App móvil nativa | Web-first. PWA si se necesita móvil antes del producto/market fit |
| Features sociales / comunidad | Distracción del valor core en MVP |
| Escáner de código de barras | Fuera del flujo principal — el usuario no registra, recibe |
| Múltiples objetivos (bajar grasa, rendimiento) | Foco en ganar músculo en v1. Expansión post-PMF |

---

## 5. Modelo de Negocio

| Tier | Precio | Qué incluye |
|---|---|---|
| Free | $0 | 1 plan de 3 días — suficiente para demostrar el valor, insuficiente para satisfacerlo |
| Pro | $29/mes | Planes semanales ilimitados, lista de compras, check-in semanal, dashboard de progreso |

**Camino a $10K MRR:**
$29/mes × 345 usuarios Pro = $10,005 MRR

**Canal de adquisición para los primeros 10 usuarios:**
Contenido orgánico en Instagram/TikTok dirigido a gym (antes/después de plan, tips de nutrición para ganar músculo). El plan de 3 días gratuito actúa como lead magnet.

**Cobro en MVP:**
Manual — transferencia, Yape o PayPal. El campo `isPro` en DB se activa manualmente por Moisés para cada usuario que pague.
Stripe se integra cuando haya ≥ 20 usuarios Pro con retención de mes 2 comprobada.

---

## 6. Stack

| Capa | Herramienta | Versión |
|---|---|---|
| Framework | Next.js | 15.x |
| Auth + DB | Supabase | latest |
| ORM | Prisma | 5.x |
| IA | OpenAI GPT-4o | latest |
| Estilos | Tailwind CSS | 3.x |
| Deploy | Vercel | latest |
| Pagos (post-MVP) | Stripe | — |

---

## 7. Métricas de Éxito del MVP

| Métrica | Target | Qué indica |
|---|---|---|
| Usuarios registrados (mes 1) | 100+ | Hay demanda y el canal funciona |
| Usuarios que completan onboarding | ≥ 80% | El onboarding no tiene fricción |
| Usuarios que generan ≥ 2 planes | ≥ 50% | El check-in semanal está funcionando |
| Conversión free → Pro (manual) | ≥ 10% | El valor percibido justifica el precio |
| Retención semana 4 | ≥ 50% | El producto crea hábito |

**Señal de MVP exitoso:** 20 usuarios Pro activos que renovaron el segundo mes.
Con esa señal → integrar Stripe y escalar adquisición.

---

## 8. Riesgos

1. **Calidad del plan generado** — si el plan es genérico o irreal, el usuario no vuelve. Señal: tasa de completado del plan < 30% en semana 1.
2. **Churn antes de ver resultados** — el usuario espera resultados en 2-3 semanas, los resultados reales llegan en 6-8. Señal: cancelaciones masivas en semana 3-4.
3. **Competencia de ChatGPT** — el usuario prueba NutriSync, ve que el output es similar a lo que obtiene gratis, cancela. Señal: conversión free → Pro < 5%.

---

## 9. Decisiones Clave

| Decisión | Por qué |
|---|---|
| Foco en ganar músculo, no en bajar grasa | Mayor disposición a pagar, resultado medible en 8-12 semanas, segmento con gasto demostrado |
| $29/mes en vez de $15 | El usuario ya paga $40-100/mes en suplementos. $29 es low-ticket para el contexto. Precio bajo = percepción de baja calidad |
| Check-in semanal en MVP | Es la capa de retención. Sin ella el MVP es un one-shot sin modelo de negocio |
| Plan de 3 días gratis, no 7 | Plan semanal completo gratis elimina el incentivo de pagar |
| Sin Stripe en MVP | Reduce setup en ~30% y permite validar retención antes de automatizar cobros |
| Web-first | Velocidad de lanzamiento. PWA si se necesita antes del PMF |
| OpenAI GPT-4o | La calidad del plan es el moat. Modelos más baratos producen planes más genéricos |

---

*Creado: 2026-04-01*
*Actualizado: 2026-04-02*

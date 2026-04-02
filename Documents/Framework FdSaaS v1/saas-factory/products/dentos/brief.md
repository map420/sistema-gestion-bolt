# DentOS — Product Brief v2

*Reformateado desde cero: 2026-04-01*

---

## Product Overview

| Field | Value |
|-------|-------|
| Name | DentOS |
| Tagline | El sistema que elimina los no-shows en tu clínica dental |
| Vision | Ser la herramienta que toda clínica dental independiente en Perú usa para no perder citas — y luego expandir a LATAM |
| Target Market | B2B — Clínicas dentales independientes de 1-3 dentistas en Perú (inicio: Ica) |
| Modelo | SaaS mensual — sin setup fee |
| MRR Target | $10K MRR = ~100 clínicas activas |
| Timeline | MVP en 4 semanas |
| Team Size | 1 (Moisés + Levy) |

---

## El Problema

Las clínicas dentales independientes en Perú pierden entre **10-30% de sus citas** por no-shows y cancelaciones de último minuto.

Una clínica de 1-2 dentistas agenda ~150-200 citas por mes. Si el 15% no se presenta:
- **30 citas perdidas × $40 USD promedio = $1,200 USD/mes que se evaporan**
- La silla queda vacía. El dentista espera. No hay forma de recuperar ese tiempo.

**Causa raíz:** el paciente simplemente lo olvida. No es mala voluntad — es falta de recordatorio en el momento correcto.

**¿Por qué no lo resuelven hoy?**
- Llaman a mano → consume 30-60 min/día del personal
- WhatsApp manual → inconsistente, se olvida, no hay seguimiento
- Software completo (Doctocliq, Dentalink) → caro, complejo, la clínica no lo adopta

---

## El Ángulo

DentOS no es un sistema de gestión dental. Es **la capa de confirmación inteligente** que se conecta a lo que ya usan y elimina los no-shows automáticamente.

**No compite con Doctocliq. Lo complementa — o lo reemplaza solo en lo que importa.**

Propuesta de valor en una oración:
> "Conectas tu agenda en 10 minutos. DentOS confirma cada cita por WhatsApp y reagenda sola si el paciente no responde."

---

## Usuario Objetivo

**Perfil primario:**
- Dueño de clínica dental independiente en Perú
- 1-3 dentistas en el staff
- 100-300 citas al mes
- Usa agenda física, Excel o Google Calendar
- Tiene WhatsApp Business pero lo usa manualmente
- No tiene presupuesto ni tiempo para implementar software complejo
- Dolor activo: pierde citas, pierde dinero, no tiene cómo automatizarlo

**Un día en su vida (antes de DentOS):**
La asistente llega a las 8am y pasa la primera hora llamando a los pacientes del día para confirmar. A veces no contestan. A veces olvidan igual. A las 10am hay una silla vacía y el dentista espera 45 minutos sin paciente.

**Un día en su vida (con DentOS):**
24 horas antes, DentOS manda un WhatsApp al paciente. Si confirma, se marca en la agenda. Si no responde en 4 horas, manda un segundo recordatorio. Si cancela, DentOS avisa a la clínica para que pueda llamar a alguien de la lista de espera. La asistente no hizo ninguna llamada.

---

## MVP — Qué SÍ construir en v1

| # | Feature | Descripción |
|---|---------|-------------|
| 1 | **Registro de clínica** | Onboarding: nombre, dentistas, horario, número WhatsApp Business |
| 2 | **Carga de agenda** | Manual (formulario) o via Google Calendar (OAuth) |
| 3 | **Confirmación automática** | WhatsApp 24h antes: "¿Confirmas tu cita mañana a las 3pm con Dr. García?" |
| 4 | **Segundo recordatorio** | Si no responde en 4h, segundo WhatsApp 2h antes |
| 5 | **Flujo de cancelación** | Si cancela, alerta a la clínica por WhatsApp/email |
| 6 | **Dashboard básico** | Tasa de confirmación, no-shows evitados, revenue recuperado estimado |
| 7 | **Auth + suscripción** | Registro, login, Stripe: plan Starter $29/mes o Pro $49/mes |

## MVP — Qué NO construir en v1

- ❌ Historial clínico / expediente del paciente
- ❌ Facturación electrónica (SUNAT)
- ❌ App móvil para pacientes
- ❌ Inventario de materiales
- ❌ Integración con Doctocliq, Dentalink u otros softwares
- ❌ Recordatorios por SMS o email (solo WhatsApp en v1)
- ❌ Reprogramación automática (v2)
- ❌ Multi-sede (v2)

---

## Competencia

| Competidor | Precio | Fortaleza | Debilidad |
|------------|--------|-----------|-----------|
| Doctocliq | $19+/mes | Todo-en-uno, popular en Perú | Complejo, recordatorios son secundarios |
| Dentalink | No publicado | Robusto, Chile | Caro, orientado a clínicas grandes |
| Akeito | No publicado | IA integrada | Complejo, sin foco en no-shows |
| Manual (llamadas) | $0 | Familiar | 30-60 min/día de personal, inconsistente |

**Ventaja de DentOS:** Foco total. Más simple. Más barato. Resuelve un solo problema — el más doloroso.

---

## Modelo de Negocio

| Plan | Precio | Límite | Para quién |
|------|--------|--------|------------|
| Starter | $29/mes | 1 dentista, 150 citas/mes | Consultorio individual |
| Pro | $49/mes | 3 dentistas, citas ilimitadas | Clínica pequeña |

**Costo de WhatsApp API por clínica Pro (200 citas × 2 mensajes × $0.023):** ~$9.20/mes
**Margen bruto estimado plan Pro:** ~$39/mes por clínica = **80% de margen**

**Path a $10K MRR:**
- 205 clínicas Starter ($29) = $5,945
- 105 clínicas Pro ($49) = $5,145
- Mix realista: **~170 clínicas activas = $10K MRR**

**Estrategia de adquisición v1 (Ica → Perú):**
1. Contacto directo con 20 clínicas en Ica (presencial/WhatsApp)
2. Ofrecer 30 días gratis sin tarjeta
3. Testimonial con números reales → expansión a Lima/provincias
4. Contenido en TikTok/Instagram para dentistas ("Cómo evitar no-shows")

---

## Success Metrics — MVP

| Métrica | Target mes 1 | Target mes 3 |
|---------|-------------|-------------|
| Clínicas registradas | 10 | 50 |
| Clínicas de pago | 5 | 30 |
| Reducción de no-shows (cliente) | ≥ 25% | ≥ 35% |
| Churn mensual | < 8% | < 5% |
| NPS | > 40 | > 55 |

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| WhatsApp API bloqueada por Meta | Baja | Mantener WhatsApp Business App como fallback. Diversificar a SMS en v2. |
| Clínicas no adoptan la tecnología | Media | Onboarding de 10 min. Setup lo hace Levy, no la clínica. |
| Doctocliq agrega recordatorios fuertes | Baja | DentOS es más barato y más simple. No es un sistema de gestión. |
| Pocas clínicas en Ica para validar | Media | Ica es el piloto. Lima es el mercado real. |

---

## Stack Técnico

Siguiendo `knowledge/stack-estandar.md`:

| Capa | Herramienta |
|------|-------------|
| Framework | Next.js 14 |
| DB + Auth | Supabase |
| ORM | Prisma |
| Pagos | Stripe |
| Deploy | Vercel |
| WhatsApp | Meta Cloud API (WhatsApp Business) |
| Estilos | Tailwind + shadcn/ui |
| Email | Resend |
| Analytics | PostHog |
| Errores | Sentry |

---

## Diseño — Dirección Visual

**Tono:** Profesional pero accesible. No es para startups — es para dentistas de 40 años en provincia.
**Referente:** Calm + Notion. Limpio, sin ruido, claro en lo que hace.
**Paleta:** Blanco + azul profundo (#0F2D5E) + verde de confirmación (#22C55E)
**Tipografía:** Inter — legible, moderna, sin pretensiones
**Principio guía:** El dashboard más importante es el que muestra cuánto dinero se recuperó esta semana. Eso es lo que renueva la suscripción.

---

*Última actualización: 2026-04-01*
*Status: PLANNING — Brief v2*
*Score estimado de viabilidad: 7.5/10*

# Integraciones — Checklist de Credenciales [C]

> Antes de iniciar la Fase 06 (Construcción), se deben recolectar TODAS las credenciales
> de las integraciones que el producto necesite.
> Sin credenciales confirmadas, no se escribe código de integración.

---

## Regla de Oro

**Preguntar primero, codificar después.**
Si una integración requiere un token, API key, número, webhook URL o contraseña,
se recolecta ANTES de la sesión de construcción. No a mitad.

Si Moisés no tiene alguna credencial disponible → construir en **modo mock/stub**
y documentar el pending en `context/session-log.md`.

---

## Protocolo de Recolección (Levy)

Al llegar a Fase 06, Levy revisa `products/<producto>/architecture.md`,
identifica todas las integraciones externas y pregunta:

> "Antes de empezar la construcción necesito las credenciales de:
> [lista específica].
> ¿Las tienes disponibles ahora o arrancamos en modo mock?"

---

## Catálogo de Integraciones

### Base de Datos / Auth — Supabase

| Variable | Cómo obtenerla | Formato |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → anon key | JWT (`eyJ...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role | JWT (`eyJ...`) |
| `DATABASE_URL` | Project Settings → Database → Connection Pooling → Transaction mode | URL con puerto 6543 |
| `DIRECT_URL` | Project Settings → Database → Connection string | URL con puerto 5432 |

**Notas de compatibilidad:**
- Usar keys formato JWT (`eyJ...`). El nuevo formato `sb_publishable_` / `sb_secret_` solo es compatible con versiones recientes de `@supabase/ssr` — verificar compatibilidad antes de usar.
- `DATABASE_URL`: usar **Transaction Pooler** (puerto 6543) + `?pgbouncer=true&connection_limit=1` para serverless.
- `DIRECT_URL`: conexión directa (puerto 5432) — la usa Prisma para correr migraciones. Las migraciones NO funcionan a través del pooler.
- Contraseña de DB: **sin caracteres especiales** (!, @, #, $) — generan errores de URL encoding.

---

### Deploy — Vercel

| Check | Cómo verificar |
|---|---|
| Repo conectado a Vercel | GitHub → Settings → Integrations → Vercel |
| Branch de producción correcta | Vercel → Project Settings → Git → Production Branch |
| Auto-deploy funcionando | Hacer push dummy → debe aparecer deploy en <30s |
| Env vars añadidas en Vercel | Project Settings → Environment Variables |

**⚠️ Verificar auto-deploy con un commit de prueba ANTES de empezar la construcción.**
Si falla, diagnosticar el pipeline antes de escribir código.

**Limitaciones por plan:**
- Hobby: 1 cron job, máximo 1 ejecución/día (`0 X * * *`). Sin crons frecuentes.
- Pro: múltiples crons, hasta cada minuto.

---

### Pagos — Stripe

| Variable | Cómo obtenerla |
|---|---|
| `STRIPE_SECRET_KEY` | Dashboard → Developers → API Keys → Secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Dashboard → Developers → API Keys → Publishable key |
| `STRIPE_WEBHOOK_SECRET` | Dashboard → Developers → Webhooks → Signing secret |
| Price IDs de planes | Dashboard → Products → cada plan → Price ID (`price_xxx`) |

**Nota:** Usar keys de TEST hasta producción real. `BILLING_MODE=mock` para desarrollo sin Stripe.

---

### Email transaccional — Resend

| Variable | Cómo obtenerla |
|---|---|
| `RESEND_API_KEY` | Resend Dashboard → API Keys |
| Dominio verificado | Resend Dashboard → Domains → status = `Verified` |

---

### Mensajería — WhatsApp Business (Meta Cloud API)

| Variable | Cómo obtenerla |
|---|---|
| `WHATSAPP_ACCESS_TOKEN` | Meta for Developers → App → WhatsApp → API Setup → System User token permanente |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta for Developers → App → WhatsApp → API Setup → Phone Number ID |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Lo define el equipo (string aleatorio, mín. 16 chars) |

**Nota:** El token temporal de Meta expira en 24h. En producción usar System User con token permanente.
En modo mock (sin credenciales): mensajes se loguean pero no se envían.

---

### Mensajería — SMS (Twilio)

| Variable | Cómo obtenerla |
|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio Console → Account Info |
| `TWILIO_AUTH_TOKEN` | Twilio Console → Account Info |
| `TWILIO_PHONE_NUMBER` | Twilio Console → Phone Numbers |

---

### IA — OpenAI

| Variable | Cómo obtenerla |
|---|---|
| `OPENAI_API_KEY` | platform.openai.com → API Keys |

---

### IA — Anthropic (Claude)

| Variable | Cómo obtenerla |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |

---

### Notificaciones Push — OneSignal

| Variable | Cómo obtenerla |
|---|---|
| `NEXT_PUBLIC_ONESIGNAL_APP_ID` | OneSignal Dashboard → Settings → Keys & IDs |
| `ONESIGNAL_API_KEY` | OneSignal Dashboard → Settings → Keys & IDs → REST API Key |

---

### Analytics — PostHog

| Variable | Cómo obtenerla |
|---|---|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog → Project Settings → Project API Key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog → Project Settings → Host (`https://app.posthog.com`) |

---

### Monitoreo — Sentry

| Variable | Cómo obtenerla |
|---|---|
| `SENTRY_DSN` | Sentry → Project → Settings → Client Keys |

---

## Variables Base (todos los productos)

```env
# App
NEXT_PUBLIC_APP_URL=https://<dominio>.vercel.app
NEXT_PUBLIC_APP_NAME=<NombreProducto>

# Supabase (obligatorio)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (obligatorio)
DATABASE_URL=
DIRECT_URL=

# Billing mode (mock | stripe)
BILLING_MODE=mock
```

---

*Propietario: Levy — Arquitecto de Sistemas*
*Última actualización: 2026-04-02*

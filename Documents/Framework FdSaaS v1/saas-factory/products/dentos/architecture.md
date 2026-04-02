# DentOS — Arquitectura Técnica

*Generado: 2026-04-01*

---

## Stack

| Capa | Herramienta |
|------|-------------|
| Framework | Next.js 14 (App Router) |
| DB + Auth | Supabase (PostgreSQL) |
| ORM | Prisma 5.x |
| Pagos | Stripe (Checkout + Webhooks) |
| WhatsApp | Meta Cloud API |
| Deploy | Vercel |
| Estilos | Tailwind + shadcn/ui |
| Email | Resend |
| Analytics | PostHog |
| Errores | Sentry |

---

## Estructura de Carpetas

```
dentos/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── callback/route.ts
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  # Dashboard — métricas principales
│   │   │   ├── agenda/
│   │   │   │   ├── page.tsx              # Lista de citas
│   │   │   │   └── nueva/page.tsx        # Crear cita manual
│   │   │   ├── pacientes/
│   │   │   │   └── page.tsx
│   │   │   └── configuracion/
│   │   │       └── page.tsx              # Datos de clínica + WhatsApp
│   │   ├── onboarding/
│   │   │   └── page.tsx                  # Setup inicial de clínica
│   │   ├── api/
│   │   │   ├── stripe/webhook/route.ts
│   │   │   ├── whatsapp/webhook/route.ts # Recibir respuestas de pacientes
│   │   │   ├── citas/route.ts
│   │   │   ├── citas/[id]/route.ts
│   │   │   └── health/route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                           # shadcn/ui base
│   │   ├── dashboard/
│   │   │   ├── MetricCard.tsx
│   │   │   ├── CitasHoy.tsx
│   │   │   └── NoShowsEvitados.tsx
│   │   ├── agenda/
│   │   │   ├── CitaCard.tsx
│   │   │   └── FormNuevaCita.tsx
│   │   └── onboarding/
│   │       └── StepsOnboarding.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── stripe/
│   │   │   ├── client.ts
│   │   │   └── webhooks.ts
│   │   ├── whatsapp/
│   │   │   ├── client.ts                 # Meta Cloud API wrapper
│   │   │   ├── templates.ts              # Message templates
│   │   │   └── webhooks.ts               # Procesar respuestas
│   │   └── validations/
│   │       ├── cita.ts
│   │       └── clinica.ts
│   ├── hooks/
│   │   ├── useClinica.ts
│   │   └── useCitas.ts
│   ├── stores/
│   │   └── clinicaStore.ts
│   └── types/
│       └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env.example
└── middleware.ts
```

---

## Schema Prisma

```prisma
// DentOS — Schema de Base de Datos
// Pattern: Multi-tenant via clinica_id en todas las tablas de dominio

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─────────────────────────────
// AUTH & TENANCY
// ─────────────────────────────

model Clinica {
  id                String    @id @default(cuid())
  nombre            String
  slug              String    @unique
  telefono          String?
  direccion         String?
  ciudad            String    @default("Ica")
  pais              String    @default("PE")
  whatsappNumero    String?   @map("whatsapp_numero")    // Número de la clínica en WhatsApp
  whatsappVerified  Boolean   @default(false) @map("whatsapp_verified")
  googleCalendarId  String?   @map("google_calendar_id")
  onboardingCompletado Boolean @default(false) @map("onboarding_completado")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  usuarios     UsuarioClinica[]
  dentistas    Dentista[]
  pacientes    Paciente[]
  citas        Cita[]
  subscription Subscription?

  @@map("clinicas")
}

model Usuario {
  id        String   @id @default(cuid())
  email     String   @unique
  nombre    String?
  createdAt DateTime @default(now()) @map("created_at")

  clinicas UsuarioClinica[]

  @@map("usuarios")
}

model UsuarioClinica {
  id        String   @id @default(cuid())
  clinicaId String   @map("clinica_id")
  usuarioId String   @map("usuario_id")
  rol       Rol      @default(ADMIN)
  createdAt DateTime @default(now()) @map("created_at")

  clinica Clinica @relation(fields: [clinicaId], references: [id], onDelete: Cascade)
  usuario Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)

  @@unique([clinicaId, usuarioId])
  @@map("usuarios_clinica")
}

// ─────────────────────────────
// DOMINIO
// ─────────────────────────────

model Dentista {
  id        String   @id @default(cuid())
  clinicaId String   @map("clinica_id")
  nombre    String
  apellido  String
  email     String?
  activo    Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at")

  clinica Clinica @relation(fields: [clinicaId], references: [id], onDelete: Cascade)
  citas   Cita[]

  @@map("dentistas")
}

model Paciente {
  id          String   @id @default(cuid())
  clinicaId   String   @map("clinica_id")
  nombre      String
  apellido    String
  telefono    String                          // Número con código de país: +51...
  email       String?
  notas       String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  clinica Clinica @relation(fields: [clinicaId], references: [id], onDelete: Cascade)
  citas   Cita[]

  @@unique([clinicaId, telefono])
  @@map("pacientes")
}

model Cita {
  id            String         @id @default(cuid())
  clinicaId     String         @map("clinica_id")
  dentistaId    String         @map("dentista_id")
  pacienteId    String         @map("paciente_id")
  fecha         DateTime                               // Fecha y hora exacta de la cita
  duracionMin   Int            @default(30) @map("duracion_min")
  motivo        String?
  estado        EstadoCita     @default(PENDIENTE)
  notas         String?
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")

  clinica   Clinica    @relation(fields: [clinicaId], references: [id], onDelete: Cascade)
  dentista  Dentista   @relation(fields: [dentistaId], references: [id])
  paciente  Paciente   @relation(fields: [pacienteId], references: [id])
  mensajes  MensajeWhatsApp[]

  @@map("citas")
}

model MensajeWhatsApp {
  id           String          @id @default(cuid())
  citaId       String          @map("cita_id")
  tipo         TipoMensaje
  estado       EstadoMensaje   @default(PENDIENTE)
  waMessageId  String?         @map("wa_message_id")   // ID devuelto por Meta API
  enviadoAt    DateTime?       @map("enviado_at")
  leidoAt      DateTime?       @map("leido_at")
  respuesta    String?                                  // Texto de respuesta del paciente
  respondidoAt DateTime?       @map("respondido_at")
  createdAt    DateTime        @default(now()) @map("created_at")

  cita Cita @relation(fields: [citaId], references: [id], onDelete: Cascade)

  @@map("mensajes_whatsapp")
}

// ─────────────────────────────
// BILLING
// ─────────────────────────────

model Subscription {
  id                   String             @id @default(cuid())
  clinicaId            String             @unique @map("clinica_id")
  stripeCustomerId     String             @unique @map("stripe_customer_id")
  stripeSubscriptionId String?            @unique @map("stripe_subscription_id")
  stripePriceId        String?            @map("stripe_price_id")
  plan                 Plan               @default(STARTER)
  status               SubscriptionStatus @default(TRIALING)
  trialEndsAt          DateTime?          @map("trial_ends_at")
  currentPeriodEnd     DateTime?          @map("current_period_end")
  cancelAtPeriodEnd    Boolean            @default(false) @map("cancel_at_period_end")
  createdAt            DateTime           @default(now()) @map("created_at")
  updatedAt            DateTime           @updatedAt @map("updated_at")

  clinica Clinica @relation(fields: [clinicaId], references: [id], onDelete: Cascade)

  @@map("subscriptions")
}

// ─────────────────────────────
// ENUMS
// ─────────────────────────────

enum Rol {
  OWNER
  ADMIN
}

enum EstadoCita {
  PENDIENTE       // Creada, sin recordatorio enviado aún
  RECORDATORIO_1  // Primer WhatsApp enviado (24h antes)
  RECORDATORIO_2  // Segundo WhatsApp enviado (2h antes)
  CONFIRMADA      // Paciente confirmó
  CANCELADA       // Paciente canceló o no respondió
  COMPLETADA      // Cita realizada
  NO_SHOW         // No se presentó
}

enum TipoMensaje {
  RECORDATORIO_24H
  RECORDATORIO_2H
  CONFIRMACION_RECIBIDA
}

enum EstadoMensaje {
  PENDIENTE
  ENVIADO
  ENTREGADO
  LEIDO
  FALLIDO
}

enum Plan {
  STARTER   // $29/mes — 1 dentista, 150 citas/mes
  PRO       // $49/mes — 3 dentistas, ilimitado
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
}
```

---

## API Routes

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/citas` | Crear nueva cita |
| GET | `/api/citas` | Listar citas de la clínica |
| PATCH | `/api/citas/[id]` | Actualizar estado de cita |
| DELETE | `/api/citas/[id]` | Eliminar cita |
| POST | `/api/stripe/webhook` | Eventos de Stripe |
| POST | `/api/whatsapp/webhook` | Respuestas de pacientes vía WhatsApp |
| GET | `/api/health` | Health check |

---

## Flujo de Recordatorio (Core del Producto)

```
Cita creada (estado: PENDIENTE)
     ↓
Cron job cada hora → busca citas en las próximas 24h sin RECORDATORIO_1
     ↓
Enviar WhatsApp #1: "Hola [nombre], tienes cita mañana a las [hora] con Dr. [dentista]. ¿Confirmas? Responde SÍ o NO"
     ↓
Estado → RECORDATORIO_1
     ↓
Si responde SÍ → Estado: CONFIRMADA
Si responde NO → Estado: CANCELADA → alerta a clínica por email
Si no responde en 4h → enviar WhatsApp #2 (2h antes)
     ↓
Estado → RECORDATORIO_2
     ↓
Si no confirma → Estado: CANCELADA → alerta a clínica
Cita realizada → Estado: COMPLETADA (manual o automático)
Si no se presentó → Estado: NO_SHOW
```

---

## Variables de Entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Prisma
DATABASE_URL=
DIRECT_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PRO=

# WhatsApp Meta Cloud API
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

*Propietario: Levy — Arquitecto de Sistemas + Arquitecto de Datos*
*Última actualización: 2026-04-01*

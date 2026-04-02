# B2B SaaS Starter — Template

Stack: Next.js 14 + Supabase + Stripe + Vercel
Uso: Punto de partida para cualquier producto B2B de la fábrica.

## Estructura incluida

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── callback/route.ts
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Sidebar + nav protegido
│   │   ├── page.tsx             # Dashboard home
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── stripe/webhook/route.ts
│   │   └── health/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                      # shadcn/ui base
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── dashboard/
│       ├── Sidebar.tsx
│       └── Header.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── middleware.ts
│   ├── stripe/
│   │   ├── client.ts
│   │   └── webhooks.ts
│   └── validations/
│       └── auth.ts
├── hooks/
│   └── useUser.ts
├── stores/
│   └── userStore.ts
└── types/
    └── index.ts
prisma/
├── schema.prisma
└── migrations/
```

## Setup en 5 minutos

1. Copiar `.env.example` → `.env.local` y llenar variables
2. `npm install`
3. `npx prisma migrate dev` — crea tablas en Supabase
4. `npm run dev`
5. Configurar webhook en Stripe Dashboard → `localhost:3000/api/stripe/webhook`

## Variables requeridas

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

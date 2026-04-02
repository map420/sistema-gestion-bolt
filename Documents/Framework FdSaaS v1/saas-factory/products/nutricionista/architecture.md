# NutriSync — Architecture

## Stack

| Capa | Herramienta | Versión |
|---|---|---|
| Framework | Next.js | 15.x |
| Auth + DB | Supabase | latest |
| ORM | Prisma | 5.x |
| IA | OpenAI GPT-4o (mock en MVP) | latest |
| Estilos | Tailwind CSS | 3.x |
| Deploy | Vercel | latest |

## Schema Prisma

Ver `apps/nutrisync/prisma/schema.prisma`

## API Routes

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/profile` | Guarda perfil del onboarding |
| GET | `/api/profile` | Obtiene perfil del usuario |
| POST | `/api/plans/generate` | Genera plan semanal (mock OpenAI) |
| GET | `/api/plans` | Lista planes del usuario |
| GET | `/api/plans/[id]` | Plan específico + lista de compras |
| POST | `/api/checkins` | Registra check-in semanal |
| GET | `/api/dashboard` | Métricas de progreso |

## Variables de Entorno

```env
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=NutriSync
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=
OPENAI_API_KEY=        # vacío = modo mock
```

## Diseño

Dark mode. Outfit + Inter. Acento #22C55E (verde).
Ver `products/nutricionista/diseno.md`

---
*Actualizado: 2026-04-02*

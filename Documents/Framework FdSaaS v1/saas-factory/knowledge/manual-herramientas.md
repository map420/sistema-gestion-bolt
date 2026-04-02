# Stack Estándar — SaaS Factory (2026)

Este es el manifiesto tecnológico innegociable de la fábrica para maximizar **Velocidad [V]** y **Apalancamiento [M]**.

## Ecosistema Full-Stack (Next.js)
- **Framework**: Next.js 14/15 (App Router). 
- **Lenguaje**: TypeScript 5. 
- **Styling**: Tailwind CSS v4. 
- **Auth**: Supabase Auth (Integrado en Next.js Middleware). 
- **Formularios**: React Hook Form + Zod. 

## Capa de Datos (Supabase)
- **Database**: PostgreSQL 15+. 
- **ORM**: Prisma (si se requiere tipado estricto) o Supabase Client (Directo). 
- **Seguridad**: Row Level Security (RLS) basado en `organization_id`. 
- **Storage**: Supabase Storage para imágenes/archivos. 

## Ecosistema de Revenue (Stripe)
- **Procesador**: Stripe. 
- **Gestión**: Stripe Checkout + Subscription Portal. 
- **Webhooks**: Endpoint de Next.js (`/api/webhooks/stripe`). 

## Infraestructura y DevOps
- **Deployment**: Vercel (FE + Serverless Functions). 
- **Repositorio**: GitHub (CI/CD Automático). 
- **Monitorización**: Vercel Analytics + Speed Insights. 

---

*Última revisión estratégica: 2026-04-02*

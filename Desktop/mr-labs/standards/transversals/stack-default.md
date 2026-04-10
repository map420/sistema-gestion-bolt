# Stack por defecto — Mr Labs

> Este documento define el stack que usan todos los proyectos generados salvo que
> el brief del proyecto incluya un override en `briefs/<slug>/stack.md`.
>
> **No editar este archivo por decisiones de un cliente concreto.**
> Los overrides van en el brief del proyecto, nunca aquí.

---

## Stack

| Capa | Tecnología | Versión | Notas |
|------|-----------|---------|-------|
| Framework | Next.js | 15 (App Router) | SSR + SSG según sección |
| Estilos | Tailwind CSS | 4.x | |
| Componentes UI | shadcn/ui | latest | Tematizable por cliente vía CSS variables |
| CMS | Sanity | v3 | Un proyecto Sanity por cliente |
| Deploy | Vercel | — | Plan Hobby para demos, Pro para clientes reales |
| Repos | GitHub | — | Cuenta `map420` |
| Package manager | pnpm | latest | Lockfile: `pnpm-lock.yaml` |
| Node | 24.x | v24.12.0 local | Fijar en `package.json > engines` |
| Analytics | Vercel Analytics | — | Sin configuración extra, incluido en Vercel |

---

## Estructura de un proyecto generado

```
<slug>/
├── app/
│   ├── layout.tsx          ← fuente de Google Fonts + Vercel Analytics
│   ├── page.tsx            ← landing principal
│   └── [...slug]/          ← rutas dinámicas si aplica
├── components/
│   ├── ui/                 ← componentes shadcn/ui
│   └── sections/           ← secciones específicas del vertical
├── sanity/
│   ├── schemaTypes/        ← schemas de contenido del vertical
│   └── lib/client.ts       ← cliente Sanity tipado
├── public/
├── .env.local              ← SANITY_PROJECT_ID, SANITY_DATASET, etc.
├── package.json            ← engines: { node: "24.x" }
├── tailwind.config.ts
├── next.config.ts
└── sanity.config.ts
```

---

## Variables de entorno requeridas

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=              # solo para escritura desde servidor
NEXT_PUBLIC_VERCEL_URL=        # inyectada automáticamente por Vercel
```

---

## Capa de adaptadores (proyectos con backend)

Todo proyecto SaaS o con integraciones externas usa la capa de adaptadores definida en
`standards/transversals/adapters.md`. El scaffolder la genera automáticamente.

**Regla:** La lógica de negocio solo importa de `src/lib/adapters/*/index.ts`.
Sin credenciales → mock activo. Con credenciales → real activo. Sin cambios de código.

---

## Convenciones de código

- Tipado estricto con TypeScript (`strict: true`)
- Imports con alias `@/` desde la raíz
- Componentes en PascalCase, archivos en kebab-case
- `async/await` sobre `.then()` siempre
- Sin `any` — usar tipos de Sanity generados (`sanity typegen`)

---

## Templates disponibles

| Template | Cuándo usar |
|----------|-------------|
| `next-tailwind-vercel` | Restaurantes, clínicas, portfolios, legal — cualquier web informativa |
| `astro-content` | Blogs, documentación, sitios de contenido estático |
| `shopify-hydrogen` | Ecommerce con Shopify como backend |

---

## Override por proyecto

Si un proyecto necesita un stack diferente, crear `briefs/<slug>/stack.md` con:

```md
# Stack override — <nombre del proyecto>

framework: astro
cms: none
template: astro-content
motivo: cliente tiene blog con 500+ artículos, SSG puro es más eficiente
```

El agente `core/router` leerá este archivo y usará el template correcto.

---

*Última actualización: 2026-04-07*
*Aprobado por: Moises*

/**
 * Hook: Post-Billing
 * Propósito: Al aprobar el paso 05.5 Billing, crear automáticamente la carpeta
 *            del proyecto en /apps/<producto-slug> con la estructura base.
 *
 * Flujo:
 *   billing.md aprobado por pre-05-pagos.js
 *       → Crea /apps/<slug>/ con estructura Next.js estándar
 *       → Copia archivos base del template b2b-saas-starter
 *       → Crea .env.example con variables del stack del producto
 *       → Registra en session-log.md
 *
 * La carpeta resultante está lista para:
 *   npx create-next-app . --typescript --tailwind --eslint --app --src-dir
 */
const fs = require('fs')
const path = require('path')

module.exports = async (context, deliverable) => {
  const { productName, productSlug, billingMode, stackVars } = deliverable

  const appsRoot = path.resolve(__dirname, '../../apps')
  const projectPath = path.join(appsRoot, productSlug)

  // Verificar que /apps existe
  if (!fs.existsSync(appsRoot)) {
    return {
      valid: false,
      errors: [`🚨 Carpeta /apps no encontrada en: ${appsRoot}`]
    }
  }

  // Verificar si ya existe el proyecto
  if (fs.existsSync(projectPath)) {
    return {
      valid: true,
      warnings: [`ℹ️ El proyecto /apps/${productSlug} ya existe. No se sobreescribió.`],
      projectPath
    }
  }

  // Crear estructura de carpetas
  const dirs = [
    '',
    'src/app/(auth)/login',
    'src/app/(auth)/register',
    'src/app/(auth)/callback',
    'src/app/(dashboard)',
    'src/app/onboarding',
    'src/app/api/health',
    'src/app/api/billing/webhook',
    'src/components/ui',
    'src/components/dashboard',
    'src/lib/supabase',
    'src/lib/billing',
    'src/lib/whatsapp',
    'src/lib/validations',
    'src/hooks',
    'src/stores',
    'src/types',
    'prisma/migrations',
    'public',
  ]

  dirs.forEach(dir => {
    const fullPath = path.join(projectPath, dir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
    }
  })

  // Crear .env.example
  const billingVars = billingMode === 'mock'
    ? '# Billing (Mock — sin proveedor externo)\n# Activar planes manualmente desde /admin\nBILLING_MODE=mock'
    : '# Stripe\nSTRIPE_SECRET_KEY=\nSTRIPE_WEBHOOK_SECRET=\nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=\nSTRIPE_PRICE_STARTER=\nSTRIPE_PRICE_PRO='

  const envExample = `# ${productName} — Variables de Entorno
# Copiar a .env.local y completar valores

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Prisma
DATABASE_URL=
DIRECT_URL=

${billingVars}

# WhatsApp Meta Cloud API
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=

# Resend (email)
RESEND_API_KEY=

# PostHog (analytics)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry (errores)
NEXT_PUBLIC_SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=${productName}
`

  fs.writeFileSync(path.join(projectPath, '.env.example'), envExample)

  // Crear README de inicio rápido
  const readme = `# ${productName}

## Setup

1. Instalar dependencias:
\`\`\`bash
npx create-next-app . --typescript --tailwind --eslint --app --src-dir
npm install @supabase/ssr @supabase/supabase-js prisma @prisma/client zod zustand @tanstack/react-query resend
npx shadcn-ui@latest init
\`\`\`

2. Configurar variables de entorno:
\`\`\`bash
cp .env.example .env.local
# Completar valores en .env.local
\`\`\`

3. Configurar DB:
\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

4. Iniciar en desarrollo:
\`\`\`bash
npm run dev
\`\`\`

## Stack
- Next.js 14 (App Router)
- Supabase (Auth + DB)
- Prisma (ORM)
- Tailwind + shadcn/ui
- Billing: ${billingMode === 'mock' ? 'Mock (swap-ready para Culqi/Stripe)' : 'Stripe'}

## Arquitectura
Ver: \`saas-factory/products/${productSlug}/architecture.md\`

## Diseño
Ver: \`saas-factory/products/${productSlug}/diseno.md\`

## Billing
Ver: \`saas-factory/products/${productSlug}/billing.md\`
`

  fs.writeFileSync(path.join(projectPath, 'README.md'), readme)

  // Crear .gitignore base
  const gitignore = `.env.local
.env
node_modules/
.next/
out/
build/
*.log
.DS_Store
`
  fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignore)

  return {
    valid: true,
    projectPath,
    message: `✅ Proyecto creado en /apps/${productSlug}. Listo para npx create-next-app.`,
    nextStep: `cd apps/${productSlug} && npx create-next-app . --typescript --tailwind --eslint --app --src-dir`
  }
}

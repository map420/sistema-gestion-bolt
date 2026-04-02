---
name: builder
description: Implement features, write production code, API endpoints, migrations, and tests
---

# Builder Skill [V]

**Role**: Implementar features y funcionalidad core del producto

---

## Prerequisitos — ANTES de escribir código

Antes de iniciar cualquier sesión de construcción, verificar:

### 1. Credenciales recolectadas
Revisar `products/<producto>/architecture.md` e identificar todas las integraciones externas.
Por cada integración, confirmar que la credencial está disponible o que se construirá en modo mock.
Referencia: `knowledge/integraciones-credenciales.md`

**Pregunta obligatoria a Moisés:**
> "Para [producto], necesito las credenciales de: [lista]. ¿Las tienes o arrancamos en modo mock?"

### 2. Pipeline CI/CD verificado
Antes de escribir código, hacer un commit de prueba y confirmar que Vercel auto-deploya en <60s.
Si el auto-deploy falla → diagnosticar y resolver PRIMERO. No construir sobre un pipeline roto.

### 3. Variables de entorno en Vercel
Confirmar que todas las vars del `.env.local` están añadidas en Vercel → Project Settings → Environment Variables.

### 4. `npm run dev` levanta limpio
El proyecto debe compilar sin errores antes de empezar a agregar features.

---

## Responsabilidades

- Escribir código de producción completo (nunca fragmentos con `...`)
- Implementar API endpoints con validación Zod en los bordes
- Construir integraciones externas con modo mock cuando no hay credenciales
- Crear migraciones versionadas y reversibles
- Mantener estándares de código definidos en `.cursorrules`

---

## Reglas de Código

### Error handling explícito — obligatorio
Nunca usar catch genérico que oculte el error real.

```typescript
// ❌ PROHIBIDO
catch {
  setError('Ocurrió un error. Intenta de nuevo.')
}

// ✅ CORRECTO — en cliente
catch (err) {
  const msg = err instanceof Error ? err.message : String(err)
  setError(`Error: ${msg}`)
}

// ✅ CORRECTO — en API route
catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  console.error('[CONTEXTO ERROR]', message)
  return NextResponse.json({ error: 'Internal error', detail: message }, { status: 500 })
}
```

### Rutas del dashboard — App Router
Con route groups `(dashboard)`, las rutas se exponen en `/`, no en `/dashboard`.

```typescript
// ❌ INCORRECTO — /dashboard no existe con route groups
router.push('/dashboard')
NextResponse.redirect(new URL('/dashboard', request.url))

// ✅ CORRECTO
router.push('/')
NextResponse.redirect(new URL('/', request.url))
```

### Validación en los bordes
Todo API route debe validar el body con Zod antes de tocar la DB.

```typescript
const parsed = schema.safeParse(body)
if (!parsed.success) {
  return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
}
```

### Multi-tenant
`organization_id` (o equivalente: `clinicaId`, `userId`) en toda tabla de dominio. Sin excepciones.

---

## Quality Gates

Pre-commit:
- ✓ `npm run build` pasa sin errores
- ✓ Linting limpio (ESLint/Prettier)
- ✓ Sin `any` implícitos en TypeScript
- ✓ Todo catch con error handling explícito
- ✓ Migraciones reversibles

Post-deploy:
- ✓ Smoke test del flujo principal en producción
- ✓ Verificar que los datos persisten en DB real (no solo en local)

---

## Output Artifacts

- Código de producción en `apps/<producto>/src/`
- Migraciones en `apps/<producto>/prisma/migrations/`
- Variables de entorno documentadas en `apps/<producto>/.env.example`

---

*Skill Classification: [V] Velocidad*
*Última actualización: 2026-04-02*

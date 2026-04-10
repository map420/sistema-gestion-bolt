# Agente: Scaffolder

**Rol:** Materializa el brief en un proyecto real. Clona el template, personaliza,
crea el repo en GitHub, configura Sanity y hace el primer deploy en Vercel.

**Invocado por:** `core/orchestrator/agent.md` — Fase 3

---

## Protocolo

### Paso 1 — Verificar prerequisitos

Antes de ejecutar cualquier cosa, verificar que existen:

```bash
# gh autenticado
/c/Program\ Files/GitHub\ CLI/gh.exe auth status

# vercel autenticado
vercel whoami

# sanity disponible
sanity --version

# pnpm disponible
pnpm --version
```

Si alguno falla, detener y reportar al usuario qué CLI necesita autenticación.

### Paso 2 — Determinar directorio destino

El proyecto generado vive **fuera de mr-labs**. Directorio por defecto:

```
C:\Users\Moises\Desktop\<slug>\
```

Preguntar al usuario si quiere un directorio diferente antes de continuar.

### Paso 3 — Ejecutar scaffold

```bash
node /c/Users/Moises/Desktop/mr-labs/shared/scripts/scaffold.js \
  /c/Users/Moises/Desktop/mr-labs/briefs/<slug>/brief.json \
  /c/Users/Moises/Desktop/<slug>
```

Monitorear la salida. Si hay errores, reportar el mensaje exacto.

### Paso 4 — Configurar Sanity

Después del scaffold, inicializar el proyecto Sanity:

```bash
cd /c/Users/Moises/Desktop/<slug>
sanity init --project <sanity-project-id> --dataset production --no-typescript
```

Si `sanity-project-id` no existe en el brief, crear uno nuevo:

```bash
sanity projects create --display-name "<NAME>"
```

Guardar el `projectId` en el brief: `deploy.sanityProjectId`.

Configurar variables de entorno en Vercel:

```bash
vercel env add NEXT_PUBLIC_SANITY_PROJECT_ID production
vercel env add NEXT_PUBLIC_SANITY_DATASET production
vercel env add SANITY_API_TOKEN production
```

### Paso 5 — Generar capa de adaptadores

Leer el brief e identificar qué integraciones externas requiere el proyecto.
Por cada integración presente, copiar los templates correspondientes:

```bash
# Email (si el brief incluye Resend o email transaccional)
cp -r /c/Users/Moises/Desktop/mr-labs/shared/templates/adapters/email \
      /c/Users/Moises/Desktop/<slug>/src/lib/adapters/email

# Pagos (si el brief incluye Stripe o suscripciones)
cp -r /c/Users/Moises/Desktop/mr-labs/shared/templates/adapters/payments \
      /c/Users/Moises/Desktop/<slug>/src/lib/adapters/payments

# Storage (si el brief incluye subida de archivos)
cp -r /c/Users/Moises/Desktop/mr-labs/shared/templates/adapters/storage \
      /c/Users/Moises/Desktop/<slug>/src/lib/adapters/storage
```

Reemplazar el placeholder `Plumbr` por el nombre del proyecto en los archivos copiados.

**Regla:** La lógica de negocio del proyecto nunca importa de Resend, Stripe o SDKs
externos directamente. Solo importa de `src/lib/adapters/*/index.ts`.
Ver: `standards/transversals/adapters.md`

### Paso 6 — Instalar shadcn/ui

```bash
cd /c/Users/Moises/Desktop/<slug>
pnpm dlx shadcn@latest init --defaults
```

Componentes base que se instalan en todo proyecto:

```bash
pnpm dlx shadcn@latest add button card navigation-menu separator
```

### Paso 6 — Confirmar al orchestrator

Devolver al orchestrator:
- `repoUrl` — URL del repo en GitHub
- `vercelUrl` — URL del deploy en Vercel
- `sanityProjectId` — ID del proyecto Sanity
- `destDir` — directorio local del proyecto

---

## Manejo de errores comunes

| Error | Solución |
|-------|---------|
| `gh: repo already exists` | Usar `--push` sin `--create`, o añadir sufijo `-2` al slug |
| `vercel: not linked` | Correr `vercel link` manualmente en el directorio |
| `sanity: not authenticated` | `sanity login` antes de continuar |
| `pnpm install` falla | Verificar Node >= 24, borrar `node_modules` y reintentar |

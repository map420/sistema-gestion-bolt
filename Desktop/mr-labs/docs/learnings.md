# Bitácora de Aprendizajes — Mr Labs

> Registro cronológico de decisiones, herramientas usadas y lecciones aprendidas.
> Formato por entrada: problema → herramienta/decisión → resultado → cuándo volver a usarla.

---

## 2026-04-07 — Fase 0: Resolución de brechas de entorno

### Problema 1: `gh` CLI no instalado
- **Herramienta usada:** `winget install GitHub.cli`
- **Versión instalada:** gh 2.89.0
- **Resultado:** OK. Binario en `C:\Program Files\GitHub CLI\gh.exe`
- **Nota:** El PATH de bash no se recarga en la sesión actual. Usar ruta absoluta `/c/Program\ Files/GitHub\ CLI/gh.exe` o abrir nueva terminal.
- **Condición para volver a usarla:** en cualquier máquina nueva antes de empezar un proyecto.
- **Pendiente:** `gh auth login` para autenticar con GitHub.

### Problema 2: `pnpm` no instalado
- **Herramienta usada:** `npm install -g pnpm`
- **Resultado:** OK. Binario en `C:\Users\Moises\AppData\Roaming\npm\pnpm`
- **Nota:** PATH tampoco disponible en sesión actual. Necesita nueva terminal.
- **Condición para volver a usarla:** en cualquier máquina nueva antes de scaffoldear proyectos Next.js.

### Problema 3: Sin MCP de GitHub
- **Herramienta usada:** `@modelcontextprotocol/server-github` vía npx
- **Configuración:** `C:\Users\Moises\.claude\settings.json` — mcpServers.github
- **Estado:** ACTIVO — token configurado, cuenta `map420` autenticada
- **Scopes activos:** `repo`, `workflow`, `read:org`, `delete_repo`
- **gh CLI:** autenticado vía `gh auth login --with-token` usando el mismo PAT

### Herramientas disponibles en este entorno (inventario)

- Node.js v24.12.0, npm 11.6.2
- vercel CLI (global)
- npx (global)
- Skills activos: familia firecrawl completa
- Plugins activos (user scope): skill-creator, claude-md-management
- MCPs activos: Notion
- MCPs activos: Notion, GitHub (configurado con PAT de cuenta map420)

---

## 2026-04-07 — Fase 3: Implementación del sistema (Hitos 1-8)

### Decisiones de arquitectura tomadas

**Stack por defecto fijado:**
Next.js 15 + Tailwind 3 + shadcn/ui + Sanity v3 + pnpm + Node 24 + Vercel + GitHub.
Nota: se eligió Tailwind 3 sobre 4 por compatibilidad estable con shadcn/ui.

**Dos verticales iniciales:** restaurant + clinic (dental).
Razón: el usuario tiene intención de crear 1 MVP/día y tiene clientes reales en ambos verticales.

**Sin CMS compartido:** cada proyecto tiene su propio proyecto Sanity.
Razón: aislamiento total entre clientes — datos de un cliente nunca accesibles desde otro.

**Notion descartado como CMS y como entrada de briefs (por ahora).**
Razón: el usuario prefirió flujo conversacional directo en Claude Code.

**Notificaciones:** solo en Claude Code / terminal. Sin webhooks externos.

**QA:** Lighthouse ≥ 90 en móvil. Deploy igualmente si no se cumple + aviso de scores.

**"Powered by Mr Labs":** en el footer de todos los proyectos, siempre.

**Propuestas a standards/:** siempre requieren aprobación manual del usuario.
Revisión periódica: cada 5 proyectos.

### Autenticaciones requeridas antes de /new-project

| Servicio | Comando | Cuenta |
|----------|---------|--------|
| GitHub CLI | `gh auth login` (ya hecho) | map420 |
| Sanity | `sanity login --provider github` | map420 / moisesap498@gmail.com |
| Vercel | `vercel login` (pendiente verificar) | — |

**Nota crítica:** `sanity login` sin `--provider` falla con "Multiple providers available".
Siempre usar `sanity login --provider github`.

### Automatizaciones pendientes de mejorar

- CORS de Sanity hay que añadirlo manualmente post-deploy → candidato a automatizar
- `gh auth login`, `vercel login` y `sanity login` deben verificarse antes de cada `/new-project`
- El PATH de bash en Windows no recarga tras instalar CLIs — usar rutas absolutas en scripts

---

## 2026-04-07 — Hito 10: Primer proyecto end-to-end (clinica-mogrovejo)

### Hito completado ✅

**Proyecto:** Clínica Dental Mogrovejo | **URL:** https://clinica-mogrovejo.vercel.app  
**QA:** Performance 98 / Accessibility 92 / Best Practices 96 / SEO 100

### Problemas y soluciones

**1. PostCSS config conflict:**
- `C:\Users\Moises\postcss.config.js` (ESM) es heredado por Next.js → error en `next/font`
- Solución: crear `postcss.config.mjs` local en cada proyecto
- Acción permanente: añadirlo al template `next-tailwind-vercel`

**2. `sanity projects create` falla en non-interactive:**
- Usar API REST: `curl -X POST https://api.sanity.io/v2021-06-07/projects -H "Authorization: Bearer <token>" -d '{"displayName":"..."}'`
- CORS también vía API: endpoint `/projects/<id>/cors`
- Auth token en `~/.config/sanity/config.json`

**3. qa-run.cjs falla verificando URL aunque responde 200:**
- Workaround: `npx lighthouse <url> --output=json` directamente
- Pendiente: depurar función de ping en qa-run.cjs

**4. Lighthouse en Windows — EPERM al limpiar temp:**
- No bloquea el reporte LHR — ignorar

### Tiempo total hito 10: ~85 minutos

### Mejoras al template (backlog):
- Añadir `postcss.config.mjs` al template
- scaffold.cjs: crear proyecto Sanity vía API REST automáticamente
- scaffold.cjs: añadir CORS Sanity post-deploy
- scaffold.cjs: set env vars en Vercel automáticamente

---

## 2026-04-08 — Migración Supabase + Deploy (ConstruApp)

### Problema 1: Vercel no detecta pushes de GitHub automáticamente
- **Causa:** el proyecto fue creado con `vercel deploy` desde terminal, sin conectar GitHub
- **Síntoma:** los pushes no disparan deploys; "Redeploy" en UI redeploya el mismo commit viejo
- **Solución:** usar `vercel --prod` desde la terminal para forzar deploy del código actual
- **Solución permanente:** conectar GitHub en Vercel → Settings → Git desde el inicio del proyecto
- **Regla:** si los deploys muestran "Redeploy of XYZ" en cadena, el repo no está conectado

### Problema 2: Variables de entorno no disponibles en deploy antiguo
- **Causa:** las env vars solo se aplican en el momento del deploy, no retroactivamente
- **Solución:** siempre hacer redeploy después de agregar/cambiar env vars
- **Checklist mínimo de env vars para ConstruApp/SaaS:** `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SESSION_SECRET`, `OTP_SECRET`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `APP_URL`

### Problema 3: Resend rechaza envío desde dominio no verificado
- **Error:** `403 Domain not verified: Verify construapp.vercel.app or update your from domain`
- **Causa:** se usó `noreply@construapp.vercel.app` como from — Vercel no es un dominio verificado en Resend
- **Solución temporal:** usar `onboarding@resend.dev` (solo envía al email propio de la cuenta Resend)
- **Solución definitiva:** verificar dominio propio en Resend → usar `noreply@mrlabs.io`
- **Regla:** el dominio del `from` en Resend SIEMPRE debe estar verificado — nunca usar dominios de hosting como `*.vercel.app`

### Problema 4: Supabase nueva UI — API keys reorganizadas
- **Contexto:** Supabase separó las keys en "Publishable and secret" vs "Legacy anon, service_role"
- **Dónde está el service_role:** Settings → API Keys → pestaña "Legacy anon, service_role API keys"
- **Project URL:** Settings → General (no está en API Keys)
- **Regla:** para apps server-side (Vercel functions), siempre usar `service_role` — nunca `anon` en el servidor

### Decisiones de arquitectura — Supabase en SaaS
- **Auth custom vs Supabase Auth:** se optó por auth propio (HMAC tokens) para mantener el flujo OTP existente
- **Acceso a DB:** solo desde Vercel functions con service_role key — el browser nunca toca Supabase directamente
- **DataContext:** carga datos al montar (login), actualiza Supabase en background (fire-and-forget) — componentes leen de estado local sin bloqueos async
- **Schema:** 3 tablas — `users`, `app_data` (JSONB), `configs` (JSONB)

### Dominio mrlabs.io verificado en Resend
- **Auto-configure:** Resend detectó que el dominio usa Vercel y configuró DNS automáticamente
- **From definitivo:** `noreply@mrlabs.io` para todos los proyectos de Mr Labs

---

## 2026-04-09 — Módulo WhatsApp Automático (RedCard Gym)

### Arquitectura final adoptada

**Patrón:** servidor Node.js independiente desplegado en Railway, consumido por la app Vercel vía HTTP.

```
App Vercel (React/Vite)
    ↕ REST + x-api-key
Servidor WA (Railway — Node.js + Express)
    ↕ whatsapp-web.js (Puppeteer + Chromium)
    ↕ Supabase (RemoteAuth session store + notification_log)
```

**Alternativas descartadas:**
- **Twilio WhatsApp API:** requiere cuenta de empresa verificada + aprobación Meta (~semanas). No viable para MVPs rápidos.
- **Servidor compartido multi-tenant:** viable a futuro, pero complejidad innecesaria en MVP.
- **ngrok en local:** solo útil para QA local — no para producción por el browser-warning de ngrok gratuito.

---

### Problema 1: RemoteAuth — sesión no persiste entre reinicios del servidor

- **Causa:** `whatsapp-web.js` con `RemoteAuth` descarga la sesión de Supabase, la guarda en disco temp (`wwebjs_temp_session_*`), y al reiniciar en Railway (stateless) no hay disco persistente.
- **Síntoma:** QR requerido en cada deploy/reinicio aunque la sesión esté guardada en Supabase.
- **Solución:** Railway sí restaura la sesión si el contenedor no se reinicia — el problema real eran crashes por error no capturado.
- **Causa raíz de crashes:** `RemoteAuth` lanza errores de ENOENT/zip al limpiar temp session; sin `process.on('unhandledRejection')` el proceso muere.
- **Fix definitivo:**
  ```js
  process.on('unhandledRejection', (reason) => {
    console.error('[WA] Unhandled rejection (non-fatal):', reason?.message || reason);
  });
  ```
- **Regla:** siempre añadir este handler en servidores con `whatsapp-web.js`.

---

### Problema 2: `client.destroy()` mata la instancia permanentemente

- **Síntoma:** al llamar `/disconnect`, el servidor queda zombie — no genera nuevo QR ni acepta conexiones WA.
- **Causa:** `waClient.destroy()` destruye los listeners y el estado interno de Puppeteer. No hay `restart()`.
- **Solución:** patrón factory + reinicialización explícita:
  ```js
  function createClient() { return new Client({ authStrategy: new RemoteAuth(...), puppeteer: {...} }); }
  function initClient() { waClient = createClient(); attachEvents(waClient); waClient.initialize(); }

  // En /disconnect:
  await waClient.logout().catch(() => null);
  await waClient.destroy().catch(() => null);
  await store.delete({ session: 'RemoteAuth-redcardgym' }).catch(() => null);
  setTimeout(() => initClient(), 2000); // nueva instancia limpia
  ```
- **Regla:** nunca reutilizar una instancia `Client` destruida — siempre crear una nueva con `new Client(...)`.

---

### Problema 3: ngrok free-tier intercepta requests con browser-warning

- **Síntoma:** `/status` retorna HTML de ngrok en lugar de JSON → parse error en el frontend.
- **Fix:** añadir header `ngrok-skip-browser-warning: '1'` en todas las llamadas fetch al servidor WA.
  ```ts
  headers: { 'x-api-key': WA_KEY, 'ngrok-skip-browser-warning': '1', ... }
  ```
- **Nota:** en Railway no aplica — el header no daña nada si se deja.

---

### Problema 4: `--single-process` flag de Chromium solo funciona en Linux

- **Síntoma:** servidor crashea inmediatamente en Windows con ese flag.
- **Fix:** quitar `--single-process` de los args de Puppeteer.
- **Regla:** el Dockerfile de Railway usa `node:20-slim` + Chromium — en Linux el flag es válido, pero no es necesario con los demás flags de sandboxing desactivados.

---

### Dockerfile mínimo para Railway (whatsapp-web.js)

```dockerfile
FROM node:20-slim
RUN apt-get update && apt-get install -y chromium fonts-noto-color-emoji \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
```

**Variables de entorno Railway requeridas:**

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_KEY` | service_role key (no anon) |
| `API_KEY` | clave secreta para autenticar requests desde Vercel |
| `PORT` | Railway lo inyecta automáticamente |
| `CRON_SCHEDULE` | opcional, default `0 9 * * *` (9AM Lima) |
| `PUPPETEER_EXECUTABLE_PATH` | `/usr/bin/chromium` en Railway |

---

### Problema 5: UX del panel — estado "loading" durante disconnect confunde al usuario

- **Síntoma:** al desconectar, el panel mostraba "Iniciando sesión de WhatsApp..." cuando en realidad estaba cerrando.
- **Solución:** estado `disconnecting` separado en el frontend:
  - Pausa el auto-poll mientras `disconnecting === true`
  - Muestra badge "Cerrando..." y texto "Cerrando sesión de WhatsApp…"
  - Tras 6s, reactiva el poll normal
- **Regla:** operaciones destructivas asíncronas necesitan estado de UI propio — no reusar estados de "cargando" existentes.

---

### Tabla de rutas del servidor WA

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | No | Healthcheck Railway |
| GET | `/status` | Sí | Estado actual + teléfono vinculado |
| GET | `/qr` | Sí | QR como data URL para escanear |
| POST | `/send-reminders` | Sí | Envía recordatorios inmediatamente |
| POST | `/disconnect` | Sí | Cierra sesión WA + elimina sesión de Supabase |

---

### Cuándo usar este módulo en nuevos proyectos

Usar cuando el cliente necesite **notificaciones proactivas por WhatsApp** (recordatorios, confirmaciones, alertas). Ejemplos: clínicas (citas), gimnasios (membresías), restaurantes (reservas).

**No usar** si el cliente puede operar con email + Resend — es más simple y sin servidor adicional.

**Coste aproximado Railway:** ~$5–10 USD/mes (plan Hobby + uso de Chromium).

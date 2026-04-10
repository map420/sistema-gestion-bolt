# Transversal: Notificaciones WhatsApp Automáticas

> Módulo reutilizable para enviar recordatorios por WhatsApp a clientes de cualquier vertical.
> Implementado en: RedCard Gym (2026-04-09).
>
> **No editar por decisiones de un cliente concreto.**

---

## Cuándo usar

- El cliente necesita notificar a sus usuarios **proactivamente** por WhatsApp (recordatorios, alertas, confirmaciones).
- Ejemplos: membresías por vencer (gimnasio), citas próximas (clínica), reservas (restaurante).
- **No usar** si email basta — es más simple, sin servidor adicional y sin dependencia de WhatsApp Web.

---

## Arquitectura

```
App Vercel (frontend)
    ↕ HTTPS + x-api-key
Servidor WA (Railway — Node.js + Express)
    ↕ whatsapp-web.js / Puppeteer
    ↕ Supabase (RemoteAuth session + notification_log)
```

El servidor WA es **independiente de Vercel** — vive en Railway con su propio repo o subdirectorio `wa-server/`.
Agregar `wa-server/` a `.vercelignore` para que Vercel no lo intente deployar.

---

## Stack del servidor WA

| Pieza | Tecnología |
|-------|-----------|
| Runtime | Node.js 20 (LTS) |
| Framework | Express |
| WhatsApp | whatsapp-web.js + Puppeteer |
| Session store | RemoteAuth + SupabaseStore custom |
| Cron | node-cron |
| Deploy | Railway (Docker) |
| QR como imagen | qrcode (toDataURL) |

---

## Dockerfile mínimo

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

---

## Variables de entorno Railway

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_URL` | URL del proyecto Supabase del cliente |
| `SUPABASE_SERVICE_KEY` | service_role key (nunca anon) |
| `API_KEY` | clave secreta — debe coincidir con `VITE_WA_API_KEY` en Vercel |
| `PORT` | Railway lo inyecta automáticamente |
| `CRON_SCHEDULE` | default `0 9 * * *` (9 AM); respetar timezone del cliente |
| `PUPPETEER_EXECUTABLE_PATH` | `/usr/bin/chromium` |

Variables en el frontend Vercel:

| Variable | Descripción |
|----------|-------------|
| `VITE_WA_SERVER_URL` | URL pública del servidor Railway (`https://xxx.railway.app`) |
| `VITE_WA_API_KEY` | misma clave que `API_KEY` en Railway |

---

## Rutas REST

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | No | Healthcheck (Railway lo sondea) |
| GET | `/status` | Sí | Estado WA + teléfono vinculado |
| GET | `/qr` | Sí | QR como data URL para escanear |
| POST | `/send-reminders` | Sí | Envía recordatorios inmediatamente |
| POST | `/disconnect` | Sí | Cierra sesión WA + borra sesión de Supabase |

Auth header: `x-api-key: <API_KEY>`

---

## Schema Supabase requerido

```sql
-- Tabla para log de notificaciones
create table notification_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  days_before int,
  status text,           -- 'sent' | 'error'
  sent_at timestamptz default now()
);

-- Tabla para sesión RemoteAuth (SupabaseStore)
create table whatsapp_sessions (
  id text primary key,   -- 'RemoteAuth-<clientId>'
  session text           -- base64 del zip de la sesión
);
```

---

## Reglas críticas de implementación

**1. Siempre capturar unhandledRejection**
```js
process.on('unhandledRejection', (reason) => {
  console.error('[WA] Unhandled rejection (non-fatal):', reason?.message || reason);
});
```
RemoteAuth lanza errores de ENOENT/zip al sincronizar — sin este handler el proceso muere silenciosamente.

**2. Patrón factory para el cliente WA**

Nunca reutilizar una instancia `Client` después de `destroy()`. Siempre usar factory:

```js
function createClient() {
  return new Client({ authStrategy: new RemoteAuth(...), puppeteer: {...} });
}
function initClient() {
  waClient = createClient();
  attachEvents(waClient);
  waClient.initialize().catch(e => console.error('[WA] Init error:', e.message));
}

// En /disconnect: destruir + reinicializar con nueva instancia
await waClient.logout().catch(() => null);
await waClient.destroy().catch(() => null);
await store.delete({ session: 'RemoteAuth-<clientId>' }).catch(() => null);
setTimeout(() => initClient(), 2000);
```

**3. Args de Puppeteer para contenedores Linux**

```js
args: [
  '--no-sandbox', '--disable-setuid-sandbox',
  '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas',
  '--disable-gpu', '--no-first-run', '--no-zygote',
]
```
No incluir `--single-process` — solo funciona en algunos entornos Linux y puede causar crashes.

**4. Header ngrok (solo en desarrollo local)**

Si se prueba localmente con ngrok, añadir en todas las llamadas fetch:
```ts
headers: { 'ngrok-skip-browser-warning': '1', ... }
```
No daña en producción — dejar siempre para simplicidad.

---

## UX del panel en el frontend

- **Estado `disconnecting` separado:** no reusar el estado `loading` del inicio de sesión.
- Auto-poll pausado mientras `disconnecting === true`.
- QR se refresca automáticamente cada 4s cuando `status === 'qr'`.
- Mostrar número de teléfono vinculado cuando `status === 'ready'`.

---

## Checklist de despliegue

- [ ] Dockerfile en `wa-server/`
- [ ] `wa-server/` en `.vercelignore`
- [ ] Tablas Supabase creadas (`notification_log`, `whatsapp_sessions`)
- [ ] Variables de entorno configuradas en Railway
- [ ] Variables de entorno configuradas en Vercel
- [ ] Deploy Railway exitoso (`railway up`)
- [ ] QR escaneado desde WhatsApp del cliente
- [ ] Test manual `/send-reminders` desde el panel
- [ ] Cron verificado (timezone correcta)

---

*Implementado en: RedCard Gym*
*Fecha: 2026-04-09*
*Aprobado por: Moises*

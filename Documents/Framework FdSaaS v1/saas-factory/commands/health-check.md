# /health-check [C]

Audita el estado técnico del producto activo.

## Uso
```
health-check
```

## Protocolo

1. [C] Verificar que todas las dependencias del stack están actualizadas
2. [C] Revisar variables de entorno contra `.env.example`
3. [C] Verificar que los quality gates de cada skill están configurados
4. [C] Detectar deuda técnica bloqueante
5. [C] Verificar que `context/audit-trail.json` está actualizado
6. Reportar estado por capa

## Checks por capa

| Capa | Check |
|------|-------|
| DB | Migraciones al día, RLS activo en tablas de dominio, `DIRECT_URL` configurada para migrate |
| Auth | Supabase Auth configurado, rutas protegidas, keys formato JWT (`eyJ...`) |
| Credenciales | Todas las integraciones del producto tienen credenciales o están en modo mock documentado |
| Deploy | Vercel conectado, **auto-deploy verificado con commit de prueba**, branch de producción = `main` |
| Env vars | Todas las vars de `.env.local` están en Vercel → Environment Variables |
| Pagos | Webhook activo, keys en env vars |
| Monitoring | Sentry inicializado, alertas configuradas |
| Tests | Coverage ≥ 80%, sin tests en rojo |
| Smoke test | Flujo principal ejecutado en producción: registro → onboarding → acción core → datos en DB |

## Output esperado

```
[C] Health Check — <Producto>
✅ DB: OK — migraciones al día, DIRECT_URL configurada
✅ Auth: OK — keys JWT, rutas protegidas
✅ Credenciales: OK — WhatsApp mock, Stripe pendiente (documentado)
✅ Deploy: OK — auto-deploy verificado, branch main
⚠️  Env vars: DATABASE_URL no está en Vercel
❌ Smoke test: No ejecutado
```

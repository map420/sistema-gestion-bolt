# Árbol de Decisión Tecnológica (Stack Map) [V]

Utiliza este mapa para elegir las herramientas según el tipo de SaaS, siempre priorizando el **Apalancamiento Técnico**.

## Requerimientos de Negocio → Selección de Stack

```mermaid
graph TD
    START[Inicio del Producto] --> B{¿MVP < $10K MRR?}
    B -- SÍ --> C[Next.js + Supabase + Stripe]
    B -- NO --> D{¿Escala masiva > 100K users?}
    D -- SÍ --> E[Considerar Infra-AWS + PostgreSQL Citus]
    D -- NO --> C

    C --> F{¿IA Generativa?}
    F -- SÍ --> G[Gemini 1.5 Pro + Vercel AI SDK]
    F -- NO --> H[Estandar Next.js]

    C --> I{¿Pagos Complejos / Marketplace?}
    I -- SÍ --> J[Stripe Connect]
    I -- NO --> K[Stripe Checkout]
    
    C --> L{¿Real-time?}
    L -- SÍ --> M[Supabase Channels / Realtime]
    L -- NO --> N[TanStack Query (Polling)]
```

## Referencia Rápida de Escenarios

| Escenario | Stack Sugerido por Levy | Por qué |
| :--- | :--- | :--- |
| **Startup / MVP** | **Next.js + Supabase + Vercel** | Máxima velocidad de iteración. |
| **Enterprise SaaS** | **Next.js + Supabase + Stripe Connect** | Multi-tenancy nativo con RLS. |
| **App de IA** | **SDK Vercel AI + Gemini + Supabase Vector** | Integración nativa con modelos de Google. |
| **Marketplace** | **Next.js + Stripe Connect + Supabase** | Manejo de pagos a terceros simplificado. |

---

### [⚠️] Alerta de Pérdida de Apalancamiento
Evitar a toda costa (en Fase 1):
- Microservicios separados.
- Bases de datos auto-gestionadas en EC2.
- Frameworks sin SSR (SEO es crítico en B2C).

---

*Última actualización estratégica: 2026-04-02*

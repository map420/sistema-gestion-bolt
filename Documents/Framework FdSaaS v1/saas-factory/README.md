# SaaS Factory v1

## 🏭 Orquestador de Agentes para Construcción de Productos SaaS

Una arquitectura completa de agentes especializados que coordinan el desarrollo end-to-end de productos SaaS, desde estrategia hasta lanzamiento.

---

## 📊 Estructura Maestra [V][C][M]

**[V] VISIÓN** — Agentes que definen y ejecutan  
**[C] CONTROL** — QA Auditor que valida calidad  
**[M] MEMORIA** — Contexto y decisiones persistentes

```
saas-factory/
├── .claude/              ← Orquestador principal [V]
│   ├── CLAUDE.md          (tabla de coordinación)
│   └── mcp.json           (configuración MCP)
│
├── agents/ (8 + QA)       ← Sub-agentes especializados
│   ├── product-strategist.md     [V] Define visión
│   ├── tech-architect.md         [V] Diseña architecture
│   ├── builder.md               [V] Implementa código
│   ├── ui-designer.md           [V] Crea interfaces
│   ├── payments.md              [V] Gestiona pagos
│   ├── data-agent.md            [V] Analytics + ETL
│   ├── researcher.md            [V] Insights + competitive
│   ├── launch-agent.md          [V] GTM + deployment
│   └── qa-auditor.md            [C] Control de calidad
│
├── commands/              ← 14× slash commands
│   └── README.md          (lista de comandos)
│
├── prompts/               ← Templates y session starters
│   └── README.md          (categorías de prompts)
│
├── templates/             ← Scaffolds B2B + AI
│   └── README.md          (boilerplates disponibles)
│
├── knowledge/             ← Base de conocimiento
│   ├── stack-estandar.md     (tech stack)
│   ├── stack-map.md          [V] Árbol de decisión
│   ├── decisions.md          [C] ADRs del proyecto
│   └── checklist-lanzamiento.md
│
├── hooks/                 [C] Pre/post validation
│   └── README.md
│
├── tests/                 [C] Criterios de aceptación
│   └── README.md
│
├── context/               [M] Estado persistente
│   ├── active-product.md     (producto en desarrollo)
│   ├── factory-registry.md   (índice de proyectos)
│   ├── session-log.md        [M] Historial vivo
│   └── archive/              (sesiones completadas)
│
├── .cursorrules           [C] Estándares en el editor
├── .env.example           (variables de entorno)
└── README.md              (este archivo)
```

---

## 🚀 Flujo de Trabajo Orquestado

```
NEW PRODUCT IDEA
    ↓
    [V] Product Strategist
    ├─ Market analysis
    ├─ User stories
    └─ Output: active-product.md
    ↓
    [C] QA Auditor validates scope
    ✓ Realistic timeline?
    ✓ Achievable with budget?
    ✓ Team capacity sufficient?
    ↓
    [V] Tech Architect
    ├─ Architecture design
    ├─ Stack decision (stack-map.md)
    └─ Output: decisions.md (ADRs)
    ↓
    [C] QA Auditor validates tech
    ✓ Stack in stack-estandar.md?
    ✓ Security baseline met?
    ✓ Cost projections OK?
    ↓
    [V × 6] Parallel agents execute
    ├─ Builder: Implementa features
    ├─ UI Designer: Componentes
    ├─ Payments: Setup Stripe
    ├─ Data Agent: Analytics
    ├─ Researcher: Competitive analysis
    └─ (Each updates session-log.md)
    ↓
    [C] QA Auditor validates each
    ├─ Code coverage ≥80%?
    ├─ Security scan clean?
    ├─ Compliance checklist passed?
    └─ (Logs to hooks/ pre-validation)
    ↓
    [V] Launch Agent
    ├─ GTM strategy
    ├─ Launch checklist
    └─ Deployment prep
    ↓
    [C] FINAL GATE: QA Auditor
    ✓ All systems operational?
    ✓ Monitoring + alerts ready?
    ✓ Rollback plan documented?
    ↓
    🚀 DEPLOY TO PRODUCTION
    ↓
    [M] Session archived to context/archive/
    ↓
    📊 Next sprint planning
```

---

## 🎯 Como Usar

### 1️⃣ Iniciar Nuevo Producto

```bash
# Copiar template según tipo
cp -r templates/b2b-saas-starter my-product

# Actualizar active-product.md con detalles
# Lanzar Product Strategist agent con prompts/product-kickoff.md
```

### 2️⃣ Ejecutar Sprint

```bash
# Usar slash command
/start-sprint

# Asignar tareas a agentes específicos
/assign-agent builder "Implement authentication"
/assign-agent designer "Create dashboard mockups"

# Trigger validaciones
/validate-scope      # QA Auditor checks constraints
/check-compliance    # PCI/SOC2 audit
```

### 3️⃣ Monitorear Progreso

- Revisar `context/session-log.md` en tiempo real
- Cada agente logea acciones + artifacts
- QA Auditor documenta todas las validaciones
- Decisiones arquitectónicas en `knowledge/decisions.md` (ADRs)

### 4️⃣ Lanzar Producto

```bash
# Usar Launch Agent
/deploy-staging      # Desplegar a staging
/health-check        # Verificar todos los sistemas
/generate-report     # Crear reporte ejecutivo

# Cuando todo está verde:
cd .claude
cat CLAUDE.md        # Revisar tabla maestra
# DEPLOY COMMAND AQUÍ
```

### 5️⃣ Archivar Sesión

```bash
/archive-session

# Mueve session-log.md a context/archive/session-[timestamp].md
# Limpia contexto para próximo sprint
```

---

## 📋 Los 9 Agentes

| Agent | Rol | Clasificación | Artifacts |
|-------|-----|---------------|-----------|
| **Product Strategist** | Define visión + roadmap | [V] Visión | `active-product.md` |
| **Tech Architect** | Diseña system + stack | [V] Visión | `architecture.md`, ADRs |
| **Builder** | Implementa features | [V] Visión | Código + tests |
| **UI Designer** | Crea componentes | [V] Visión | Figma + React TSX |
| **Payments** | Setup Stripe + billing | [V] Visión | API integrations |
| **Data Agent** | Analytics + ETL | [V] Visión | Dashboards + schemas |
| **Researcher** | Market insights | [V] Visión | Análisis competitivo |
| **Launch Agent** | GTM + deployment | [V] Visión | GTM plan + checklist |
| **QA Auditor** | Control + validación | [C] Control | Audit trail + gate reports |

---

## 🔧 Configuración Rápida

1. **Stack por defecto** (`stack-estandar.md`):
   - Frontend: React 19 + TypeScript + Tailwind
   - Backend: Node.js 20 + Fastify + PostgreSQL
   - Deployment: Vercel (frontend) + AWS ECS (backend)
   - Payments: Stripe

2. **Compliance incluida**:
   - PCI-DSS (Payments)
   - GDPR (Privacy)
   - SOC 2 Type II (Audit)

3. **Hooks Pre/Post**:
   - Validación automática antes de merge
   - Logging automático a audit trail
   - Alertas de bloqueadores

---

## 📚 Archivos Principales

### `.claude/CLAUDE.md`
Tabla maestra de coordinación [V][C][M] que describe el flujo orquestado.

### `knowledge/decisions.md`
Archivo de decisiones arquitectónicas (ADRs). Cada decision documentada aquí se convierte en principio de diseño.

### `context/session-log.md`
**ARCHIVO VIVO** — Se actualiza en tempo real durante el sprint. Contiene:
- Timeline de acciones
- Decisiones tomadas
- Bloqueadores
- Siguiente steps

### `.cursorrules`
Estándares de código vivos en el editor. Cursor/Cline lee automáticamente en el editor.

---

## 🎓 Para Tu Equipo

1. **PMs**: Trabaja con Product Strategist + QA Auditor
2. **Architects**: Actualiza `knowledge/stack-map.md` con decisiones
3. **Developers**: Revisa `.cursorrules` + `knowledge/decisions.md`
4. **Designers**: Mantén consistency con componentes en `templates/`
5. **DevOps**: Implementa hooks en `hooks/` para tu CI/CD

---

## 🔐 Seguridad

- Todos los secrets en `.env.example` (NUNCA commitear valores reales)
- Validación PCI-DSS incluida en `agents/payments.md`
- Compliance checklist automatizada mediante QA Auditor

---

## 📞 Próximos Pasos

- [ ] Personalizar `stack-estandar.md` con tu tech stack
- [ ] Copiar template base y customizar
- [ ] Configura MCP server en `.claude/mcp.json`
- [ ] Lanza Product Strategist con primer producto
- [ ] Documenta decisiones en `knowledge/decisions.md`

---

**SaaS Factory v1 — Construyendo productos SaaS con agentes coordinados.**

*Last updated: 2026-04-01*

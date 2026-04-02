# Prompt: Diseño de Esquema de Datos [V]

**Uso**: Convertir requerimientos de producto en un esquema de base de datos relacional robusto.
**Agente responsable**: 03-arquitecto-datos.md

---

## 🏗️ Estructura del Prompt

"Actúa como 03-arquitecto-datos de la SaaS Factory. Mi objetivo es transformar este Producto Brief en un esquema de PostgreSQL para Supabase.

### 📋 Restricciones Obligatorias (ADRs):
1. **Multi-tenancy**: Cada tabla de dominio debe incluir `organization_id: uuid`.
2. **Seguridad**: Definir políticas RLS (Row Level Security) para cada tabla.
3. **Naming**: Usar snake_case para tablas y columnas.
4. **Relaciones**: Definir llaves foráneas y cascadas explícitamente.

### 📂 Output Requerido:
1. Diagrama Entidad-Relación (Mermaid).
2. Script SQL de creación para Supabase.
3. Políticas RLS básicas de aislamiento por tenant.
4. Esquema de Prisma (si aplica).

### 🚀 Brief del Producto:
[PEGAR BRIEF AQUÍ]"

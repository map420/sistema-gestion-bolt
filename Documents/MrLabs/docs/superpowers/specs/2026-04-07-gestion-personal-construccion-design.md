# Gestión de personal — construcción

**Fecha:** 2026-04-07
**Estado:** Aprobado

---

## Resumen

App web para que un administrador gestione el personal de una empresa de servicios generales de construcción. Permite registrar trabajadores, anotar asistencia y actividades diarias, controlar pagos individuales y generar comprobantes y planillas en PDF. Sin servidor ni login — todo persiste en `localStorage`.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React 19 |
| Estilos | TailwindCSS |
| Íconos | Lucide Icons |
| PDF | html2pdf.js |
| Persistencia | localStorage (JSON) |
| Despliegue | Estático (Vercel / Netlify) |

---

## Arquitectura

App de una sola página (`SPA`) con sidebar de navegación fija a la izquierda y área de contenido a la derecha. Sin rutas del servidor — la sección activa se controla con estado local (`useState`).

```
App
├── Sidebar (navegación)
└── Main
    ├── Trabajadores
    ├── RegistroDiario
    ├── Pagos
    └── Reportes
```

### Persistencia

Un único objeto JSON en `localStorage` con clave `construapp_data`:

```json
{
  "trabajadores": [...],
  "registros": [...],
  "pagos": [...]
}
```

Un módulo `storage.ts` centraliza todas las lecturas y escrituras. Ningún componente accede a `localStorage` directamente.

---

## Módulos

### 1. Trabajadores

**Propósito:** Mantener el catálogo de personal.

**Datos por trabajador:**
- `id` — UUID generado al crear
- `nombre` — string
- `oficio` — string (ej. "Albañil", "Electricista")
- `tipoPago` — `"hora"` | `"dia"`
- `tarifa` — número (monto por hora o por día)
- `telefono` — string (opcional)
- `activo` — boolean

**UI:**
- Lista de trabajadores con nombre, oficio, tarifa y badge activo/inactivo
- Botón "Nuevo trabajador" abre un formulario inline o modal
- Editar y desactivar (no eliminar — preserva historial)

---

### 2. Registro diario

**Propósito:** Anotar quién trabajó cada día, qué hizo y cuánto tiempo.

**Datos por registro:**
- `id` — UUID
- `trabajadorId` — referencia
- `fecha` — `YYYY-MM-DD`
- `cantidad` — número (horas o días según `tipoPago` del trabajador)
- `actividad` — string descriptivo
- `montoCalculado` — `tarifa × cantidad`

**UI:**
- Selector de fecha (por defecto hoy, navegable con ← →)
- Lista de todos los trabajadores activos
- Toggle por trabajador: si trabajó, se expande para ingresar actividad y cantidad
- El monto se calcula automáticamente al ingresar cantidad
- Barra inferior: total del día + botón "Guardar registro"
- Un registro por trabajador por día (si ya existe, se carga para editar)

---

### 3. Pagos

**Propósito:** Ver el acumulado por trabajador en un período y registrar pagos realizados.

**Datos por pago:**
- `id` — UUID
- `trabajadorId` — referencia
- `fecha` — `YYYY-MM-DD`
- `monto` — número
- `periodo` — `{ desde: YYYY-MM-DD, hasta: YYYY-MM-DD }`
- `notas` — string (opcional)
- `folio` — número autoincremental

**UI:**
- Selector de período: Semana / Quincena / Personalizado
- Lista de trabajadores con:
  - Total devengado en el período (suma de registros)
  - Total ya pagado en el período
  - Saldo pendiente (devengado − pagado)
  - Badge: "Sin deuda" (verde) / "Pendiente" (rojo)
- Acciones por trabajador: Ver detalle · Registrar pago · Comprobante PDF

**Comprobante PDF:**
- Folio, fecha de emisión
- Nombre del trabajador y período
- Tabla con cada registro del período: fecha, actividad, días/horas, monto
- Total pagado
- Líneas de firma (trabajador y empleador)

---

### 4. Reportes

**Propósito:** Generar planilla general del período para ver el costo total de mano de obra.

**UI:**
- Selector de período igual al de Pagos
- Tabla con todos los trabajadores: nombre, oficio, días/horas totales, monto devengado, monto pagado, saldo
- Fila de totales al fondo
- Botón "Exportar planilla PDF" — genera un PDF con la tabla completa con encabezado de empresa

---

## Datos y flujo

```
Crear trabajador
      ↓
Registro diario (fecha + trabajador + actividad + cantidad)
      ↓
Pagos: acumula registros → registrar pago → genera comprobante PDF
      ↓
Reportes: planilla del período → exportar PDF
```

### Cálculo de saldo

```
saldo_pendiente = Σ(montoCalculado de registros en período) − Σ(montos de pagos en período)
```

Si `saldo_pendiente <= 0` → badge verde "Sin deuda". Si `> 0` → badge rojo "Pendiente".

---

## Generación de PDF

Se usa `html2pdf.js`. Cada PDF se genera renderizando un componente React oculto en el DOM y convirtiéndolo a PDF en el cliente. No requiere backend.

- **Comprobante individual:** componente `<ComprobanteTemplate>` con los datos del trabajador y período
- **Planilla general:** componente `<PlanillaTemplate>` con la tabla completa del período

---

## Estados de UI requeridos

| Situación | Comportamiento |
|---|---|
| Sin trabajadores | Empty state con botón "Agregar primer trabajador" |
| Día sin registros | Lista de trabajadores con todos los toggles en "No trabajó" |
| Registro ya existe | Al navegar a esa fecha, se cargan los datos para editar |
| Saldo en cero | Badge verde, botón "Registrar pago" deshabilitado |
| Sin registros en período | Totales en $0, planilla vacía con mensaje |

---

## Fuera de alcance

- Autenticación / multi-usuario
- Backend o base de datos
- Cálculo de impuestos o deducciones (INSS, IR, etc.)
- Gestión de proyectos/obras
- Notificaciones o recordatorios
- App móvil

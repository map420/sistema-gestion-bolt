---
name: product-strategist
description: Define el brief completo del producto con foco en que el MVP demuestre valor de negocio real y genere retención.
---

# 02 Estratega de Producto [V]

**Rol:** Construir el brief que convierte una idea refinada en un producto concreto listo para arquitectura.

El brief no es un documento de intenciones. Es el contrato de construcción.
Todo lo que está en IN se construye. Todo lo que está en OUT no existe hasta que haya evidencia de que se necesita.

---

## Principio Central del MVP

> El MVP no es el producto más pequeño posible. Es el producto más pequeño que demuestra el valor de negocio completo.

Un MVP que no demuestra valor de negocio no es un MVP — es un prototipo. Y los prototipos no generan revenue ni retención.

**Un MVP válido cumple las tres capas:**

| Capa | Qué es | Por qué importa |
|---|---|---|
| **1. Valor core** | La función principal que resuelve el problema | Sin esto no hay producto |
| **2. Retención** | La razón por la que el usuario vuelve la semana/mes siguiente | Sin esto no hay negocio — es un one-shot |
| **3. Diferenciación percibida** | Por qué el usuario paga en vez de usar una alternativa gratuita | Sin esto el precio no se sostiene |

Las tres capas deben estar presentes en el MVP scope. Si falta alguna, el MVP está incompleto.

---

## Estructura del Brief

### 1. Identidad

```
Nombre: [Nombre del producto]
Tagline: [Una línea — qué hace, para quién, qué resultado]
Estado: BRIEF EN CONSTRUCCIÓN / APROBADO / EN CONSTRUCCIÓN / PRODUCCIÓN
```

---

### 2. Problema y Usuario

**Problema:**
- ¿Qué dolor específico resuelve?
- ¿Es vitamina (nice-to-have) o painkiller (need-to-have)?
- ¿Cuánto le cuesta al usuario NO tener esto resuelto?

**Usuario objetivo (perfil exacto):**
- Quién es (demografía, contexto, comportamiento)
- Qué hace hoy para resolver el problema (herramientas actuales, workarounds)
- Por qué cambiaría a este producto

---

### 3. Solución y Aha Moment

**Flujo del usuario (de registro a valor):**
Describir el camino exacto que recorre el usuario desde que entra por primera vez hasta que obtiene el valor prometido. Debe poder leerse como una historia.

```
Paso 1 → Paso 2 → ... → [AHA MOMENT] → Paso N
```

**Aha moment:** El momento exacto donde el usuario entiende el valor. Debe ocurrir en la primera sesión, idealmente en menos de 5 minutos.

---

### 4. MVP Scope

#### Las tres capas — definición explícita

**Capa 1 — Valor core:**
[El feature o flujo que entrega la promesa principal del producto]

**Capa 2 — Retención:**
[Qué trae al usuario de vuelta. Puede ser: contenido nuevo, progreso visible, hábito semanal, notificación, actualización del plan, etc.]

**Capa 3 — Diferenciación percibida:**
[Por qué el usuario paga en vez de usar ChatGPT, Google, o cualquier alternativa gratuita. Debe ser experiencia, no solo output.]

#### Features IN (construir en v1)

Listar solo lo que contribuye directamente a las tres capas. Cada feature lleva su capa asignada.

| Feature | Capa | Por qué está en el MVP |
|---|---|---|
| [feature] | [1/2/3] | [razón] |

#### Features OUT (no construir en v1)

Listar explícitamente con razón. Sin esta lista, el scope crece solo.

| Feature | Por qué no en MVP |
|---|---|
| [feature] | [razón] |

---

### 5. Modelo de Negocio

**Precios:**
| Tier | Precio | Qué incluye |
|---|---|---|
| Free | $0 | [lead magnet — suficiente para mostrar valor, insuficiente para satisfacerlo] |
| Pro | $X/mes | [acceso completo a las tres capas] |

**Camino a $10K MRR:**
- Precio Pro × N usuarios = $10K MRR → N = [número]
- Canal de adquisición para los primeros 10 usuarios: [canal concreto]

**Cobro en MVP:**
MVP usa cobro manual (transferencia, Yape, PayPal). Sin integración de pagos automática.
Campo `isPro` (o equivalente) en DB, activado manualmente por Moisés.
Stripe se integra post-MVP cuando hay ≥ 20 usuarios Pro con retención de mes 2 comprobada.

---

### 6. Stack

Referencia: `knowledge/stack-estandar.md`

| Capa | Herramienta | Versión |
|---|---|---|
| Framework | Next.js | 15.x |
| Auth + DB | Supabase | latest |
| ORM | Prisma | 5.x |
| IA (si aplica) | [modelo] | [versión] |
| Estilos | Tailwind CSS | 3.x |
| Deploy | Vercel | latest |
| Pagos (post-MVP) | Stripe | — |

---

### 7. Métricas de Éxito del MVP

Definir qué debe pasar para declarar el MVP exitoso. Sin estas métricas, no hay forma de saber si funcionó.

| Métrica | Target | Qué indica |
|---|---|---|
| [métrica] | [número] | [por qué importa] |

**Señal de MVP exitoso:** [Una condición concreta que activa el paso a crecimiento — ej. "20 usuarios Pro que renovaron mes 2"]

---

### 8. Riesgos

Máximo 3. Solo los que pueden matar el producto si no se atienden en los primeros 90 días.

1. [Riesgo] — [Señal de alerta temprana]
2. [Riesgo] — [Señal de alerta temprana]
3. [Riesgo] — [Señal de alerta temprana]

---

### 9. Decisiones Clave

Registrar por qué se eligió cada cosa importante. Esto previene revisitar las mismas decisiones en sesiones futuras.

| Decisión | Por qué |
|---|---|
| [qué se decidió] | [razón] |

---

## Criterios de Aprobación del Brief

El brief no está aprobado hasta que Levy y Moisés confirmen:

- [ ] Las tres capas del MVP están definidas explícitamente
- [ ] El aha moment ocurre en la primera sesión (< 5 min)
- [ ] Hay un mecanismo de retención claro (razón para volver)
- [ ] El usuario tiene una razón concreta para pagar vs usar alternativa gratuita
- [ ] El camino a $10K MRR es calculable con el precio definido
- [ ] Los features OUT están listados con razón explícita
- [ ] El cobro en MVP es manual — sin Stripe hasta retención validada

---

*Skill Classification: [V] Velocidad*
*Última actualización: 2026-04-02*

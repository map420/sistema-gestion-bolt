# /start-sprint [M][V]

Inicia un nuevo sprint para el producto activo.

## Uso
```
start-sprint
```

## Protocolo

1. [M] Leer `context/active-product.md` → producto y fase actual
2. [M] Leer `context/session-log.md` → últimas decisiones y blockers
3. [V] Proponer objetivo del sprint (1 entregable concreto)
4. [V] Definir tareas en orden de ejecución con agente responsable
5. [M] Registrar inicio de sprint en `session-log.md`

## Output esperado

```
Sprint iniciado: <Producto> — <Fecha>
Objetivo: <entregable concreto>
Tareas:
  1. [Agente] Tarea
  2. [Agente] Tarea
  ...
```

# /archive-session [M]

Cierra el sprint actual y archiva el estado del producto.

## Uso
```
archive-session
```

## Protocolo

1. [M] Leer `context/session-log.md` → decisiones y progreso actual
2. [M] Copiar a `context/archive/session-<product>-<YYYY-MM-DD>.md`
3. [M] Actualizar `context/sessions/<product>-session-log.md` con el estado final
4. [M] Actualizar `context/active-product.md` con la fase actual
5. [M] Registrar nuevas ADRs en `knowledge/decisions.md` si las hay
6. [V] Reportar resumen: qué se completó, qué queda pendiente, próximo paso

## Output esperado

```
[M] Sesión archivada: <product>-<date>
Completado: X tareas
Pendiente: Y tareas
Próximo sprint: <recomendación>
```

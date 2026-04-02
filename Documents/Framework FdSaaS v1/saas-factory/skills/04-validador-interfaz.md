---
name: ui-designer
description: Create user interfaces, design systems, interactions, WCAG accessibility, and React TSX components
---

# 04 Validador de Interfaz [V] — Sistema de Diseño Premium

**Insumo Maestro**: `products/<producto>/diseno.md`
**Role**: Auditor de calidad visual y arquitecto de UX bajo estándares de Apple y Vercel.

## Cuándo se activa
Se activa automáticamente cuando `diseno.md` es actualizado con el output de Stitch 2.0.
El contenido ya no debe contener el placeholder "ESPERANDO OUTPUT DE STITCH 2.0".

## Flujo completo del Paso 05

```
post-03-arquitecto.js genera:
  → mockup-prompt.md  (Moisés pega en Stitch 2.0)
  → diseno.md         (estructura vacía lista para recibir output)
       ↓
Moisés pega el output de Stitch 2.0 en diseno.md
       ↓
pre-04-validador.js valida diseno.md automáticamente
       ↓
✅ Aprobado → avanzar a Paso 05.5 Billing
❌ Bloqueado → Moisés corrige y repega
```

## Flujo de Validación
1. Leer `diseno.md` del producto activo
2. Verificar que contiene output real de Stitch (no placeholder)
3. Cruzar contra `knowledge/estandar-diseno.md`
4. Ejecutar `pre-04-validador.js` — gates de pantallas, aha moment, consistencia
5. Veredicto: ✅ Aprobado o ❌ Bloqueado con razones específicas

## Principios Base (El "Efecto WOW")
1. **Simplicidad de Apple**: Si no es esencial, es ruido. Priorizamos el espacio en blanco.
2. **Claridad de Vercel**: El diseño debe verse "desarrollado por ingenieros con ojo de diseño". Bordes precisos, degradados sutiles, micro-animaciones rápidas.
3. **Estructura de Notion**: La interfaz debe sentirse como una herramienta, no como una web estática.

## Estándares UI (Atomics)
- **Tipografía**: Outfit o Inter (moderna, legible, profesional).
- **Color**: Fondos oscuros (glassmorphism) o blancos puros con acentos en colores HSL seleccionados.
- **Grillas**: Uso estricto de escala de 8px para consistencia en espaciado.
- **Micro-interacciones**: Hover sutil para cada elemento interactivo.

## UX Audit Checklist (Filtro de Calidad)
- [ ] **Aha Moment**: ¿El usuario entiende el valor en menos de 60 segundos?
- [ ] **Jerarquía de Acción**: ¿Hay un solo botón principal por pantalla?
- [ ] **Accesibilidad**: ¿Cumple con WCAG AA en contraste y legibilidad?
- [ ] **Mobile First**: ¿El diseño es natural en dispositivos móviles?
- [ ] **Consistencia**: ¿Los iconos y botones son idénticos en toda la aplicación?

## Output Artifacts
- Component library (Figma)
- React components (TSX)
- CSS modules
- Accessibility audit report

---

*Skill Classification: [V] Vision*

# Sistema de Diseño Premium — SaaS Factory

Este documento es la fuente de verdad para el Skill `04-validador-interfaz.md`.

## Principios Base (El "Efecto WOW")
1. **Simplicidad de Apple**: Si no es esencial, es ruido. Priorizamos el espacio en blanco sobre el amontonamiento de funciones.
2. **Claridad de Vercel**: El diseño debe verse "desarrollado por ingenieros con ojo de diseño". Bordes precisos (1px), degradados sutiles y micro-animaciones de <200ms.
3. **Estructura de Notion**: La interfaz debe sentirse como una herramienta ejecutable, con tipografía clara y jerarquía lógica.

## Estándares UI (Atomics)
- **Tipografía**: Outfit (Headings) e Inter (Body).
- **Color**: 
  - Dark Mode: #000000 (OLED) con superficies en #0A0A0A + Glassmorphism.
  - Acentos: HSL consistentes (Brand colors).
- **Grillas**: Escala estricta de 8px (2, 4, 8, 16, 24, 32...).
- **Componentes**: Bordes redondeados sutiles (8px a 12px max).

## UX Audit Checklist (Filtro de Calidad)
- [ ] **Aha Moment**: ¿El valor principal se entiende en segundos?
- [ ] **Fricción**: ¿Podemos eliminar un click o un campo extra?
- [ ] **Accesibilidad**: Contraste 4.5:1 minimo (WCAG AA).
- [ ] **Mobile-First**: Debe ser usable con una sola mano.
- [ ] **Feedback**: Cada acción del usuario debe tener una respuesta visual inmediata.

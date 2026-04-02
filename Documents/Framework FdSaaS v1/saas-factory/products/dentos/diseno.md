# Design System Specification: Clinical Precision & Digital Sophistication

## 1. Overview & Creative North Star: "The Digital Surgeon"
This design system is anchored by a Creative North Star we call **"The Digital Surgeon."** Much like a modern medical facility, the interface must feel sterile, high-precision, and hyper-organized, yet possess the cinematic depth of a high-end editorial platform.

We are moving away from the "friendly SaaS" aesthetic. There are no playful rounds or soft pastels here. Instead, we utilize **Brutalistic Minimalism**: a philosophy that relies on extreme contrast, sharp 0px corners, and massive typographic scales to command authority. By stripping away decorative lines and relying on tonal shifts and "active" light, we create a tool that feels less like a website and more like a high-performance instrument.

---

## 2. Colors: Tonal Architecture
The palette is rooted in the "Cold Netflix" aesthetic—deep, immersive blacks that allow data and primary actions to "pierce" through the darkness.

### Core Palette
* **Surface (Primary):** `#131313` (The void)
* **Primary (Accent):** `#3cd7ff` (Electric Cyan) — Used exclusively for critical actions and "Aha" data points.
* **Tertiary (Success):** `#3de273` (Emerald) — Reserved for "Confirmed" states and growth metrics.
* **On-Surface:** `#e2e2e2` — A crisp, off-white to prevent eye strain while maintaining high contrast.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** To separate the sidebar from the main stage, or a table from a header, do not draw a line. Instead, shift the background.
* *Example:* Use `surface_container_low` (#1b1b1b) for the background and `surface_container` (#1f1f1f) for the card. The "edge" is created by the color shift, not a stroke.

### The "Glass & Gradient" Rule
To add soul to the "cold" aesthetic, primary CTAs should utilize a subtle linear gradient from `primary` (#3cd7ff) to `primary_container` (#009ebe). For floating overlays or navigation bars, use **Glassmorphism**: `surface_container_highest` (#353535) at 70% opacity with a `20px` backdrop-blur.

---

## 3. Typography: Editorial Authority
We use **Inter** as a variable font to create a rigid, hierarchical structure. Typography isn’t just for reading; it’s for navigating.

* **Display (Large Scale):** `display-lg` (3.5rem) / Bold. Used for "Aha" metrics like "98% Confirmation Rate."
* **Headlines:** `headline-lg` (2rem) / Bold. Used for page titles. The high contrast between `headline-lg` and `body-md` creates an editorial, premium feel.
* **Data Labels:** `label-sm` (0.6875rem) / All-Caps / Medium weight. Used for table headers and metadata.
* **Hierarchy Note:** Always pair a `display` value with a `secondary` color text to ensure the most important information is the brightest thing on the screen.

---

## 4. Elevation & Depth: Tonal Layering
In a system with `0px` border radius, traditional shadows can look messy. We use **Tonal Layering** to define the Z-axis.

* **The Layering Principle:**
* **Level 0 (Base):** `surface` (#131313)
* **Level 1 (Sections):** `surface_container_low` (#1b1b1b)
* **Level 2 (Cards/Modules):** `surface_container` (#1f1f1f)
* **Level 3 (Popovers/Modals):** `surface_container_highest` (#353535)
* **The "Ghost Border" Fallback:** If high-density data requires visual separation, use the `outline_variant` (#414755) at **15% opacity**. It should be felt, not seen.
* **Ambient Shadows:** For modals only. Use a massive blur (40px-60px) with `0.08` opacity using the `on_surface` color as the shadow tint. This mimics a soft glow rather than a heavy drop-shadow.

---

## 5. Components: Sharp Precision
All components follow the **0px Radius** mandate.

* **Primary Buttons:** High-contrast `primary` (#3cd7ff) background with `on_primary` (#003642) text. No rounding. Hover state shifts to `primary_fixed_dim`.
* **Ghost Buttons:** Transparent background with an `outline` (#8b90a0) at 30% opacity. On hover, the opacity shifts to 100%. This maintains the "Cold" aesthetic.
* **Status Badges (Appointment States):**
* *Confirmed:* Subtle `tertiary_container` background with `tertiary` text.
* *Canceled:* `error_container` background with `error` text.
* *Pending:* `secondary_container` background with `secondary` text.
* **WhatsApp Status Indicator:** A pulsing `2px` ring of `tertiary` (#3de273) around a user's avatar or icon, indicating an active automation sequence.
* **Input Fields:** Use `surface_container_highest` for the track. No borders. On focus, a `1px` bottom-border of `primary` (#3cd7ff) animates in.
* **Cards & Lists:** Forbid dividers. Use `spacing-8` (1.75rem) of vertical white space to separate list items. Content is grouped by proximity and subtle background shifts.

---

## 6. Do’s and Don’ts

### Do:
* **Embrace Negative Space:** If you think there’s enough room, add 20% more. Space is luxury.
* **Use Intentional Asymmetry:** Align metrics to the far right and labels to the far left to create a wide, cinematic tension.
* **Prioritize Data:** Large, bold typography for numbers; smaller, muted typography for labels.

### Don’t:
* **No Rounded Corners:** Ever. Not even 2px. The "sharpness" is the brand.
* **No Generic Shadows:** Avoid the standard `0 4px 10px rgba(0,0,0,0.5)`. Use the tonal layering mentioned in Section 4.
* **No Saturation Overload:** Keep the background dead neutral. Only the `primary` and `tertiary` tokens should carry hue.
* **No Visual Noise:** If a divider isn't strictly necessary for legibility, remove it. Use the spacing scale (`2`, `4`, `8`, `12`) to define groups.
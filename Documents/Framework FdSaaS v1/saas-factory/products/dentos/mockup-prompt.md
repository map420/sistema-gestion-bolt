# Mockup Prompt — DentOS

*Generado por: mockup-generator.md + respuestas de diseño*
*Herramienta destino: Stitch 2.0*
*Fecha: 2026-04-01*

---

## Referencias de diseño

| Pregunta | Respuesta |
|----------|-----------|
| Estilo visual | Minimalista y frío |
| App de referencia | Netflix |
| Sensación del usuario | Moderna y confiable |

---

## Prompt para Stitch 2.0

Copia y pega el siguiente texto directamente en Stitch 2.0:

```
Design a web app mockup for DentOS.

## What this app does
DentOS automatically sends WhatsApp reminders to dental patients before their appointments,
eliminating no-shows for independent dental clinics.
A dentist registers their clinic, loads their appointments, and DentOS handles all the
confirmation follow-up — no manual calls, no missed patients.
Target user: Owner of a small independent dental clinic in Peru (1-3 dentists, 100-300 appointments/month).

## Design direction
Style: Minimalist and cold — clean surfaces, strong contrast, no decoration noise.
Reference: Netflix — confident use of dark backgrounds, bold typography as hierarchy,
content-first layout, everything feels premium without being complicated.
First impression: "This is modern and trustworthy." The dentist should feel this tool
is more sophisticated than anything they've used before, yet instantly understandable.

Use these as creative direction — interpret freely. Prioritize clarity and confidence.

## How the app works (UX flow)

The user goes through this journey:

1. **Register / Login**
   Entry point. User creates an account or logs in with email and password.
   Leads to: Onboarding (first time) or Dashboard (returning user).

2. **Onboarding (3 steps)**
   One-time setup before accessing the app.
   - Step 1: Clinic info — name, city, contact phone
   - Step 2: Connect WhatsApp Business number — input number, verify connection
   - Step 3: Add first appointment — patient name, phone, dentist, date/time
   Progress indicator visible across all 3 steps.
   After step 3: enters Dashboard.

3. **Dashboard**
   Main screen. The dentist's morning view — what happened and what's coming.
   Key information:
   - Appointments confirmed today
   - No-shows avoided this week
   - Estimated revenue recovered this month
   - Appointments still pending confirmation
   Primary actions: go to Agenda, add new appointment.

4. **Agenda**
   Full appointment list. Core working screen.
   User can: filter by Today / This week / All, search by patient name,
   see WhatsApp reminder status per appointment, add new appointment.
   Each appointment shows: patient, dentist, date/time, confirmation status,
   whether WhatsApp was sent/delivered/read.
   Statuses: Pending, Reminder sent, Confirmed, Canceled, Completed, No-show.

5. **New Appointment**
   Form to register a new appointment.
   Fields: patient (search existing or create new), dentist, date, time, optional reason.
   After saving: back to Agenda with new appointment visible.

6. **Patients**
   Full patient directory.
   Shows: name, phone, last appointment, total appointments, no-show history.
   Click on a patient: see their full appointment history.

7. **Settings**
   Clinic configuration.
   Sections: clinic data, WhatsApp connection status, dentist list, billing plan and usage.

## Component integration

- Sidebar (persistent across all dashboard screens):
  Navigation to Dashboard, Agenda, Patients, Settings.
  Shows current billing plan and upgrade prompt at the bottom.

- Appointment row/card:
  Reused in Dashboard (today's snapshot) and Agenda (full list).
  Same component, same status indicators — consistent everywhere.

- Status badge:
  One consistent visual system for appointment states across all screens.

- WhatsApp indicator:
  Visible on every appointment — shows if reminder was sent, delivered, or read.
  This is a differentiating UI element — make it feel clear and meaningful.

- Revenue recovered metric:
  The most important number in the app. Should feel like a reward every time the
  dentist sees it. This is what justifies the subscription.

## The "aha moment" to highlight
A dentist opens DentOS Monday morning.
In under 5 seconds they see: 3 appointments confirmed for today, 2 no-shows avoided
last week, $160 recovered this month.
Design this moment to feel satisfying and undeniable.
This is the screen that makes them renew every month.

## Language
Spanish. Realistic dummy data: Spanish names, Peruvian phone numbers (+51 956 XXX XXX),
cities like Ica and Lima, dentist names like "Dr. García" or "Dra. Medina".

## Output
- All 7 screens
- Desktop-first (1280px)
- Consistent components and visual language across all screens
- Present the app as a coherent product, not isolated screens
```

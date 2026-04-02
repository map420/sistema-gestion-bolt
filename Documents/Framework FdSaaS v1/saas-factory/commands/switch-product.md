# /switch-product [M][V]

Switch the active product context without losing session history.

## Usage

```
/switch-product <product-name>
```

**Example:**
```
/switch-product DentOS
/switch-product Nutricionista
```

## What this command does

1. [M] Archive current `session-log.md` → `context/archive/session-<product>-<date>.md`
2. [M] Save current `active-product.md` → `context/archive/active-<product>-<date>.md`
3. [M] Load target product brief from `products/<product>/brief.md`
4. [M] Load or create `context/sessions/<product>-session-log.md` as the new `session-log.md`
5. [M] Update `active-product.md` with target product data
6. [V] Report new active context: product, phase, last 3 decisions, next step

## Switch Protocol (Levy executes this)

### Step 1 — Archive current state
- Copy `context/session-log.md` → `context/archive/session-<current-product>-<YYYY-MM-DD>.md`
- Copy `context/active-product.md` → `context/archive/active-<current-product>-<YYYY-MM-DD>.md`

### Step 2 — Load target product
- Read `products/<target>/brief.md`
- Check if `context/sessions/<target>-session-log.md` exists
  - YES → load it as the new session-log
  - NO → create a new session-log for that product

### Step 3 — Update active files
- Overwrite `context/active-product.md` with target product data
- Overwrite `context/session-log.md` with target product session

### Step 4 — Report
```
[M] Switched to: <Product Name>
Phase: <current phase>
Last decisions: <top 3 from session-log>
Next step: <recommended action>
Active since: <date>
```

## Supported Products

List from `context/factory-registry.md` — any product with status PLANNING or higher.

## Rules

- Never switch without archiving first. Context is never lost.
- If target product has no brief, stop and alert: "No brief found for <product>. Run /idea-refiner first."
- Update `context/factory-registry.md` to reflect the new active product after switch.
- One active product at a time. No exceptions.

---

*Command type: [M] Memory + [V] Velocity*
*Last updated: 2026-04-01*

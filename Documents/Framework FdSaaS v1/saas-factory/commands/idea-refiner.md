# /idea-refiner

Activate the Idea Refiner skill to validate and refine a raw business idea.

## What it does

Runs a structured 5-stage analysis on any business idea:
1. Understand the raw idea
2. Validate the market and problem
3. Define the target user with precision
4. Define the MVP (and what NOT to build)
5. Evaluate the business model and path to $10K MRR

Outputs a scored report with the best angle, three scope cuts, next step, and honest warnings.

## Usage

```
/idea-refiner [idea]
```

**Examples:**
```
/idea-refiner una app para clínicas dentales
/idea-refiner marketplace de freelancers para startups
/idea-refiner herramienta de facturación para autónomos
```

If no idea is provided, Levy will ask for it.

## Skill file

`saas-factory/skills/01-refinador-negocio.md`

## Behavior

On invocation, Levy reads `saas-factory/skills/01-refinador-negocio.md` and runs the full refinement sequence.
Results are conversational — no file is written unless Moisés confirms the idea as a product,
at which case a brief is created in `products/<name>/brief.md` and the registry is updated.

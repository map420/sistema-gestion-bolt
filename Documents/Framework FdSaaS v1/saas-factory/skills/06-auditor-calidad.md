---
name: qa-auditor
description: Cross-functional validation, quality assurance, compliance audit, inter-skill dependencies, and deployment sign-off
---

# QA Auditor Skill [C]

**Role**: Cross-functional validation and quality assurance orchestration

## Responsabilidades

- Validate scope & constraints from each skill
- Enforce quality gates across pipeline
- Audit compliance & security standards
- Identify inter-skill dependencies
- Final sign-off before deployment

## Validation Gates

| Skill | Gate | Criteria |
|-------|------|----------|
| Strategist | Scope | Market size, timeline, team capacity |
| Architect | Tech | Stack compatibility, security, cost |
| Builder | Code | Tests ≥80%, linting, security scan |
| UI Designer | Design | WCAG AA, responsive, brand consistency |
| Payments | Security | PCI-DSS, encryption, audit trail |
| Data | Quality | Schema valid, no nulls, lineage clear |
| Researcher | Evidence | Sources credible, data current |
| Launch | Readiness | All systems operational, alerts configured |

## Audit Trail

All validations logged to:
- `context/audit-trail.json` (timestamped)
- `hooks/pre-gate-logs.md` (rejections + remediation)

## Critical Decisions

Gate rejections require:
1. Auditor documents reason + evidence
2. Skill owner responds with remediation plan
3. Auditor re-validates or escalates to engineering lead

## Output Artifacts

- Audit report with sign-off
- Gate validation matrix
- Compliance checklist (SOC 2, privacy)
- Deployment readiness report

---

*Skill Classification: [C] Control / Quality*

# Hooks [C] NUEVO

Pre/post validation hooks by agent.

## Hook Execution Flow

```
Agent completes deliverable
    ↓
pre-{agent}-hook.js → Validate constraints
    ↓
If valid: ✓ Continue
If invalid: ✗ Reject + notify Agent + QA Auditor
    ↓
post-{agent}-hook.js → Log to audit trail
    ↓
Update context/session-log.md
```

## Available Hooks

| Hook | Purpose |
|------|---------|
| `pre-strategist.js` | Validate market assumptions, timeline realism |
| `pre-architect.js` | Check tech stack compatibility, security baseline |
| `pre-builder.js` | Enforce test coverage ≥80%, linting clean |
| `pre-designer.js` | Check WCAG AA compliance, mobile responsive |
| `pre-payments.js` | Verify PCI compliance, encryption enabled |
| `pre-data.js` | Validate schema, data lineage documented |
| `pre-researcher.js` | Check source credibility, data freshness |
| `pre-launch.js` | Verify all systems operational, alerts configured |

## Hook Template

```javascript
// hooks/pre-{agent}.js
module.exports = async (context, deliverable) => {
  const errors = [];
  
  // Validation logic
  if (!deliverable.spec) {
    errors.push('Missing specification');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true };
};
```

---

*Maintained by: QA Auditor [C]*

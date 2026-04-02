# Acceptance Tests [C] NUEVO

Quality criteria and acceptance tests by agent.

## Test Categories

### Builder: Code Quality

```gherkin
Scenario: Code passes quality gates
  Given a pull request is submitted
  When CI/CD pipeline runs
  Then unit tests must pass with ≥80% coverage
  And linting must be clean
  And security scan must find 0 critical vulnerabilities
```

### Payments: Transaction Safety

```gherkin
Scenario: Payment processed securely
  Given a customer subscribes to plan
  When Stripe webhook is received
  Then transaction is logged to audit trail
  And customer sees confirmation within 2 seconds
  And no card data is stored locally
```

### UI Designer: Accessibility

```gherkin
Scenario: Component is accessible
  Given a new component is created
  When axe DevTools scan runs
  Then it must have 0 violations
  And color contrast must be ≥4.5:1
  And keyboard navigation must work
```

### Launch Agent: Deployment Readiness

```gherkin
Scenario: Production ready
  Given launch checklist items
  When all items are checked
  Then load test passes (100K req/min)
  And rollback plan is documented
  And monitoring alerts are configured
```

## Acceptance Criteria Template

```markdown
## Feature: [Name]

### AC1: User can do X
- [ ] Given: [precondition]
- [ ] When: [action]
- [ ] Then: [expected result]

### AC2: Error handling
- [ ] Given: [error scenario]
- [ ] When: [action]
- [ ] Then: [error message displayed]
```

---

*Maintained by: QA Auditor [C]*

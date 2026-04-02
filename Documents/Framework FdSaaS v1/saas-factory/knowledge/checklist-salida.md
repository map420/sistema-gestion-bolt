# Launch Checklist

Pre-deployment verification (Launch Agent responsibility).

## 4 Weeks Before

- [ ] Product spec finalized (Product Strategist)
- [ ] Architecture design reviewed (Tech Architect)
- [ ] Tech debt inventory completed
- [ ] Security audit scheduled
- [ ] Budget approved & allocated
- [ ] Team roles defined

## 2 Weeks Before

- [ ] Code freeze date set
- [ ] Staging environment stable
- [ ] Beta user group identified
- [ ] Support docs drafted
- [ ] Monitoring/alerting configured
- [ ] Rollback plan documented

## 1 Week Before

- [ ] All unit tests passing (≥80% coverage)
- [ ] Integration tests green
- [ ] Load testing completed (100K req/min)
- [ ] Security scan clean (Snyk, OWASP)
- [ ] Compliance audit passed
- [ ] Database migrations tested

## 1 Day Before

- [ ] All systems checked (health-check endpoint)
- [ ] DNS records verified
- [ ] SSL certificates valid
- [ ] CDN cache flushed
- [ ] Deployment scripts dry-run successful
- [ ] Team on-call roster assigned

## Launch Day (T-0)

- [ ] Production database backup created
- [ ] Blue-green deployment ready
- [ ] Monitoring dashboards live
- [ ] Support escalation process activated
- [ ] **DEPLOY**
- [ ] Smoke tests pass
- [ ] Analytics recording events
- [ ] Customer communication sent

## Post-Launch (T+1 to T+7)

- [ ] Daily check-ins with team
- [ ] Error rate < 0.1%
- [ ] No critical bugs report
- [ ] Customer feedback collected
- [ ] Retrospective scheduled
- [ ] Success metrics tracking
- [ ] Archive session to `context/archive/`

---

*Agent: Launch Agent [V]*  
*QA Gate: Final sign-off by QA Auditor [C]*

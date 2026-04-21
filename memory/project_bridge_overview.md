---
name: PROJECT BRIDGE Overview
description: Hardship assessment platform for UK utilities — 7 epics, customer + admin flows, 37 UI journeys
type: project
---

## What is PROJECT BRIDGE?

A platform that helps UK utility companies identify customers struggling with bills and create fair, sustainable payment plans quickly. Prevents wrongful disconnections while recovering arrears.

**Value Proposition:**
- **Customers:** Get fair payment plan in minutes (not days), understand affordability, access support services
- **Utilities:** Reduce disconnections, recover arrears, meet FCA/Ofgem regulations, automate routine decisions
- **Officers:** Automated routine work, clear context for decisions, flexibility to override, audit trail for protection

## 7 Epics in Scope

1. **Bank Connection & Detection** — Customer connects bank account via OAuth, system auto-detects hardship
2. **Assessment & Recommendations** — Customer sees financial breakdown, chooses from 3 payment plans, discovers support services
3. **Payment Plan Management** — Customer accepts plan, gets reminders, can reschedule missed payments, reassessed every 6 months
4. **Admin Queue & Management** — Officers see cases needing review, review case details, modify plans, escalate complex cases
5. **Performance & Compliance** — Managers monitor team KPIs, compliance officers audit for fairness/discrimination, executives see ROI
6. **Hardship Policy Configuration** — Policy managers set affordability thresholds, vulnerability rules, manual review triggers
7. **Vulnerable Customer Protection** — System identifies PSR customers, applies no-disconnection guarantees, offers priority support

## 37 UI Screens Total

**Status:** 7 mockups created, 30 still needed

**By Phase:**
- **Phase 1 (MVP):** 5 screens — Assessment Overview, Payment Plan Options, Plan Acceptance, Case Review, Modify Plan
- **Phase 2 (Core):** ~12 screens — Assessment tabs, payment portal, manager/compliance dashboards
- **Phase 3 (Supporting):** ~15 screens — Home, missed payment handling, config, PSR protection

## Key Design Principles

- **Plain English** everywhere (not legal jargon)
- **Transparency** (customers understand why they're in hardship)
- **Fairness** (consistent decisions, documented overrides, discrimination detection)
- **Flexibility** (officers can modify for edge cases, customers can reschedule)
- **Empathy** (tone is supportive, not threatening)
- **Compliance-ready** (100% audit trail, regulatory reporting)

## Technical Notes

- Follows Claude.ai design system (CSS variables, light/dark mode)
- OAuth for bank connection (read-only access via Tink or similar provider)
- 6-month reassessment cycles
- Real-time queue management & KPI dashboards
- GDPR-compliant data handling (3-year retention)

## Regulatory Context

**FCA (Financial Conduct Authority)**
- Requires documented affordability assessments
- All decisions must show ability to pay
- Complaints & appeals tracked
- No unfair treatment of vulnerable customers

**Ofgem (Utilities Regulator)**
- PSR (Priority Services Register) protection required
- Medical equipment customers = no disconnection guarantee
- Vulnerable customer protections mandatory
- Hardship process must be fair, documented, accessible

---
name: BRIDGE Terminology & Acronyms
description: Full glossary of terms used in the hardship assessment platform
type: reference
---

## Key Business Terms

| Term | Definition | Context |
|------|-----------|---------|
| **Assessment** | Automated financial analysis to determine hardship level | Core feature — run after bank data collected |
| **Hardship** | Customer's bill is unaffordable relative to disposable income | Triggers payment plan offer |
| **Hardship Levels** | SEVERE (>25%), MODERATE (10-25%), LOW (<10%), NONE | Based on bill as % of disposable income |
| **Payment Plan** | Repayment schedule for arrears (typically 12-36 months) | Offered in 3 options: Conservative, Balanced, Aggressive |
| **Sustainability Score** | HIGH/MEDIUM/LOW rating of plan feasibility | Based on remaining disposable income after plan payment |
| **Disposable Income** | Income remaining after essential expenses (rent, food, transport, utilities) | Used to calculate affordability |
| **Arrears** | Outstanding utility bill debt owed by customer | Amount that payment plan repays |
| **Disconnection** | Cutting off utility service (gas/electricity) | What Bridge prevents through payment plans |
| **Missed Payment** | Customer fails to pay on due date | Triggers empathetic check-in (not automatic escalation) |
| **Escalation** | Sending case to senior officer/team | Used for complex cases, manual review needed |
| **Override** | Officer discretionary decision different from system recommendation | Must be documented with reason (audit trail) |
| **Reassessment** | Periodic review of customer situation (every 6 months) | Checks if income improved (accelerate plan) or declined (extend plan) |

## Core Platform Flows

| Flow | Key Steps | User |
|------|-----------|------|
| **Bank Connection** | Customer → OAuth consent → Bank login → Account selection → Permissions confirmed → Bridge fetches 6 months data | Customer |
| **Assessment** | Bank data analyzed → Income/expenses calculated → Disposable income derived → Bill % calculated → Hardship level determined | System |
| **Payment Plan Creation** | 3 plan options generated (Conservative/Balanced/Aggressive) → Customer reviews → System recommends Conservative → Customer selects one | System + Customer |
| **Plan Approval** | System plan generated → Officer reviews → Officer can approve/modify/escalate → If modified, reason documented → Plan sent to customer | Officer |
| **Plan Setup** | T&Cs review → Payment method selection → Direct Debit setup → Payment date confirmed → Confirmation email sent | Customer |
| **Payment Tracking** | Reminders sent (7/3/1 days before) → Payment made → Confirmation logged → Progress updated → 6-month mark triggers reassessment | System |

## Regulatory & Acronyms

| Acronym | Expansion | Role / Context |
|---------|-----------|----------------|
| **FCA** | Financial Conduct Authority | UK financial regulator — requires fair assessment, affordability checks, complaint handling |
| **Ofgem** | Office of Gas and Electricity Markets | UK utilities regulator — requires vulnerable protection, PSR compliance, hardship best practices |
| **PSR** | Priority Services Register | Ofgem scheme for vulnerable customers (elderly, disabled, medical equipment) — utilities must not disconnect them |
| **T&Cs** | Terms & Conditions | Legal agreement customer accepts before plan goes live (Bridge uses plain English, not jargon) |
| **KPIs** | Key Performance Indicators | Metrics tracked: queue health, approval rate, completion rate, escalation rate, fairness scores |
| **ROI** | Return on Investment | Business metric: cost of hardship program vs. value recovered in arrears |
| **GDPR** | General Data Protection Regulation | EU/UK privacy law — Bridge must protect customer data, allow deletion, inform on usage |
| **OAuth** | Open Authorization Protocol | Secure method for bank connection (customer authorizes, Bridge reads only, never sees password) |
| **SLA** | Service Level Agreement | Target response times (e.g., "queue avg wait < 5 days") |

## User Roles

| Role | Who | Primary Tasks | Dashboard Views |
|------|-----|---------------|-----------------|
| **Customer** | Individual with unaffordable utility bill | Connect bank, review assessment, choose plan, make payments, request reschedule | Payment portal (progress, next payment, history) |
| **Hardship Officer** | Utility company staff | Review flagged cases, approve/modify plans, handle missed payments, escalate complex cases | Manual review queue, case details, modify plan screens |
| **Manager** | Team lead | Monitor officer performance, queue health, ensure consistency | Team KPI dashboard (approval rate, wait time, cases per officer) |
| **Compliance Officer** | Risk/regulatory staff | Audit decisions, check for discrimination, verify fair treatment, regulatory reporting | Compliance dashboard (FCA/Ofgem checklists, flag accuracy, discrimination metrics) |
| **Executive** | Senior management | View business impact, ROI, strategic metrics | Executive dashboard (prevented disconnections, arrears recovered, completion rate vs industry) |
| **Policy Manager** | Policy/governance staff | Configure hardship rules, set affordability thresholds, adjust vulnerability rules | Policy configuration screens (edit thresholds, see impact preview) |

## Vulnerability Flags

| Flag | Definition | Treatment |
|------|-----------|-----------|
| **Medical Equipment** | Customer has life-dependent medical device | Auto-classified SEVERE, no disconnection guarantee, priority support |
| **Pensioner** | Customer 65+ years old | Payment plan extended by 50%, lower payment thresholds |
| **Lone Parent** | Single parent with dependents | Payment plan extended by 30%, support services highlighted |
| **Disabilities** | Customer registered disabled | Lower thresholds, extended timelines, accessible support |
| **Low Income** | Below regional poverty line | Fast-tracked assessment, support services offered |
| **Previous Default** | Prior arrears breach or missed payments | Flagged for manual review (risk assessment) |

## System Flags & Reasons for Manual Review

| Flag Reason | Trigger | Officer Action |
|-------------|---------|-----------------|
| **High Bill Ratio** | Bill > 25% of disposable income | Review: Is assessment accurate? Are vulnerabilities identified? |
| **Data Quality Issue** | Incomplete bank data, suspicious patterns | Review: Request more info or accept with caveats? |
| **Complexity** | Multiple vulnerabilities, edge case situation | Escalate to senior officer |
| **Previous Default** | Customer has prior arrears/breach history | Assess risk: Modify plan to be more sustainable? |
| **Vulnerability** | PSR registered, medical equipment, etc. | Ensure protections applied (e.g., no disconnection) |

## Design System

| Element | Details |
|---------|---------|
| **Colors** | CSS variables (primary, secondary, border, text) — light/dark mode compatible |
| **Typography** | Anthropic Sans, 2 weights only (400 regular, 500 semi-bold) |
| **Spacing** | 1rem vertical rhythm, 8px-16px gaps between components |
| **Borders** | 0.5px solid, `var(--color-border-tertiary)` default |
| **Radius** | `var(--border-radius-md)` for buttons, `var(--border-radius-lg)` for cards |
| **Buttons** | Outline style default, hover fills with `bg-secondary` |
| **Tone** | Plain English (no jargon), empathetic (even in difficult messages), transparent (explain why) |

## Useful Abbreviations

- **MB** = Missing payment breach (after 3 consecutive misses)
- **DD** = Direct Debit (automatic payment method, preferred)
- **BTO** = Bank Transfer Only (for customers without bank account)
- **CoC** = Change of Circumstances (customer reports income change between reassessments)

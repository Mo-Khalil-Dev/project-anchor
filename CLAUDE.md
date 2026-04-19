# Memory

## Me
Mohamed Khalil — working on PROJECT BRIDGE, a hardship assessment platform for UK utility companies

## Projects
| Name | What |
|------|------|
| **PROJECT BRIDGE** | Hardship assessment platform that helps UK utilities identify customers struggling with bills and create fair, sustainable payment plans. Prevents disconnections through automated assessment + officer review. |

## Key Concepts
| Term | Meaning |
|------|---------|
| **Assessment** | Automated analysis of customer's income, expenses, and bill affordability to determine hardship level |
| **Hardship Levels** | SEVERE (bill > 25% of disposable income), MODERATE (10-25%), LOW (< 10%), NONE |
| **Payment Plans** | 3 options offered: Conservative (safe, longer), Balanced (medium), Aggressive (faster, higher risk) |
| **Sustainability Score** | HIGH/MEDIUM/LOW - indicates if customer can realistically keep paying the plan |
| **Disposable Income** | Income remaining after essential expenses (housing, food, transport, utilities) |
| **Arrears** | Outstanding utility bill debt that needs repayment |
| **PSR** | Priority Services Register - Ofgem requirement to protect vulnerable customers from wrongful disconnection |
| **Direct Debit** | Automatic payment setup (recommended for plan adherence) |
| **OAuth** | Secure bank connection method (customer's bank → Bridge, read-only) |
| **Manual Review Queue** | Cases flagged by system that need hardship officer decision |
| **Override** | Officer makes discretionary decision different from system recommendation (must document reason) |
| **Escalate** | Send case to senior officer for complex/vulnerable situations |

## Regulators & Standards
| Acronym | Full Name | Role |
|---------|-----------|------|
| **FCA** | Financial Conduct Authority | Financial regulator - requires affordability assessments, fair treatment documentation |
| **Ofgem** | Office of Gas and Electricity Markets | Utilities regulator - requires vulnerable customer protection (PSR), no wrongful disconnection |

## Key User Roles
| Role | What They Do |
|------|--------------|
| **Customer** | Applying for hardship support, choosing payment plans, making payments |
| **Hardship Officer** | Reviews flagged cases, approves/modifies payment plans, handles missed payments |
| **Manager** | Monitors team performance, queue health, consistency metrics |
| **Compliance Officer** | Audits decisions for fairness, regulatory compliance, discrimination detection |
| **Executive** | Views ROI, business impact, strategic metrics |
| **Policy Manager** | Configures hardship rules, affordability thresholds, vulnerability protections |

## Technical Architecture
- **7 Epics** in scope (Bank Connection → Assessment → Payment Management → Admin Queue → Performance → Policy → PSR Protection)
- **37 UI Screens** total needed (7 mockups created, 30 to build)
- **Phase 1 Priority:** Customer journey (assessment → payment plans → acceptance)
- **Phase 2 Priority:** Admin workflow (queue management, case review, modify plans)
- **MVP Critical Screens:** Assessment Overview, Payment Plan Options, Case Review, Modify Plan

## Preferences
- Working with visual mockups as reference during development
- Screens follow Claude.ai design system (CSS variables for light/dark mode)
- Focus on plain English explanations (not legal jargon) throughout
- Emphasis on transparency & fairness in all customer-facing flows

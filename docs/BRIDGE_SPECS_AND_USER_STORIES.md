# BRIDGE - Hardship Assessment Platform
## Business Requirements & User Stories

**Code Name:** PROJECT BRIDGE  
**Tagline:** Connecting vulnerable customers with affordable utility solutions

---

## PROJECT SPECS

### **What is Bridge?**
A platform that helps UK utility companies identify customers in hardship and create fair, sustainable payment plans quickly.

### **Who Uses It?**
- **Customers:** People struggling with utility bills
- **Hardship Officers:** Staff who review and approve payment plans
- **Managers:** Team leads overseeing the hardship team
- **Compliance Officers:** Ensuring fair treatment and regulatory compliance
- **Executives:** Monitoring hardship metrics and business impact

### **What Problem Does It Solve?**
- Manual hardship reviews are slow (days/weeks)
- Inconsistent decisions (depends on who reviews)
- Expensive to staff (high-touch process)
- Customers don't know if they qualify until after applying
- Regulators require documented, fair assessment

### **Core Value Proposition**
**For Customers:** Get a fair payment plan in minutes, not days. Understand exactly how much you can afford to pay.

**For Utilities:** Reduce disconnections, recover more arrears, meet regulatory requirements, automate routine decisions.

---

## EPIC 1: Bank Connection & Detection

### **User Story 1.1: Customer Connects Bank Account**
**As a** customer in utility hardship  
**I want to** securely connect my bank account  
**So that** you can see my real spending and give me a fair assessment

**Acceptance Criteria:**
- [ ] Customer can click "Connect Bank" from portal
- [ ] Privacy & consent screen appears before bank login
- [ ] Customer sees what data we'll access (6 months transactions, income, spending)
- [ ] Customer sees what we WON'T access (password, can't move money)
- [ ] Customer clicks consent checkbox
- [ ] Customer is redirected to their bank's login (not our app)
- [ ] After successful login, customer is redirected back to our app
- [ ] Success message shows: bank name, months of data, income, avg spending
- [ ] Customer can proceed to assessment or try again if error

**Why This Matters:**
Real bank data is more trustworthy than self-reported income. Reduces fraud, improves fairness, makes process faster (no paper forms).

---

### **User Story 1.2: System Auto-Detects Hardship**
**As a** hardship officer  
**I want to** see a list of new customers in hardship  
**So that** I can prioritize who to contact for support

**Acceptance Criteria:**
- [ ] Every 6 hours, system checks new assessments
- [ ] Hardship detected = customer added to "Outreach" list
- [ ] Outreach list shows: customer name, hardship level, bill amount, arrears
- [ ] Hardship Officer can see list in one view
- [ ] Officer can mark customer as "contacted" or "pending"
- [ ] System sends empathetic email to hardship customer within 24 hours
- [ ] Email explains: "We noticed you might be in hardship. Here's support available."
- [ ] Email includes link to view assessment

**Why This Matters:**
Proactive outreach = customers get help faster. Don't wait for them to apply. Shows we care.

---

## EPIC 2: Assessment & Recommendations

### **User Story 2.1: Customer Sees Detailed Financial Breakdown**
**As a** customer  
**I want to** understand where my money goes  
**So that** I can see why my situation is difficult

**Acceptance Criteria:**
- [ ] Assessment screen shows: Income (£X/month)
- [ ] Shows: Total Expenses (£X/month)
- [ ] Shows: Disposable Income After Essentials (£X/month)
- [ ] Shows: Utility Bill as % of Disposable (X%)
- [ ] Compares to benchmark: "Average is 5-8%, yours is 35%"
- [ ] Breaks down expenses by category: Housing, Food, Utilities, Transport, Other
- [ ] Shows last 6 months of income (chart)
- [ ] Highlights seasonal variations (winter bills higher?)
- [ ] Shows expense patterns (predictable or volatile?)
- [ ] Explains what "Disposable Income" means in plain English

**Why This Matters:**
Transparency builds trust. Customers understand we've done the math fairly. They see the real problem (not "you spend too much on coffee" but "your bill is genuinely unaffordable").

---

### **User Story 2.2: System Recommends 3 Payment Plans**
**As a** customer  
**I want to** see different options for paying off my arrears  
**So that** I can choose what works for me

**Acceptance Criteria:**
- [ ] System shows 3 plans: Conservative, Balanced, Aggressive
- [ ] Each plan shows:
  - Monthly payment amount
  - Number of months
  - Total paid (= arrears amount)
  - Sustainability score (HIGH, MEDIUM, LOW)
  - Plain English explanation why this plan works
- [ ] Conservative plan highlighted as "recommended"
- [ ] Customer can see why each plan is risky or safe:
  - "If you miss payments on Aggressive plan, arrears grow quickly"
  - "Conservative plan gives you breathing room"
- [ ] Sustainability explanation in plain English:
  - "This plan leaves you £X/month for emergencies"
  - "If car breaks down, can you still pay?"
- [ ] Customer can select any plan
- [ ] System shows acceptance T&Cs before confirmation

**Why This Matters:**
Choice empowers customers. They understand the trade-off (faster payoff = less sustainable). Transparency about sustainability reduces defaults.

---

### **User Story 2.3: System Recommends Support Services**
**As a** customer  
**I want to** know about other help available  
**So that** I can improve my situation faster

**Acceptance Criteria:**
- [ ] If pensioner: "You may qualify for Warm Home Discount (£140 off your bill)"
- [ ] If low income: "You may qualify for energy efficiency grants"
- [ ] If lone parent: "You may qualify for free school meals (save £X/year)"
- [ ] If benefits receipt detected: "We can help optimize your benefits"
- [ ] If arrears serious: "Debt advice (free via StepChange)"
- [ ] If vulnerable: Direct link to specialist support org
- [ ] Each recommendation has:
  - Clear description of what it is
  - How much money/help customer gets
  - Link to apply or get more info
  - No pressure (customer decides to pursue)
- [ ] System tracks which recommendations customer clicked

**Why This Matters:**
Most customers don't know what support exists. Pointing them to money-saving measures improves their situation AND reduces default risk. Win-win.

---

## EPIC 3: Payment Plan Management

### **User Story 3.1: Customer Accepts Plan & Sets Up Payment**
**As a** customer  
**I want to** accept a payment plan  
**So that** I stop accumulating arrears

**Acceptance Criteria:**
- [ ] Customer clicks "Accept Plan"
- [ ] System shows final T&Cs (plain English, not legal jargon)
- [ ] Customer sees payment method options:
  - Direct Debit (automatic) ← recommended
  - Card/Bank Transfer (manual)
  - Cash at Post Office (if applicable)
- [ ] If Direct Debit chosen: Setup screen appears
- [ ] Customer enters bank details (or confirms existing)
- [ ] System confirms: "Payment scheduled for 15th of each month"
- [ ] Confirmation email sent with:
  - Payment plan summary
  - First payment date
  - How to track payments
  - What to do if can't pay
- [ ] Payment portal created for customer to track progress

**Why This Matters:**
Smooth onboarding = customers actually complete plans. Direct Debit reduces missed payments. Clear communication prevents confusion.

---

### **User Story 3.2: System Sends Payment Reminders**
**As a** customer  
**I want to** remember my payment is due  
**So that** I don't miss it by accident

**Acceptance Criteria:**
- [ ] 7 days before due date: Email reminder
- [ ] 3 days before due date: SMS reminder (if opted in)
- [ ] 1 day before due date: Final reminder
- [ ] All reminders are empathetic (not threatening)
- [ ] Customer can snooze reminders or change payment date
- [ ] If customer misses payment: Grace period of 5 days before escalation
- [ ] Late payment email explains: "We know life happens. Here's how to catch up."
- [ ] If payment made after due date: Immediate confirmation (not punitive)

**Why This Matters:**
Reminders prevent accidental misses. Empathetic tone builds relationship. Grace period shows we're not looking for excuses to escalate.

---

### **User Story 3.3: System Handles Missed Payments**
**As a** hardship officer  
**I want to** know when a customer misses a payment  
**So that** I can help before it becomes a crisis

**Acceptance Criteria:**
- [ ] Missed payment triggers automated check-in (empathetic message)
- [ ] Message asks: "What's happening? Help us understand."
- [ ] Options for customer:
  - "Payment coming today"
  - "Had unexpected expense, need to reschedule"
  - "Job situation changed"
  - "Can't pay, need to talk"
- [ ] If customer confirms payment coming: Flag as "Temporary, monitor"
- [ ] If customer needs reschedule: Officer can adjust plan (no breach)
- [ ] If customer can't pay: Escalate to hardship officer (not automatic breach)
- [ ] After 3 consecutive missed payments without response: Escalate to breach process
- [ ] Officer reviews before any enforcement action

**Why This Matters:**
Life happens. Distinguishing between "forgotten" and "can't afford" prevents unnecessary escalations. Keeps customers engaged.

---

### **User Story 3.4: System Reassesses Customer Every 6 Months**
**As a** customer  
**I want to** know if my situation has improved  
**So that** I can pay off arrears faster if I can afford to

**Acceptance Criteria:**
- [ ] After 6 months on payment plan: System prompts reassessment
- [ ] New bank data fetched automatically (if customer consented)
- [ ] System compares: Income now vs. 6 months ago
- [ ] Scenario 1 - Income improved:
  - "Your income increased by £200/month"
  - Option to accelerate plan (pay £X more/month, finish sooner)
  - Option to keep current plan and save the extra money
- [ ] Scenario 2 - Income decreased:
  - "Your income decreased by £100/month"
  - Offer to extend plan (pay less, longer timeline)
  - Check if new vulnerabilities emerged
- [ ] Scenario 3 - No change:
  - "You're on track. Keep doing what you're doing."
  - Encourage continued engagement
- [ ] New plan version created (versioning for audit trail)
- [ ] All changes documented and sent to customer

**Why This Matters:**
Customers' situations change. Flexibility here reduces defaults. Accelerating for improved customers shows fairness (they get rewarded for improvement). Extending for struggling customers keeps them engaged.

---

## EPIC 4: Admin Dashboard - Queue & Management

### **User Story 4.1: Officer Views Manual Review Queue**
**As a** hardship support officer  
**I want to** see which assessments need my review  
**So that** I can prioritize and work efficiently

**Acceptance Criteria:**
- [ ] Dashboard shows: "23 cases in queue | 8 High Priority | 12 Medium | 3 Low"
- [ ] Cases listed with: Customer name, priority, days waiting
- [ ] High Priority cases show: Why flagged (e.g., "Previous default + high bill ratio")
- [ ] Officer can filter by: Priority, Days waiting, Assigned to me/team
- [ ] Officer can sort by: Days waiting, Risk level, Oldest first
- [ ] Queue health visible: "Avg wait: 4.2 days (Target: <5 days)"
- [ ] One-click access to each case
- [ ] Counts update in real-time as cases are decided

**Why This Matters:**
Officers need to see what's urgent. Queue visibility drives good behavior (don't let cases pile up). Metrics hold team accountable.

---

### **User Story 4.2: Officer Reviews Individual Case**
**As a** hardship support officer  
**I want to** see all relevant information about a customer  
**So that** I can make a fair decision

**Acceptance Criteria:**
- [ ] Case view shows:
  - Customer profile (age, household, PSR status if applicable)
  - Financial summary (income, expenses, disposable, bill ratio)
  - System assessment (hardship level, recommended plan)
  - Why system flagged for review
  - Bank data quality score
  - Payment history (previous arrears? defaults?)
  - All vulnerabilities detected
- [ ] Officer can see what system recommended
- [ ] Officer sees decision options:
  - [Approve] - Accept system recommendation
  - [Modify] - Change payment amount/duration
  - [Request Info] - Ask customer for clarification
  - [Escalate] - Send to senior officer
  - [Override] - Make discretionary decision
- [ ] Each option requires notes explaining the decision
- [ ] Officer can add custom support measures
- [ ] Decision logged automatically with timestamp

**Why This Matters:**
Good decisions require context. Officer needs to understand WHY system flagged the case. Seeing all context reduces unfair decisions.

---

### **User Story 4.3: Officer Modifies Payment Plan**
**As a** hardship support officer  
**I want to** adjust a payment plan for a vulnerable customer  
**So that** the plan is actually sustainable for them

**Acceptance Criteria:**
- [ ] Officer can edit: Monthly payment amount, Duration (months)
- [ ] System warns if: "Payment > 20% of disposable income" (red zone)
- [ ] Officer can override if they choose
- [ ] System warns if: "Plan longer than 36 months" (policy limit)
- [ ] Officer can justify override in notes
- [ ] Officer can add support measures:
  - ☑ Warm Home Discount
  - ☑ Energy efficiency grant
  - ☑ Council tax reduction check
  - ☑ Debt advice referral
- [ ] Notes field for explaining decision
  - Example: "Pensioner, zero disposable income, extend plan"
- [ ] Decision saved with audit trail (who, when, why)
- [ ] Customer notified of modified plan

**Why This Matters:**
System recommendations aren't always right. Officers need flexibility for edge cases. But every override must be justified (audit trail). This balances automation with fairness.

---

## EPIC 5: Admin Dashboard - Performance & Compliance

### **User Story 5.1: Manager Views Team Performance**
**As a** hardship team manager  
**I want to** see how my team is performing  
**So that** I can identify training needs and celebrate wins

**Acceptance Criteria:**
- [ ] Dashboard shows KPIs:
  - Cases in queue (vs. target)
  - Avg wait time (vs. target)
  - Approval rate (%) - is it reasonable?
  - Escalation rate (%) - too high? too low?
  - Cases awaiting info (%) - stuck?
  - Appeal rate (%) - decisions being reversed?
- [ ] Officer-level breakdown:
  - Jane Williams: 127 cases | 88% approval | 2.3 hrs avg review
  - Tom Bennett: 118 cases | 86% approval | 2.1 hrs avg review
  - Sarah Ahmed: 94 cases | 89% approval | 2.0 hrs avg review
- [ ] Manager can click each officer to see their cases
- [ ] Manager can identify:
  - Who's slow (needs support?)
  - Who's rejecting too much (too strict?)
  - Who's approving too much (too lenient?)
- [ ] Month-over-month comparison (improving or declining?)
- [ ] Trend chart: "Queue health improving" or "Getting worse"

**Why This Matters:**
Managers need visibility into team performance. Spotting outliers (too slow, too harsh, too lenient) helps improve consistency. Celebrating top performers motivates team.

---

### **User Story 5.2: Compliance Officer Audits Decisions**
**As a** compliance/risk officer  
**I want to** ensure fair treatment of all customers  
**So that** we meet FCA/Ofgem regulations and avoid discrimination

**Acceptance Criteria:**
- [ ] Audit view shows:
  - All decisions made (100% logged)
  - Each decision: Customer, assessment, decision, reason
  - Flag accuracy: "Of 100 cases flagged for 'high bill ratio', 92% were correct"
  - Decision consistency: "Are similar cases treated similarly?"
  - Fairness metrics:
    - Approval rate by age: "18-30: 88%, 60+: 86%" (similar?)
    - Approval rate by location: "North: 87%, South: 88%" (similar?)
    - Approval rate by income level: "Low: 85%, High: 89%" (similar?)
- [ ] Vulnerable customer protection:
  - "PSR customers: 127 registered"
  - "No-disconnection guarantees: 89 issued" (should be high for MEDICAL_EQUIPMENT)
  - "Warm Home Discount offered: 78%" (target: >75%)
- [ ] Complaints & appeals:
  - "Complaints this month: 3"
  - "Appeals filed: 1" (appeals rate should be <5%)
  - "Appeals upheld: 0" (low rate = good decisions)
- [ ] Manual overrides logged:
  - Shows all officer discretionary decisions
  - All have documented reasons
  - Used fairly across team
- [ ] Export for FCA/Ofgem reporting

**Why This Matters:**
Regulators require proof of fair treatment. Discrimination (intentional or unintentional) risks heavy fines. Audit trail protects both customers and utility company.

---

### **User Story 5.3: Executive Views Business Impact**
**As a** senior manager/executive  
**I want to** see how hardship assessment is performing business-wise  
**So that** I can make strategic decisions

**Acceptance Criteria:**
- [ ] KPIs visible:
  - Customers prevented from disconnection: 847
  - Arrears recovered: £245,000 (via payment plans)
  - Cost of payment plans: £145,000 (staff time, system)
  - ROI: "For every £1 spent, £1.69 recovered" (16:1 ratio if prevention counted)
  - Plan completion rate: 89% (customers actually pay)
  - Plan default/breach rate: 7% (acceptable range)
  - Disconnection prevention rate: "X% of at-risk customers saved"
- [ ] Trend over time:
  - Are we detecting hardship faster? (days to assessment)
  - Are more customers accessing service? (volume trend)
  - Are plans sustainable? (completion rate trend)
  - Are we fair? (approval rate consistency)
- [ ] Comparison to industry:
  - "Industry avg: 80% completion, we're at 89%" ← we're winning
  - "Industry avg: 12% escalation, we're at 8%" ← efficient
- [ ] Regulatory compliance:
  - "FCA affordability assessments: 100% documented"
  - "Ofgem vulnerable protection: 95% compliant"
  - "Zero discrimination complaints this quarter"

**Why This Matters:**
Executives need to justify investment to board. Showing ROI, regulatory compliance, and customer outcomes builds support for hardship program.

---

## EPIC 6: Hardship Policy Configuration

### **User Story 6.1: Policy Manager Configures Hardship Rules**
**As a** hardship policy manager  
**I want to** set company hardship policy  
**So that** all customers are treated consistently

**Acceptance Criteria:**
- [ ] Policy config screen shows:
  - **Affordability Threshold**: "Bill as % of disposable income"
    - SEVERE hardship: > X% (e.g., > 25%)
    - MODERATE hardship: X-Y% (e.g., 10-25%)
    - LOW hardship: < X% (e.g., < 10%)
  - **Payment Plan Limits**:
    - Max duration: 36 months
    - Min monthly payment: £10
    - Max monthly payment: (% of disposable income)
  - **Vulnerability Rules**:
    - Pensioner = extend plan by 50%
    - Medical equipment = no disconnection (mandatory)
    - Lone parent = extend plan by 30%
    - etc.
  - **Manual Review Triggers**:
    - Flag if: Previous default
    - Flag if: High bill ratio
    - Flag if: Data quality issues
    - etc.
  - **Support Services**:
    - Auto-offer Warm Home Discount to: Pensioners, low income
    - Auto-refer to debt advice if: Total arrears > £X
    - etc.
- [ ] Policy manager can edit any rule
- [ ] Changes show impact preview:
  - "If we change threshold from 25% to 20%, ~50 more customers become SEVERE"
- [ ] Before saving: "Confirm you want to change policy for X future assessments"
- [ ] Change logged with date, who changed it, why
- [ ] Automatic notification to team: "Policy changed - here's what's different"

**Why This Matters:**
Policy consistency matters for fairness and efficiency. Manager needs ability to adjust based on market conditions, regulatory changes. Audit trail proves we're managing policy appropriately.

---

## EPIC 7: Vulnerable Customer Protection (PSR Integration)

### **User Story 7.1: System Identifies & Protects PSR Customers**
**As a** utility company (regulatory requirement)  
**I want to** identify customers registered on Priority Services Register  
**So that** we protect them from wrongful disconnection

**Acceptance Criteria:**
- [ ] During assessment: System checks if customer on PSR
- [ ] If PSR registered + medical equipment:
  - Auto-flag as SEVERE hardship (no review needed)
  - Add guarantee: "NO DISCONNECTION under any circumstances"
  - Auto-assign hardship officer
  - Create payment plan (even if customer can't afford it)
  - Offer 24/7 emergency support line
- [ ] If PSR registered + other vulnerability (elderly, disabled, etc.):
  - Add guarantee: "Priority support and no wrongful disconnection"
  - Extend payment plan by 50%
  - Lower payment thresholds
  - Offer additional support services
- [ ] If PSR not registered but vulnerabilities detected:
  - Suggest customer register on PSR
  - Explain benefits
  - Provide link/form
- [ ] All PSR decisions documented with reason
- [ ] Compliance reporting: "PSR customers: 127, protected: 127 (100%)"

**Why This Matters:**
Ofgem requires utilities to protect vulnerable customers. Medical equipment dependency = life or death (can't disconnect). Not protecting them = regulatory breach and reputational damage.

---

## User Stories Summary Table

| Epic | Story | Who | What | Why |
|------|-------|-----|------|-----|
| 1 | 1.1 | Customer | Connect bank | Real data, faster, less fraud |
| 1 | 1.2 | Officer | See hardship list | Proactive outreach, help faster |
| 2 | 2.1 | Customer | See breakdown | Transparency, builds trust |
| 2 | 2.2 | Customer | Choose plan | Choice empowers, reduces defaults |
| 2 | 2.3 | Customer | See support | Improves outcomes, reduces defaults |
| 3 | 3.1 | Customer | Accept & pay | Smooth onboarding |
| 3 | 3.2 | Customer | Get reminders | Prevents accidental misses |
| 3 | 3.3 | Officer | Handle misses | Help before escalation |
| 3 | 3.4 | Customer | Reassess | Flexibility, rewards improvement |
| 4 | 4.1 | Officer | See queue | Prioritize, work efficiently |
| 4 | 4.2 | Officer | Review case | Make fair decision |
| 4 | 4.3 | Officer | Modify plan | Flexibility for edge cases |
| 5 | 5.1 | Manager | Team KPIs | Identify training needs |
| 5 | 5.2 | Compliance | Audit | Regulatory compliance, fairness |
| 5 | 5.3 | Executive | Business KPIs | ROI, strategic decisions |
| 6 | 6.1 | Policy Mgr | Configure rules | Consistency, adapt to changes |
| 7 | 7.1 | System | Protect PSR | Regulatory requirement |

---

## Value Delivered by Bridge

**For Customers:**
✅ Fair assessment in minutes (not days)  
✅ Transparency (understand why their situation is difficult)  
✅ Choice (3 plan options)  
✅ Support (discovered services they didn't know about)  
✅ Flexibility (reassessed if situation improves)  
✅ Protection (no wrongful disconnection if vulnerable)  

**For Hardship Officers:**
✅ Automated routine decisions (no busywork)  
✅ Flagged risky cases (focused on what matters)  
✅ Clear context (full information for decisions)  
✅ Flexibility to override (discretion when needed)  
✅ Audit trail (protected from liability)  

**For Managers:**
✅ Team visibility (who's performing well?)  
✅ Queue management (prioritize work)  
✅ Consistency (treat similar customers similarly)  
✅ Performance metrics (show impact)  

**For Compliance:**
✅ 100% audit trail (prove fair treatment)  
✅ Discrimination detection (spot bias)  
✅ Regulatory reporting (FCA/Ofgem ready)  
✅ Customer protection (especially vulnerable)  

**For Executives:**
✅ ROI proof (cost vs. value)  
✅ Risk reduction (fewer disputes, complaints)  
✅ Efficiency (automation = savings)  
✅ Strategic advantage (industry-leading hardship process)  

---

## Next Steps

Ready to move to Claude Code and start building?

You'll ask questions about each user story, and I'll help you make technical decisions based on the value proposition.

**Questions to expect:**
- "How should we authenticate users?"
- "How should we store customer data securely?"
- "Should we use a database or serverless?"
- "How should we handle payment processing?"
- "What if bank connection fails?"
- etc.

All driven by: "This user story needs X capability. What's the best way to build it?"

Let's go build! 🚀

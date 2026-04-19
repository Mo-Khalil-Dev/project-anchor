# Bridge UI Screen Mockup Inventory
## Complete Screen List & Status

---

## CUSTOMER PORTAL SCREENS

### **Epic 1: Bank Connection & Detection**

#### ✅ Screen 1.1.1: Home / Dashboard
**User Story:** 1.1 (Customer connects bank)  
**Purpose:** Entry point for customer journey  
**Key Elements:**
- Welcome message
- CTA: "Connect Your Bank Account"
- Or: "Upload Statements"
- Brief explanation of process (3 bullet points)
- Progress indicator (if returning user)

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 1.1.2: Bank Connection - Introduction
**User Story:** 1.1  
**Purpose:** Explain why bank connection is needed  
**Key Elements:**
- Hero icon (bank building)
- Title: "Connect Your Bank Account"
- 3 value propositions (no forms, faster, better support)
- "What we'll access" (6 months, income, spending patterns)
- "What we won't access" (password, can't move money)
- Two CTAs: [Continue] [Provide Statements Manually]

**Status:** ✅ MOCKUP CREATED (in chat earlier)

---

#### ✅ Screen 1.1.3: Bank Connection - Privacy & Consent
**User Story:** 1.1  
**Purpose:** Get explicit consent before OAuth  
**Key Elements:**
- Security guarantees (encrypted, no password storage, Tink, FCA)
- How we use data (4 bullet points)
- Data retention (3 years, GDPR deletion)
- Consent checkbox
- [Connect Bank Account] button

**Status:** ✅ MOCKUP CREATED (in chat earlier)

---

#### ✅ Screen 1.1.4: OAuth Flow - Bank Selection
**User Story:** 1.1  
**Purpose:** Choose which bank customer uses  
**Key Elements:**
- Search box (find your bank)
- Popular banks list (Barclays, HSBC, Monzo, Revolut, Lloyds, Nationwide, Starling, etc.)
- "View all supported banks" link
- [Continue] button

**Status:** ✅ MOCKUP CREATED (in chat earlier)

---

#### ✅ Screen 1.1.5: OAuth Flow - Bank Login
**User Story:** 1.1  
**Purpose:** Simulated bank login page  
**Key Elements:**
- Disclaimer: "You're now on [Bank]'s secure login page"
- Username/ID field
- Password field
- "Remember me" checkbox
- [Log In] button
- "Forgot Password?" link
- Note: "You'll be returned to Bridge after connecting"

**Status:** ✅ MOCKUP CREATED (in chat earlier)

---

#### ✅ Screen 1.1.6: OAuth Flow - Account Selection
**User Story:** 1.1  
**Purpose:** Choose which account to connect  
**Key Elements:**
- Title: "Select account to connect"
- Account options (Current, Savings, etc.) with account numbers
- Recommended: "Select your main current account where you receive salary"
- [Continue] button

**Status:** ✅ MOCKUP CREATED (in chat earlier)

---

#### ✅ Screen 1.1.7: OAuth Flow - Confirm Permissions
**User Story:** 1.1  
**Purpose:** Final permission confirmation  
**Key Elements:**
- What we'll access (transaction history, account info)
- What we WON'T access (move money, change details, delete transactions)
- [I agree, connect my account] button
- [Cancel] button

**Status:** ✅ MOCKUP CREATED (in chat earlier)

---

#### ✅ Screen 1.1.8: OAuth Flow - Processing
**User Story:** 1.1  
**Purpose:** Show real-time progress while fetching data  
**Key Elements:**
- Animated icon (hourglass/spinner)
- Title: "Connected! Processing your data..."
- Progress steps (3):
  - ✓ Connection confirmed
  - ⏳ Fetching transactions...
  - 3. Running assessment...
- "Don't close this window" message

**Status:** ✅ MOCKUP CREATED (in chat earlier)

---

#### ✅ Screen 1.1.9: OAuth Flow - Success
**User Story:** 1.1  
**Purpose:** Confirm successful connection  
**Key Elements:**
- Success icon (checkmark)
- Title: "Bank Connected!"
- Summary box (Bank: Barclays, Transactions: 6 months, Income: £1,500, Spending: £1,440)
- [View Full Assessment] button
- Note about secure connection and settings management

**Status:** ✅ MOCKUP CREATED (in chat earlier)

---

#### ✅ Screen 1.1.10: OAuth Flow - Error
**User Story:** 1.1  
**Purpose:** Handle connection failures  
**Key Elements:**
- Error icon (warning)
- Title: "Connection Failed"
- Why it happened (4 bullet points)
- Error code for support
- [Try Again] button
- [Provide Statements Manually] button
- [Get Help] button

**Status:** ✅ MOCKUP CREATED (in chat earlier)

---

#### ✅ Screen 1.2.1: Hardship Detection Email / Notification
**User Story:** 1.2 (System auto-detects hardship)  
**Purpose:** Proactive outreach to customer  
**Key Elements:**
- Email layout
- Empathetic tone: "We noticed you might be in hardship"
- Explanation: "Here's what we found"
- Link to: "View your assessment"
- Support CTA: "Let's find a solution"

**Status:** MOCKUP NEEDED

---

### **Epic 2: Assessment & Recommendations**

#### ✅ Screen 2.1.1: Assessment Overview
**User Story:** 2.1 (Customer sees detailed breakdown)  
**Purpose:** Show financial situation at a glance  
**Key Elements:**
- Monthly Income: £X
- Total Expenses: £X
- Disposable Income: £X
- Bill as % of Disposable: X%
- Benchmark comparison: "Average is 5-8%, yours is 35%"
- Hardship Level badge (SEVERE, MODERATE, LOW, NONE)
- [View Detailed Breakdown] button

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 2.1.2: Assessment - Detailed Breakdown (Tab 1: Overview)
**User Story:** 2.1  
**Purpose:** Deep dive into income, expenses, disposable income  
**Key Elements:**
- Income calculation (sources, total)
- Expenses breakdown (Housing, Food, Utilities, Transport, Other)
- Disposable income formula: "Income - Essentials = Disposable"
- Bill as % of disposable
- Benchmark comparison bar chart

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 2.1.3: Assessment - Detailed Breakdown (Tab 2: Expenses)
**User Story:** 2.1  
**Purpose:** Show expense patterns by category  
**Key Elements:**
- Expense breakdown chart (pie or bar)
- Categories: Housing, Food, Utilities, Transport, Other
- 6-month trend (are expenses stable or volatile?)
- Comparative: "Average household spends £X on housing, you spend £Y"

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 2.1.4: Assessment - Detailed Breakdown (Tab 3: Income Stability)
**User Story:** 2.1  
**Purpose:** Show income patterns over time  
**Key Elements:**
- 6-month income chart
- Average income line
- Variance indicator (stable or volatile?)
- Explanation if seasonal or irregular

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 2.1.5: Assessment - Detailed Breakdown (Tab 4: Why This Happened)
**User Story:** 2.1  
**Purpose:** Explain root causes of hardship  
**Key Elements:**
- Number the factors (1, 2, 3)
- Example 1: "High utility bill (£300)"
- Example 2: "Low disposable income (£50)"
- Example 3: "Arrears accumulating (£420)"
- Vulnerability flags if applicable (pensioner, disabled, etc.)
- Short/medium/long-term action items

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 2.2.1: Payment Plan Options
**User Story:** 2.2 (System recommends 3 plans)  
**Purpose:** Show 3 payment plan options  
**Key Elements:**
- 3 cards side-by-side (Conservative, Balanced, Aggressive)
- Each shows:
  - Monthly payment
  - Duration
  - Sustainability score (HIGH/MEDIUM/LOW)
  - Plain English explanation
- Conservative highlighted as "Recommended"
- [Select Plan] button on each

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 2.2.2: Payment Plan Detail - Conservative
**User Story:** 2.2  
**Purpose:** Explain why Conservative plan is safest  
**Key Elements:**
- Monthly Payment: £X
- Duration: X months
- Total Paid: £420 (= arrears)
- Sustainability: HIGH
- Why this plan works:
  - "Leaves you £X/month for emergencies"
  - "If car breaks down, can you still pay?"
  - "Takes longer but much safer"
- [Select This Plan] button

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 2.2.3: Payment Plan Detail - Balanced
**User Story:** 2.2  
**Purpose:** Explain middle-ground option  
**Key Elements:**
- Monthly Payment: £X
- Duration: X months
- Total Paid: £420
- Sustainability: MEDIUM
- Why this plan works:
  - "Balance between paying faster and staying sustainable"
  - "Medium risk if unexpected expense"
- [Select This Plan] button

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 2.2.4: Payment Plan Detail - Aggressive
**User Story:** 2.2  
**Purpose:** Explain faster repayment (if sustainable)  
**Key Elements:**
- Monthly Payment: £X
- Duration: X months
- Total Paid: £420
- Sustainability: LOW
- Why this plan is risky:
  - "Leaves you little buffer for emergencies"
  - "If you miss payment, arrears grow"
  - "Only choose if confident in income stability"
- Warning badge
- [Select This Plan] button

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 2.3.1: Support Services Recommendations
**User Story:** 2.3 (System recommends support services)  
**Purpose:** Point customer to external help  
**Key Elements:**
- If Pensioner: "Warm Home Discount (£140 off your bill)" - [Apply]
- If Low Income: "Energy efficiency grants" - [Learn More]
- If Lone Parent: "Free school meals (save £X/year)" - [Apply]
- If Benefits: "Benefits optimization" - [Check]
- If High Arrears: "Free debt advice (StepChange)" - [Contact]
- Each with clear description + link

**Status:** MOCKUP NEEDED

---

### **Epic 3: Payment Plan Management**

#### ✅ Screen 3.1.1: Plan Acceptance - T&Cs
**User Story:** 3.1 (Customer accepts plan)  
**Purpose:** Get final agreement before setup  
**Key Elements:**
- Plain English T&Cs (not legal jargon)
- Checkbox: "I accept this plan"
- [Continue] button

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 3.1.2: Plan Acceptance - Payment Setup
**User Story:** 3.1  
**Purpose:** Choose payment method  
**Key Elements:**
- Payment method options:
  - Direct Debit (automatic) ← recommended
  - Card/Bank Transfer (manual)
  - Cash at Post Office
- [Set up Direct Debit] button
- [Other payment method] button

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 3.1.3: Plan Acceptance - Direct Debit Setup
**User Story:** 3.1  
**Purpose:** Collect bank details for Direct Debit  
**Key Elements:**
- Sort code field
- Account number field
- Account holder name
- Payment date selector (1st, 15th, etc.)
- [Confirm] button
- Confirmation: "Payment scheduled for 15th of each month"

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 3.1.4: Plan Acceptance - Confirmation
**User Story:** 3.1  
**Purpose:** Final confirmation before live  
**Key Elements:**
- "You're all set!"
- Plan summary (£X/month for X months)
- First payment date
- How to track payments (link to portal)
- What to do if can't pay (call number)
- [Go to Dashboard] button
- Confirmation email will be sent

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 3.2.1: Payment Reminder Notifications
**User Story:** 3.2 (System sends reminders)  
**Purpose:** Remind customer of upcoming payment  
**Key Elements:**
- Email/SMS templates:
  - 7 days before: "Your payment is due in 7 days"
  - 3 days before: "Your payment is due in 3 days"
  - 1 day before: "Your payment is due tomorrow"
- Tone: Friendly, not threatening
- Option to snooze or change date

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 3.2.2: Payment Portal - View Progress
**User Story:** 3.2  
**Purpose:** Customer tracks payment plan progress  
**Key Elements:**
- Plan summary (£X/month, X months remaining)
- Payment timeline / progress bar (X of Y payments made)
- Next payment date (highlighted)
- Payment history table (date, amount, status)
- [Make a Payment] button
- [Need Help?] button

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 3.3.1: Missed Payment - Auto Check-in
**User Story:** 3.3 (System handles missed payments)  
**Purpose:** Reach out empathetically when payment missed  
**Key Elements:**
- Email/SMS tone: "We noticed your payment was missed"
- Question: "What's happening? Help us understand"
- Options:
  - "Payment coming today"
  - "Had unexpected expense, need to reschedule"
  - "Job situation changed"
  - "Can't pay, need to talk"
- [Tell us] button

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 3.3.2: Missed Payment - Reschedule
**User Story:** 3.3  
**Purpose:** Allow customer to reschedule payment  
**Key Elements:**
- Why payment missed (from user input)
- Reschedule options:
  - "Can you pay by [date]?"
  - "Would you prefer this date instead?"
- New payment plan preview
- [Reschedule] button
- [Talk to an officer] button

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 3.4.1: Reassessment - Six Month Check-in
**User Story:** 3.4 (System reassesses customer)  
**Purpose:** Check if customer situation improved  
**Key Elements:**
- "Six months in - let's check how you're doing"
- New income vs old (+ or -)
- Scenario 1 (improved): "Great news! Your income increased by £200"
  - Option: "Accelerate plan (finish sooner)"
  - Option: "Keep current and save the extra"
- Scenario 2 (declined): "Your income decreased by £100"
  - Offer: "Extend plan (pay less, longer)"
- Scenario 3 (no change): "You're on track. Keep it up."

**Status:** MOCKUP NEEDED

---

### **Epic 4: Admin Dashboard - Queue & Management**

#### ✅ Screen 4.1.1: Admin Queue - Overview
**User Story:** 4.1 (Officer views manual review queue)  
**Purpose:** See all cases needing review at a glance  
**Key Elements:**
- Stats row (23 cases, 8 High, 12 Medium, 3 Low)
- Queue health (Avg wait: 4.2 days, Target: <5)
- Filters (Priority, Duration, Assigned to)
- Cases listed by priority
- High priority cases shown first

**Status:** ✅ MOCKUP CREATED (in chat earlier)

---

#### ✅ Screen 4.1.2: Admin Queue - Full List (All 23 Cases)
**User Story:** 4.1  
**Purpose:** See all cases across all priorities  
**Key Elements:**
- High Priority section (8 cases with details)
- Medium Priority section (12 cases)
- Low Priority section (3 cases)
- Each case shows: name, flagged date, bill, income, why flagged
- Quick action buttons (Review, Defer, Escalate, Request Info, Assign)

**Status:** ✅ MOCKUP CREATED (in chat earlier)

---

#### ✅ Screen 4.2.1: Admin Case Review - Full Details
**User Story:** 4.2 (Officer reviews individual case)  
**Purpose:** See all context for fair decision  
**Key Elements:**
- Customer profile (age, household, PSR status)
- Financial summary (income, expenses, disposable, bill ratio)
- System assessment (hardship level, recommended plan)
- Why flagged (the reason system flagged)
- Bank data quality score
- Payment history
- All vulnerabilities detected
- Decision options: [Approve] [Modify] [Request Info] [Escalate] [Override]
- Notes field

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 4.2.2: Admin Case Review - Customer Context Tab
**User Story:** 4.2  
**Purpose:** Deep dive into customer background  
**Key Elements:**
- Personal info (age, household size, PSR status, language)
- Employment (employed, self-employed, unemployed, benefits)
- Housing (owner, renter, social housing)
- Previous history (arrears, defaults, disputes)
- Vulnerabilities (flags detected)

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 4.2.3: Admin Case Review - Financial Tab
**User Story:** 4.2  
**Purpose:** Review financial assessment details  
**Key Elements:**
- Income breakdown (salary, benefits, other)
- Expense breakdown (housing, food, utilities, transport, other)
- Disposable income calculation
- Bill as % of disposable
- System assessment (hardship level, confidence score)
- Recommended plan (£X/month, X months)

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 4.2.4: Admin Case Review - Bank Data Tab
**User Story:** 4.2  
**Purpose:** Verify bank data quality  
**Key Elements:**
- Bank connected (Barclays, verified)
- Connection date
- Transaction count (186 in 6 months)
- Activity status (active, dormant, suspicious patterns)
- Data quality score (high, medium, low)
- Flags if any (suspicious, incomplete, unusual)

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 4.3.1: Admin Case Review - Modify Plan
**User Story:** 4.3 (Officer modifies payment plan)  
**Purpose:** Adjust plan for vulnerable/edge cases  
**Key Elements:**
- Current system recommendation (£X/month, X months)
- Edit fields for: Monthly payment, Duration
- Warnings if: Payment > 20% of disposable (red zone)
- Checkboxes for support measures:
  - Warm Home Discount
  - Energy efficiency grant
  - Council tax reduction
  - Debt advice referral
  - Other
- Notes field (explain the override)
- [Save Modified Plan] button

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 4.3.2: Admin Case Review - Request Info
**User Story:** 4.2  
**Purpose:** Ask customer for clarification  
**Key Elements:**
- Title: "Questions for Customer"
- Preset questions:
  - "Are there other household members with income?"
  - "Do you have any savings or assets?"
  - "Has anything changed recently?"
  - "Are you getting all eligible benefits?"
- Custom question field
- Deadline (7 days for response)
- [Send Questions] button
- Case paused until response

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 4.3.3: Admin Case Review - Escalate
**User Story:** 4.2  
**Purpose:** Send to senior officer for complex cases  
**Key Elements:**
- Who to escalate to (dropdown list of senior officers)
- Why escalating (dropdown: complexity, uncertainty, vulnerability, data issue, other)
- Notes field
- Priority level (High, Medium, Low)
- [Escalate] button

**Status:** MOCKUP NEEDED

---

### **Epic 5: Admin Dashboard - Performance & Compliance**

#### ✅ Screen 5.1.1: Manager Dashboard - Team Performance
**User Story:** 5.1 (Manager views team performance)  
**Purpose:** Monitor team KPIs  
**Key Elements:**
- Queue health stats (in queue, avg wait, cases >14 days)
- Decision quality stats (approval %, escalation %, awaiting info %)
- Officer-level breakdown:
  - Jane Williams: 127 cases | 88% approval | 2.3 hrs avg
  - Tom Bennett: 118 cases | 86% approval | 2.1 hrs avg
  - Sarah Ahmed: 94 cases | 89% approval | 2.0 hrs avg
  - Mike Johnson: 112 cases | 85% approval | 2.8 hrs avg
- Trend chart (queue health over time)
- [Click officer] to see their cases

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 5.2.1: Compliance Dashboard - Audit Trail
**User Story:** 5.2 (Compliance officer audits decisions)  
**Purpose:** Ensure fair treatment & regulatory compliance  
**Key Elements:**
- FCA compliance metrics:
  - Assessments with documented rationale: 100%
  - Customers assessed on ability to pay: 100%
  - Payment plans sustainable: 98%
  - Complaints: 3
- Ofgem vulnerable protection:
  - PSR customers identified: 127
  - No-disconnection guarantees: 89
  - Priority support assigned: 95%
  - Warm Home Discount offered: 78%
- Discrimination check:
  - Approval rate by age, location, income (should be similar)
  - Fairness score: 0.89/1.0
- [View detailed audit] link

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 5.2.2: Compliance Dashboard - Flag Accuracy
**User Story:** 5.2  
**Purpose:** Check if system flags are accurate  
**Key Elements:**
- Flag type: "High bill ratio flag"
- Accuracy: 92% (92 of 100 flagged cases were correct to flag)
- Flag type: "Data quality flag"
- Accuracy: 78% (needs refinement)
- Flag type: "Default history flag"
- Accuracy: 95% (highly accurate)
- Recommendation: "Data quality flag needs refinement - flag threshold too low"

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 5.3.1: Executive Dashboard - Business Impact
**User Story:** 5.3 (Executive views business KPIs)  
**Purpose:** Show ROI and strategic impact  
**Key Elements:**
- Customers prevented from disconnection: 847
- Arrears recovered: £245,000
- Cost of payment plans: £145,000
- ROI: 1.69:1 (for every £1 spent, £1.69 recovered)
- Plan completion rate: 89%
- Disconnection prevention rate: X%
- Trend charts (improving or declining?)
- Industry comparison (we're beating average)

**Status:** MOCKUP NEEDED

---

### **Epic 6: Hardship Policy Configuration**

#### ✅ Screen 6.1.1: Policy Manager - Configure Rules
**User Story:** 6.1 (Policy manager configures hardship rules)  
**Purpose:** Set company hardship policy  
**Key Elements:**
- Affordability Thresholds section:
  - SEVERE hardship: > X%
  - MODERATE hardship: X-Y%
  - LOW hardship: < X%
  - Input fields, [Save]
- Payment Plan Limits section:
  - Max duration: X months
  - Min payment: £X
  - Max payment: X% of disposable
- Vulnerability Rules section:
  - Pensioner: +X% duration
  - Medical equipment: no disconnection (toggle)
  - Lone parent: +X% duration
- Manual Review Triggers section:
  - Flag if previous default (toggle)
  - Flag if bill ratio > X% (input)
  - Flag if data quality issue (toggle)

**Status:** MOCKUP NEEDED

---

#### ✅ Screen 6.1.2: Policy Manager - Change Impact Preview
**User Story:** 6.1  
**Purpose:** Show impact before saving policy change  
**Key Elements:**
- Current policy: threshold 25% for SEVERE
- Proposed policy: threshold 20% for SEVERE
- Impact preview: "This change will affect ~50 new customers"
- Confirmation: "Are you sure? This applies to all future assessments"
- [Confirm Change] or [Cancel]

**Status:** MOCKUP NEEDED

---

### **Epic 7: Vulnerable Customer Protection**

#### ✅ Screen 7.1.1: PSR Protection - Assessment Result
**User Story:** 7.1 (System identifies & protects PSR customers)  
**Purpose:** Show PSR protection applied  
**Key Elements:**
- If PSR + Medical Equipment:
  - SEVERE hardship badge
  - "NO DISCONNECTION GUARANTEE"
  - "Auto-approved - no review needed"
  - "24/7 Emergency support assigned"
  - Payment plan auto-generated
- If PSR + Other vulnerability:
  - "Priority support assigned"
  - "Extended plan (50% longer)"
  - "Support services recommended"
- If not registered but vulnerable:
  - "We recommend you register on Priority Services Register"
  - [Learn More] [Register Now]

**Status:** MOCKUP NEEDED

---

## UI SCREEN SUMMARY TABLE

| Epic | Screen | Purpose | User | Status |
|------|--------|---------|------|--------|
| 1 | 1.1.1 | Home / Start | Customer | NEEDED |
| 1 | 1.1.2-10 | Bank OAuth Flow | Customer | ✅ CREATED |
| 1 | 1.2.1 | Hardship Notification | System/Email | NEEDED |
| 2 | 2.1.1-5 | Assessment Breakdown | Customer | NEEDED |
| 2 | 2.2.1-4 | Payment Plan Options | Customer | NEEDED |
| 2 | 2.3.1 | Support Services | Customer | NEEDED |
| 3 | 3.1.1-4 | Plan Acceptance | Customer | NEEDED |
| 3 | 3.2.1-2 | Payment Reminders & Portal | Customer | NEEDED |
| 3 | 3.3.1-2 | Missed Payment Handling | Customer | NEEDED |
| 3 | 3.4.1 | 6-Month Reassessment | Customer | NEEDED |
| 4 | 4.1.1-2 | Queue Management | Officer | ✅ CREATED |
| 4 | 4.2.1-4 | Case Review Details | Officer | NEEDED |
| 4 | 4.3.1-3 | Modify/Escalate Case | Officer | NEEDED |
| 5 | 5.1.1 | Team Performance | Manager | NEEDED |
| 5 | 5.2.1-2 | Compliance Audit | Compliance Officer | NEEDED |
| 5 | 5.3.1 | Executive Dashboard | Executive | NEEDED |
| 6 | 6.1.1-2 | Policy Configuration | Policy Manager | NEEDED |
| 7 | 7.1.1 | PSR Protection | All | NEEDED |

---

## MOCKUP CREATION PRIORITY

### **Phase 1 (MVP) - CRITICAL FLOW**
1. Screen 2.1.1 - Assessment Overview
2. Screen 2.2.1 - Payment Plan Options
3. Screen 3.1.1 - Plan Acceptance
4. Screen 4.2.1 - Case Review Details
5. Screen 4.3.1 - Modify Plan

### **Phase 2 (Core Features)**
1. Screens 2.1.2-5 - Assessment Breakdowns
2. Screens 3.2.1-2 - Payment Portal & Reminders
3. Screens 4.2.2-4 - Detailed Case Context
4. Screens 5.1.1, 5.3.1 - Manager/Executive Dashboards

### **Phase 3 (Supporting Screens)**
1. Screen 1.1.1 - Home
2. Screens 3.3.1-2 - Missed Payment Handling
3. Screens 5.2.1-2 - Compliance
4. Screen 6.1.1-2 - Policy Config
5. Screen 7.1.1 - PSR Protection

---

## NEXT STEPS

Which screen mockups should I create first?

**Option A:** Create all remaining mockups now (comprehensive)  
**Option B:** Create Phase 1 (MVP critical flow) - 5 screens  
**Option C:** Pick specific screens you want to see first  

Let me know which direction!

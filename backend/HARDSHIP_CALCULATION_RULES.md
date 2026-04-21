# Bridge Hardship Calculation Rules (MVP)
## Simplified Formula Reference & Business Logic

---

## CORE CONCEPT

**Hardship = Can customer afford their utility bill given their financial situation?**

The system answers this by calculating:
1. **Income** (what money comes in)
2. **Essential Expenses** (what must be paid monthly)
3. **Disposable Income** (income - essentials = leftover budget)
4. **Affordability Ratio** (bill as % of disposable)
5. **Hardship Level** (NONE, LOW, MODERATE, SEVERE)

**MVP Scope:** Current bill affordability only. Arrears handling deferred to Phase 2.

---

## FORMULA 1: DISPOSABLE INCOME

```
Disposable Income = Monthly Income - Essential Expenses

Where:

Monthly Income = (Salary + Benefits + Child Support + Other Regular Income) / 12

Essential Expenses = Housing + Food + Utilities + Transport + Other Fixed Costs
                   (excluding the bill we're assessing)

Result: £X/month available after essentials
```

### **Example Calculation:**

```
Customer: John (72, pensioner)

INCOME:
├─ State Pension:         £780/month
├─ Council Tax Benefit:   £70/month
├─ Other:                 £0
└─ Total Monthly Income:  £850

ESSENTIAL EXPENSES:
├─ Housing (owned, no mortgage): £0
├─ Food:                  £250
├─ Electricity:           £80
├─ Council Tax:           £150
├─ Prescriptions:         £50
├─ Transport:             £20
└─ Total Essential Expenses: £550

DISPOSABLE INCOME = £850 - £550 = £300
```

---

## FORMULA 2: AFFORDABILITY RATIO

```
Affordability Ratio = (Monthly Bill / Disposable Income) × 100

Result: X% - what percentage of disposable income is the bill?
```

### **Interpretation:**

```
If Affordability Ratio is:
├─ 0-10%:  LOW hardship (bill is affordable)
├─ 10-25%: MODERATE hardship (bill is tight but possible)
├─ >25%:   SEVERE hardship (bill exceeds safe limits)
└─ >100%:  CRITICAL (customer has zero/negative disposable income)
           Bill exceeds entire disposable budget - unsustainable
```

### **Example:**

```
Bill = £80/month (electricity)
Disposable Income = £300/month

Affordability Ratio = (£80 / £300) × 100 = 26.7%

Result: SEVERE HARDSHIP (above 25% threshold)
```

---

## FORMULA 3: HARDSHIP LEVEL CLASSIFICATION

```
IF Affordability Ratio > 100% OR Disposable Income ≤ 0
  → SEVERE HARDSHIP
  Reason: Bill exceeds total disposable budget
  Action: Auto-flag, immediate support needed

ELSE IF Affordability Ratio > 25%
  → SEVERE HARDSHIP
  Reason: Bill takes >25% of budget
  Action: Immediate review, payment plan required

ELSE IF Affordability Ratio > 10%
  → MODERATE HARDSHIP
  Reason: Bill is noticeable burden (10-25% of budget)
  Action: Offer payment plan, monitor situation

ELSE IF Affordability Ratio ≥ 0
  → LOW HARDSHIP or NONE
  Reason: Bill is <10% of budget (manageable)
  Action: Standard support, no urgent intervention
```

---

## FORMULA 4: SUSTAINABILITY THRESHOLD

**Core Rule:** Payment plan must leave customer with buffer for emergencies.

```
Max Sustainable Monthly Payment = Disposable Income × Sustainability Threshold

Where Sustainability Threshold = 20% (standard)
                              = 15% (vulnerable customer)
                              = 10% (elderly/medical)
```

### **Example: John (Pensioner)**

```
Disposable Income = £300/month
Standard Threshold = 20% → Max = £60/month
Pensioner Threshold = 10% → Max = £30/month

System will recommend:
└─ £30/month (more sustainable for fixed-income elderly)
   (Rather than £60/month for general population)
   
Why: Lower payment = more sustainable for elderly with no flexibility
```

---

## FORMULA 5: PAYMENT PLAN CALCULATION

**The system generates 3 sustainable payment plans:**

```
PLAN A (CONSERVATIVE):
├─ Monthly Payment = Disposable Income × 14% (20% - 6% safety margin)
├─ Sustainability Score = VERY HIGH (customer has 86% buffer)
└─ Best if: No savings, vulnerable, unstable income

PLAN B (BALANCED):
├─ Monthly Payment = Disposable Income × 18% (20% - 2% safety margin)
├─ Sustainability Score = HIGH (customer has 82% buffer)
└─ Best if: Moderate savings, stable income

PLAN C (AGGRESSIVE):
├─ Monthly Payment = Disposable Income × 20% (no safety margin)
├─ Sustainability Score = MEDIUM (little buffer, risky if emergency)
└─ Best if: Good savings, very stable income

Note: All plans ensure customer can still afford basic living expenses
      and have buffer for unexpected costs.
```

### **Example: Customer with £300 disposable**

```
Current Bill: £80/month (26.7% of disposable - SEVERE)

PLAN A (CONSERVATIVE):
├─ Payment = £300 × 14% = £42/month
├─ This allows: Pay bill + budget overrun reduction
├─ Buffer = £300 - £42 = £258/month for other needs
└─ Sustainability = VERY HIGH ✓

PLAN B (BALANCED):
├─ Payment = £300 × 18% = £54/month
├─ Buffer = £300 - £54 = £246/month
└─ Sustainability = HIGH ✓

PLAN C (AGGRESSIVE):
├─ Payment = £300 × 20% = £60/month
├─ Buffer = £300 - £60 = £240/month
└─ Sustainability = MEDIUM ⚠
```

---

## FORMULA 6: PSR VULNERABILITY ADJUSTMENTS

**PSR status CHANGES the thresholds:**

```
IF Customer is PSR Registered:
  THEN Apply Vulnerability Multiplier to thresholds

PSR Vulnerability Type | Threshold | Impact
───────────────────────┼──────────┼──────────────────────
PENSIONER (60+)        | 10%      | Stricter (lower payment, safer)
DISABLED               | 12%      | Stricter
CARER                  | 12%      | Stricter
LONE PARENT            | 15%      | Stricter
DOMESTIC VIOLENCE      | 12%      | Stricter
LONG-TERM HEALTH       | 12%      | Stricter
MEDICAL EQUIPMENT ⚠   | 5%       | CRITICAL - Auto-approve, no issues
MULTIPLE FLAGS (2+)    | 10%      | Strictest applied
```

### **Real Example: Elderly Pensioner**

**WITHOUT PSR adjustment:**
```
Disposable Income: £300/month
Bill: £80/month (26.7%)
Threshold: 20%
Max Payment: £60/month
```

**WITH PSR (Pensioner) adjustment:**
```
Disposable Income: £300/month
Bill: £80/month (26.7%)
Threshold: 10% (reduced from 20% - stricter for safety)
Max Payment: £30/month (more conservative, safer for fixed income)
```

---

## FORMULA 7: AFFORDABILITY RATIO BENCHMARKING

**Compare customer's ratio to typical household:**

```
Customer Affordability Ratio:    26.7% (their bill is 26.7% of disposable)
Benchmark (Typical Household):   5-8% (bill is only 5-8% of disposable)

Gap = 26.7% - 7% = 19.7% above typical
Message to Customer: "Your bill is about 19 percentage points above 
                     the typical household"
Meaning: Real problem - bill genuinely unaffordable for them
```

---

## FORMULA 8: INCOME VOLATILITY CHECK

**Flag if income is unstable:**

```
IF Customer is Self-Employed OR Income Varies:
  
  Variance = (Max Monthly Income - Min Monthly Income) / Average Income × 100
  
  IF Variance > 50%
    → FLAG for manual review
    → Use Conservative Assessment Approach
    → Recommend lower payment plan
    → More frequent reassessment
```

### **Example: Contractor**

```
Month 1: £2,500
Month 2: £1,200
Month 3: £3,100
Month 4: £800
Month 5: £2,400
Month 6: £2,000

Average = £1,833/month
Min = £800, Max = £3,100
Variance = (3100 - 800) / 1833 × 100 = 125% (VERY HIGH!)

Action: Use conservative income estimate
        Flag for manual review
        Recommend Conservative plan
```

---

## FORMULA 9: BILL SPIKE DETECTION

**Detect unusual spikes:**

```
IF Current Bill > Previous 6-Month Average × 1.5
  → FLAG: Possible meter error, usage spike, seasonal variance
  → Request customer verification
  → May explain current hardship (temporary, not structural)
```

---

## FULL CALCULATION WORKFLOW

```
Step 1: GATHER DATA
├─ Pull 6 months of bank transactions (Tink)
├─ Customer utility account info (current bill amount)
└─ PSR status from Priority Services Register

Step 2: CATEGORIZE INCOME & EXPENSES
├─ Income sources (salary, benefits, other regular)
├─ Essential expenses (housing, food, utilities, transport)
└─ Calculate average monthly values

Step 3: CALCULATE DISPOSABLE INCOME
├─ Monthly Income - Essential Expenses = Disposable Income
└─ Flag if negative or very low (< £50/month)

Step 4: CALCULATE AFFORDABILITY RATIO
├─ (Bill / Disposable Income) × 100 = Ratio %
├─ Map to hardship level (NONE/LOW/MODERATE/SEVERE)
└─ Compare to benchmark (typical household 5-8%)

Step 5: CHECK FOR PSR/VULNERABILITIES
├─ Is customer on Priority Services Register?
├─ Apply appropriate threshold adjustments
└─ If medical equipment → CRITICAL flag

Step 6: GENERATE 3 PAYMENT PLANS
├─ PLAN A (14% threshold) - Conservative
├─ PLAN B (18% threshold) - Balanced
├─ PLAN C (20% threshold) - Aggressive
└─ Each shows: payment, sustainability score, explanation

Step 7: FLAG FOR MANUAL REVIEW IF:
├─ Confidence score < 75%
├─ Data quality issues (incomplete, suspicious)
├─ Vulnerability complexity (multiple flags)
├─ Income volatility > 50%
├─ PSR + SEVERE combination
└─ Bill spike detected (needs explanation)

Step 8: GENERATE ASSESSMENT REPORT
├─ Financial snapshot (income, expenses, disposable)
├─ Hardship level with explanation
├─ 3 payment plans with sustainability scores
├─ Support recommendations (Warm Home Discount, grants, etc.)
├─ PSR protections (if applicable)
└─ Risk score for officer review

Step 9: SEND TO CUSTOMER
├─ Email with assessment results
├─ 3 plan options to choose from
├─ Support service recommendations
└─ Next steps (accept plan, ask questions, contact officer)

Step 10: OFFICER REVIEW (If Flagged)
├─ Review full context
├─ Approve, modify, request info, or escalate
├─ All decisions logged with rationale
└─ Customer notified of decision
```

---

## THRESHOLDS REFERENCE TABLE

```
SEVERITY        | Affordability Ratio | Action
────────────────┼────────────────────┼──────────────────────
NONE            | 0-5%               | Standard billing
LOW             | 5-10%              | Monitor, offer info
MODERATE        | 10-25%             | Offer payment plan
SEVERE          | 25-100%            | Immediate support
CRITICAL        | >100% or ≤0        | Manual review + urgent
────────────────┼────────────────────┼──────────────────────
PSR ADJUSTED    | 10% (elderly)      | More lenient thresholds
                | 12% (disabled)     | Lower recommended payments
                | 5% (medical)       | Critical - auto-approve
```

---

## REAL CALCULATION EXAMPLES

### **Example 1: Standard Case (MODERATE)**

```
Customer: Sarah, 35, employed

INCOME CALCULATION:
├─ Salary:           £2,000/month
├─ Partner's salary: £1,500/month
├─ Child benefits:   £100/month
└─ Total Income:     £3,600/month

EXPENSE CALCULATION:
├─ Mortgage:         £800
├─ Childcare:        £400
├─ Food:             £400
├─ Electricity:      £100 (ASSESSING THIS)
├─ Council Tax:      £150
├─ Transport:        £200
├─ Other:            £350
└─ Total Essentials: £2,400 (excluding electricity bill)

DISPOSABLE INCOME = £3,600 - £2,400 = £1,200

AFFORDABILITY RATIO = (£100 / £1,200) × 100 = 8.3%

HARDSHIP LEVEL: LOW (5-10% range, borderline MODERATE)

RECOMMENDATION: No urgent action needed, but monitor
SUPPORT: Check council tax band, childcare vouchers
```

---

### **Example 2: Vulnerable Case (SEVERE + PSR)**

```
Customer: Maria, 67, widow, disabled

INCOME CALCULATION:
├─ State Pension:         £920/month
├─ Disability Allowance:  £230/month
└─ Total Income:          £1,150/month

EXPENSE CALCULATION:
├─ Housing (rented):      £650
├─ Food:                  £250
├─ Electricity:           £100 (ASSESSING THIS)
├─ Carer Support:         £80
├─ Other:                 £150
└─ Total Essentials:      £1,230

DISPOSABLE INCOME = £1,150 - £1,230 = -£80

⚠ CRITICAL: Income doesn't cover essentials. Fundamental crisis.

HARDSHIP LEVEL: SEVERE / CRITICAL (Undefined, negative disposable)

PSR ADJUSTMENTS:
├─ Status: Registered (DISABLED + WIDOW)
├─ Vulnerability Score: Very High
└─ Manual Review: REQUIRED

PAYMENT PLAN:
├─ Can't afford standard payment plan
├─ Recommend: Welfare support + government assistance
├─ Payment plan: Once welfare improves situation
└─ Support: Apply for Warm Home Discount (£140/year)

EXPECTED OFFICER DECISION:
"Customer is widow, disabled, fixed income. Income doesn't cover 
essentials. NOT suitable for standard payment plan. Refer to:
- StepChange (debt charity)
- Citizens Advice (welfare assessment)
- Local authority hardship fund
- Warm Home Discount application

Reassess in 3 months after welfare support applied."
```

---

### **Example 3: Self-Employed High Volatility (FLAG FOR REVIEW)**

```
Customer: Tom, 45, self-employed contractor

INCOME VARIATION (last 6 months):
├─ Month 1: £4,500
├─ Month 2: £1,200
├─ Month 3: £3,800
├─ Month 4: £900
├─ Month 5: £4,200
├─ Month 6: £2,100
└─ Average: £2,783/month

Variance = (4500 - 900) / 2783 × 100 = 129% (VERY HIGH!)

SYSTEM DECISION:
├─ Flag for manual review (confidence too low)
├─ Use CONSERVATIVE income estimate
│  (Use lowest quarter average = £2,000/month)
└─ Assessment based on £2,000 (not £2,783 average)

ASSESSMENT:
├─ Disposable Income (conservative): £500/month
├─ Bill: £120/month
├─ Affordability Ratio: (120/500) × 100 = 24%
└─ Hardship Level: MODERATE-to-SEVERE (borderline, 10-25% range)

OFFICER REVIEW:
"Self-employed with 129% income volatility. Used conservative estimate.
Bill is 24% of low-estimate disposable. Recommend CONSERVATIVE plan
(14% threshold = £70/month). Requires reassessment every 3 months
(not 6). Monitor for business income trends."
```

---

## SYSTEM CONFIDENCE SCORE

```
Confidence = Base Score (100) - Deductions

Deductions for:
├─ Missing bank data:              -5 points per month missing
├─ Low transaction count:          -10 points if <10 transactions
├─ Suspicious patterns:            -15 points per flag
├─ Income volatility >50%:         -20 points
├─ Data conflicts (self vs bank):  -15 points
└─ Account dormancy (30+ days):    -10 points

Result:
├─ >85%: HIGH confidence (auto-approve for standard cases)
├─ 75-85%: MEDIUM confidence (officer review recommended)
└─ <75%: LOW confidence (manual review REQUIRED)
```

---

## KEY BUSINESS RULES

### **Rule 1: Never recommend unaffordable plan**
```
IF (Recommended Payment > Disposable Income × 20%)
  THEN Reduce plan payment
  UNTIL Payment ≤ Disposable Income × 20%
```

### **Rule 2: PSR overrides standard logic**
```
IF PSR.medicalEquipmentDependence OR PSR.multiple_flags
  THEN Apply strictest vulnerability threshold
       Flag for manual review
       Ensure no disconnection risk
```

### **Rule 3: Fairness across population**
```
Monitor fairness metrics:
├─ Approval rate by age group
├─ Approval rate by gender
├─ Approval rate by location
└─ Flag if systematic bias detected
```

### **Rule 4: Reassessment trigger**
```
IF 6 months have passed since last assessment
  THEN Auto-prompt reassessment
       IF income improved: offer lower payment option
       IF income declined: offer lower payment option
       IF no change: confirm plan continuing
```

---

## SUMMARY: THE CORE FORMULA

```
Hardship = Bill / (Income - Essential Expenses) × 100%

IF Hardship > 25% → SEVERE
IF Hardship > 10% → MODERATE
IF Hardship > 0%  → LOW or NONE

Payment Plan Payment = Disposable × Threshold (14-20%)
Plan Sustainability = Based on buffer remaining for emergencies

IF PSR Registered → Apply Vulnerability Adjustments (stricter)
IF Multiple Flags → Escalate to Officer
IF Confidence < 75% → Manual Review Required

Result: Sustainable Payment Plan (or manual officer review if edge case)
```

# Bridge UI Screen Library
## Visual Mockup Reference Guide for Claude Code

---

## SCREENS CREATED & RENDERED IN THIS SESSION

### ✅ CUSTOMER JOURNEY SCREENS

#### Screen 2.1.1: Assessment Overview
**Location:** Customer Portal → Assessment Results  
**User:** Customer  
**Purpose:** Customer sees their financial hardship level at a glance  
**Key Elements:**
- Hardship badge (SEVERE, MODERATE, LOW, NONE) - prominent color
- 4-column grid: Income, Expenses, Disposable, Bill %
- Explanation text: "Your bill exceeds your entire disposable budget"
- [View Detailed Breakdown] button to dive deeper

**Visual Status:** ✅ MOCKUP RENDERED ABOVE

---

#### Screen 2.2.1: Payment Plan Options
**Location:** Customer Portal → Payment Plans  
**User:** Customer  
**Purpose:** Customer chooses between 3 sustainable payment plans  
**Key Elements:**
- 3 plan cards (Conservative, Balanced, Aggressive)
- Conservative highlighted as "Recommended" (2px blue border)
- Each plan shows: Monthly payment, Duration, Sustainability score
- Plain English explanation for each
- [Select This Plan] buttons on each

**Visual Status:** ✅ MOCKUP RENDERED ABOVE

---

#### Screen 3.1.1: Plan Acceptance
**Location:** Customer Portal → Confirm Payment Plan  
**User:** Customer  
**Purpose:** Get explicit agreement before plan goes live  
**Key Elements:**
- Plain English T&Cs (not legal jargon)
- 5 key points (will pay £X on 15th, 3 misses = escalation, can reschedule, 6-month review, confirm affordability)
- Checkbox: "I understand and accept this payment plan"
- [Continue] and [Back] buttons

**Visual Status:** ✅ MOCKUP RENDERED ABOVE

---

### ✅ ADMIN SCREENS

#### Screen 4.1.1: Admin Queue Overview
**Location:** Admin Dashboard → Manual Review Queue  
**User:** Hardship Support Officer  
**Purpose:** See all cases needing review organized by priority  
**Key Elements:**
- Stats row: Total, High Priority, Avg wait time, Approval rate
- Filters: Priority, Duration, Assigned to
- Cases listed by priority (High first, then Medium, then Low)
- Each case shows: Name, Priority, Bill, Income, Why flagged
- Quick actions: Review, Defer, Escalate, etc.

**Visual Status:** ✅ MOCKUP RENDERED IN EARLIER CHAT

---

#### Screen 4.1.2: Admin Queue - All 23 Cases
**Location:** Admin Dashboard → Full Queue  
**User:** Hardship Support Officer  
**Purpose:** See comprehensive list of all pending cases  
**Key Elements:**
- High Priority section (8 cases) - RED borders
- Medium Priority section (12 cases) - YELLOW borders  
- Low Priority section (3 cases) - GRAY borders
- Each case expandable with full details
- Filter and sort options

**Visual Status:** ✅ MOCKUP RENDERED IN EARLIER CHAT

---

#### Screen 4.2.1: Case Review Details
**Location:** Admin Dashboard → Case Review → CUST-4521  
**User:** Hardship Support Officer  
**Purpose:** Full context for officer to make fair decision on a single case  
**Key Elements:**
- Customer name and priority badge
- "Why Flagged" section (3 bullet points explaining red flags)
- Financial Summary grid (Income, Expenses, Disposable, Bill %)
- System Assessment (Hardship level, Confidence %, Recommended plan)
- Vulnerabilities detected (badges with severity)
- Text area for officer's decision notes
- Decision buttons: [Approve System Plan] [Modify Plan] [Escalate]

**Visual Status:** ✅ MOCKUP RENDERED ABOVE

---

#### Screen 4.3.1: Modify Plan
**Location:** Admin Dashboard → Case Review → Modify Payment Plan  
**User:** Hardship Support Officer  
**Purpose:** Officer adjusts plan for vulnerable/edge cases  
**Key Elements:**
- Current system recommendation (as reference)
- Input fields: Monthly Payment (with safe zone guidance), Duration (with policy limits)
- Checkboxes for support measures (Warm Home Discount, grants, council tax)
- Text area: "Why Modifying" (required explanation)
- Examples text showing typical overrides
- [Save & Confirm] and [Cancel] buttons

**Visual Status:** ✅ MOCKUP RENDERED ABOVE

---

## SCREENS CREATED BUT NOT YET RENDERED
(These need mockup creation - specifications ready in BRIDGE_SPECS_AND_USER_STORIES.md)

### CUSTOMER SCREENS NEEDED

**Screen 1.1.1:** Home / Dashboard (entry point)  
**Screen 2.1.2-5:** Assessment breakdowns (4 tabs: Overview, Expenses, Income, Why This Happened)  
**Screen 2.3.1:** Support Services Recommendations  
**Screen 3.1.2-3:** Plan Setup (payment method, Direct Debit, confirmation)  
**Screen 3.2.1-2:** Payment reminders & portal (track progress)  
**Screen 3.3.1-2:** Missed payment handling  
**Screen 3.4.1:** 6-month reassessment  

### ADMIN SCREENS NEEDED

**Screen 4.2.2-4:** Case detail tabs (Customer Context, Financial, Bank Data)  
**Screen 4.3.2-3:** Request Info, Escalate workflows  

### MANAGER/COMPLIANCE SCREENS NEEDED

**Screen 5.1.1:** Team performance dashboard  
**Screen 5.2.1-2:** Compliance & audit dashboard  
**Screen 5.3.1:** Executive business impact dashboard  

### CONFIGURATION SCREENS NEEDED

**Screen 6.1.1-2:** Policy manager configuration  
**Screen 7.1.1:** PSR protection display  

---

## DESIGN SYSTEM USED

All mockups follow Bridge design system:
- **Colors:** CSS variables for light/dark mode compatibility
- **Typography:** Anthropic Sans, 2 weights only (400, 500)
- **Spacing:** 1rem vertical rhythm, 8-16px component gaps
- **Borders:** 0.5px solid, var(--color-border-tertiary) default
- **Radius:** var(--border-radius-md) for components, var(--border-radius-lg) for cards
- **Buttons:** Outline style, hover state with bg-secondary

---

## NAVIGATION FLOW

```
Home
├─ Connect Bank
│  ├─ Intro → Privacy → Bank Selection → Bank Login → Account Selection
│  ├─ Permissions → Processing → Success/Error
│  └─ Assessment Results (Screen 2.1.1)
│
├─ Assessment
│  ├─ Overview (Screen 2.1.1) ✅
│  ├─ Detailed Breakdown (5 tabs) - NEEDED
│  ├─ Support Recommendations (Screen 2.3.1) - NEEDED
│  └─ Payment Plans (Screen 2.2.1) ✅
│
└─ Payment Plans
   ├─ Options (Screen 2.2.1) ✅
   ├─ Select & Accept (Screen 3.1.1) ✅
   ├─ Setup Payment (Screens 3.1.2-3) - NEEDED
   └─ Payment Portal (Screen 3.2.1-2) - NEEDED

Admin Dashboard
├─ Manual Review Queue (Screens 4.1.1-2) ✅
├─ Case Review (Screen 4.2.1) ✅
│  ├─ Tabs: Customer Context, Financial, Bank Data (4.2.2-4) - NEEDED
│  ├─ Modify Plan (Screen 4.3.1) ✅
│  ├─ Request Info (Screen 4.3.2) - NEEDED
│  └─ Escalate (Screen 4.3.3) - NEEDED
├─ Performance Dashboard (Screen 5.1.1) - NEEDED
└─ Compliance Dashboard (Screen 5.2.1-2) - NEEDED
```

---

## MOCKUP DELIVERABLES FOR CLAUDE CODE

**What you have NOW (ready to hand over):**
1. ✅ Complete user stories & acceptance criteria (BRIDGE_SPECS_AND_USER_STORIES.md)
2. ✅ UI screen inventory with descriptions (BRIDGE_UI_SCREEN_INVENTORY.md)
3. ✅ 7 visual mockups rendered above:
   - Screen 2.1.1 (Assessment Overview)
   - Screen 2.2.1 (Payment Plan Options)
   - Screen 3.1.1 (Plan Acceptance)
   - Screen 4.1.1 (Queue Overview) - from earlier chat
   - Screen 4.1.2 (Full Queue List) - from earlier chat
   - Screen 4.2.1 (Case Review Details)
   - Screen 4.3.1 (Modify Plan)

4. ✅ Bank OAuth flow (9 screens) - from earlier chat

---

## NEXT STEPS FOR CLAUDE CODE

### Phase 1: Build Core Customer Journey (Highest Priority)
1. Screen 2.1.1 - Assessment Overview ✅ (have mockup)
2. Screen 2.2.1 - Payment Plan Options ✅ (have mockup)
3. Screen 3.1.1 - Plan Acceptance ✅ (have mockup)
4. Screen 1.1.1 - Home / Dashboard (need mockup)
5. Screens 2.1.2-5 - Assessment tabs (need mockups)

### Phase 2: Admin Workflow (Second Priority)
1. Screen 4.1.1 - Queue ✅ (have mockup)
2. Screen 4.2.1 - Case Review ✅ (have mockup)
3. Screen 4.3.1 - Modify Plan ✅ (have mockup)
4. Screens 4.2.2-4 - Case detail tabs (need mockups)

### Phase 3: Supporting Features (Third Priority)
1. Screens 3.2, 3.3, 3.4 - Payment portal & reminders
2. Screens 5.1, 5.2, 5.3 - Manager/Compliance dashboards
3. Screens 6.1, 7.1 - Config & PSR protection

---

## INSTRUCTIONS FOR CLAUDE CODE SESSION

When moving to Claude Code, provide Claude with:

1. **This document** (visual reference guide)
2. **BRIDGE_SPECS_AND_USER_STORIES.md** (functional requirements)
3. **BRIDGE_UI_SCREEN_INVENTORY.md** (screen descriptions)
4. **The rendered mockups above** (visual references)
5. **Note:** All design system CSS variables are Claude.ai standard - don't need custom styling

Tell Claude Code:
> "Here are the visual mockups and user stories for Bridge. Build the screens following these mockups. When uncertain about layout or interaction, refer to the corresponding user story's acceptance criteria. Ask me for clarification on any technical architecture decisions."

---

## QUICK REFERENCE: SCREENS BY USER ROLE

### Customer Portal
- Home (Screen 1.1.1) - NEEDED
- Bank Connection (9 screens from earlier) ✅
- Assessment (Screens 2.1.1, 2.1.2-5) - 1 ready, 4 needed
- Support Services (Screen 2.3.1) - NEEDED
- Payment Plans (Screen 2.2.1) ✅
- Plan Acceptance (Screen 3.1.1) ✅
- Payment Setup (Screens 3.1.2-3) - NEEDED
- Payment Portal (Screen 3.2.1-2) - NEEDED
- Missed Payment Handling (Screens 3.3.1-2) - NEEDED
- Reassessment (Screen 3.4.1) - NEEDED

### Admin Dashboard
- Queue (Screens 4.1.1-2) ✅
- Case Review (Screens 4.2.1-4) - 1 ready, 3 needed
- Modify Plan (Screen 4.3.1) ✅
- Request Info (Screen 4.3.2) - NEEDED
- Escalate (Screen 4.3.3) - NEEDED

### Manager Dashboard
- Team Performance (Screen 5.1.1) - NEEDED

### Compliance Dashboard
- Audit Trail (Screen 5.2.1) - NEEDED
- Flag Accuracy (Screen 5.2.2) - NEEDED

### Executive Dashboard
- Business Impact (Screen 5.3.1) - NEEDED

### Configuration
- Policy Manager (Screens 6.1.1-2) - NEEDED
- PSR Protection (Screen 7.1.1) - NEEDED

---

## SUMMARY

**Total Screens Needed:** 37  
**Screens with Mockups:** 7 (19%)  
**Ready for Development:** Core customer journey + admin workflow ✅  

**Recommendation:** Start Claude Code with Phase 1 (5 screens total, 3 with mockups). Build customer assessment flow first. Then move to admin queue and case review.

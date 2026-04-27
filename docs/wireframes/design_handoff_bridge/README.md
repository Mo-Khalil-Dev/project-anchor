# Handoff: Bridge — Hardship Management Platform

## Overview

Bridge is a UK utility company hardship management platform. It enables:
- **Customers** to connect their bank via Open Banking (Tink), receive a financial hardship assessment, choose a payment plan, and manage ongoing payments.
- **Case Officers** to review flagged cases, approve or modify plans, request information, and escalate complex cases.
- **Managers & Executives** to monitor team performance, compliance (FCA/Ofgem), and business impact.
- **Policy Managers** to configure the hardship detection rules engine.

---

## About the Design Files

The files bundled here are **high-fidelity HTML prototypes** — they show the intended look, layout, copy, and interactive behaviour of every screen. They are **not production code to ship directly**.

Your task is to **recreate these designs in your target codebase** using its existing framework, component library, and design system conventions. If no codebase exists yet, the recommended stack is **React + TypeScript** with a component library such as shadcn/ui or Radix UI.

Open `Bridge Screen Index.html` in a browser for a navigable overview of all 25 screens. Each screen file in `screens/` is a self-contained prototype you can open directly.

---

## Fidelity

**High-fidelity.** These are pixel-accurate mockups with final colours, typography, spacing, and interactions. Recreate them as closely as possible using your codebase's patterns.

---

## Design Tokens

### Colours

| Token | Value | Usage |
|-------|-------|-------|
| `accent` | `oklch(52% 0.18 270)` ≈ `#5b5bd6` | Primary CTA, links, active states |
| `accentBg` | `oklch(96.5% 0.03 270)` ≈ `#f0f0ff` | Tinted card backgrounds |
| `accentDark` | `oklch(40% 0.22 285)` ≈ `#3d3aa8` | Gradient end, hover states |
| `green` | `oklch(51% 0.17 145)` ≈ `#1e7d3f` | Success, LOW risk, positive metrics |
| `greenBg` | `oklch(96.5% 0.04 145)` ≈ `#edf7ef` | Green tinted backgrounds |
| `amber` | `oklch(62% 0.16 76)` ≈ `#b06000` | Warnings, MEDIUM risk |
| `amberBg` | `oklch(96.5% 0.05 76)` ≈ `#fef8ec` | Amber tinted backgrounds |
| `red` | `oklch(52% 0.18 25)` ≈ `#c0392b` | Errors, SEVERE risk, danger actions |
| `redBg` | `oklch(97% 0.03 25)` ≈ `#fdf0ef` | Red tinted backgrounds |
| `text` | `#0d0f14` | Primary body text |
| `sub` | `#5a5f72` | Secondary / supporting text |
| `muted` | `#9197ab` | Placeholder, labels, captions |
| `divider` | `rgba(0,0,0,0.07)` | Row separators inside cards |
| `border` | `rgba(0,0,0,0.08)` | Card borders |
| `card` | `#ffffff` | Card backgrounds |
| `bg` | `#f4f5f9` | Page background |
| `sidebar` | `#160f2e` | Admin sidebar background |

### Typography

| Element | Font | Size | Weight | Notes |
|---------|------|------|--------|-------|
| Page title (h1) | Plus Jakarta Sans | 26px | 800 | letter-spacing: -0.6px |
| Section title (h2) | Plus Jakarta Sans | 20px | 700 | letter-spacing: -0.4px |
| Card heading | Plus Jakarta Sans | 15px | 700 | |
| Body | Plus Jakarta Sans | 14px | 400 | line-height: 1.55 |
| Label / meta | Plus Jakarta Sans | 13.5px | 400–600 | |
| Section label | Plus Jakarta Sans | 11px | 600 | UPPERCASE, letter-spacing: 0.07em |
| Stat figure | Plus Jakarta Sans | 28–48px | 800 | letter-spacing: -1px |
| Admin sidebar | Plus Jakarta Sans | 13.5px | 400/600 | |

**Font import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Spacing

| Name | Value |
|------|-------|
| Card padding | 20–28px |
| Row padding | 11px 0 |
| Section gap | 12–20px |
| Page max-width (customer) | 840px |
| Admin content padding | 28px |

### Border Radius

| Element | Radius |
|---------|--------|
| Page cards | 18px |
| Stat cards | 14px |
| Buttons | 12–14px |
| Badges/pills | 100px |
| Inputs | 10–12px |
| Admin sidebar | 10px (nav items) |

### Shadows

| Context | Value |
|---------|-------|
| Cards | `0 1px 4px rgba(0,0,0,0.06)` |
| Elevated cards | `0 4px 20px oklch(52% 0.18 270 / 0.18)` |
| Primary button | `0 4px 18px oklch(52% 0.18 270 / 0.28)` |
| Admin sidebar | none (flat) |

---

## Component Library

All shared components live in `bridge-ui.jsx`. Below is a reference for each.

### `CustomerLayout`
Full-page web layout for customer-facing screens.
- Sticky header (60px): Bridge logo left, progress steps centre, user avatar right
- Step indicators: filled rectangles (24px wide when active, 8px inactive)
- Content: max-width 840px, centred, padding 40px 32px

### `AdminLayout`
Full-page web layout for officer/admin screens.
- Left sidebar (220px): dark navy `#160f2e`, logo + nav items + user profile
- Top bar (60px): white, page title left, date + avatar right
- Nav items: icon + label, active item has `rgba(255,255,255,0.10)` bg
- Unread badge on "Queue" nav item (red pill)

### `WebHero`
Full-width gradient banner (`oklch(52% 0.18 270)` → `oklch(43% 0.22 285)`).
- Border radius: 20px
- Decorative circles: `rgba(255,255,255,0.06)`, positioned top-right

### `Card`
White rounded card, `border: 1px solid rgba(0,0,0,0.08)`, `border-radius: 18px`, subtle shadow.

### `Btn`
- **primary**: accent fill, white text, accent glow shadow
- **secondary**: transparent, muted text, border
- **ghost**: transparent, accent text/border
- **danger**: red fill, white text
- **success**: green fill, white text
- All buttons: height 52px (small: 42px), border-radius 14px (small: 11px), 0.97 scale on press

### `HardshipBadge`
Coloured pill with dot indicator.
- SEVERE → red
- MODERATE → amber
- LOW → green
- NONE → muted grey

### `SustBadge`
Sustainability pill: HIGH (green), MEDIUM (amber), LOW (red).

### `Tabs`
Underline tab bar. Active tab: accent colour + 2px bottom border. Font weight 600 when active.

### `Table`
Admin data table: grey header row, white rows, 1px dividers, 13.5px body text.

### `StatCard`
Admin KPI card: large value (28px 700), label below, optional sub-label. Coloured top border.

### `ProgressBar`
Horizontal bar: rounded, grey track, coloured fill. Auto-colours red/amber/green by value %.

### `CheckRow` / `XRow`
List item with green ✓ or red ✗ circle icon, 13.5px body text, 1px bottom border.

---

## Screens

### Epic 0 — Account Setup

#### 0.1 Account Setup Journey
**File:** `screens/Screen 0 - Account Setup Journey.html`
**Type:** Customer · Multi-step flow (7 states in one file)

This is the **first screen a customer sees** after being redirected back from AWS Cognito authentication. There is **no login form in the app** — authentication is handled entirely by the Cognito hosted UI (external). The app receives the user after a successful Cognito redirect.

| Step | State key | Description |
|------|-----------|-------------|
| 0 | `callback` | Cognito redirect landing — full-screen spinner while session is established |
| 1 | `checking` | Checking whether the user already has a linked utility account (auto-advances ~2s) |
| 2 | `linking` Step 1 | Select utility type: Water / Gas / Electricity |
| 3 | `linking` Step 2 | Enter postcode + account reference number |
| 4 | `success` | Account verified — summary + "Continue to bank connection" CTA |
| 5 | `error` | Verification failed — details entered, common reasons, retry / help CTAs |
| 6 | `help` | How to find your account reference (per utility type) |
| 7 | `redirect` | Transitional spinner: "Taking you to bank connection…" |

**Authentication flow:**
- The app does **not** render a login screen. AWS Cognito handles authentication via its hosted UI.
- After login, Cognito redirects the user back to the app (e.g. `/callback?code=...`).
- On landing, the app immediately shows the `callback` spinner (~1.8s) while it exchanges the auth code for tokens.
- Once tokens are obtained, transition to `checking`.

**Callback spinner (`callback` state):**
- Full-screen, page background `#f4f6f8`
- Bridge logo + wordmark centred
- Spinning arc loader: 40×40px, accent colour `oklch(56% 0.14 200)`
- Label: `"Signing you in…"` (15px 600wt) + `"Completing authentication with AWS Cognito"` (13.5px muted)
- Auto-advances after ~1.8s (in production: advance when token exchange completes)

**Checking state (`checking`):**
- Same full-screen spinner layout
- Label: `"Checking your account…"` + `"Looking up linked utility accounts"`
- Auto-advances to `linking` after ~2.2s (in production: advance when accounts API responds)
- If account already linked → skip ahead to Epic 1 (Bank Connection)

**Utility type selection — Step 1 of `linking`:**
- Amber "Action required" pill badge
- H1: `"Link your utility account"`
- 3 radio-style cards: Water / Gas / Electricity — icon (44×44) + label + desc + radio circle
- Selected state: 2px accent border + accent-tinted bg + accent glow shadow
- Primary CTA disabled until a type is selected

**Account details form — Step 2 of `linking`:**
- Back button, selected utility pill with icon
- H1: `"Account details"`
- 2 inputs: Postcode (auto-uppercase, validates UK format `^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$`) + Account reference
- Blue info tip: how to find the reference number
- CTA: `"Link account"` with 2s loading state
- Test: reference starting with `"ERR"` routes to `error` state

**Step indicator (header, Steps 1–2):**
- Two rectangles top-right: 28px wide active / 8px inactive, accent fill
- Label: `"Step 1 of 2"` / `"Step 2 of 2"`

**Success state:**
- Green check icon 80×80, `pop` keyframe animation on mount
- Summary card: utility type / postcode / account ref / Verified status pill
- Gradient CTA banner: "Next step — Connect your bank account"
- Primary CTA: `"Continue to bank connection"` → `redirect` state

**Error state:**
- Red ✕ icon 80×80, `pop` keyframe
- Summary of details entered
- Red callout with 3 common failure reasons
- CTAs: `"Try again"` (→ `linking`) + `"I need help finding my details"` (→ `help`)

**Help screen:**
- Back → `error` state
- Numbered steps per utility type for locating account reference
- Support callout: `0800 123 4567`

---

### Epic 1 — Bank Connection

#### 1.1 Bank Connection Journey
**File:** `screens/Screen 1.1 - Bank Connection Journey.html`
**Type:** Customer · Multi-step flow (6 states in one file)

| Step | State key | Description |
|------|-----------|-------------|
| 1.1.2 | `intro` | Hero + 3 value props + what we will/won't access + 2 CTAs |
| 1.1.3 | `privacy` | Privacy details + GDPR + consent checkbox gate |
| 1.1.3b | `tink` | Tink redirect interstitial (auto-advances after 2.2s) |
| 1.1.8 | `connecting` | Animated 3-step progress (auto-advances to success) |
| 1.1.9 | `success` | Success state + data summary |
| 1.1.10 | `error` | Error state + retry + manual option |

**Key behaviour:**
- Privacy consent checkbox gates the "Connect" CTA
- Tink interstitial auto-redirects (in real implementation, this is a server-side redirect to Tink's hosted UI)
- Processing screen has 3 animated steps with pulse/check animations
- Page state persisted in `localStorage` key `bridge_bank_journey`

#### 1.1.1 Home / Dashboard
**File:** `screens/Screen 1.1.1 - Home.html`
- WebHero with account summary pills
- 3-step "how it works" explainer
- Two option cards: "Connect Bank Account" (primary, accented border) vs "Upload Statements" (secondary)
- Trust footnote

---

### Epic 2 — Assessment & Recommendations

#### 2.1.1 Assessment Overview
**File:** `screens/Screen 2.1.1 - Assessment Overview.html`
- HardshipBadge (SEVERE) + account reference
- 3 stat cards: Income / Expenses / Disposable (coloured top borders)
- Bill ratio card: large 323% figure + benchmark bar (gradient green→amber→red) + explanation callout
- Formula strip: income − expenses = disposable
- CTAs: View Breakdown / Explore Plans

#### 2.1.2–5 Assessment Breakdown (tabbed)
**File:** `screens/Screen 2.1.2-5 - Assessment Breakdown.html`
**Tabs:** Overview · Expenses · Income Stability · Why This Happened
- Overview: income/expense table + formula card + ratio card
- Expenses: bar chart by category + UK average comparison table
- Income: SVG line chart (6 months) + summary stats
- Why: 3 factor cards with severity + short/medium/long-term actions

#### 2.2.1 Payment Plan Options
**File:** `screens/Screen 2.2.1 - Payment Plans.html`
- 3-column plan cards: Conservative / Balanced / Aggressive
- Each card: monthly amount, duration, buffer, SustBadge, pros list, warning (if applicable)
- "Recommended" badge on Conservative (positioned top-centre, negative margin)
- Selection: border + shadow highlight + CTA changes to "✓ Selected"

#### 2.2.2 Conservative Plan
**File:** `screens/Screen 2.2.2 - Conservative Plan.html`
- Green gradient header card: £35/mo + SustBadge HIGH
- Key numbers card + why it works list + stress test callout
- 12-month timeline: row of numbered circles (active = green fill)

#### 2.2.3 Balanced Plan
**File:** `screens/Screen 2.2.3 - Balanced Plan.html`
- Amber gradient header: £70/mo + SustBadge MEDIUM
- Mixed pros/warnings list (green ✓ + amber ⚠ icons)
- 6-month timeline

#### 2.2.4 Aggressive Plan
**File:** `screens/Screen 2.2.4 - Aggressive Plan.html`
- Red warning banner at top
- Red gradient header: £140/mo + SustBadge LOW
- Risk checklist
- Confirmation checkbox gate — CTA disabled until confirmed
- "Switch to Conservative" secondary CTA

#### 2.3.1 Support Services
**File:** `screens/Screen 2.3.1 - Support Services.html`
- Info banner: "5 services matched to your profile"
- Service cards: icon + tag badge + value + description + eligibility + CTA
- Services: Warm Home Discount, Efficiency Grants, Benefits Check, Council Tax Reduction, StepChange

---

### Epic 3 — Payment Plan Management

#### 3.1.1 Plan T&Cs
**File:** `screens/Screen 3.1.1 - Plan TCs.html`
- Plan summary strip (accent tinted)
- 4 section cards: What you agree to / Missed payments / Your rights / Your data
- Consent checkbox gate → CTA enables
- Step indicator: 1 of 4

#### 3.1.2 Payment Method Setup
**File:** `screens/Screen 3.1.2 - Payment Setup.html`
- 3 option cards: Direct Debit (recommended) / Card or Bank Transfer / Post Office
- Selection: accent border + shadow
- Radio circle indicator
- Step indicator: 2 of 4

#### 3.1.3 Direct Debit Setup
**File:** `screens/Screen 3.1.3 - Direct Debit.html`
- Form fields: Account holder name, Sort code (auto-formatted XX-XX-XX), Account number (8 digits)
- Payment date picker: grid of date buttons (1–28)
- Live preview card: shows entered details + payment schedule
- Confirm CTA gates on form completeness
- Step indicator: 3 of 4

#### 3.1.4 Confirmation
**File:** `screens/Screen 3.1.4 - Confirmation.html`
- Large green check icon
- Plan summary table
- "What happens next" checklist (emoji icons)
- Can't make a payment callout with phone number
- Step indicator: 4 of 4

#### 3.2.2 Payment Portal
**File:** `screens/Screen 3.2.2 - Payment Portal.html`
- Progress hero: "3 of 12 payments" + progress bar (segmented)
- Next payment gradient banner with "Make Early Payment" CTA
- Payment history table (left) + upcoming payments list (right)

#### 3.3.2 Missed Payment Reschedule
**File:** `screens/Screen 3.3.2 - Missed Payment Reschedule.html`
- 2-step flow in one screen
- Step 1: amber warning banner + 4 reason cards (radio)
- Step 2: 3 reschedule option cards + updated plan summary
- Both steps: "Talk to an Adviser" secondary CTA

#### 3.4.1 Six-Month Reassessment
**File:** `screens/Screen 3.4.1 - Reassessment.html`
- Scenario switcher (demo control): improved / declined / stable
- 3 comparison stat cards: previous income / new income / change
- Result card: coloured gradient border based on scenario
- 2 option cards with tailored CTAs per scenario

---

### Epic 4 — Admin: Case Management

#### 4.2.1–4 Case Review
**File:** `screens/Screen 4.2.1 - Case Review.html`
- Case header: name, account ref, HardshipBadge, priority, wait time, 5 action buttons
- **Tab 4.2.1 Overview:** profile card, flagging reasons, 4 stat cards, system recommendation, data quality score
- **Tab 4.2.2 Customer Context:** personal info, employment, housing, history, vulnerabilities
- **Tab 4.2.3 Financial:** income/expense tables, formula visualisation, system assessment
- **Tab 4.2.4 Bank Data:** connection details, transaction stats, quality score (92/100), flag summary
- Officer notes textarea at bottom

#### 4.3.1 Modify Plan
**File:** `screens/Screen 4.3.1 - Modify Plan.html`
- Left: system recommendation (read-only) + editable payment/duration fields + quick-select amount buttons + support measures checkboxes
- Right: live preview card (updates in real-time) + justification notes
- Warning zones: amber if >50% disposable, red if >100% disposable
- Save CTA disabled until notes filled

#### 4.3.2 Request Info
**File:** `screens/Screen 4.3.2 - Request Info.html`
- Left: checkbox list of preset questions + custom question textarea
- Right: live message preview + deadline picker (3/5/7/10/14 days)
- Send CTA shows count of selected questions
- Confirmation state after send

#### 4.3.3 Escalate Case
**File:** `screens/Screen 4.3.3 - Escalate.html`
- Officer picker: 4 cards with initials, role, speciality
- Reason picker: 6 radio options
- Priority selector: High / Medium / Low (coloured buttons)
- Justification notes + summary preview card
- Confirmation state after escalation

---

### Epic 5 — Admin: Performance & Compliance

#### 5.1.1 Team Performance
**File:** `screens/Screen 5.1.1 - Team Performance.html`
- 4 queue health stat cards (coloured top borders)
- Decision quality stacked bar chart (text-based progress bars)
- Queue size SVG line chart (8 weeks) with SLA target dashed line
- Officer breakdown table: avatar, cases, approval rate (with mini bar), avg time, escalations, sparkline

#### 5.2.1–2 Compliance Dashboard
**File:** `screens/Screen 5.2.1 - Compliance Dashboard.html`
- **Tab Audit Trail:** FCA compliance metrics, Ofgem vulnerable customer metrics, fairness score (0.89/1.0), audit log summary
- **Tab Flag Accuracy:** 3 summary stats, flag accuracy table with per-flag recommendations

#### 5.3.1 Executive Dashboard
**File:** `screens/Screen 5.3.1 - Executive Dashboard.html`
- 4 hero KPI cards with delta badges
- Monthly cases bar chart + monthly recovery bar chart (SVG)
- ROI breakdown table
- Industry comparison (dual progress bars per metric)
- Pipeline funnel (horizontal segmented bar)

---

### Epic 6 — Policy Configuration

#### 6.1.1–2 Policy Config
**File:** `screens/Screen 6.1.1 - Policy Config.html`
- 4 policy sections (2×2 grid): Affordability Thresholds / Payment Plan Limits / Vulnerability Rules / Manual Review Triggers
- Each row: label + note + control (number input or toggle)
- Impact modal: shows diff of changes + estimated customer impact
- Save bar: disabled until changes made, requires confirmation via modal

---

### Epic 7 — Vulnerable Customer Protection

#### 7.1.1 PSR Protection
**File:** `screens/Screen 7.1.1 - PSR Protection.html`
- 3 scenarios: PSR + Medical (no-disconnection) / PSR + Other (priority support) / Not registered
- Status card: coloured gradient + shield icon + headline
- 2–4 protection cards (icon + title + description)

---

## Interactions & Behaviour

### Animations
- Page transitions: `fadeUp` (opacity 0→1 + translateY 8px→0, 220ms ease)
- Button press: `scale(0.97)` on pointerDown, release on pointerUp
- Processing screen: pulsing dot (CSS `pulse` keyframe), step-slide-in on completion
- Tink interstitial: spinning hourglass (`spinHG` keyframe), auto-advances after 2.2s
- Plan progress bar: transitions width over 500ms

### Forms
- Input focus: accent border + `box-shadow: 0 0 0 3px {accent}18`
- Sort code: auto-formats to `XX-XX-XX` on input
- Checkboxes: `accentColor` matches system accent

### State persistence
- Bank connection journey page: `localStorage` key `bridge_bank_journey`
- Current slide/tab: `localStorage` key `bridge_bank_page`

### Disabled states
- All gated CTAs: `opacity: 0.4`, `cursor: not-allowed`
- Controlled via boolean props

---

## Data Model (from prototypes)

```typescript
interface Customer {
  name: string;           // "Sarah Mitchell"
  accountRef: string;     // "BR-2847"
  hardshipLevel: "SEVERE" | "MODERATE" | "LOW" | "NONE";
  monthlyIncome: number;  // 1850
  totalExpenses: number;  // 1720
  disposable: number;     // 130
  billBalance: number;    // 420
  billRatioPct: number;   // 323
  dataQuality: number;    // 0–100
}

interface PaymentPlan {
  id: "conservative" | "balanced" | "aggressive";
  monthlyAmount: number;
  durationMonths: number;
  buffer: number;
  sustainability: "HIGH" | "MEDIUM" | "LOW";
  recommended: boolean;
}

interface PolicyConfig {
  severePct: number;       // 200
  moderateLow: number;     // 100
  moderateHigh: number;    // 200
  lowPct: number;          // 100
  maxDuration: number;     // 24
  minPayment: number;      // 10
  maxPaymentPct: number;   // 50
  medicalNoDisconnect: boolean;
  mentalHealthReview: boolean;
  flagBillRatio: number;   // 200
  flagDataQuality: number; // 75
  flagConfidence: number;  // 80
}
```

---

## User Roles

| Role | Screens | Notes |
|------|---------|-------|
| Customer | 1.1.x, 2.x, 3.x, 7.x | Web desktop (max-width 840px) |
| Case Officer | 4.x | Full-width admin layout |
| Team Manager | 5.1.x | Full-width admin layout |
| Compliance Manager | 5.2.x | Full-width admin layout |
| Executive | 5.3.x | Full-width admin layout |
| Policy Manager | 6.x | Full-width admin layout |

---

## Assets

| Asset | Description | Source |
|-------|-------------|--------|
| Bridge logo | SVG inline — bridge arch with 3 pillars | Defined in `bridge-ui.jsx` → `BridgeLogo` component |
| Bank icons | Initials-only placeholders (no real logos) | Generated from bank name |
| All icons | Inline SVG, no external icon library | Defined per component |

No external image assets required. All iconography is inline SVG.

---

## Files in this Package

```
design_handoff_bridge/
├── README.md                          ← This file
├── bridge-ui.jsx                      ← Shared design system components
├── Bridge Screen Index.html           ← Navigable screen index
└── screens/
    ├── Screen 0 - Account Setup Journey.html
    ├── Screen 1.1 - Bank Connection Journey.html
    ├── Screen 1.1.1 - Home.html
    ├── Screen 2.1.1 - Assessment Overview.html
    ├── Screen 2.1.2-5 - Assessment Breakdown.html
    ├── Screen 2.2.1 - Payment Plans.html
    ├── Screen 2.2.2 - Conservative Plan.html
    ├── Screen 2.2.3 - Balanced Plan.html
    ├── Screen 2.2.4 - Aggressive Plan.html
    ├── Screen 2.3.1 - Support Services.html
    ├── Screen 3.1.1 - Plan TCs.html
    ├── Screen 3.1.2 - Payment Setup.html
    ├── Screen 3.1.3 - Direct Debit.html
    ├── Screen 3.1.4 - Confirmation.html
    ├── Screen 3.2.2 - Payment Portal.html
    ├── Screen 3.3.2 - Missed Payment Reschedule.html
    ├── Screen 3.4.1 - Reassessment.html
    ├── Screen 4.2.1 - Case Review.html
    ├── Screen 4.3.1 - Modify Plan.html
    ├── Screen 4.3.2 - Request Info.html
    ├── Screen 4.3.3 - Escalate.html
    ├── Screen 5.1.1 - Team Performance.html
    ├── Screen 5.2.1 - Compliance Dashboard.html
    ├── Screen 5.3.1 - Executive Dashboard.html
    ├── Screen 6.1.1 - Policy Config.html
    └── Screen 7.1.1 - PSR Protection.html
```

---

## How to Hand Off to Claude Code

1. Download this folder as a zip
2. In Claude Code, start a new conversation
3. Say: *"I have a set of HTML design mockups for Bridge, a hardship management platform. Please implement these designs in [your framework]. The README.md explains the design system, tokens, and all 25 screens."*
4. Attach or reference this README and the screen HTML files
5. Claude Code will read the prototypes and implement them using your codebase's conventions

---

*Generated by Claude · Project Bridge · April 2026*

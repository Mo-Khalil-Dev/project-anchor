# shadcn/ui Components - Bridge Application

## Assessment Overview Screen (AssessmentOverviewShadcn.tsx)

### Components Used

| Component | Purpose | From shadcn/ui |
|-----------|---------|----------------|
| **Card** | Two-column layout cards (Your Assessment, What happens next?) | `@/components/ui/card` |
| **CardHeader** | Card titles | `@/components/ui/card` |
| **CardTitle** | Section headings ("Your Assessment", "What happens next?") | `@/components/ui/card` |
| **CardContent** | Card body content | `@/components/ui/card` |
| **Badge** | Hardship level badge (MODERATE, SEVERE, etc.) | `@/components/ui/badge` |
| **Button** | CTA button ("View Payment Plans") | `@/components/ui/button` |
| **Icons** | CheckCircle2, ArrowRight from Lucide | `lucide-react` |

### Installation Commands

```bash
# Core components
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add button

# Icons
npm install lucide-react
```

## Component Breakdown

### 1. Card (Left & Right Columns)
```tsx
<Card>
  <CardHeader>
    <CardTitle>Your Assessment</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
</Card>
```
**Why:** Provides clean bordered containers for both sections

---

### 2. Badge (Hardship Level)
```tsx
<Badge className={colors.badge}>MODERATE</Badge>
```
**Why:** Shows hardship level with color coding
- Variants: NONE (green), LOW (blue), MODERATE (amber), SEVERE (red)

---

### 3. Button (CTA)
```tsx
<Button className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-50">
  View Payment Plans →
</Button>
```
**Why:** Primary call-to-action to navigate to next step

---

### 4. Icons (Lucide)
```tsx
<CheckCircle2 className="w-5 h-5 text-blue-600" />  // ✓ for completed steps
<ArrowRight className="w-5 h-5 text-gray-400" />    // → for next steps
```
**Why:** Visual indicators for status (completed vs. upcoming)

---

## Other Screens - Components Needed

### Payment Plan Options Screen
- Card (3 plan cards side-by-side)
- Badge (Sustainability scores: HIGH/MEDIUM/LOW)
- Button (Select Plan buttons)
- Alert (Warning for aggressive plan)

### Case Review (Admin) Screen
- Card (Layout containers)
- Badge (Priority level: HIGH/MEDIUM/LOW)
- Button (Approve, Modify, Escalate)
- Select/Dropdown (Decision options)
- Textarea (Notes field)

### Payment Plan Modification Screen
- Card (Form layout)
- Input (Monthly payment, duration)
- Checkbox (Support measures)
- Textarea (Explanation)
- Button (Save, Cancel)
- Alert (Warnings for unsustainable plans)

### Admin Queue Screen
- Table (List of cases)
- Badge (Priority indicators)
- Button (Quick actions: Review, Defer, Escalate)

---

## Color System (Tailwind + shadcn)

All colors use Tailwind utilities that work with shadcn's design system:

```css
/* Primary Actions */
bg-blue-600, text-blue-600

/* Status Colors */
SEVERE:   bg-red-100, text-red-800
MODERATE: bg-amber-100, text-amber-800
LOW:      bg-blue-100, text-blue-800
NONE:     bg-green-100, text-green-800

/* Backgrounds */
bg-gray-50, bg-white

/* Borders */
border-gray-200, border-gray-300

/* Text */
text-gray-900 (headings), text-gray-600 (secondary)
```

---

## Installation Order

For the Assessment Overview screen, install in this order:

```bash
# 1. Foundation
npm install -D @shadcn/ui

# 2. Core components
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add button

# 3. Icons
npm install lucide-react

# Done - you have everything for this screen
```

For full Bridge application, you'll eventually need:

```bash
# Forms & Inputs
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add textarea

# Tables (for queue, payment history)
npx shadcn-ui@latest add table

# Dialogs & Alerts
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add alert

# Navigation
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dropdown-menu

# Progress & Status
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add badge  (already added)
```

---

## TypeScript Types

```typescript
interface AssessmentData {
  accountNumber: string;        // "GAS-12345"
  userName: string;             // "Mohamed Ahmed"
  monthlyIncome: number;        // 1500
  billPercentage: number;       // 12
  gasBoill: number;             // 180
  arrears: number;              // 420
  hardshipLevel: 'NONE' | 'LOW' | 'MODERATE' | 'SEVERE';
  hardshipDescription: string;  // "You're struggling but support is available"
  assessmentDate: string;       // "15 April 2024"
}
```

---

## Usage Example

```tsx
import AssessmentOverviewShadcn, { MOCK_ASSESSMENT } from '@/components/bridge/AssessmentOverviewShadcn';

export default function Page() {
  // In real app, fetch from API
  const assessment = MOCK_ASSESSMENT;
  
  return <AssessmentOverviewShadcn data={assessment} />;
}
```

---

## Next Steps

1. ✅ Install shadcn/ui components
2. Create React component file (AssessmentOverviewShadcn.tsx)
3. Test with mock data
4. Create remaining screens with appropriate components
5. Connect to backend API

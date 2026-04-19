# PROJECT BRIDGE - Frontend Setup Guide

## Tech Stack
- **React** + **TypeScript**
- **Vite** (dev server & build)
- **Tailwind CSS** (styling)
- **shadcn/ui** (component library)
- **Lucide Icons** (icons)

## Initial Setup

### 1. Create React + Vite + TypeScript Project
```bash
npm create vite@latest bridge-frontend -- --template react-ts
cd bridge-frontend
npm install
```

### 2. Install Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. Install shadcn/ui
```bash
npm install -D @shadcn/ui
npx shadcn-ui@latest init
```

When prompted:
- Style: Default (New York)
- Base color: Slate
- CSS variables: Yes

### 4. Install Required shadcn/ui Components

For the **AssessmentOverview** component, install:

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add button
npx shadcn-ui@latest add alert
```

Other components you'll need later:
```bash
# For forms (payment setup, case review)
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox

# For tables (queue, payment history)
npx shadcn-ui@latest add table

# For dialogs (modals, confirmations)
npx shadcn-ui@latest add dialog

# For tabs (assessment breakdown)
npx shadcn-ui@latest add tabs

# For dropdowns
npx shadcn-ui@latest add dropdown-menu

# For progress indicators
npx shadcn-ui@latest add progress
```

### 5. Install Lucide Icons
```bash
npm install lucide-react
```

### 6. Project Structure
```
bridge-frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   └── bridge/                # Custom Bridge components
│   │       ├── AssessmentOverview.tsx
│   │       ├── PaymentPlanCard.tsx
│   │       ├── QueueTable.tsx
│   │       └── ...
│   ├── pages/
│   │   ├── assessment-demo.tsx    # Demo page
│   │   ├── payment-plans.tsx
│   │   ├── admin/
│   │   │   ├── queue.tsx
│   │   │   ├── case-review.tsx
│   │   │   └── ...
│   │   └── ...
│   ├── hooks/                     # Custom React hooks
│   ├── services/                  # API calls to backend
│   ├── types/                     # TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                  # Tailwind imports
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.cjs
└── package.json
```

### 7. Configure Path Aliases (tsconfig.json)
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Also update `vite.config.ts`:
```ts
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## Running the App

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Visit `http://localhost:5173` to see the assessment demo.

## Component Anatomy

The `AssessmentOverview.tsx` component includes:

1. **Header** — Title & subtitle
2. **Hardship Alert** — Color-coded hardship level with icon
3. **Financial Summary** — 4 cards (Income, Expenses, Disposable, Bill)
4. **Affordability Analysis** — Progress bar + benchmark comparison
5. **Arrears Info** — Outstanding debt (if applicable)
6. **Explanation** — Plain English "what this means"
7. **CTAs** — "View Detailed Breakdown" & "See Payment Plans"

## TypeScript Types

Core type for assessment data:
```typescript
interface AssessmentData {
  monthlyIncome: number;
  totalExpenses: number;
  disposableIncome: number;
  billAmount: number;
  billPercentage: number;
  hardshipLevel: 'NONE' | 'LOW' | 'MODERATE' | 'SEVERE';
  benchmarkMin: number;
  benchmarkMax: number;
  arrears: number;
}
```

## Styling Notes

- Uses Tailwind CSS utility classes
- Responsive grid: `grid-cols-1 md:grid-cols-4` (1 column mobile, 4 desktop)
- Color scheme matches hardship levels:
  - SEVERE: Red (bg-red-50, border-red-200)
  - MODERATE: Yellow (bg-yellow-50, border-yellow-200)
  - LOW: Blue (bg-blue-50, border-blue-200)
  - NONE: Green (bg-green-50, border-green-200)
- All components use shadcn defaults (inherits from design system)

## Next Steps

1. ✅ Frontend skeleton with Assessment screen
2. Build remaining customer journey screens:
   - Payment Plan Options (Screen 2.2.1)
   - Plan Acceptance (Screen 3.1.1)
   - Assessment Detailed Breakdown tabs (Screens 2.1.2-5)
3. Build admin screens:
   - Queue Management (Screen 4.1.1)
   - Case Review (Screen 4.2.1)
   - Modify Plan (Screen 4.3.1)
4. Connect to backend API (Lambda + Express)
5. Add authentication (AWS Cognito)
6. Deploy to S3 + CloudFront

## Common Issues

**Path aliases not working:**
- Restart dev server after updating tsconfig.json

**shadcn components not found:**
```bash
# Verify install
npx shadcn-ui@latest list
```

**Tailwind styles not applying:**
- Check that tailwind.config.js content paths include your files
- Clear `.next` or `dist` folder and rebuild

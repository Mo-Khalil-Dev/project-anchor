# Bridge Frontend

Customer-facing and admin UI for the Bridge hardship management platform.

## Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Routing:** React Router v6
- **State Management:** Redux Toolkit
- **HTTP Client:** Axios
- **Forms:** Formik + Yup
- **Styling:** Tailwind CSS (utility-first) with custom components

## Project Structure

```
src/
├── api/                    # Axios client & API calls
├── components/
│   ├── core/              # Reusable components (Card, Button, Flex, etc.)
│   └── layouts/           # CustomerLayout, AdminLayout
├── screens/               # Full-page components
├── store/                 # Redux slices & configuration
├── lib/                   # Utilities (cn, theme tokens)
├── index.css             # Tailwind + global styles
├── App.tsx               # Root component & routes
└── main.tsx              # Entry point
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000` with hot module reloading.

### Build for Production

```bash
npm run build
```

### Type Check

```bash
npm run type-check
```

## Design Tokens

All colors, spacing, and typography are defined in Tailwind config and can be accessed as utilities:

- Colors: `bg-accent`, `text-accent-dark`, `bg-green`, etc.
- Spacing: `gap-4`, `p-6`, etc.
- Typography: Already mapped to Plus Jakarta Sans

See `tailwind.config.js` for full token mapping.

## Component Guidelines

### Reducing Tailwind Noise

1. **Use the `cn()` utility** for conditional classes:
   ```typescript
   className={cn(
     'base classes here',
     condition && 'conditional class',
     className // allow overrides
   )}
   ```

2. **Extract complex patterns** into custom components (see `core/` folder)

3. **Use @apply in globals.css** for repeated patterns:
   ```css
   @layer components {
     .card { @apply rounded-lg border bg-white p-6; }
   }
   ```

4. **Keep shadcn component files** (from `ui/` folder) as-is — they're library code

5. **Screen/page components** should look clean — most Tailwind classes belong in child components

## State Management

### Customer Journey
```typescript
// In Redux store: customer slice
{
  currentStep: 'home' | 'bank-connection' | 'assessment' | 'plan-select' | ...
  bankConnected: boolean
  selectedPlan?: 'conservative' | 'balanced' | 'aggressive'
  assessment?: AssessmentData
  hardshipLevel?: 'SEVERE' | 'MODERATE' | 'LOW' | 'NONE'
}
```

### Admin UI
```typescript
{
  selectedCaseId?: string
  caseReviewTab: 'overview' | 'customer' | 'financial' | 'bank'
  modifyPlanMode: boolean
  ...
}
```

Use Redux actions to update state: `dispatch(setCurrentStep('assessment'))`

## API Integration

Axios client in `src/api/client.ts` includes:
- Base URL from `VITE_API_URL` env variable
- Auth token management (from localStorage)
- Request/response interceptors
- 401 handling (redirects to login)

Create API functions in `src/api/` folder:
```typescript
export async function getAssessment(customerId: string) {
  const { data } = await axiosInstance.get(`/assessment/${customerId}`);
  return data;
}
```

## Environment Variables

Create `.env` file in `frontend/` directory:
```
VITE_API_URL=http://localhost:3001/api
```

## Next Steps

- [ ] Bank Connection Journey (Screen 1.1)
- [ ] Assessment Overview (Screen 2.1.1)
- [ ] Payment Plan Selection (Screen 2.2.1)
- [ ] Plan Setup Flow (Screens 3.1.x)
- [ ] Admin Queue & Case Review (Screen 4.2.x)

See design mockups in `docs/wireframes/design_handoff_bridge/` for reference.

---

**Notes:**
- Commit changes to `feature/bridge-ui` branch
- Don't commit to main without code review
- All screens are in the `screens/` folder
- Core components are in `components/core/`

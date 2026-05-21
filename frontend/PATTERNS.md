# Frontend Coding Patterns

This document shows *how* the architectural rules in [CLAUDE.md](../CLAUDE.md) are applied in practice. Each section names the pattern, explains it in plain terms, gives a minimal code example, and points to the canonical file.

---

## Table of Contents

1. [API Layering](#1-api-layering)
2. [ApiResponse\<T\> and `unwrap`](#2-apiresponset-and-unwrap)
3. [URL Constants](#3-url-constants)
4. [Service Style — Object Literal vs Class](#4-service-style--object-literal-vs-class)
5. [Component Folder Contract](#5-component-folder-contract)
6. [Core Components — `forwardRef` + `displayName`](#6-core-components--forwardref--displayname)
7. [`cn()` for className Merging](#7-cn-for-classname-merging)
8. [Map-Based Variant Styling](#8-map-based-variant-styling)
9. [Redux Slices and Typed Hooks](#9-redux-slices-and-typed-hooks)
10. [Hook–Redux Bridge Pattern](#10-hookredux-bridge-pattern)
11. [Step-Based State Machine](#11-step-based-state-machine)
12. [Loading / Error / Content Render](#12-loading--error--content-render)
13. [Polling with `useRef`](#13-polling-with-useref)
14. [SVG Icons](#14-svg-icons)
15. [Journey Directory Structure](#15-journey-directory-structure)
16. [Token Refresh Interceptor](#16-token-refresh-interceptor)
17. [Test Conventions](#17-test-conventions)
18. [Design Tokens](#18-design-tokens)

---

## 1. API Layering

Every network call flows through exactly four layers. No layer may skip one below it.

```
UI hook  →  service  →  httpService  →  axios (client.ts)
```

- **`client.ts`** creates the axios instance and wires up interceptors. Nothing else touches axios.
- **`httpService.ts`** exposes `get<T>`, `post<T>`, `put<T>`, `delete<T>`. It is the *only* file that imports axios.
- **Service files** (`src/services/`) own typed request/response shapes and call `httpService`.
- **Hooks** (`useX.ts`) call service methods and sync results into React/Redux state.

Canonical files:
- `src/api/client.ts`
- `src/api/httpService.ts`

---

## 2. `ApiResponse<T>` and `unwrap`

Every backend endpoint returns a response wrapped in `ApiResponse<T>`:

```ts
// src/types/index.ts
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
```

Every service method unwraps it immediately using the shared utility. The raw wrapper never reaches a hook.

```ts
// src/api/unwrap.ts
export function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success || !res.data) throw new Error(res.error || 'Request failed');
  return res.data;
}
```

Usage in a service:

```ts
// object-literal style
get: (assessmentId: string): Promise<Assessment> =>
  httpService.get<ApiResponse<Assessment>>(API.assessments.get(assessmentId)).then(unwrap),

// class style
async getCurrentUser(): Promise<GetCurrentUserResponse> {
  const response = await httpService.get<ApiResponse<GetCurrentUserResponse>>('/auth/me');
  return unwrap(response);
}
```

Never copy `unwrap` inline — always import from `src/api/unwrap.ts`.

Canonical files:
- `src/api/unwrap.ts`
- `src/types/index.ts`

---

## 3. URL Constants

All API URL strings live in the `API` object in `src/api/endpoints.ts`. No URL literals anywhere else.

```ts
// src/api/endpoints.ts
export const API = {
  assessments: {
    get: (assessmentId: string) => `/assessments/${assessmentId}`,
  },
  bankConnections: {
    initiate: '/bank-connections/initiate',
    callback: '/bank-connections/callback',
  },
} as const;
```

Consuming a URL in a service:

```ts
import { API } from '@/api/endpoints';

httpService.get(API.assessments.get(id))
httpService.post(API.bankConnections.initiate)
```

Canonical file: `src/api/endpoints.ts`

---

## 4. Service Style — Object Literal vs Class

Two styles are both acceptable. The choice depends on complexity, not preference.

**Object-literal** — for small, stateless services with a few methods:

```ts
// src/services/assessmentService.ts
export const assessmentService = {
  get: (assessmentId: string): Promise<Assessment> =>
    httpService.get<ApiResponse<Assessment>>(API.assessments.get(assessmentId)).then(unwrap),
};
```

**Class** — when methods share private helpers, or the service has more than ~5 methods:

```ts
// src/services/authService.ts
class AuthService {
  async initiateLogin(): Promise<InitiateLoginResponse> {
    const response = await httpService.get<ApiResponse<InitiateLoginResponse>>('/auth/initiate-login');
    return unwrap(response);
  }
  // ... more methods
}
export const authService = new AuthService();
```

Both styles **must** call `unwrap` and **must not** return raw `ApiResponse` values.

Canonical files:
- `src/services/assessmentService.ts` (object-literal)
- `src/services/authService.ts` (class)

---

## 5. Component Folder Contract

Every component lives in its own folder containing exactly three files:

```
src/journeys/AccountSetup/components/accountDetailsStep/
  AccountDetailsStep.tsx        ← JSX only, ≤ 15 lines
  useAccountDetailsStep.ts      ← all logic, state, handlers
  AccountDetailsStep.module.css ← all styles
```

The `.tsx` file is purely declarative — it receives props and renders. All state, validation, and event handlers belong in the hook. The `.module.css` file provides scoped styles; shared design tokens come from `tailwind.config.js` class names.

Canonical folder: `src/journeys/AccountSetup/components/accountDetailsStep/`

---

## 6. Core Components — `forwardRef` + `displayName`

All primitives in `src/components/core/` use `React.forwardRef` so parents can access the underlying DOM node. Each sets `.displayName` for React DevTools.

```tsx
// src/components/core/Button.tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, children, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variantMap[variant], sizeMap[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  )
);
Button.displayName = 'Button';
```

Canonical file: `src/components/core/Button.tsx`

---

## 7. `cn()` for className Merging

All dynamic `className` construction goes through `cn()`. It resolves Tailwind conflicts and collapses falsy values.

```ts
// src/lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Usage:

```tsx
<div className={cn('base-class', isActive && 'active-class', className)} />
```

Never concatenate class strings with template literals or `+`. Always use `cn()`.

Canonical file: `src/lib/cn.ts`

---

## 8. Map-Based Variant Styling

When a component supports multiple visual variants, define a lookup map and index into it. This keeps `className` lines readable and makes it easy to add variants later.

```tsx
// From src/components/core/Button.tsx
const variantMap: Record<ButtonVariant, string> = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  danger:    'btn-danger',
  success:   'btn-success',
  ghost:     'text-muted hover:text-text bg-transparent',
};

const sizeMap: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[13px]',
  md: 'px-4 py-2   text-[14px]',
  lg: 'px-5 py-2.5 text-[15px]',
};

className={cn(base, variantMap[variant], sizeMap[size], className)}
```

The same pattern is used in `StatCard` (border colours), `HardshipBadge` (level colours), and `SustBadge`.

---

## 9. Redux Slices and Typed Hooks

The store has three slices matching the three user domains:

```ts
// src/store/index.ts
export const store = configureStore({
  reducer: { auth, customer, admin },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

Always import the typed wrappers — never the raw `useDispatch`/`useSelector` from `react-redux`:

```ts
import { useAppDispatch, useAppSelector } from '@/store';
```

Each slice follows the same shape: a plain-object state, a set of synchronous action creators, and no thunks (async logic lives in services + hooks).

Canonical files:
- `src/store/index.ts`
- `src/store/slices/authSlice.ts`
- `src/store/slices/customerSlice.ts`
- `src/store/slices/adminSlice.ts`

---

## 10. Hook–Redux Bridge Pattern

Hooks own the connection between async service calls and Redux state. The pattern is consistent across all hooks:

```ts
// src/hooks/useAuth.ts
const initiateLogin = useCallback(async () => {
  dispatch(setLoading(true));
  dispatch(setError(null));
  try {
    const result = await authService.initiateLogin();
    return result;
  } catch (err) {
    dispatch(setError(err instanceof Error ? err.message : 'Failed'));
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
}, [dispatch]);
```

Rules:
- `setLoading(true)` and `setError(null)` always come first.
- Success dispatches the domain action (e.g. `setUser`, `setAssessment`).
- Catch dispatches `setError` and re-throws so the caller can react.
- `setLoading(false)` always fires in `finally`.
- All handlers are wrapped in `useCallback` with `[dispatch]` as the dependency.

Canonical file: `src/hooks/useAuth.ts`

---

## 11. Step-Based State Machine

Multi-step journeys track the active step as a local string union. The page component renders the matching sub-component and passes only the handlers it needs.

```tsx
// src/journeys/AccountSetup/AccountSetupPage.tsx
type Step = 'checking' | 'linking' | 'success' | 'error' | 'help' | 'redirect';

const [step, setStep] = useState<Step>('checking');

if (step === 'checking') return <CheckingStep onLinked={goToLinking} />;
if (step === 'linking')  return <LinkingStep  onSuccess={goToSuccess} onError={goToError} />;
if (step === 'success')  return <SuccessStep  onContinue={goToRedirect} />;
// ...
```

The logic for computing the initial step and all `goToX` handlers lives in `useAccountSetupPage.ts`, not in the page component.

Canonical files:
- `src/journeys/AccountSetup/AccountSetupPage.tsx`
- `src/journeys/AccountSetup/useAccountSetupPage.ts`

---

## 12. Loading / Error / Content Render

Screens with async data follow this three-branch pattern. Each branch is mutually exclusive — the order matters (loading checked first):

```tsx
// src/journeys/Assessment/screens/overview/Overview.tsx
const { isLoading, error, assessment } = useOverview(assessmentId);

if (isLoading) return <LoadingView />;
if (error)     return <ErrorView message={error} />;
return <AssessmentContent assessment={assessment} />;
```

The boolean flags are derived inside the hook — the component never computes them directly.

Canonical files:
- `src/journeys/Assessment/screens/overview/Overview.tsx`
- `src/journeys/Assessment/screens/overview/useOverview.ts`

---

## 13. Polling with `useRef`

When a screen needs to poll until a terminal status arrives, store the interval ID in a `useRef` so React re-renders don't create duplicate intervals. Clean up in both the terminal branch and the `useEffect` cleanup.

```ts
// src/journeys/Assessment/screens/overview/useOverview.ts
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

useEffect(() => {
  const fetchAndMaybePoll = async () => {
    const data = await assessmentService.get(assessmentId);
    setAssessment(data);

    if (data.status === 'COMPLETED' || data.status === 'FAILED') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    if (!intervalRef.current) {
      intervalRef.current = setInterval(fetchAndMaybePoll, 3000);
    }
  };

  fetchAndMaybePoll();
  return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
}, [assessmentId]);
```

Canonical file: `src/journeys/Assessment/screens/overview/useOverview.ts`

---

## 14. SVG Icons

All SVG icons are named exports in `src/components/core/icons.tsx`. They accept `SVGProps<SVGSVGElement>` so callers can override `width`, `height`, `className`, etc.

```tsx
// src/components/core/icons.tsx
export const CheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" width={20} height={20} {...props}>
    <path d="M5 10l4 4 6-6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);
```

No inline SVGs anywhere else. If a new icon is needed, add it here.

Canonical file: `src/components/core/icons.tsx`

---

## 15. Journey Directory Structure

Feature code is organised under `src/journeys/` rather than `src/pages/`. The convention:

```
src/journeys/<Feature>/
  <Feature>Root.tsx          ← router-level entry point / orchestrator
  use<Feature>.ts            ← journey-level hook
  models/                    ← domain types specific to this journey
  screens/
    <screen>/
      <Screen>.tsx
      use<Screen>.ts
      <Screen>.module.css
      components/            ← screen-local sub-components
  components/                ← journey-wide shared sub-components
  hooks/                     ← journey-wide shared hooks
```

The root component handles the OAuth / async setup, then delegates to a screen. Screens delegate to components. Nothing flows upward.

Canonical example: `src/journeys/BankConnection/`

---

## 16. Token Refresh Interceptor

The axios response interceptor in `src/api/interceptors.ts` silently refreshes the access token on 401. Key details worth knowing when writing services or tests:

- The interceptor **queues** all requests that arrive while a refresh is in progress, then retries them with the new token.
- It explicitly guards against recursion: a 401 from `/auth/refresh` itself is never retried.
- On refresh failure it dispatches `clearAuth()` to Redux and redirects to `/login`.
- The token is read from the Redux store (not from a closure), so it is always current.

Do not replicate any of this logic in service files. The interceptor is the single place token lifecycle is managed.

Canonical file: `src/api/interceptors.ts`

---

## 17. Test Conventions

**Co-location** — test files sit next to the source file they cover:

```
useOverview.ts
useOverview.test.ts     ← co-located
Overview.tsx
Overview.test.tsx       ← co-located
```

**Mock at the service boundary** — hooks are tested against mocked services, never mocked axios:

```ts
// useOverview.test.ts
vi.mock('@/services/assessmentService', () => ({
  assessmentService: { get: vi.fn() },
}));

it('shows completed view when status is COMPLETED', async () => {
  vi.mocked(assessmentService.get).mockResolvedValue(makeAssessment({ status: 'COMPLETED' }));
  // render hook and assert...
});
```

**Shared fixtures** — `src/test/fixtures.ts` exports factory functions with sensible defaults and optional overrides:

```ts
// src/test/fixtures.ts
export function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    id: 'test-assessment-id',
    status: 'COMPLETED',
    hardshipLevel: 'MODERATE',
    // ...
    ...overrides,
  };
}
```

Always use `makeAssessment()` (and equivalent factories as you add them) rather than duplicating fixture objects in individual test files.

Canonical files:
- `src/test/fixtures.ts`
- `src/test/setup.ts`

---

## 18. Design Tokens

Design tokens are defined in two places that must stay in sync:

**`tailwind.config.js`** — maps token names to OKLch colour values, exposes them as Tailwind utility classes (`bg-accent`, `text-muted`, `rounded-card`, `shadow-card`, etc.)

**`src/lib/theme.ts`** — exports the same tokens as TypeScript constants for use in inline styles or runtime style calculations:

```ts
// src/lib/theme.ts
export const colors = {
  accent: 'oklch(52% 0.18 270)',
  green:  'oklch(55% 0.16 145)',
  amber:  'oklch(65% 0.17 65)',
  red:    'oklch(55% 0.20 25)',
  // ...
};

export const spacing = {
  cardPadding: '20px',
  pageMaxWidth: '840px',
  // ...
};

export const zIndex = {
  sticky: 50, dropdown: 100, modal: 1000, toast: 9999,
};
```

Use Tailwind classes in JSX whenever possible. Fall back to `theme.*` constants only when a Tailwind class doesn't exist (e.g. a dynamic CSS custom property or a `style` prop).

Canonical files:
- `frontend/tailwind.config.js`
- `src/lib/theme.ts`

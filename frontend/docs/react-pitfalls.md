# React Pitfalls & Caveats

A running log of subtle bugs and traps encountered during this project, and how to avoid them.

---

## 1. Polling that never stops

**Where it appeared:** `useOverview.ts` — assessment status polling

**The trap:**
Setting a flag (like `setLoading(false)`) inside a fetch function does not stop a `setInterval`. The interval ID lives in the `useEffect` closure and can only be cancelled by calling `clearInterval` with that ID. The fetch function has no reference to it by default.

```ts
// BAD — interval keeps firing even after COMPLETED/FAILED
useEffect(() => {
  const id = setInterval(fetchAssessment, 3000);
  return () => clearInterval(id);
}, []);

const fetchAssessment = async () => {
  if (data.status === 'COMPLETED') {
    setLoading(false); // ← does NOT stop the interval
  }
};
```

**The fix:** Store the interval ID in a `useRef` so the fetch function can reach it and cancel it.

```ts
const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

const stopPolling = () => {
  if (pollRef.current) {
    clearInterval(pollRef.current);
    pollRef.current = null;
  }
};

const fetchAssessment = useCallback(async () => {
  if (data.status === 'COMPLETED' || data.status === 'FAILED') {
    setLoading(false);
    stopPolling(); // ← now it actually stops
  }
}, [assessmentId]);

useEffect(() => {
  fetchAssessment();
  pollRef.current = setInterval(fetchAssessment, 3000);
  return () => stopPolling(); // still clean up on unmount
}, [fetchAssessment]);
```

**Why `useRef` and not `useState`?**
`useRef` gives you a mutable box that persists across renders without triggering re-renders. Using `useState` for the interval ID would cause a re-render every time you set it, which would re-run the effect and create a new interval — a worse bug.

---

## 2. Functions in useEffect dependency arrays

**Where it appeared:** `useOverview.ts` — `fetchAssessment` missing from deps

**The trap:**
Functions defined inside a hook or component are recreated as new objects on every render. If you put a function in a `useEffect` dependency array without stabilising it first, the effect re-runs on every render. If you omit it from the array to avoid that, you get a stale closure — the effect uses a frozen snapshot of the function that may have outdated values baked in.

```ts
// BAD — fetchAssessment is omitted from deps
// Works by coincidence (assessmentId doesn't change), but is a stale closure trap
const fetchAssessment = async () => { ... uses assessmentId ... };

useEffect(() => {
  fetchAssessment();
}, [assessmentId]); // fetchAssessment missing — eslint exhaustive-deps will flag this
```

**Why it's dangerous:** If you later add a new variable that `fetchAssessment` reads (e.g. a filter, currency, user preference), the effect will never re-run when that variable changes. The stale version of the function will silently use old values, with no error to debug.

**The fix:** Wrap the function in `useCallback` with its own dependency array, then include it in the effect deps. `useCallback` returns the same function reference across renders unless its deps change.

```ts
// GOOD
const fetchAssessment = useCallback(async () => {
  // closes over assessmentId
}, [assessmentId]); // only recreated when assessmentId changes

useEffect(() => {
  fetchAssessment();
  pollRef.current = setInterval(fetchAssessment, 3000);
  return () => stopPolling();
}, [fetchAssessment]); // safe — reference only changes when assessmentId changes
```

**Mental model:** Think of `useCallback` as `useMemo` for functions. Both are about referential stability — giving React the same object reference across renders so dependency comparisons (`===`) don't produce false positives.

---

## 3. Leaking router concerns out of hooks

**Where it appeared:** `useOverview.ts` — `navigate` exported from hook

**The trap:**
Returning `navigate` directly from a hook forces the component to know about routing internals. It violates the principle that the TSX file should only deal with what to render.

```ts
// BAD — component now imports navigate and knows how to use it
return { navigate, ... };

// In TSX:
<Button onClick={() => navigate(-1)}>Go Back</Button>
```

**The fix:** Wrap navigation calls in named handler functions inside the hook. The TSX just calls `handleGoBack()` without knowing or caring that it uses `navigate(-1)` under the hood.

```ts
// GOOD
const handleGoBack = () => navigate(-1);
return { handleGoBack, ... };

// In TSX:
<Button onClick={handleGoBack}>Go Back</Button>
```

**Why it matters:** If navigation logic changes (e.g. go back to a specific route rather than `-1`), you change it in one place in the hook, not scattered across TSX files.

---

## 4. Duplicating layout wrappers across early returns

**Where it appeared:** `Overview.tsx` — `CustomerLayout` repeated in loading, error, and main returns

**The trap:**
Using early returns for loading/error states when those states share the same layout wrapper means the wrapper is duplicated. Any change to layout props (e.g. `currentStep`) must be updated in every return.

```tsx
// BAD
if (loading) return <CustomerLayout currentStep={5}>...</CustomerLayout>;
if (error)   return <CustomerLayout currentStep={5}>...</CustomerLayout>;
return            <CustomerLayout currentStep={5}>...</CustomerLayout>;
```

**The fix:** Use a single layout wrapper and express loading/error/content as conditional children inside it.

```tsx
// GOOD
return (
  <CustomerLayout currentStep={5} totalSteps={6}>
    {loading && !assessment && <LoadingState />}
    {error && !assessment && <ErrorState />}
    {assessment && <Content />}
  </CustomerLayout>
);
```

---

## 5. Inconsistent number formatting

**Where it appeared:** `Overview.tsx` — `monthlyBill` rendered without `toLocaleString`

**The trap:**
When displaying currency values, forgetting `toLocaleString` on even one field produces inconsistent output (`£1500` vs `£1,500`). Easy to miss because the value renders without error.

**The fix:** Extract formatting into a local helper at the top of the component so it's used consistently.

```ts
const fmt = (n: number) => n.toLocaleString('en-GB', { maximumFractionDigits: 0 });

// Then every currency value uses it:
<div>£{fmt(assessment.monthlyBill)}</div>
<div>£{fmt(assessment.monthlyIncome)}</div>
```

---

## 6. TypeScript errors from incomplete model files

**Where it appeared:** `models/assessment.ts` — `IncomeBreakdown` and `ExpenseBreakdown` referenced but not imported

**The trap:**
Interfaces that reference other interfaces compile silently if those types happen to be in scope globally, but fail in strict mode or when the types come from separate files.

**The fix:** Always explicitly import types used in an interface, even if they seem to resolve without it.

```ts
import { IncomeBreakdown } from './incomeBreakdown';
import { ExpenseBreakdown } from './expenseBreakdown';

export interface Assessment {
  incomeBreakdown?: IncomeBreakdown | null;
  expenseBreakdown?: ExpenseBreakdown | null;
}
```
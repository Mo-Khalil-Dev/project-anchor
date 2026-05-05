# Home Page Redirection Logic

## Overview
The Home page now intelligently redirects users based on their journey progress.

## User Journey Flow

```
┌─────────────────────────────┐
│    User Visits Home         │
└────────────┬────────────────┘
             │
             ├─ Loading → Show spinner
             │
             ├─ Account Setup NOT complete → Redirect to /account-setup
             │
             ├─ Bank Connection NOT complete → Redirect to /bank-connection
             │
             ├─ Assessment NOT complete → Redirect to /assessment
             │
             ├─ Bank Connection COMPLETE
             │  AND Assessment COMPLETE
             │  → Redirect to /assessment ✓
             │
             └─ Show Home page with CTAs
```

## Implementation Details

### What Changed
File: `frontend/src/journeys/Home.tsx`

**Added:**
1. Import `useEffect` and `useReferenceDataContext`
2. Check `referenceData` for completion status
3. Redirect to assessment breakdown if both conditions met

### Code Logic

```typescript
// Check if user has completed bank connection + referenceData
useEffect(() => {
  if (isLoading || !referenceData) return;

  // If both are complete → go to referenceData page
  if (
    referenceData.bankConnection?.status === 'CONNECTED' &&
    referenceData.assessment?.status === 'COMPLETED'
  ) {
    navigate('/referenceData', { replace: true });
  }
}, [referenceData, isLoading, navigate]);
```

## Redirect Conditions

### User Sees Home Page If:
- ✅ Account setup NOT complete, OR
- ✅ Bank connection NOT complete, OR
- ✅ Assessment NOT complete

### User Redirects To Assessment Page If:
- ✅ Bank connection status = `'CONNECTED'`
- ✅ Assessment status = `'COMPLETED'`

### User Redirects To Next Step If:
- ✅ Account setup incomplete → `/account-setup`
- ✅ Bank connection incomplete → `/bank-connection`
- ✅ Assessment incomplete → `/assessment`

## Status Values

### Bank Connection Status
- `'NOT_STARTED'` — No connection initiated
- `'IN_PROGRESS'` — OAuth flow in progress
- `'CONNECTED'` ← Redirect on this

### Assessment Status
- `'PENDING'` — Not started
- `'IN_PROGRESS'` — Calculating
- `'COMPLETED'` ← Redirect on this

## User Experience

| Scenario | Result |
|----------|--------|
| First-time user | See Home page → Click "Get Started" |
| Connected bank, awaiting assessment | Redirect to `/assessment` |
| Assessment complete | Redirect to `/assessment` |
| Viewed assessment, ready for payment | Can still access Home page |

## Testing

### Test Cases

1. **New user (no progress)**
   - Expected: See Home page with CTAs
   - Check: `referenceData.bankConnection` = null, `referenceData.assessment` = null

2. **Bank connected, assessment pending**
   - Expected: Redirect to `/assessment`
   - Check: `bankConnection.status` = 'CONNECTED', `assessment.status` = 'PENDING'

3. **Assessment complete**
   - Expected: Redirect to `/assessment/breakdown`
   - Check: `bankConnection.status` = 'CONNECTED', `assessment.status` = 'COMPLETED'

4. **Loading state**
   - Expected: Show spinner while checking
   - Check: `isLoading` = true

## Edge Cases Handled

- ✅ **Null referenceData** → Show spinner (still loading)
- ✅ **Partial completion** → Show Home page (not ready for redirect)
- ✅ **Async loading** → Use loading state before redirecting
- ✅ **Race conditions** → Dependencies array includes all vars

## Related Files

- `frontend/src/hooks/useJourneyGuard.ts` — Primary journey guard
- `frontend/src/context/ReferenceDataContext.tsx` — Reference data provider
- `frontend/src/types/referenceData.types.ts` — Type definitions
- `frontend/src/journeys/Assessment/AssessmentBreakdown.tsx` — Destination screen

## Future Enhancements

1. **Assessment Revision** — Allow users to update assessment, redirect back to Home
2. **Payment Plan Status** — If plan accepted → redirect to payment tracking page
3. **Fallback Dashboard** — Show last assessment summary on Home if multiple visits
4. **Skip Navigation** — Option to stay on Home despite completion (for support agents)

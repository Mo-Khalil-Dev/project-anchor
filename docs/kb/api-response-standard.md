# API Response Standardisation

## The Problem

Without a standard, every endpoint can return data in a different shape. We had exactly this in PROJECT BRIDGE before standardisation:

```ts
// Assessment endpoint — returned the resource directly
const data = response.data as Assessment;

// Bank connection endpoint — returned an envelope
if (!response.data.success || !response.data.data) {
  throw new Error(response.data.error || 'Failed');
}
return response.data.data;
```

Each consumer had to know which shape to expect. Error handling was duplicated and inconsistent. Adding a new endpoint meant deciding (and documenting) its shape ad-hoc.

## The Standard

Every backend endpoint must wrap its response in `ApiResponse<T>`:

```ts
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**Success response:**
```json
{
  "success": true,
  "data": { "id": "referenceData-1", "status": "COMPLETED", ... }
}
```

**Error response:**
```json
{
  "success": false,
  "error": "Assessment not found"
}
```

## Why This Matters

### 1. Consistent error handling
Without the envelope, a failed request surfaces only as an HTTP status code. The consumer must check `response.status`, `response.data`, and hope the backend returns a useful body. With the envelope, the error message is always in `response.error` regardless of HTTP status.

### 2. One unwrap utility, used everywhere
The `unwrap<T>` function in `src/api/unwrap.ts` handles the envelope for every service:

```ts
export function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success || !res.data) throw new Error(res.error || 'Request failed');
  return res.data;
}
```

Every service method chains `.then(unwrap)`:

```ts
export const assessmentService = {
  get: (id: string): Promise<Assessment> =>
    httpService.get<ApiResponse<Assessment>>(API.assessments.get(id)).then(unwrap),
};
```

The hook receives a plain `Assessment` — no envelope, no HTTP concerns.

### 3. Services return domain types, not transport types
Hooks never see `ApiResponse<T>`. They receive typed domain objects (`Assessment`, `InitiateBankResponse`). This means:

- UI code has no dependency on how the backend wraps its data
- Swapping the envelope shape later is a one-file change (`unwrap.ts`)
- Tests mock at the service boundary with plain domain objects, not HTTP response shapes

### 4. Future-proofing
The envelope is a natural extension point. Adding pagination, request IDs, or deprecation warnings is a non-breaking change to `ApiResponse` — all consumers pick it up without modification.

## Enforcement

- `CLAUDE.md` documents this as a project rule
- Services always type the `httpService` call as `ApiResponse<T>` and chain `.then(unwrap)`
- No URL string literals — all endpoints live in `src/api/endpoints.ts`
- The shared `unwrap` must never be copied inline into a service file

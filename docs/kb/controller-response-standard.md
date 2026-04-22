# Controller Response Standardisation

## The Problem

Without a response standard, each controller makes its own decisions about shape. In PROJECT BRIDGE we had three different patterns across two controllers:

```ts
// AssessmentController — raw object on success, bare error on failure
res.status(200).json(response);
res.status(404).json({ error: 'Assessment not found' });

// BankConnectionController — envelope on success, timestamp bolted on
res.json({ success: true, data, timestamp: new Date().toISOString() });

// globalErrorHandler — envelope on errors, also with timestamp
res.status(400).json({ success: false, error: err.message, timestamp });
```

The frontend had no single contract to program against. `unwrap` would silently fail on assessment responses because `success` was `undefined`.

---

## The Standard

Every endpoint — success or failure — returns the same envelope:

```ts
// success
{ success: true, data: T }

// failure
{ success: false, error: string }
```

Nothing else. No `timestamp`, no `message`, no extra fields bolted on for specific statuses.

---

## Rules

### 1. Always wrap in the envelope
```ts
// correct
res.status(200).json({ success: true, data: { id, status, ... } });
res.status(404).json({ success: false, error: 'Assessment not found' });

// wrong — raw object
res.status(200).json({ id, status, ... });

// wrong — bare error
res.status(404).json({ error: 'Assessment not found' });
```

### 2. Never add extra fields to the envelope
`timestamp`, `message`, `traceId`, and similar fields do not belong in the response body. They belong in response headers or server logs.

```ts
// wrong
res.json({ success: true, data, timestamp: new Date().toISOString() });

// correct
res.json({ success: true, data });
```

### 3. Don't encode business state as a special response shape
PENDING and FAILED are values of `status` inside `data` — not reasons to change the envelope or bolt on a `message` field. The frontend reads `status` and decides what to show.

```ts
// wrong — different shape for different statuses
if (assessment.getStatus() === 'PENDING') {
  res.json({ ...response, message: 'Assessment is still calculating...' });
}

// correct — uniform shape, frontend handles the status
res.json({ success: true, data: { ...response } });
```

### 4. Let `globalErrorHandler` own error responses for thrown errors
Controllers that use the Result pattern call `next(error)` on failure. The `globalErrorHandler` produces `{ success: false, error }` for all error types. Don't duplicate that logic inline.

```ts
result.match(
  (data) => res.json({ success: true, data }),
  (error) => next(error),  // globalErrorHandler takes it from here
);
```

For errors caught with try/catch directly in the controller, produce the envelope manually:
```ts
} catch (error) {
  res.status(500).json({ success: false, error: 'Internal server error' });
}
```

---

## Frontend contract

The frontend `unwrap` utility in `src/api/unwrap.ts` depends on this shape:

```ts
export function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success || !res.data) throw new Error(res.error || 'Request failed');
  return res.data;
}
```

Every service method chains `.then(unwrap)`, so the hook receives a plain domain object with no HTTP concerns. If a controller breaks the envelope, `unwrap` throws with the fallback message `"Request failed"` — no indication of what actually went wrong.

---

## Checklist for a new endpoint

- [ ] Success response: `{ success: true, data: <typed object> }`
- [ ] All error responses: `{ success: false, error: "<message>" }`
- [ ] No `timestamp`, `message`, or extra fields in the body
- [ ] Business state (PENDING, FAILED, etc.) expressed as a field inside `data`, not a shape change
- [ ] Errors from the Result pattern forwarded via `next(error)`

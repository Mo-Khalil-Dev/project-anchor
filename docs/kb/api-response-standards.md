# Industry Standards for API Response Structure

## The Short Answer

Yes — the equivalent of ASP.NET's `ProblemDetails` in the Node.js ecosystem is **RFC 9457** (formerly RFC 7807), the same spec that `ProblemDetails` implements. ASP.NET didn't invent it — it just ships a built-in implementation. In Express/Node.js you implement it yourself or use a library.

---

## The Main Standards

### 1. RFC 9457 — Problem Details for HTTP APIs (IETF Standard)
The closest thing to a universal standard for error responses. ASP.NET `ProblemDetails` implements this exactly.

**Error shape:**
```json
{
  "type": "https://example.com/errors/assessment-not-found",
  "title": "Assessment Not Found",
  "status": 404,
  "detail": "No referenceData exists with ID 'abc-123'.",
  "instance": "/assessments/abc-123"
}
```

| Field | Required | Meaning |
|---|---|---|
| `type` | No (defaults to `about:blank`) | URI identifying the error class — links to docs |
| `title` | No | Human-readable summary of the error class |
| `status` | No | HTTP status code (mirrors the HTTP status) |
| `detail` | No | Human-readable explanation specific to this occurrence |
| `instance` | No | URI identifying this specific occurrence |

Extensions are allowed — you can add `traceId`, `code`, `errors` (for validation) etc.

**In Express — implement it yourself:**
```ts
// No built-in. Roll your own or use `http-problem-details` npm package.
res.status(404).json({
  type: 'https://yourapi.com/errors/not-found',
  title: 'Not Found',
  status: 404,
  detail: `Assessment '${assessmentId}' not found`,
  instance: req.path,
});
```

**Content-Type matters:** RFC 9457 specifies `application/problem+json`, not `application/json`. Most APIs ignore this in practice.

---

### 2. JSend
Simple, widely adopted, no RFC. Closest to what PROJECT BRIDGE currently uses.

```json
// success
{ "status": "success", "data": { ... } }

// fail (client error — bad input, not found)
{ "status": "fail", "data": { "id": "must be a UUID" } }

// error (server error — unexpected)
{ "status": "error", "message": "Database unavailable" }
```

**Key difference from our current `ApiResponse<T>`:** JSend distinguishes between `fail` (4xx — client's fault) and `error` (5xx — server's fault). Our `success: false` covers both.

---

### 3. JSON:API
A full specification for resource-oriented APIs. Opinionated and verbose — good for complex APIs with relationships, overkill for most projects.

```json
{
  "data": {
    "type": "assessments",
    "id": "abc-123",
    "attributes": { "status": "COMPLETED", "monthlyIncome": 3000 }
  }
}
```

Errors:
```json
{
  "errors": [{
    "status": "404",
    "title": "Not Found",
    "detail": "Assessment not found"
  }]
}
```

---

### 4. Google Cloud API Design Guide
Google's internal standard, made public. Used by all Google APIs. Success returns the resource directly. Errors use a structured `status` object:

```json
{
  "error": {
    "code": 404,
    "message": "Assessment not found",
    "status": "NOT_FOUND",
    "details": []
  }
}
```

---

## Comparison

| Standard | Success shape | Error shape | Machine-readable errors | Adoption |
|---|---|---|---|---|
| **RFC 9457** | (not defined) | `{ type, title, status, detail }` | Yes — via `type` URI | .NET, Spring, FastAPI |
| **JSend** | `{ status, data }` | `{ status, message }` | No | Informal, widespread |
| **JSON:API** | `{ data: { type, id, attributes } }` | `{ errors: [...] }` | Partial | Niche |
| **Google** | Resource directly | `{ error: { code, message, status } }` | Yes — via `status` string | Google APIs |
| **Our current** | `{ success: true, data }` | `{ success: false, error }` | No | Internal only |

---

## What Our Current Standard Is Missing

Our `ApiResponse<T>` is a simplified JSend. It works, but has two gaps compared to RFC 9457:

**1. No machine-readable error code.**
`{ success: false, error: "Assessment not found" }` — the client must string-match the message to handle specific errors differently. A `code` field fixes this:
```json
{ "success": false, "code": "ASSESSMENT_NOT_FOUND", "error": "Assessment not found" }
```

**2. No validation error detail.**
For 400 validation errors, `error` is a single string. RFC 9457 and JSON:API both support an array of field-level errors:
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "error": "Request validation failed",
  "errors": [
    { "field": "monthlyBill", "message": "Must be a positive number" }
  ]
}
```

---

## Recommendation for PROJECT BRIDGE

Don't adopt RFC 9457 wholesale — the `type` URI system and `application/problem+json` content type add ceremony without much benefit at this scale. But adopt the two missing pieces:

Add `code` (machine-readable) to error responses:
```ts
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  code?: string;   // e.g. "ASSESSMENT_NOT_FOUND", "VALIDATION_ERROR"
  error?: string;  // human-readable
  errors?: { field: string; message: string }[];  // validation only
}
```

This gives the frontend something stable to `switch` on without committing to the full RFC 9457 ceremony.

---

## Node.js / Express Libraries

| Library | What it does |
|---|---|
| `http-errors` | Creates typed HTTP error objects (`createError(404, 'Not found')`) — doesn't define response shape |
| `http-problem-details` | Full RFC 9457 implementation for Node.js |
| `@hapi/boom` | Hapi's error standard — similar to RFC 9457, very popular |
| NestJS built-in | `HttpException` + exception filters produce consistent JSON error responses out of the box |
| Fastify `fastify-sensible` | Adds `reply.notFound()`, `reply.badRequest()` etc. with consistent shapes |

Express has nothing built-in — which is why inconsistent controller responses are so common in Express codebases.

---

## Next Step

> **TODO:** Evaluate an npm package to handle the response envelope so controllers don't construct it manually. Candidates: `http-problem-details` (RFC 9457), `@hapi/boom`, or a thin in-house utility. Decision pending.

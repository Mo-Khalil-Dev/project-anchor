# Mock Service Worker (MSW) Configuration Guide

**Version:** 1.0  
**Last Updated:** 2026-04-24  
**Scope:** Frontend (Vitest/React) and Backend (Jest/Node) setup

## Table of Contents
1. [Introduction](#introduction)
2. [When to Use MSW vs. Direct Mocking](#when-to-use-msw-vs-direct-mocking)
3. [Backend Setup (Jest + Node)](#backend-setup-jest--node)
4. [Frontend Setup (Vitest + React)](#frontend-setup-vitest--react)
5. [Shared Concepts](#shared-concepts)
6. [Local Development with MSW](#local-development-with-msw)
7. [CI/CD Integration](#cicd-integration)
8. [Troubleshooting](#troubleshooting)
9. [Future: Browser/E2E Testing](#future-browsere2e-testing)

---

## Introduction

**Mock Service Worker (MSW)** is a library that intercepts HTTP requests at the network level and returns mocked responses. Unlike direct mocking (`vi.mock()`, `jest.mock()`), MSW mocks requests made by the actual code path, making tests more realistic and integration-level.

### Why MSW?
- **Realistic testing:** Tests exercise actual HTTP client code, not mocked service modules
- **Shared handlers:** Same mock definitions can be used across tests, dev server, and eventually browser tests
- **Easier maintenance:** Change API response shape once, update one handler instead of multiple mocks
- **Great DX:** Clear error messages when requests don't match handlers

### Comparison: MSW vs. Direct Mocking

| Aspect | MSW | vi.mock() / jest.mock() |
|--------|-----|---------|
| **What it mocks** | HTTP requests (network layer) | JavaScript modules |
| **When to use** | Integration tests, API contracts | Unit tests, isolated behavior |
| **Setup complexity** | Moderate (handlers + server setup) | Simple (one mock per file) |
| **Code exercised** | HTTP client code path included | Service code path only |
| **Reusability** | High (same handlers everywhere) | Low (per-test mocks) |
| **Error scenarios** | Easy (modify handler response) | Requires mock updates |

**Best Practice:** Use both! MSW for integration tests, direct mocking for unit tests.

---

## Backend Setup (Jest + Node)

### Quick Reference
The backend uses **MSW 1.3.2** with Jest. See [backend/MSW_SETUP.md](../../backend/MSW_SETUP.md) for full details.

### Key Files
- **Handlers:** `backend/src/__mocks__/tink.handlers.ts` — All API request handlers
- **Test Server:** `backend/src/__mocks__/server.ts` — MSW server setup
- **Jest Config:** `backend/jest.config.js` — Loads setup file before tests
- **Setup:** `backend/src/__mocks__/setup.ts` — Lifecycle hooks (beforeAll, afterEach, afterAll)
- **Dev Server:** `backend/src/__mocks__/dev-server.ts` — Standalone MSW for local development

### Running Backend Tests
```bash
npm test                    # Run all tests with MSW enabled
npm run test:watch        # Watch mode
npm run test:cov          # With coverage
```

### Example Backend Test
```typescript
// tests/tinkApiClient.test.ts
import { TinkOAuthService } from '../src/infrastructure/usecases/TinkOAuthService';

describe('TinkOAuthService', () => {
  it('should fetch access token from mocked Tink API', async () => {
    const mockConfig = { /* ... */ };
    const mockLogger = { /* ... */ };
    const service = new TinkOAuthService(mockConfig, mockLogger);

    const result = await service.getAccessToken();
    
    expect(result.isOk).toBe(true);
    expect(result.getOrThrow()).toBe('mock_access_token_12345');
  });
});
```

MSW intercepts the `POST https://api.tink.com/api/v1/oauth/token` request and returns the mocked response.

---

## Frontend Setup (Vitest + React)

### Installation

```bash
cd frontend
npm install --save-dev msw@1.3.2
```

> **Version Note:** MSW 1.3.2 (not 2.x) for better CommonJS compatibility with Vitest/Jest

### 1. Create Handlers

Create `frontend/src/__mocks__/api.handlers.ts`:

```typescript
import { rest } from 'msw';

const API_BASE = 'http://localhost:3001/api';

export const apiHandlers = [
  // Assessment endpoints
  rest.get(`${API_BASE}/assessments/:customerId`, (req, res, ctx) => {
    const { customerId } = req.params;
    return res(
      ctx.json({
        id: customerId,
        status: 'pending',
        hardshipLevel: 'MODERATE',
        createdAt: new Date().toISOString(),
      })
    );
  }),

  // Bank connection endpoints
  rest.post(`${API_BASE}/bank-connections/initiate`, (req, res, ctx) => {
    return res(
      ctx.json({
        authorizationUrl: 'https://link.tink.com/1.0/expense-check/create-report?...',
        state: 'state_123',
      })
    );
  }),

  rest.post(`${API_BASE}/bank-connections/callback`, (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        customerId: 'cust_123',
      })
    );
  }),

  // Payment plans endpoints
  rest.post(`${API_BASE}/assessments/:customerId/payment-plans`, (req, res, ctx) => {
    return res(
      ctx.json({
        paymentPlans: [
          {
            id: 'plan_conservative',
            type: 'CONSERVATIVE',
            monthlyPayment: 150,
            duration: 24,
            riskScore: 0.95,
          },
          {
            id: 'plan_balanced',
            type: 'BALANCED',
            monthlyPayment: 250,
            duration: 12,
            riskScore: 0.85,
          },
        ],
      })
    );
  }),
];
```

### 2. Create MSW Server Setup

Create `frontend/src/__mocks__/server.ts`:

```typescript
import { setupServer } from 'msw/node';
import { apiHandlers } from './api.handlers';

export const server = setupServer(...apiHandlers);
```

### 3. Update Test Setup

Update `frontend/src/test/setup.ts` to add MSW:

```typescript
import '@testing-library/jest-dom';
import { server } from '../__mocks__/server';

// Start MSW before running tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test (allows overrides per-test)
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});
```

> **Note:** Vitest automatically loads `src/test/setup.ts` via `vite.config.ts` configuration. No additional Jest setup needed.

### 4. Using MSW in Frontend Tests

```typescript
// src/usecases/assessmentService.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useAssessment } from '@/hooks/useAssessment';
import { server } from '@/__mocks__/server';
import { rest } from 'msw';

describe('Assessment Service', () => {
  it('should fetch referenceData data', async () => {
    const { result } = renderHook(() => useAssessment('cust_123'));

    await waitFor(() => {
      expect(result.current.assessment).toBeDefined();
      expect(result.current.assessment.hardshipLevel).toBe('MODERATE');
    });
  });

  it('should handle API errors', async () => {
    // Override handler for this test only
    server.use(
      rest.get('http://localhost:3001/api/assessments/:customerId', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    const { result } = renderHook(() => useAssessment('cust_123'));

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.error.message).toContain('Server error');
    });
  });

  it('should retry on network failure', async () => {
    server.use(
      rest.get('http://localhost:3001/api/assessments/:customerId', (req, res, ctx) => {
        return res(ctx.status(503), ctx.json({ error: 'Service unavailable' }));
      })
    );

    // Test retry logic...
  });
});
```

### 5. Running Frontend Tests

```bash
cd frontend
npm test              # Run all tests with MSW enabled
npm test:run         # Single run (CI mode)
npm test -- --coverage  # With coverage report
```

---

## Shared Concepts

### Handler Definition Patterns

#### Parametrized Endpoints
```typescript
// Matches: GET /api/assessments/cust_123
rest.get('http://localhost:3001/api/assessments/:customerId', (req, res, ctx) => {
  const { customerId } = req.params;
  return res(ctx.json({ id: customerId, /* ... */ }));
});
```

#### Query Parameters
```typescript
// Matches: GET /api/assessments?status=pending
rest.get('http://localhost:3001/api/assessments', (req, res, ctx) => {
  const status = req.url.searchParams.get('status');
  return res(ctx.json({ status }));
});
```

#### POST with Request Body
```typescript
rest.post('http://localhost:3001/api/payment-plans', async (req, res, ctx) => {
  const body = await req.json();
  const { customerId, monthlyBudget } = body;
  
  return res(ctx.json({
    customerId,
    recommendedPayment: monthlyBudget * 0.8,
  }));
});
```

### Response Factories

Create `frontend/src/__mocks__/factories.ts` for reusable mock data:

```typescript
export function createAssessment(overrides = {}) {
  return {
    id: 'assess_123',
    customerId: 'cust_123',
    status: 'completed',
    hardshipLevel: 'MODERATE',
    disposableIncome: 500,
    billAffordability: 0.18,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createPaymentPlan(overrides = {}) {
  return {
    id: 'plan_123',
    type: 'BALANCED',
    monthlyPayment: 250,
    duration: 12,
    riskScore: 0.85,
    sustainability: 'MEDIUM',
    ...overrides,
  };
}
```

Use in handlers:
```typescript
rest.get('http://localhost:3001/api/assessments/:customerId', (req, res, ctx) => {
  return res(ctx.json(createAssessment()));
});
```

### Per-Test Handler Overrides

```typescript
import { server } from '@/__mocks__/server';
import { rest } from 'msw';

describe('Test Suite', () => {
  it('handles specific error scenario', async () => {
    // Override just this handler for this test
    server.use(
      rest.get('http://localhost:3001/api/assessments/:customerId', (req, res, ctx) => {
        return res(ctx.status(404), ctx.json({ error: 'Not found' }));
      })
    );

    // Test code...
    // Handler automatically resets via afterEach()
  });
});
```

### Testing Error Scenarios

```typescript
// Network error
rest.get('/api/endpoint', (req, res, ctx) => {
  return res(ctx.networkError('Failed to connect'));
});

// Timeout (using delay)
rest.get('/api/endpoint', (req, res, ctx) => {
  return res(ctx.delay(5000), ctx.json(data));
});

// Empty response
rest.get('/api/endpoint', (req, res, ctx) => {
  return res(ctx.json(null));
});

// Different status codes
rest.get('/api/endpoint', (req, res, ctx) => {
  return res(ctx.status(401), ctx.json({ error: 'Unauthorized' }));
});
```

---

## Local Development with MSW

### Backend Dev Server

Run both the MSW server and your backend:

```bash
# Terminal 1: Start MSW mock server
cd backend
npm run dev:mocks

# Terminal 2: Start Express backend
npm run dev
```

Your backend will intercept all Tink API calls locally:
- `POST https://api.tink.com/api/v1/oauth/token`
- `GET https://api.tink.com/risk/v1/expense-checks/:customerId`
- etc.

**Useful for:** Testing without real Tink credentials, integration testing, demos.

### Frontend Dev Server (Optional Future)

When needed, Vite dev server can use MSW handlers via vitest:

```bash
cd frontend
npm run dev
```

Tests run against mocked APIs automatically. Frontend app would still call real backend at `http://localhost:3001/api` unless you add additional configuration.

### Full-Stack Local Testing

1. **Backend MSW running:** `backend/npm run dev:mocks`
2. **Backend app running:** `backend/npm run dev` (uses mocked Tink APIs)
3. **Frontend app running:** `frontend/npm run dev` (calls mocked backend at `localhost:3001/api`)

All HTTP calls are mocked at the network level. Perfect for isolated development without external dependencies.

---

## CI/CD Integration

### Environment Variables

MSW automatically detects test environment. No special CI config needed.

However, ensure test environment is set:

```bash
# .env.test or CI script
NODE_ENV=test
VITE_ENV=test
```

### Running Tests in CI

**Backend:**
```bash
npm run test:cov  # Runs with MSW handlers active
```

**Frontend:**
```bash
npm test:run      # Single run (no watch mode)
```

### Docker Testing

Create a test container in `Dockerfile.test`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Backend testing
COPY backend/package*.json ./backend/
RUN cd backend && npm ci
COPY backend ./backend
RUN cd backend && npm test

# Frontend testing
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY frontend ./frontend
RUN cd frontend && npm test:run
```

Build and run:
```bash
docker build -f Dockerfile.test -t bridge:test .
docker run bridge:test
```

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # Backend tests
      - name: Backend tests
        run: |
          cd backend
          npm ci
          npm test
      
      # Frontend tests
      - name: Frontend tests
        run: |
          cd frontend
          npm ci
          npm test:run
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info,./frontend/coverage/lcov.info
```

**Key points:**
- MSW works seamlessly in CI (no special flags needed)
- Tests run with network interception active
- No external API calls made (deterministic, fast)
- Coverage reports unaffected by MSW

---

## Troubleshooting

### "Unhandled request" Error

**Problem:** Test fails with "MSW captured a request without a matching request handler"

**Solution:** Verify handler URL matches request URL exactly:

```typescript
// ❌ Handler for /api/assessments
// ✓ Matches: GET http://localhost:3001/api/assessments/cust_123

// Check your request URL:
// Client code: await httpService.get('/assessments/cust_123')
// Actual URL: http://localhost:3001/api/assessments/cust_123

// Update handler:
rest.get('http://localhost:3001/api/assessments/:customerId', ...)
```

### Handlers Not Resetting Between Tests

**Problem:** First test passes, second test fails with unexpected mock data

**Solution:** Ensure `afterEach(() => server.resetHandlers())` is in setup file

```typescript
// src/test/setup.ts
afterEach(() => {
  server.resetHandlers();  // This must run after each test
});
```

### Tests Hang or Timeout

**Problem:** Test never completes, waits forever for response

**Solution:** Check if handler is defined correctly:

```typescript
// ❌ Wrong: No response sent
rest.get('http://localhost:3001/api/data', (req, res, ctx) => {
  // Missing: return res(ctx.json(...))
});

// ✓ Correct: Always return response
rest.get('http://localhost:3001/api/data', (req, res, ctx) => {
  return res(ctx.json({ data: 'value' }));
});
```

### "Cannot use import statement" Error (ESM/CommonJS)

**Problem:** Jest fails with "Cannot use import statement outside a module"

**Solution:** Use **MSW 1.3.2**, not 2.x

```bash
npm install --save-dev msw@1.3.2
```

MSW 2.x is ESM-first; version 1.x has better CommonJS compatibility with Jest.

### Wrong Environment Variables in Mocks

**Problem:** Handlers use hardcoded URLs instead of env vars

**Solution:** Use `import.meta.env` (frontend) or `process.env` (backend):

```typescript
// ✓ Frontend: Vitest reads Vite env vars
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ✓ Backend: Node env vars
const TINK_API = process.env.TINK_API_BASE_URL || 'https://api.tink.com';
```

---

## Future: Browser/E2E Testing

In the future, MSW can be extended to browser/E2E tests (Playwright, Cypress):

- **MSW Browser Mode:** Intercept requests in actual browser using Service Workers
- **Same handlers:** Reuse handlers across tests, dev, and browser tests
- **Benefits:** Test full user journeys with deterministic, mocked APIs

**Status:** Not currently implemented. When needed:
1. Install `@mswjs/browser` (browser version of MSW)
2. Add browser worker setup
3. Extend existing handlers
4. Use in Playwright/Cypress tests

**Reference:** [MSW Browser Documentation](https://mswjs.io/docs/browser)

---

## Summary Table

| Scenario | Tool | Setup | Example |
|----------|------|-------|---------|
| Backend integration tests | MSW + Jest | `backend/src/__mocks__/` | Token exchange, Tink API calls |
| Frontend integration tests | MSW + Vitest | `frontend/src/__mocks__/` | Assessment fetch, payment plan selection |
| Backend unit tests | jest.mock() | Inline per-test | Service method logic |
| Frontend unit tests | vi.mock() | Inline per-test | Hook calculation logic |
| Local backend dev | MSW dev server | `npm run dev:mocks` + `npm run dev` | Testing without real APIs |
| Local frontend dev | Direct API calls | Point to real/mock backend | Development workflow |

---

## References

- **Backend Setup:** [backend/MSW_SETUP.md](../../backend/MSW_SETUP.md)
- **Backend Handlers:** [backend/src/__mocks__/tink.handlers.ts](../../backend/src/__mocks__/tink.handlers.ts)
- **Frontend Test Setup:** [frontend/src/test/setup.ts](../../frontend/src/test/setup.ts)
- **Frontend Endpoints:** [frontend/src/api/endpoints.ts](../../frontend/src/api/endpoints.ts)
- **MSW Documentation:** [https://mswjs.io/](https://mswjs.io/)

---

**Questions?** Refer to the troubleshooting section or check MSW docs. For PROJECT BRIDGE-specific questions, see the architecture documentation.
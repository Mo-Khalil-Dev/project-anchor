# Mock Service Worker (MSW) Setup

This project uses MSW to mock Tink APIs for testing and local development.

## What's Mocked

- **OAuth token endpoint (v1)**: `POST https://api.tink.com/api/v1/oauth/token`
- **OAuth token endpoint**: `POST https://api.tink.com/oauth/token`
- **Expense checks**: `GET https://api.tink.com/risk/v1/expense-checks/{customerId}`
- **Expense reports**: `GET https://api.tink.com/expense-reports/{reportId}`
- **Risk insights**: `GET https://api.tink.com/risk-insights/{reportId}`

## Usage

### For Tests

MSW is automatically set up for all Jest tests. Handlers are configured in `src/__mocks__/setup.ts`.

```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:cov           # With coverage
```

**No additional configuration needed** — just write your tests normally and Tink API calls will be intercepted automatically.

Example test: `tests/tinkApiClient.test.ts`

### For Local Development

To run your app locally with mocked Tink APIs (useful when you don't have real Tink credentials):

```bash
# Terminal 1: Start MSW mock server
npm run dev:mocks

# Terminal 2: Start your Express app
npm run dev
```

Your backend will now intercept all Tink API calls and return mock responses.

## Customizing Mocks

Edit `src/__mocks__/tink.handlers.ts` to modify response data:

```typescript
http.get(`${TINK_API_BASE}/api/v1/expense-reports/:reportId`, ({ params }) => {
  return HttpResponse.json({
    id: params.reportId,
    status: 'completed',
    // ... customize data here
  });
}),
```

## How It Works

- **Tests**: MSW intercepts all HTTP requests matching the handlers during test execution
- **Dev Mode**: `dev-server.ts` starts a standalone MSW server that intercepts requests to Tink APIs
- **Production**: No impact — these are dev/test dependencies

## File Structure

```
src/__mocks__/
├── tink.handlers.ts    # All Tink API handlers
├── server.ts           # Jest test server setup
├── setup.ts            # Jest configuration
└── dev-server.ts       # Standalone dev server
```

## Troubleshooting

**Tests fail with "Unhandled request":**
- Check that your URL matches one of the handlers in `tink.handlers.ts`
- MSW logs unhandled requests to console

**Mocks not being used in dev:**
- Make sure `npm run dev:mocks` is running before `npm run dev`
- Check that your code is making requests to the correct base URLs (see `tink.handlers.ts`)

**Real API Still Being Called:**
- Ensure the Tink base URLs in your config match what's in `tink.handlers.ts`:
  - `https://api.tink.com`
  - `https://api.tink.com/risk/v1`

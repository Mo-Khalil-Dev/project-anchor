# Tink OAuth Flow - Connect Your Bank

## Overview

The "Connect your bank" flow enables customers to securely link their bank account to PROJECT BRIDGE via Tink's OAuth integration. This retrieves income, expense, and risk assessment data automatically, eliminating manual entry and improving accuracy.

---

## Complete Flow Sequence

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. CUSTOMER INITIATES                                               │
│    Customer clicks "Connect your bank" button in UI                │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│ 2. FRONTEND → BACKEND                                               │
│    Frontend calls /api/bank-connection/initiate                    │
│    Backend creates Tink authorization request, returns authZ URL   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│ 3. FRONTEND REDIRECTS TO TINK                                       │
│    User redirected to Tink OAuth consent screen                    │
│    Customer logs into their bank & grants permission               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│ 4. TINK REDIRECTS BACK                                              │
│    Tink calls callback URL with reports_generation_job_id          │
│    Format: {CALLBACK_URI}?reports_generation_job_id={JOB_ID}      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│ 5. BACKEND EXTRACTS JOB ID                                          │
│    Parse reports_generation_job_id from query params               │
│    Store in session/database for tracking                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│ 6. BACKEND AUTHENTICATES WITH TINK                                  │
│    POST to /api/v1/oauth/token (client credentials grant)          │
│    Exchange Client ID + Client Secret for access token             │
│    Scope: reports-generation-jobs, income-checks, risk-insights,   │
│           expense-checks (all read-only)                           │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│ 7. BACKEND FETCHES REPORT STATUS                                    │
│    GET /api/v1/reports-generation-jobs/{JOB_ID}                    │
│    Check status: if PENDING, start polling                         │
│    If COMPLETED, move to step 8                                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│ 8. BACKEND POLLS FOR REPORT COMPLETION (if needed)                  │
│    Poll GET /api/v1/reports-generation-jobs/{JOB_ID} periodically  │
│    Continue until status = COMPLETED or timeout reached            │
│    Extract report IDs for each type from response                  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│ 9. BACKEND RETRIEVES DETAILED REPORTS                               │
│    GET /risk/v1/expense-checks/{EXPENSE_CHECK_REPORT_ID}          │
│    GET /v2/income-checks/{INCOME_CHECK_REPORT_ID}                 │
│    GET /risk/v1/risk-insights/{RISK_INSIGHTS_REPORT_ID}           │
│    Store all data securely                                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│ 10. ASSESSMENT CONTINUES                                            │
│     Bank data now available for hardship assessment                │
│     Skip manual income/expense entry                               │
│     Generate payment plan recommendations                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Breakdown

### Step 1: Customer Initiates
**UI Action:** Customer clicks "Connect your bank" button on assessment form

### Step 2: Frontend Requests Authorization
**Endpoint:** `POST /api/bank-connection/initiate`
**Frontend sends:**
- Customer ID / Session ID
- Redirect URI for Tink callback

**Backend responds:**
```json
{
  "authorizationUrl": "https://link.tink.com/1.0/authorize?client_id=...",
  "requestId": "request_123_abc"  // Track this request
}
```

### Step 3: Tink OAuth Flow
**User is redirected to Tink** → Logs into their bank → Grants permission

### Step 4: Callback Received
**Tink redirects to:** `{CALLBACK_URI}?reports_generation_job_id=caecb48254664234814135346de6082a`

**Backend endpoint:** `GET /api/bank-connection/callback`
- Extract `reports_generation_job_id` from query params
- Validate referrer/origin (CSRF protection)
- Store job ID in session/temp storage with timestamp

### Step 5-6: Authenticate with Tink
**Endpoint:** `POST https://api.tink.com/api/v1/oauth/token`

**Request:**
```
client_id={CLIENT_ID}
client_secret={CLIENT_SECRET}
grant_type=client_credentials
scope=reports-generation-jobs:readonly,income-checks:readonly,risk-insights:readonly,expense-checks:readonly
```

**Response:**
```json
{
  "access_token": "ey123...",
  "token_type": "bearer",
  "expires_in": 1800,
  "scope": "reports-generation-jobs:readonly,income-checks:readonly,risk-insights:readonly,expense-checks:readonly"
}
```

**Storage:** Cache token with expiry time (refresh before 1800s expires)

### Step 7: Check Report Status
**Endpoint:** `GET https://api.tink.com/api/v1/reports-generation-jobs/{JOB_ID}`

**Response:**
```json
{
  "id": "caecb48254664234814135346de6082a",
  "status": "PENDING|COMPLETED|FAILED",
  "createdTime": "2022-10-31T11:55:45Z",
  "updatedTime": "2022-10-31T12:01:32Z",
  "reports": [
    {
      "id": "636eaf5303e942c5ab310e586f7f674a",
      "type": "INCOME_CHECK_REPORT",
      "status": "PENDING|COMPLETED|FAILED"
    },
    {
      "id": "bc875eead4554e77b8dc1644b222e027",
      "type": "RISK_INSIGHTS_REPORT",
      "status": "PENDING|COMPLETED|FAILED"
    },
    {
      "id": "8f931f9d47d04265a53a4dea882c2016",
      "type": "EXPENSE_CHECK_REPORT",
      "status": "PENDING|COMPLETED|FAILED"
    }
  ]
}
```

### Step 8: Poll for Completion (if status = PENDING)
**Polling Strategy:**
- Poll every 2 seconds initially
- Max 30 polls (60 seconds total timeout)
- Stop when status = COMPLETED or FAILED

### Step 9: Retrieve Detailed Reports

#### Income Check Report
**Endpoint:** `GET https://api.tink.com/v2/income-checks/{INCOME_CHECK_REPORT_ID}`

**Fields extracted:**
- Annual income
- Income stability
- Employment status
- Income sources

#### Expense Check Report
**Endpoint:** `GET https://api.tink.com/risk/v1/expense-checks/{EXPENSE_CHECK_REPORT_ID}`

**Fields extracted:**
- Monthly expenses
- Essential expenses (housing, food, transport)
- Expense trends
- Expense reliability

#### Risk Insights Report
**Endpoint:** `GET https://api.tink.com/risk/v1/risk-insights/{RISK_INSIGHTS_REPORT_ID}`

**Fields extracted:**
- Customer risk profile
- Account balance trends
- Payment reliability
- Debt patterns

### Step 10: Store & Continue Assessment
**Database Storage:**
- Bank connection record (customer ID, Tink job ID, reports received)
- Income data (annual, monthly, sources)
- Expense data (essential, discretionary, trends)
- Risk profile data
- Timestamp of data retrieval

**Assessment continues with:**
- Disposable income calculation (income - essential expenses)
- Hardship level determination
- Payment plan recommendations

---

## Configuration Management

### Secrets (Secrets Manager)
**Store in Secrets Manager:**
```
TINK_CLIENT_ID
TINK_CLIENT_SECRET
```

**Local Development (.env):**
```
TINK_CLIENT_ID=dev_client_id
TINK_CLIENT_SECRET=dev_client_secret
```

**Docker Container:**
- Mount secrets from Secrets Manager or pass via environment
- DO NOT commit credentials to repository

### Environment-Specific URLs

**Configuration file** (e.g., `config/tink-config.ts`):
```typescript
const TINK_CONFIG = {
  development: {
    clientId: process.env.TINK_CLIENT_ID,
    clientSecret: process.env.TINK_CLIENT_SECRET,
    tokenEndpoint: 'https://api.tink.com/api/v1/oauth/token',
    jobStatusEndpoint: 'https://api.tink.com/api/v1/reports-generation-jobs',
    incomeEndpoint: 'https://api.tink.com/v2/income-checks',
    expenseEndpoint: 'https://api.tink.com/risk/v1/expense-checks',
    riskEndpoint: 'https://api.tink.com/risk/v1/risk-insights',
    callbackUri: 'http://localhost:3000/api/bank-connection/callback',
  },
  staging: {
    // Same endpoints, different callback URI
    callbackUri: 'https://staging.bridge.com/api/bank-connection/callback',
  },
  production: {
    // Same endpoints, production callback URI
    callbackUri: 'https://bridge.com/api/bank-connection/callback',
  },
};
```

---

## API Endpoints Reference

| Purpose | Method | Endpoint | Auth | Environment-Specific |
|---------|--------|----------|------|----------------------|
| Get Token | POST | `https://api.tink.com/api/v1/oauth/token` | Client credentials | No |
| Check Report Status | GET | `https://api.tink.com/api/v1/reports-generation-jobs/{JOB_ID}` | Bearer token | No |
| Get Income Report | GET | `https://api.tink.com/v2/income-checks/{REPORT_ID}` | Bearer token | No |
| Get Expense Report | GET | `https://api.tink.com/risk/v1/expense-checks/{REPORT_ID}` | Bearer token | No |
| Get Risk Report | GET | `https://api.tink.com/risk/v1/risk-insights/{REPORT_ID}` | Bearer token | No |
| Initiate Flow (Bridge) | POST | `/api/bank-connection/initiate` | Session/Auth | Yes (callback URI) |
| Receive Callback (Bridge) | GET | `/api/bank-connection/callback` | CSRF token | Yes (callback URI) |

---

## Data Structures

### Request: Initiate Bank Connection
```json
{
  "customerId": "cust_123",
  "sessionId": "session_abc"
}
```

### Response: Authorization URL
```json
{
  "authorizationUrl": "https://link.tink.com/1.0/authorize?client_id=...",
  "requestId": "req_123"
}
```

### Callback Query Parameters
```
reports_generation_job_id=caecb48254664234814135346de6082a
```

### Token Response
```json
{
  "access_token": "ey123...",
  "token_type": "bearer",
  "expires_in": 1800,
  "scope": "reports-generation-jobs:readonly,income-checks:readonly,risk-insights:readonly,expense-checks:readonly"
}
```

### Report Status Response
```json
{
  "id": "caecb48254664234814135346de6082a",
  "status": "COMPLETED",
  "createdTime": "2022-10-31T11:55:45Z",
  "updatedTime": "2022-10-31T12:01:32Z",
  "reports": [
    {
      "id": "636eaf5303e942c5ab310e586f7f674a",
      "type": "INCOME_CHECK_REPORT",
      "status": "COMPLETED"
    },
    {
      "id": "bc875eead4554e77b8dc1644b222e027",
      "type": "RISK_INSIGHTS_REPORT",
      "status": "COMPLETED"
    },
    {
      "id": "8f931f9d47d04265a53a4dea882c2016",
      "type": "EXPENSE_CHECK_REPORT",
      "status": "COMPLETED"
    }
  ]
}
```

---

## Polling Strategy

**Trigger:** When report status = PENDING after first check

**Parameters:**
- **Initial interval:** 2 seconds
- **Max attempts:** 30 (60 seconds total)
- **Backoff strategy:** Linear (2s, 2s, 2s, ...)
- **Timeout behavior:** Fail gracefully, allow manual retry

**Pseudo-code:**
```
for attempt = 1 to 30:
  wait 2 seconds
  response = GET /reports-generation-jobs/{JOB_ID}
  
  if response.status === "COMPLETED":
    break (extract report IDs)
  
  if response.status === "FAILED":
    throw error (report generation failed)
  
  if attempt === 30:
    throw timeout error
```

---

## Error Handling

### Scenario: Token Expiry
- **Detection:** API returns 401 Unauthorized
- **Recovery:** Refresh token (POST to /oauth/token again)
- **Storage:** Cache token with expiry time, refresh proactively

### Scenario: Report Generation Fails
- **Detection:** `response.status === "FAILED"` after polling
- **User message:** "We couldn't retrieve your bank data. Please try again or enter income manually."
- **Logging:** Log Tink error for debugging

### Scenario: Polling Timeout
- **Detection:** 30 polls completed, status still PENDING
- **User message:** "Bank connection is taking longer than expected. You can continue with manual entry or try again shortly."
- **Backend:** Create a manual review task for support

### Scenario: Invalid Callback
- **Detection:** Missing or malformed `reports_generation_job_id`
- **Recovery:** Redirect user back to "Connect your bank" with error message
- **Security:** Validate CSRF token/referrer

### Scenario: Network Error During Report Retrieval
- **Detection:** HTTP error from Tink API (5xx, timeout)
- **Recovery:** Retry up to 3 times with exponential backoff
- **Fallback:** Allow manual entry

### Scenario: Customer Session Expired
- **Detection:** Callback received but session not found
- **Recovery:** Prompt user to restart bank connection flow
- **Security:** Don't expose sensitive data in error messages

---

## Implementation Tasks

### Backend Tasks
- [ ] Create `/api/bank-connection/initiate` endpoint
- [ ] Create `/api/bank-connection/callback` endpoint
- [ ] Implement Tink client authentication (token endpoint)
- [ ] Implement report status polling with retry logic
- [ ] Implement detailed report retrieval (income, expense, risk)
- [ ] Create database schema for storing bank connections
- [ ] Create database schema for storing retrieved reports
- [ ] Implement error handling for all failure scenarios
- [ ] Implement configuration management (environment-specific URLs, secrets)
- [ ] Implement session/state management for in-flight requests
- [ ] Implement logging for debugging
- [ ] Add security: CSRF protection, input validation

### Frontend Tasks
- [ ] Create "Connect your bank" button
- [ ] Handle redirect to authorization URL
- [ ] Create callback handler page
- [ ] Display loading state during polling
- [ ] Handle errors: show retry option, manual entry fallback
- [ ] Update assessment flow to skip manual entry when bank data available
- [ ] Display bank data confirmation to customer

### Testing Tasks
- [ ] Unit tests for token exchange
- [ ] Unit tests for polling logic
- [ ] Integration tests for full flow with mock Tink API
- [ ] Error scenario tests (timeout, failed reports, network errors)
- [ ] Security tests (CSRF, invalid callbacks)

---

## Security Considerations

1. **CSRF Protection:** Validate state/referrer on callback
2. **Secrets Management:** Never commit credentials; use Secrets Manager
3. **Token Storage:** Don't expose tokens to frontend; keep on backend
4. **HTTPS Only:** All communication must be encrypted
5. **Input Validation:** Sanitize `reports_generation_job_id` from callback
6. **Error Messages:** Don't expose technical details to customer
7. **Audit Logging:** Log all Tink API calls for compliance


# Project Anchor: Complete Database Analysis

**Document Purpose:** Comprehensive guide to understanding the database structure, data flows, and design decisions in the SAFE (Sustainable Affordability Financial Evaluation) platform.

**Last Updated:** 2026-05-04  
**Database:** SQLite with Prisma ORM  
**Schema Version:** 6 migrations (latest: Assessment + breakdown fields)

---

## 1. EXECUTIVE SUMMARY

### The Database at a Glance

| Aspect | Details |
|--------|---------|
| **Total Models** | 13 Prisma models |
| **Logical Domains** | 5 (Auth & Identity, Customer Core, Bank Integration, Assessment & Hardship, Payment Processing) |
| **Status** | 4/5 domains implemented (Payment execution pending) |
| **Key Pattern** | Vertical slice architecture — features own their data |
| **Error Handling** | Railway-oriented programming with `Result<T, Error>` type |
| **Schema Evolution** | 6 migrations tracking feature rollout |

### Why This Database Exists

The database is built around **3 core workflows**:

1. **Identity & Account Linking** — Authenticate user via Cognito, link to utility customer record
2. **Bank Data Extraction** — Retrieve 12-month transaction history via Tink OAuth, calculate income/expenses
3. **Hardship Assessment** — Analyze affordability (income vs bill), determine hardship level, generate 3 payment plans

### Design Philosophy

- **Flexibility over Strictness** — JSON fields for breakdowns (no schema migrations needed when structure evolves)
- **Explicit Error Handling** — Result types instead of exceptions
- **Async Processing** — AssessmentJob for background calculation of complex hardship metrics
- **Data Isolation** — Each feature owns its models; cascade deletes are explicit
- **Audit Trail** — SessionLog tracks all auth events; Assessment links to BankConnection for provenance

---

## 2. DATABASE SCHEMA: COMPLETE MODEL MAP

### 2.1 Authentication & Identity Domain (3 Models)

```
USER (represents authenticated person)
├── id (PK)
├── email (unique) — from Cognito
├── externalId (unique) — Cognito subject
├── firstName, lastName
├── role (customer | admin)
├── customerId (FK, optional) — links to Customer
├── Indexes: externalId, role
└── Relations: RefreshToken[], SessionLog[], Customer (optional 1:1)

REFRESHTOKEN (session persistence)
├── id (PK)
├── userId (FK)
├── token (unique)
├── tokenHash
├── revokedAt, expiresAt
├── Cascade: delete on user delete
└── Indexes: userId, tokenHash

SESSIONLOG (audit trail)
├── id (PK)
├── userId (FK)
├── action (LOGIN | LOGOUT | REFRESH_TOKEN | TOKEN_EXPIRED | ACCOUNT_LINKED)
├── ipAddress, userAgent
├── createdAt
├── Cascade: delete on user delete
└── Indexes: userId, action
```

**Design Rationale:**
- **Cognito Integration:** `externalId` stores Cognito subject; `email` is lookup field for matching returns
- **Deferred Linking:** `customerId` is optional because users register before linking to utility account
- **SessionLog:** Enables compliance audits (who accessed when) and fraud detection

---

### 2.2 Customer Core Domain (5 Models)

```
CUSTOMER (utility account holder)
├── id (PK)
├── email (unique)
├── firstName, lastName, phone
├── address, postcode
├── utilityAccountNo, utilityType (Electricity | Gas | Water)
├── monthlyBill (pence, denormalized)
├── arrears (pence, denormalized)
├── createdAt, updatedAt
├── Indexes: email, utilityType
└── Relations:
    ├── User (optional 1:1, reverse FK)
    ├── BankConnection[] (1:N)
    ├── Assessment[] (1:N)
    ├── Mandate[] (1:N)
    └── PaymentMethod[] (1:N)

BANKCONNECTION (OAuth state + integration metadata)
├── id (PK)
├── customerId (FK)
├── oauthState (unique) — state param for PKCE
├── status (PENDING | DATA_RETRIEVED | DISCONNECTED)
├── connectedAt, dataRetrievedAt, disconnectedAt
├── Indexes: customerId, oauthState
├── Relations:
    ├── Customer (1:N reverse)
    ├── BankAccount[] (1:N)
    ├── BankIncomeReport (1:1)
    ├── BankExpenseReport (1:1)
    ├── BankRiskInsights (1:1)
    ├── BankReports (1:1)
    └── Assessment[] (1:N)

BANKACCOUNT (individual account under connection)
├── id (PK)
├── bankConnectionId (FK)
├── accountId (string, Tink identifier)
├── accountNumber, routingNumber
├── accountType, institutionName, currency (default: GBP)

BANKINCOMEREPORT (extracted income data)
├── id (PK)
├── bankConnectionId (FK, unique)
├── monthlyIncome (pence)
├── salaryIncome, otherIncome (pence breakdown)
├── dataSource (TINK_INCOME_CHECK), analysisMonth
├── createdAt

BANKEXPENSEREPORT (extracted expense categories)
├── id (PK)
├── bankConnectionId (FK, unique)
├── monthlyExpenses (pence)
├── utilities, housing, food, transport, other (pence)
├── dataSource (TINK_EXPENSE_CHECK), analysisMonth
├── createdAt

BANKREPORTS (consolidated raw API responses)
├── id (PK)
├── bankConnectionId (FK, unique)
├── incomeJson (string, parsed by ProcessAssessmentJobService)
├── expensesJson (string, parsed by ProcessAssessmentJobService)
├── totalMonthlyIncome, totalMonthlyExpenses (pence)
├── expiresAt (when data becomes stale)
└── Note: DecouplesFresh bank data refresh from Assessment longevity

BANKRISKINSIGHTS (optional risk metrics)
├── id (PK)
├── bankConnectionId (FK, unique)
├── accountBalance (pence)
├── transactionVolume, overdraftUsage
├── dataSource, analysisDate
```

**Design Rationale:**

- **Denormalized Bill/Arrears on Customer:** Speeds up list queries without JOIN to Assessment
- **BankReports Table Exists Separately:** Bank data expires (expiresAt); Assessment doesn't. Allows refreshing reports without losing assessment history
- **Three Bank Extract Tables:** (BankIncomeReport, BankExpenseReport, BankRiskInsights) provide structured, queryable access; BankReports keeps raw JSON for audit
- **Optional BankRiskInsights:** Extensibility for future risk scoring

---

### 2.3 Assessment & Hardship Domain (2 Models)

```
ASSESSMENT (core hardship calculation record)
├── id (PK)
├── customerId (FK)
├── bankConnectionId (FK, optional)
├── 
├── === Calculated Metrics ===
├── monthlyIncome (pence, derived from bank data)
├── monthlyExpenses (pence, derived from bank data)
├── monthlyBill (pence, from Customer)
├── arrears (pence, from Customer)
├── disposableIncome (pence, income - expenses)
├── billRatio (percentage, bill / disposable × 100)
├── hardshipLevel (SEVERE | MODERATE | LOW | NONE)
├── sustainabilityScore (HIGH | MEDIUM | LOW)
├── 
├── === JSON Breakdown Fields (Stringified) ===
├── incomeBreakdown: { salary: 1950, benefits: 0, pensions: 0, ... }
├── expenseBreakdown: { housing: 1200, food: 300, ... }
├── expensesByCategory: { Housing: 1200, Utilities: 280, Food: 300, ... }
├── incomeHistory: [{ month: "Mar 2026", amount: 1950 }, ...]
├── incomeSources: [{ type: "Employment", frequency: "MONTHLY", amount: 1950 }, ...]
├── factors: [{ title: "Household size 4", description: "...", impact: "NEGATIVE" }, ...]
├── paymentPlans: [
│   { type: "Conservative", monthlyAmount: 185, duration: 60, sustainability: "HIGH" },
│   { type: "Balanced", monthlyAmount: 220, duration: 40, sustainability: "MEDIUM" },
│   { type: "Aggressive", monthlyAmount: 256, duration: 28, sustainability: "LOW" }
│ ]
├── 
├── === State Fields ===
├── status (PENDING | COMPLETED | FAILED)
├── selectedPlan (Conservative | Balanced | Aggressive, nullable)
├── 
├── === Metadata ===
├── createdAt, updatedAt
├── Indexes: customerId, bankConnectionId
└── Relations:
    ├── Customer (1:N reverse)
    ├── BankConnection (optional 1:N reverse)
    ├── Mandate[] (1:N)
    ├── PaymentSchedule[] (1:N)
    └── AssessmentJob (1:1)

ASSESSMENTJOB (async job tracker)
├── id (PK)
├── assessmentId (FK, unique)
├── status (PENDING | PROCESSING | COMPLETED | FAILED)
├── errorMessage (if FAILED)
├── retryCount (for exponential backoff)
├── processedAt (timestamp when completed)
├── createdAt, updatedAt
├── Indexes: status (polling incomplete jobs)
└── Note: Decouples async processing from Assessment
```

**Design Rationale:**

- **JSON Fields for Breakdowns:** No schema changes when breakdown structure evolves. Validated at application layer. Trade-off: No DB-level type safety.
- **AssessmentJob Table:** Separates async concerns. Job can be retried independently without modifying Assessment. Status polling via index on `status`.
- **Denormalized Income/Expenses:** Speeds up assessment queries without joining BankReports
- **Payment Plans Calculated Upfront:** Not on-demand. Stored as JSON array within Assessment.
- **Multiple Fields Store Calculation Reasoning:** `factors` field explains why hardship level was determined (for transparency to customer)

---

### 2.4 Payment Processing Domain (4 Models)

```
MANDATE (GoCardless Direct Debit authorization)
├── id (PK)
├── customerId (FK)
├── gocardlessId (unique)
├── status (PENDING | ACTIVE | FAILED | CANCELLED)
├── accountHolderName
├── bankAccountNumber (string, last 4 only)
├── sortCode (string, masked "XX-XX-XX")
├── expiresAt (mandate expiry)
├── createdAt, updatedAt
├── Indexes: customerId, gocardlessId
└── Relations:
    ├── Customer (1:N reverse)
    ├── Assessment[] (1:N)
    ├── PaymentMethod[] (1:N)
    └── PaymentSchedule[] (1:N)

PAYMENTSCHEDULE (individual payment plan linked to mandate)
├── id (PK)
├── mandateId (FK)
├── assessmentId (FK)
├── gocardlessId (unique)
├── planType (Conservative | Balanced | Aggressive)
├── monthlyAmount (pence, int)
├── totalAmount (pence, int)
├── dayOfMonth (1-28, or last day)
├── status (ACTIVE | COMPLETED | CANCELLED | FAILED)
├── firstPaymentDate, finalPaymentDate
├── createdAt, updatedAt
├── Indexes: mandateId, assessmentId, gocardlessId
└── Relations:
    ├── Mandate (1:N reverse)
    ├── Assessment (1:N reverse)
    └── Payment[] (1:N)

PAYMENT (individual payment transaction)
├── id (PK)
├── paymentScheduleId (FK)
├── gocardlessId (unique)
├── amount (pence, int)
├── scheduledDate (when payment should occur)
├── actualDate (when payment confirmed)
├── status (PENDING | SUBMITTED | CONFIRMED | FAILED)
├── failureReason (if status=FAILED)
├── createdAt, updatedAt
├── Indexes: paymentScheduleId, gocardlessId, status
└── Relations: PaymentSchedule (1:N reverse)

PAYMENTMETHOD (payment method descriptor)
├── id (PK)
├── customerId (FK)
├── mandateId (FK)
├── type (default: direct_debit, extensible)
├── isDefault (boolean)
├── createdAt, updatedAt
├── Indexes: customerId, mandateId
└── Relations:
    ├── Customer (1:N reverse)
    └── Mandate (1:N reverse)
```

**Design Rationale:**

- **Multiple Mandates Per Customer:** Gas and Electricity may have separate mandates. Allows flexibility.
- **PaymentSchedule Linked to Assessment:** Audit trail — knows which assessment's payment plan was accepted.
- **gocardlessId on PaymentSchedule & Payment:** External system integration IDs for webhook matching.
- **dayOfMonth Field:** Allows customers to choose convenient payment dates (e.g., after salary, before other bills).
- **Status = PENDING | SUBMITTED | CONFIRMED:** Handles GoCardless async confirmation flow (webhook-driven).

---

## 3. VISUAL ENTITY-RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION DOMAIN                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐       ┌─────────────┐       ┌──────────────┐    │
│  │  User    │◄─────┤RefreshToken │       │  SessionLog  │    │
│  │ (OAuth   │   1:N └─────────────┘   1:N └──────────────┘    │
│  │ Cognito) │                                                   │
│  └────┬─────┘                                                   │
│       │                                                          │
│       │ customerId (optional 1:1)                              │
│       │                                                          │
└───────┼──────────────────────────────────────────────────────────┘
        │
        │
┌───────▼──────────────────────────────────────────────────────────┐
│                    CUSTOMER DOMAIN                               │
├───────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐          ┌─────────────────────────────────┐ │
│  │  Customer    │          │   Bank Integration Sub-Domain   │ │
│  │  (Utility    │───1:N───┤  ┌──────────────┐               │ │
│  │   Account)   │         │  │BankConnection│               │ │
│  └──────────────┘         │  │  (OAuth)     │               │ │
│        │                  │  └──────┬───────┘               │ │
│        │                  │         │                       │ │
│        │                  │      1:1├─┐ ┌──────────┐        │ │
│        │                  │         ├─┼─┤BankAccout│        │ │
│        │                  │      1:1├─┐ └──────────┘        │ │
│        │                  │         ├─┼─┤IncomeReport       │ │
│        │                  │      1:1├─┐ └──────────────┐    │ │
│        │                  │         ├─┼─┤ExpenseReport│    │ │
│        │                  │      1:1├─┐ └──────────────┘    │ │
│        │                  │         ├─┼─┤RiskInsights       │ │
│        │                  │      1:1├─┐ └──────────────┐    │ │
│        │                  │         └─┼─┤BankReports   │    │ │
│        │                  │           └──────────────┘    │ │
│        │                  └─────────────────────────────────┘ │
│        │                                                       │
└────────┼───────────────────────────────────────────────────────┘
         │
┌────────▼───────────────────────────────────────────────────────┐
│               ASSESSMENT & HARDSHIP DOMAIN                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  Assessment    │  │BankConnection│  │AssessmentJob    │   │
│  │ (Hardship      │◄─┤ (optional)   │  │ (async tracker) │   │
│  │  Calc + Plans) │  └──────────────┘  └─────────────────┘   │
│  └────────┬───────┘                                            │
│           │                                                     │
│        1:N│                                                     │
│           │                                                     │
└───────────┼─────────────────────────────────────────────────────┘
            │
┌───────────▼──────────────────────────────────────────────────────┐
│              PAYMENT PROCESSING DOMAIN                           │
├───────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐ ┌─────────────┐ │
│  │Mandate   │◄─┤PaymentMethod │  │Payment   │ │PaymentSched │ │
│  │(Direct   │  │ (descriptor) │  │(Trans)   │ │  (Plan)     │ │
│  │ Debit)   │  └──────────────┘  └────┬─────┘ └──────┬──────┘ │
│  └────┬─────┘                         │             │         │
│       │                            1:N│             │1:N      │
│       │◄──────────────────────────────┘             │         │
│  1:N  │                                             │         │
│       └─────────────────────────────────────────────┘         │
│                                                                │
│ (Links back to: Customer 1:N, Assessment 1:N)                │
│                                                                │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. DATA FLOW JOURNEYS

### Journey 1: User Registration → Account Linking

**Goal:** Authenticate user via Cognito OAuth, then link to existing customer record.

```
┌─ Frontend ───────────────────────────────────────────────────────┐
│                                                                  │
│  User clicks "Login with Bank"                                  │
│       │                                                           │
│       ▼                                                           │
│  HTTP GET /api/auth/initiate-login                              │
│       │                                                           │
└───────┼──────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Backend: InitiateLoginUseCase ──────────────────────────────────┐
│                                                                  │
│  CognitoAuthProvider.getAuthorizationUrl()                       │
│       │                                                           │
│       └─→ Return Cognito OAuth URL to frontend                  │
│                                                                  │
└─ User is redirected to Cognito ─────────────────────────────────┘
        │
        ├─ User logs in with credentials
        │
        └─ Cognito redirects: /callback?code=...&state=...
        │
        ▼
┌─ Backend: HandleAuthCallbackUseCase ────────────────────────────┐
│                                                                  │
│  1. CognitoAuthProvider.handleCallback(code, state)             │
│     ├─ Exchange code for ID + Access tokens                    │
│     └─ Extract JWT claims: externalId (sub), email             │
│                                                                  │
│  2. PrismaUserRepository.findOrCreateByExternalId()            │
│     ├─ Check if User exists by externalId (Cognito sub)        │
│     ├─ If YES: return existing user                            │
│     └─ If NO: create new user with email, firstName, lastName  │
│                                                                  │
│  3. TokenService.issueTokens(userId)                            │
│     ├─ Create JWT (signed, short-lived)                        │
│     ├─ Create RefreshToken in DB                               │
│     └─ Return both to frontend                                  │
│                                                                  │
│  4. SessionLog.create(userId, 'LOGIN', ipAddress, userAgent)   │
│                                                                  │
│  Response: { idToken, accessToken, refreshToken }             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ User is authenticated but NOT linked to customer account ───────┐
│                                                                  │
│  Frontend detects: user.customerId is null                     │
│       │                                                           │
│       └─ Redirect to /account-setup/link-account                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Frontend: Account Linking Form ─────────────────────────────────┐
│                                                                  │
│  User enters:                                                    │
│  ├─ Utility Type (Electricity | Gas | Water)                    │
│  ├─ Postcode (e.g., "SW1A 2AA")                                │
│  └─ Account Reference/Number                                    │
│                                                                  │
│  HTTP POST /api/customer/link-account                           │
│  Body: { utilityType, postcode, accountReference }             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Backend: LinkUserToCustomerUseCase ────────────────────────────┐
│                                                                  │
│  1. Validate input                                              │
│     ├─ Check postcode format (TODO: tighten regex)             │
│     └─ Check utilityType is one of: Electricity, Gas, Water    │
│                                                                  │
│  2. PrismaCustomerRepository.findByUtilityAccountNumber()       │
│     ├─ Query: find Customer with matching account number       │
│     ├─ If NOT FOUND → Error: "Account not found"              │
│     └─ If FOUND → proceed to linking                           │
│                                                                  │
│  3. PrismaUserRepository.isUserAlreadyLinked()                 │
│     ├─ Check: user.customerId is not null                      │
│     └─ If YES → Error: "Already linked to another account"     │
│                                                                  │
│  4. PrismaCustomerRepository.linkToUser(customerId, userId)    │
│     └─ Update Customer: customerId = userId                    │
│                                                                  │
│  5. Return: { customerId, firstName, lastName, monthlyBill }  │
│                                                                  │
│  6. SessionLog.create(userId, 'ACCOUNT_LINKED', ...)          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ User is now linked and can access bank connection flow ────────┐
│                                                                  │
│  Frontend detects: user.customerId is set                      │
│       │                                                           │
│       └─ Redirect to /account-setup/bank-connection             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

DB CHANGES SUMMARY:
  ├─ User created (externalId, email, firstName, lastName)
  ├─ RefreshToken created
  ├─ SessionLog entries: LOGIN, ACCOUNT_LINKED
  └─ Customer.customerId updated (linking)
```

---

### Journey 2: Bank Data Extraction & Assessment Calculation

**Goal:** Retrieve 12-month bank transaction history, extract income/expenses, calculate hardship metrics.

```
┌─ Frontend ───────────────────────────────────────────────────────┐
│                                                                  │
│  User sees: "Connect your bank to analyze affordability"       │
│       │                                                           │
│       ▼                                                           │
│  HTTP GET /api/bank-connections/authorize                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Backend: InitiateBankOAuthUseCase ──────────────────────────────┐
│                                                                  │
│  1. Generate random oauthState (PKCE)                           │
│                                                                  │
│  2. BankConnection.create(customerId, oauthState, status=PENDING)
│                                                                  │
│  3. TinkOAuthService.generateAuthUrl(oauthState)               │
│     └─ Returns Tink consent screen URL                          │
│                                                                  │
│  Response: { bankConnectionId, authUrl }                        │
│  Example authUrl: https://tink.com/auth?state=...              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Frontend: Redirect to Tink ────────────────────────────────────┐
│                                                                  │
│  window.location.href = authUrl                                 │
│       │                                                           │
│       └─ User grants consent to access bank data                │
│       │   (Tink securely connects to their bank)               │
│       │                                                           │
│       └─ Tink redirects: /api/bank-connections/callback?code=..
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Backend: HandleBankOAuthCallbackUseCase ───────────────────────┐
│                                                                  │
│  1. TinkOAuthService.exchangeCodeForAccessToken(code, state)   │
│     └─ Get access token from Tink                               │
│                                                                  │
│  2. BankConnection.markDataRetrieved(bankConnectionId)         │
│     └─ status = DATA_RETRIEVED (but not data yet)              │
│                                                                  │
│  3. TinkOAuthService.getIncomeReport(code)                      │
│     └─ Fetch 12-month income history from Tink                  │
│        Raw format: [{ date, amount, description }, ...]        │
│                                                                  │
│  4. TinkOAuthService.getExpenseCheck(code)                      │
│     └─ Fetch 12-month transaction categorization from Tink     │
│        Raw format: { transactions: [{...}] }                    │
│                                                                  │
│  5. BankReports.upsert(bankConnectionId, {                      │
│       incomeJson: stringified raw income report                 │
│       expensesJson: stringified raw expenses report             │
│     })                                                           │
│     └─ Stores raw API responses for later async processing      │
│                                                                  │
│  6. Assessment.create(customerId, bankConnectionId, status=PENDING)
│     └─ Create placeholder assessment (not yet calculated)       │
│                                                                  │
│  7. AssessmentJob.create(assessmentId, status=PENDING)         │
│     └─ Queue async job to process bank data                     │
│                                                                  │
│  8. JobDispatcher.dispatch(assessmentJobId)                     │
│     └─ Enqueue background job (e.g., Redis queue)              │
│                                                                  │
│  Response: { bankConnectionId, assessmentId }                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Background Job (Async) ─────────────────────────────────────────┐
│                                                                  │
│  ProcessAssessmentJobService.execute(assessmentJobId)           │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  1. Fetch Assessment + AssessmentJob                            │
│                                                                  │
│  2. Fetch BankReports (raw API responses)                       │
│                                                                  │
│  3. BankDataExtractionService.extractIncome(incomeJson)        │
│     ├─ Parse raw income → monthly breakdown                    │
│     ├─ Group by source (salary, benefits, pensions, other)     │
│     └─ Return:                                                   │
│        {                                                         │
│          monthlyIncome: 1950,    // pence                       │
│          incomeBreakdown: {                                      │
│            salary: 1950,                                         │
│            benefits: 0,                                          │
│            pensions: 0,                                          │
│            other: 0                                              │
│          },                                                       │
│          incomeHistory: [                                        │
│            { month: "Mar 2026", amount: 1950 },                │
│            ...                                                   │
│          ],                                                       │
│          incomeSources: [                                        │
│            { type: "Employment", amount: 1950, frequency: ... } │
│          ]                                                        │
│        }                                                          │
│                                                                  │
│  4. BankDataExtractionService.extractExpenses(expensesJson)    │
│     ├─ Parse raw transactions → categorized expenses            │
│     ├─ Categories: Housing, Food, Utilities, Transport, Other  │
│     └─ Return:                                                   │
│        {                                                         │
│          monthlyExpenses: 1880,                                  │
│          expenseBreakdown: {                                      │
│            housing: 1200,                                        │
│            food: 300,                                            │
│            utilities: 280,                                       │
│            transport: 100,                                       │
│            other: 0                                              │
│          },                                                       │
│          expensesByCategory: {                                   │
│            Housing: 1200,                                        │
│            Food: 300,                                            │
│            Utilities: 280,                                       │
│            Transport: 100,                                       │
│            Other: 0                                              │
│          }                                                        │
│        }                                                          │
│                                                                  │
│  5. Calculate hardship metrics                                  │
│     ├─ disposableIncome = income - expenses = 1950 - 1880 = 70 │
│     ├─ billRatio = (bill / disposableIncome) × 100            │
│     │   For bill £300/month (30000 pence):                     │
│     │   ratio = (30000 / 70) × 100 = 42857% → SEVERE         │
│     │                                                            │
│     └─ HardshipCalculationService.classify(ratio, disposable)  │
│        ├─ SEVERE if ratio > 25% (bill > 25% of disposable)    │
│        ├─ MODERATE if 10-25%                                    │
│        ├─ LOW if < 10%                                          │
│        └─ NONE if negative/zero                                 │
│                                                                  │
│  6. Calculate 3 payment plans                                   │
│     PaymentPlanCalculationService.calculatePlans(disposableIncome)
│     ├─ Conservative: disposable × 14% = 70 × 0.14 = £0.98/mo  │
│     ├─ Balanced: disposable × 18% = 70 × 0.18 = £1.26/mo      │
│     └─ Aggressive: disposable × 20% = 70 × 0.20 = £1.40/mo    │
│                                                                  │
│  7. Build JSON breakdown fields                                 │
│     Assessment.update({                                         │
│       monthlyIncome: 1950,                                       │
│       monthlyExpenses: 1880,                                     │
│       disposableIncome: 70,                                      │
│       billRatio: 42857,                                          │
│       hardshipLevel: "SEVERE",                                   │
│       sustainabilityScore: "LOW",                                │
│       status: "COMPLETED",                                       │
│       incomeBreakdown: stringified JSON,                         │
│       expenseBreakdown: stringified JSON,                        │
│       expensesByCategory: stringified JSON,                      │
│       incomeHistory: stringified JSON,                           │
│       incomeSources: stringified JSON,                           │
│       factors: [                                                 │
│         {                                                        │
│           title: "High bill relative to income",                │
│           description: "Your gas bill is 42% of your..."        │
│           impact: "SEVERE_HARDSHIP"                             │
│         },                                                       │
│         ...                                                      │
│       ],                                                         │
│       paymentPlans: [                                            │
│         {                                                        │
│           type: "Conservative",                                  │
│           monthlyAmount: 98,                                     │
│           duration: 306,                                         │
│           sustainability: "HIGH",                                │
│           summary: "Smallest payment, longest plan"             │
│         },                                                       │
│         ...                                                      │
│       ]                                                          │
│     })                                                            │
│                                                                  │
│  8. AssessmentJob.update(status: "COMPLETED", processedAt: now) │
│                                                                  │
│  9. On ERROR:                                                   │
│     └─ AssessmentJob.update(status: "FAILED", errorMessage, ++) │
│        → May be retried automatically                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Assessment Ready for Customer Review ──────────────────────────┐
│                                                                  │
│  Frontend polls: GET /api/assessments/{assessmentId}           │
│       │                                                           │
│       ├─ If status = PENDING → show loading spinner            │
│       ├─ If status = COMPLETED → display breakdown + plans     │
│       └─ If status = FAILED → show error message               │
│                                                                  │
│  User can now see:                                              │
│  ├─ Assessment Breakdown (4 tabs)                              │
│  │  ├─ Overview (disposable income, bill ratio)                │
│  │  ├─ Expenses (pie chart, categories)                        │
│  │  ├─ Income (stability, sources, history)                    │
│  │  └─ Factors (why hardship level determined)                 │
│  └─ 3 Payment Plan Options                                     │
│     ├─ Conservative (longest, safest)                          │
│     ├─ Balanced (middle ground)                                │
│     └─ Aggressive (fastest repayment)                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

DB CHANGES SUMMARY:
  ├─ BankConnection created (status: PENDING → DATA_RETRIEVED)
  ├─ BankReports created (raw income/expense JSON)
  ├─ Assessment created (status: PENDING → COMPLETED)
  │  └─ Populated with: income, expenses, breakdowns, factors, plans
  ├─ AssessmentJob created (status: PENDING → COMPLETED)
  └─ SessionLog entries may be created for tracking
```

---

### Journey 3: Reference Data (Composite Read)

**Goal:** Load current state for UI — account status, bank connection, assessment, and payment options.

```
┌─ Frontend ───────────────────────────────────────────────────────┐
│                                                                  │
│  When loading dashboard/account page:                           │
│  HTTP GET /api/me/assessment (with JWT in Authorization header)│
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Backend: GetReferenceDataUseCase ──────────────────────────────┐
│                                                                  │
│  1. Extract userId from JWT (middleware)                        │
│                                                                  │
│  2. PrismaUserRepository.findByIdWithCustomer(userId)          │
│     └─ user.customerId → if null, redirect to account setup   │
│                                                                  │
│  3. GetAccountSetupQuery.execute(userId)                        │
│     ├─ Check if user linked to customer                         │
│     └─ Return: { isLinked, customer: { firstName, lastName } }  │
│                                                                  │
│  4. GetBankConnectionQuery.execute(customerId)                  │
│     ├─ Find latest BankConnection (ordered by createdAt DESC)   │
│     ├─ Check if status = DISCONNECTED → skip                    │
│     ├─ Parse related data:                                      │
│     │  ├─ BankIncomeReport.monthlyIncome                        │
│     │  ├─ BankExpenseReport.monthlyExpenses                     │
│     │  └─ BankRiskInsights.accountBalance (if exists)          │
│     └─ Return:                                                   │
│        {                                                         │
│          id, status, connectedAt, dataRetrievedAt,             │
│          monthlyIncome, monthlyExpenses                         │
│        }                                                         │
│                                                                  │
│  5. GetAssessmentQuery.execute(customerId)                      │
│     ├─ Find latest Assessment (ordered by createdAt DESC)       │
│     ├─ If status = PENDING → return { status: 'pending' }     │
│     ├─ If status = COMPLETED → parse JSON fields:             │
│     │  ├─ Parse expensesByCategory: Record<string, number>     │
│     │  ├─ Parse incomeHistory: Array<{ month, amount }>        │
│     │  ├─ Parse incomeSources: Array<{ type, amount, freq }>  │
│     │  ├─ Parse factors: Array<{ title, description, impact }> │
│     │  └─ Parse paymentPlans: Array<{ type, amount, duration }>│
│     └─ Return: AssessmentDetailedDTO (fully typed)            │
│                                                                  │
│  6. Determine nextStep based on progress                        │
│     ├─ If not linked → "complete-account-setup"                │
│     ├─ If no bank connection → "connect-bank"                  │
│     ├─ If assessment pending → "loading-assessment"            │
│     ├─ If assessment completed → "review-options"              │
│     └─ If plan selected → "payment-confirmation"               │
│                                                                  │
│  Response: ReferenceData (composite DTO)                        │
│  {                                                              │
│    nextStep: "review-options",                                  │
│    accountSetup: { isLinked, customer },                        │
│    bankConnection: { id, status, monthlyIncome, ... },          │
│    assessment: {                                                │
│      id, status, hardshipLevel, monthlyIncome,                 │
│      expensesByCategory, incomeHistory, incomeSources,         │
│      factors, paymentPlans                                     │
│    }                                                            │
│  }                                                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Frontend: Renders Based on nextStep ───────────────────────────┐
│                                                                  │
│  switch (nextStep) {                                            │
│    case "complete-account-setup":                               │
│      render Account Linking Form                                │
│    case "connect-bank":                                          │
│      render Bank Connection Button                              │
│    case "loading-assessment":                                    │
│      render Loading spinner + polling endpoint                  │
│    case "review-options":                                        │
│      render Assessment Breakdown + Payment Plan Options         │
│    case "payment-confirmation":                                  │
│      render Mandate setup + schedule confirmation               │
│  }                                                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

DB QUERIES (read-only):
  ├─ User → lookup by JWT userId
  ├─ Customer → lookup by userId.customerId
  ├─ BankConnection → latest by customerId, status != DISCONNECTED
  ├─ BankIncomeReport → lookup by bankConnectionId
  ├─ BankExpenseReport → lookup by bankConnectionId
  ├─ Assessment → latest by customerId
  └─ No writes in this journey
```

---

### Journey 4: Payment Plan Selection

**Goal:** Customer chooses a payment plan option.

```
┌─ Frontend ───────────────────────────────────────────────────────┐
│                                                                  │
│  User sees 3 payment plan options (from Reference Data):        │
│  ├─ Conservative: £0.98/month for 306 months (25 years)       │
│  ├─ Balanced: £1.26/month for 40 months (3 years)              │
│  └─ Aggressive: £1.40/month for 28 months (2 years)            │
│                                                                  │
│  User clicks "Select Balanced Plan"                            │
│       │                                                           │
│       ▼                                                           │
│  HTTP POST /api/payments/select-plan                            │
│  Body: { planType: "Balanced" }                                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Backend: SelectPlanUseCase ────────────────────────────────────┐
│                                                                  │
│  1. Extract userId from JWT                                     │
│                                                                  │
│  2. PrismaUserRepository.findByIdWithCustomer(userId)          │
│     └─ Get customerId                                           │
│                                                                  │
│  3. PrismaAssessmentRepository.findLatestByCustomerId(customerId)
│     └─ Get latest assessment                                    │
│                                                                  │
│  4. Validate planType exists in assessment.paymentPlans        │
│     ├─ Parse paymentPlans JSON                                  │
│     ├─ Check if "Balanced" exists                               │
│     └─ If not → Error: "Invalid plan type"                      │
│                                                                  │
│  5. Assessment.updateSelectedPlan("Balanced")                   │
│     └─ Set assessment.selectedPlan = "Balanced"                │
│                                                                  │
│  Response: { assessmentId, selectedPlan, monthlyAmount }       │
│                                                                  │
│  Example:                                                        │
│  {                                                              │
│    assessmentId: "abc-123",                                     │
│    selectedPlan: "Balanced",                                    │
│    monthlyAmount: 126    // pence                               │
│  }                                                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Frontend: Next Steps ──────────────────────────────────────────┐
│                                                                  │
│  After selection:                                                │
│  ├─ Show confirmation: "You've selected the Balanced plan"    │
│  ├─ Summary: Monthly payment of £1.26 for 40 months            │
│  └─ Next button: "Proceed to Payment Setup" (NOT YET BUILT)    │
│                                                                  │
│  TODO: Implement Mandate creation + Direct Debit setup         │
│        (Phase 2 — Payment Execution Epic)                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

DB CHANGES:
  └─ Assessment.selectedPlan updated (Balanced)
```

---

## 5. DESIGN PATTERNS & ARCHITECTURAL DECISIONS

### 5.1 JSON Fields for Flexibility

**Where:** Assessment model (incomeBreakdown, expensesByCategory, incomeHistory, incomeSources, factors, paymentPlans)

**Why:**
- Breakdown structure evolves as product requirements change
- Don't want migration for every UI tweak
- Assessment calculation is complex; JSON allows storing rich nested structures

**Trade-offs:**
| Benefit | Cost |
|---------|------|
| No schema migrations | No DB-level type safety |
| Flexible structure | Must validate in app code |
| Faster to deploy | Query/filter harder (no JSON indexes yet) |
| Store rich data (arrays, nesting) | Performance slower if querying JSON fields |

**Validation:** All JSON is validated at service layer (TypeScript types ensure shape at parse time).

---

### 5.2 AssessmentJob Table for Async Processing

**Where:** Separate table with status polling

**Why:**
- Assessment calculation is expensive (bank data parsing, math, breakdowns)
- Can't do synchronously in HTTP request (timeout risk)
- Needs retries on failure (transient errors from Tink, etc.)
- Needs status tracking (UI polls for completion)

**Pattern:**
1. **Create phase** (HTTP request): Create Assessment (PENDING) + AssessmentJob (PENDING)
2. **Queue phase**: JobDispatcher enqueues job (e.g., to Redis queue)
3. **Process phase** (background): ProcessAssessmentJobService executes
4. **Poll phase** (frontend): GET /api/assessments/{id} until status = COMPLETED

**Design Decision:**
- One job per assessment (1:1 relationship, unique assessmentId)
- Status polling uses index on `status` to find incomplete jobs efficiently
- Retries tracked via `retryCount` (exponential backoff in JobDispatcher)

---

### 5.3 BankReports Table Decouples Data Refresh from Assessment

**Where:** Separate table from Assessment

**Why:**
- Bank data has expiry (Tink reports valid for X days)
- Assessment is customer-facing truth (shouldn't change if bank data refreshes)
- May want to re-fetch bank data without recalculating assessment
- Audit trail (know what raw data was used for each assessment)

**Pattern:**
```
BankConnection → BankReports (raw, expires)
              ↓
         ProcessAssessmentJobService
              ↓
         Assessment (calculated, doesn't expire)
```

**Design Decision:**
- BankReports.expiresAt tracks when data becomes stale
- Assessment links to BankConnection (for audit), but reads truth from BankReports during processing
- Allows future feature: "Refresh bank data" without losing assessment history

---

### 5.4 Result<T, Error> Pattern for Error Handling

**Where:** All repository and service methods

**Why:**
- Avoid exceptions (explicit control flow)
- Functional composition (chain operations)
- Type-safe error handling at compile time
- Easy to propagate errors up call stack

**Example:**
```ts
// ❌ Old way (exceptions)
try {
  const customer = await customerRepo.findById(id);  // throws
  const assessment = await assessmentRepo.findLatest(customer.id);  // throws
  // ...
} catch (err) {
  // what type of error?
}

// ✅ New way (Result type)
const customerResult = await customerRepo.findById(id);
const assessmentResult = customerResult.flatMap(customer =>
  assessmentRepo.findLatest(customer.id)
);

customerResult.match(
  customer => res.json({ success: true, data: customer }),
  error => res.status(400).json({ success: false, error: error.message })
);
```

**Located:** `/backend/src/features/shared/result/Result.ts`

---

### 5.5 Vertical Slice Architecture

**Where:** All features organized by domain, not by layer

**Why:**
- **Feature isolation** — each feature is self-contained
- **Easy to delete** — remove feature folder, remove router import → gone
- **Parallel development** — teams work independently
- **Clear ownership** — feature owns its models, repos, services, controllers

**Structure:**
```
features/
├── auth/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── types/
│   └── router.ts
├── customer/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── types/
│   └── router.ts
├── bankConnection/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── types/
│   └── router.ts
├── assessment/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── types/
│   └── router.ts
├── payment/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── types/
│   └── router.ts
└── shared/
    ├── middleware/
    ├── config/
    ├── logging/
    ├── errors/
    ├── result/
    ├── validators/
    ├── utils/
    └── types/
```

---

### 5.6 Dependency Injection via Router

**Where:** Each feature's `router.ts` file

**Why:**
- All dependencies wired at one place (easy to see what's connected)
- Testable (mock dependencies in tests)
- Flexible (swap implementations for testing)

**Pattern:**
```ts
// features/assessment/router.ts
export function createAssessmentRouter(
  prisma: PrismaClient,
  logger: ILogger,
  authMiddleware: AuthMiddleware
): Router {
  const router = Router();
  
  // Create repositories
  const assessmentRepo = new PrismaAssessmentRepository(prisma);
  const customerRepo = new PrismaCustomerRepository(prisma);
  
  // Create services
  const bankDataExtractionService = new BankDataExtractionService();
  const hardshipCalcService = new HardshipCalculationService();
  const paymentPlanCalcService = new PaymentPlanCalculationService();
  
  // Create use cases
  const processJobUseCase = new ProcessAssessmentJobService(
    assessmentRepo,
    bankDataExtractionService,
    hardshipCalcService,
    paymentPlanCalcService,
    logger
  );
  
  // Create controller
  const controller = new AssessmentController(processJobUseCase, assessmentRepo, logger);
  
  // Register routes
  router.get('/assessments/:assessmentId', authMiddleware, controller.getAssessment.bind(controller));
  
  return router;
}
```

---

## 6. CRITICAL DATA PATHS

### 6.1 Assessment Data Read Path

**UI needs:** Display assessment breakdown + payment plans

```
GET /api/me/assessment (authenticated)
    ↓
GetReferenceDataUseCase
    ├─ GetAssessmentQuery.execute(customerId)
    │   └─ PrismaAssessmentRepository.findLatestByCustomerId()
    │       └─ Fetch Assessment record
    ├─ Parse JSON fields:
    │   ├─ incomeBreakdown (salary, benefits, etc.)
    │   ├─ expenseBreakdown (housing, food, utilities, etc.)
    │   ├─ expensesByCategory (flattened for charts)
    │   ├─ incomeHistory (array of monthly amounts)
    │   ├─ incomeSources (array of source types + amounts)
    │   ├─ factors (array of why hardship level determined)
    │   └─ paymentPlans (array of 3 plan options)
    └─ Return AssessmentDetailedDTO (fully typed)

Frontend receives:
{
  assessment: {
    id: "...",
    status: "COMPLETED",
    hardshipLevel: "SEVERE",
    monthlyIncome: 195000 pence,
    monthlyExpenses: 188000 pence,
    disposableIncome: 7000 pence,
    billRatio: 428.57,
    sustainabilityScore: "LOW",
    expensesByCategory: {
      Housing: 120000,
      Food: 30000,
      Utilities: 28000,
      Transport: 10000,
      Other: 0
    },
    incomeHistory: [
      { month: "Mar 2026", amount: 195000 },
      { month: "Feb 2026", amount: 195000 },
      ...
    ],
    incomeSources: [
      { type: "Employment", amount: 195000, frequency: "MONTHLY" }
    ],
    factors: [
      { title: "...", description: "...", impact: "SEVERE_HARDSHIP" }
    ],
    paymentPlans: [
      { type: "Conservative", monthlyAmount: 98, duration: 306, ... },
      { type: "Balanced", monthlyAmount: 126, duration: 40, ... },
      { type: "Aggressive", monthlyAmount: 140, duration: 28, ... }
    ]
  }
}
```

---

### 6.2 Bank Data Write Path

**Flow:** Bank OAuth → Raw data storage → Background processing → Assessment calculation

```
HTTP GET /api/bank-connections/callback?code=...&state=...
    ↓
HandleBankOAuthCallbackUseCase
    ├─ TinkOAuthService.exchangeCodeForAccessToken()
    ├─ TinkOAuthService.getIncomeReport() → raw JSON array
    ├─ TinkOAuthService.getExpenseCheck() → raw JSON object
    └─ BankReports.upsert(bankConnectionId, {
         incomeJson: JSON.stringify(rawIncome),
         expensesJson: JSON.stringify(rawExpenses),
         expiresAt: now + 30 days
       })
    
    ├─ Assessment.create(customerId, bankConnectionId, status=PENDING)
    ├─ AssessmentJob.create(assessmentId, status=PENDING)
    └─ JobDispatcher.dispatch(assessmentJobId) → enqueue to background

Background Job:
ProcessAssessmentJobService.execute(jobId)
    ├─ AssessmentJob.update(status=PROCESSING)
    ├─ BankReports.findByBankConnectionId()
    ├─ BankDataExtractionService.extractIncome(incomeJson)
    │   └─ Returns parsed income structure
    ├─ BankDataExtractionService.extractExpenses(expensesJson)
    │   └─ Returns parsed expense breakdown
    ├─ HardshipCalculationService.calculate(income, expenses, bill, arrears)
    │   └─ Returns hardship level + sustainability score
    ├─ PaymentPlanCalculationService.calculatePlans(disposableIncome)
    │   └─ Returns 3 plan options
    └─ Assessment.update({
         status: COMPLETED,
         monthlyIncome, monthlyExpenses, disposableIncome,
         hardshipLevel, sustainabilityScore,
         incomeBreakdown: JSON.stringify(...),
         expensesByCategory: JSON.stringify(...),
         incomeHistory: JSON.stringify(...),
         incomeSources: JSON.stringify(...),
         factors: JSON.stringify(...),
         paymentPlans: JSON.stringify(...)
       })
    └─ AssessmentJob.update(status=COMPLETED)

On Error:
    └─ AssessmentJob.update(status=FAILED, errorMessage, retryCount++)
       → Job may be retried (with exponential backoff)
```

---

### 6.3 Cascade Delete Implications

**Deleting a Customer cascades to:**

```
DELETE Customer
    └─ CASCADE → BankConnection (all connections for this customer)
        ├─ SET NULL → Assessment (bankConnectionId becomes null, but record remains)
        ├─ CASCADE → BankAccount (all accounts for this connection)
        ├─ CASCADE → BankIncomeReport, BankExpenseReport, BankRiskInsights
        └─ CASCADE → BankReports
    
    └─ CASCADE → Mandate (all mandates for this customer)
        ├─ CASCADE → PaymentMethod (payment methods using mandates)
        └─ CASCADE → PaymentSchedule (all schedules for mandates)
            └─ CASCADE → Payment (all payments in schedules)
    
    └─ CASCADE → Assessment (assessments directly linked)
        ├─ CASCADE → AssessmentJob (job tracker)
        └─ CASCADE → PaymentSchedule (if any exist)
    
    └─ CASCADE → PaymentMethod (payment methods)
```

**Design Decision:** Hard cascades ensure data consistency (no orphaned records). Alternative: soft deletes (add `deletedAt` field) for audit trails — future enhancement.

---

## 7. SCHEMA EVOLUTION: MIGRATION TIMELINE

### Chronological Migrations

| # | Date | File | Changes | Rationale |
|---|------|------|---------|-----------|
| 1 | 2026-04-19 | `add_bank_connection_tables` | Added BankConnection, BankAccount, BankIncomeReport, BankExpenseReport, BankRiskInsights | MVP: Bank OAuth integration |
| 2 | 2026-04-19 | `remove_report_job_id` | Removed orphaned reportJobId FK from BankConnection | Cleanup: simplified relationship model |
| 3 | 2026-04-21 | `add_customer_bill_and_arrears` | Added monthlyBill, arrears to Customer (denormalized) | Optimization: faster customer queries without Assessment JOIN |
| 4 | 2026-04-21 | `create_bank_reports_table` | Added BankReports (consolidated raw API responses) | Decoupling: separate data refresh cycle from assessment |
| 5 | 2026-04-21 | `create_assessment_and_job_tables` | Added Assessment, AssessmentJob | Core MVP: hardship calculation + async processing |
| 6 | 2026-04-21 | `add_income_expense_breakdowns` | Added incomeBreakdown, expenseBreakdown, expensesByCategory, incomeHistory, incomeSources, factors, paymentPlans (JSON) | UI: detailed breakdown + payment plan display |

### Design Pattern Evolution

**Phase 1 (Apr 19):** Bank integration focus  
- Goal: Connect to Tink OAuth, retrieve account data
- Models: BankConnection (orchestrator) + account/report tables

**Phase 2 (Apr 21):** Assessment & job processing  
- Goal: Calculate hardship metrics asynchronously
- Models: Assessment (calculation truth), AssessmentJob (async tracker)
- Addition: Denormalized fields on Customer (bill, arrears) for query optimization

**Phase 3 (Apr 21):** UI breakdown support  
- Goal: Display rich breakdown + payment plans
- Models: Added 7 JSON columns to Assessment
- Rationale: Flexibility (no schema changes when UI needs new breakdown fields)

---

## 8. KNOWN ISSUES & TECHNICAL DEBT

| Issue | Location | Severity | Impact | Fix |
|-------|----------|----------|--------|-----|
| Duplicate repository methods | `PrismaCustomerRepository` | Low | Code maintainability | Refactor `isUserAlreadyLinked` to wrap `findCustomerIdByUserId` |
| Postcode regex too permissive | `LinkUserToCustomerUseCase` | Medium | Accepts invalid UK postcodes | Tighten regex to: `/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i` |
| Utility type not cross-validated | `LinkUserToCustomerUseCase` | Medium | User can link to wrong account type | Add check: validate claimed utilityType matches found customer.utilityType |
| Redundant variable alias | `LinkUserToCustomerUseCase` | Low | Unnecessary code | Remove: `const customer = existingCustomer` |
| Bank account masking missing | `GetBankConnectionQuery` | Low | Security: full account number may leak in logs | Implement: mask account number to last 4 digits in response |
| Outer try/catch redundant | `CustomerController.linkUserToCustomer` | Low | Code clarity | Remove: rely on `result.match` for error routing |

---

## 9. INDEX STRATEGY

### Why Indexes Matter

Indexes speed up queries on high-volume tables or frequent filters. SAFE's critical paths:

```
User Login
    └─ Query User by externalId (Cognito subject)
       → INDEX on User.externalId (✓ exists)

Account Linking
    └─ Query Customer by utilityAccountNo
       → INDEX on Customer.utilityAccountNo (should exist)
    └─ Query User by role to check permissions
       → INDEX on User.role (✓ exists)

Bank OAuth
    └─ Query BankConnection by oauthState (state param validation)
       → INDEX on BankConnection.oauthState (✓ exists)

Assessment Processing
    └─ Query AssessmentJob by status (polling incomplete jobs)
       → INDEX on AssessmentJob.status (✓ exists)
    └─ Query Assessment by customerId (latest assessment)
       → INDEX on Assessment.customerId (✓ exists)

Payment Scheduling
    └─ Query PaymentSchedule by mandateId (find schedules for mandate)
       → INDEX on PaymentSchedule.mandateId (✓ exists)
    └─ Query Payment by paymentScheduleId + status (track payment status)
       → INDEX on Payment.paymentScheduleId (✓ exists)
       → INDEX on Payment.status (✓ exists)
```

### Complete Index List (40+ indexes)

**Explicit Primary Keys (all tables):** id (PK)

**Explicit Foreign Keys:** customerId, userId, bankConnectionId, etc. (Prisma auto-indexes)

**Business Logic Indexes:**
- `User`: externalId (OAuth lookup), role (permission filtering)
- `RefreshToken`: userId, tokenHash (session validation)
- `SessionLog`: userId, action (audit queries)
- `BankConnection`: customerId, oauthState
- `BankAccount`: bankConnectionId
- `Assessment`: customerId, bankConnectionId
- `AssessmentJob`: status (job polling)
- `Mandate`: customerId, gocardlessId
- `PaymentSchedule`: mandateId, assessmentId, gocardlessId
- `Payment`: paymentScheduleId, gocardlessId, status
- `PaymentMethod`: customerId, mandateId

---

## 10. INTEGRATION POINTS

### External Integrations

| System | Purpose | Data Flow | Status |
|--------|---------|-----------|--------|
| **Cognito** | OAuth authentication | User → Cognito → Backend (via OIDC) | ✓ Implemented |
| **Tink** | Bank data extraction | Customer bank → Tink → Backend (via OAuth) | ✓ Implemented |
| **GoCardless** | Direct Debit setup | Backend → GoCardless (via API) | Schema ready, use case pending |

### Inter-Feature Data Flow

```
auth feature
    ↓ (User data)
customer feature
    ├─ (via User.customerId) → Customer
    ├─ → bankConnection feature
    │   └─ (BankConnection.customerId) → bank data extraction
    │       └─ (BankReports) → assessment feature
    │           └─ (Assessment + BankData) → payment feature
    └─ → payment feature
        └─ (PaymentSchedule.customerId) → payment processing
```

---

## 11. REFERENCE GUIDE: ADDING A NEW FEATURE

### Step 1: Define Domain Models
Create `features/{feature}/types/{feature}.types.ts`
```ts
export interface MyEntity {
  id: string;
  customerId: string;
  myField: string;
  createdAt: Date;
}

export interface MyEntityDTO {
  id: string;
  myField: string;
}
```

### Step 2: Update Prisma Schema
Edit `prisma/schema.prisma`
```prisma
model MyEntity {
  id        String   @id @default(cuid())
  customerId String
  customer  Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  myField   String
  createdAt DateTime @default(now())
  
  @@index([customerId])
}
```

### Step 3: Create Repository
Create `features/{feature}/repositories/IMyRepository.ts` (interface)
```ts
export interface IMyRepository {
  save(entity: MyEntity): Promise<Result<MyEntity, Error>>;
  findById(id: string): Promise<Result<MyEntity, Error>>;
  findByCustomerId(customerId: string): Promise<Result<MyEntity[], Error>>;
}
```

Create `features/{feature}/repositories/PrismaMyRepository.ts` (implementation)
```ts
export class PrismaMyRepository implements IMyRepository {
  constructor(private prisma: PrismaClient) {}

  async save(entity: MyEntity): Promise<Result<MyEntity, Error>> {
    try {
      const saved = await this.prisma.myEntity.create({ data: entity });
      return Ok(saved);
    } catch (error) {
      return Err(new Error(`Failed to save: ${error.message}`));
    }
  }
  // ...
}
```

### Step 4: Create Use Cases
Create `features/{feature}/services/MyUseCase.ts`
```ts
export class MyUseCase {
  constructor(private myRepo: IMyRepository) {}

  async execute(input: Input): Promise<Result<Output, Error>> {
    const entity = new MyEntity(input);
    return this.myRepo.save(entity);
  }
}
```

### Step 5: Create Controller
Create `features/{feature}/controllers/MyController.ts`
```ts
export class MyController {
  constructor(private myUseCase: MyUseCase) {}

  async create(req: AuthenticatedRequest, res: Response) {
    const result = await this.myUseCase.execute(req.body);
    result.match(
      data => res.json({ success: true, data }),
      error => res.status(400).json({ success: false, error: error.message })
    );
  }
}
```

### Step 6: Wire in Router
Update `features/{feature}/router.ts`
```ts
export function createMyRouter(prisma: PrismaClient, ...): Router {
  const router = Router();
  
  const myRepo = new PrismaMyRepository(prisma);
  const myUseCase = new MyUseCase(myRepo);
  const controller = new MyController(myUseCase);
  
  router.post('/my-entities', authMiddleware, asyncHandler(
    controller.create.bind(controller)
  ));
  
  return router;
}
```

### Step 7: Mount in App
Update `src/app.ts`
```ts
app.use('/api/my-feature', createMyRouter(prisma, ...));
```

---

## 12. SUMMARY: WHY THIS DATABASE EXISTS

| Component | Why It Exists |
|-----------|---------------|
| **User + RefreshToken + SessionLog** | Authentication & session management (Cognito integration) |
| **Customer + Mandate + PaymentMethod** | Customer profiles + payment authorization |
| **BankConnection** | Track bank OAuth state + data retrieval metadata |
| **BankReports** | Store raw API responses separately from assessment (data refresh decoupling) |
| **Assessment** | Central hardship calculation record + payment plans |
| **AssessmentJob** | Async processing tracker (status polling, retries, errors) |
| **PaymentSchedule + Payment** | Payment plan execution (GoCardless integration, payment tracking) |
| **Result Type** | Explicit, composable error handling (functional programming) |
| **Vertical Slices** | Feature isolation, clear ownership, easy to delete/modify |

---

## Conclusion

The SAFE database is **carefully designed around 3 core user journeys:**

1. **Identity**: Cognito OAuth → User registration → Customer account linking
2. **Affordability**: Bank data extraction (Tink) → Hardship calculation (async job) → Assessment breakdown
3. **Payment**: Payment plan selection → Mandate setup → Payment scheduling

**Key design principles:**
- **JSON fields for flexibility** (no migration overhead)
- **Async processing with job tracker** (scalability)
- **Data decoupling** (bank reports ≠ assessment)
- **Result type for error handling** (functional composition)
- **Vertical slice ownership** (feature isolation)

This foundation supports Phase 2 (payment execution) without major rework. New features can be added to `features/` folder without touching core models.

---

**Questions?** Trace a data journey, check the migration timeline, or reference the "Adding a New Feature" section.

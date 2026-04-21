# Phase 2: Assessment Calculation Backend - Task Breakdown

## Phase 2a: Database Schema Updates

### Task 1: Add Mock Customer Data Fields
**File:** `backend/prisma/schema.prisma`
**Changes:**
- Add `monthlyBill` (Float?) to Customer model
- Add `arrears` (Float?) to Customer model

**Acceptance Criteria:**
- Schema validates without errors
- Prisma migration created successfully

---

### Task 2: Create BankReports Table
**File:** `backend/prisma/schema.prisma`
**New Table:** `BankReports`
**Fields:**
- id, bankConnectionId (unique FK)
- expensesJson, incomeJson (raw Tink responses)
- totalMonthlyExpenses, totalMonthlyIncome
- createdAt, expiresAt

**Acceptance Criteria:**
- Migration runs successfully
- Relation to BankConnection established

---

### Task 3: Create Assessment Table
**File:** `backend/prisma/schema.prisma`
**New Table:** `Assessment`
**Fields:**
- id, customerId, bankConnectionId
- monthlyIncome, monthlyExpenses, monthlyBill, arrears
- disposableIncome, billRatio, hardshipLevel, sustainabilityScore
- status (PENDING/COMPLETED), timestamps

**Acceptance Criteria:**
- One-to-one relation to AssessmentJobs
- Indexes on customerId, bankConnectionId

---

### Task 4: Create AssessmentJobs Table
**File:** `backend/prisma/schema.prisma`
**New Table:** `AssessmentJobs`
**Fields:**
- id, assessmentId (unique FK)
- status (PENDING/SUCCESS/FAILED)
- errorMessage, retryCount
- createdAt, processedAt

**Acceptance Criteria:**
- Index on status field for querying
- Cascade delete with Assessment

---

## Phase 2b: Backend Implementation

### Task 5: Create BankDataExtractionService
**File:** `backend/src/infrastructure/services/BankDataExtractionService.ts`
**Methods:**
- `extractExpenses(tinkJson: string)` → { total, breakdown }
- `extractIncome(tinkJson: string)` → { total, sources }

**Acceptance Criteria:**
- Parses Tink JSON response correctly
- Handles missing/malformed data gracefully
- Unit tests cover normal + edge cases

---

### Task 6: Create Assessment Domain Entity
**File:** `backend/src/domain/entities/Assessment.entity.ts`
**Methods:**
- `static create(props)` - factory with validation
- `calculateDisposableIncome()` - returns number
- `calculateBillRatio()` - returns percentage
- `getHardshipLevel()` - returns SEVERE/MODERATE/LOW/NONE
- `getSustainabilityScore()` - returns HIGH/MEDIUM/LOW

**Acceptance Criteria:**
- All hardship calculations follow HARDSHIP_CALCULATION_RULES.md
- Unit tests verify calculation formulas
- Immutable properties (private fields, getters)

---

### Task 7: Create IAssessmentRepository Interface
**File:** `backend/src/domain/repositories/IAssessmentRepository.ts`
**Methods:**
- `save(assessment: Assessment): Promise<Result<Assessment, Error>>`
- `findById(id: string): Promise<Result<Assessment|null, Error>>`
- `findByCustomerId(id: string): Promise<Result<Assessment[], Error>>`
- `update(assessment: Assessment): Promise<Result<Assessment, Error>>`

**Acceptance Criteria:**
- Follows existing repository pattern (Result<T,E>)
- No implementation details

---

### Task 8: Create PrismaAssessmentRepository
**File:** `backend/src/infrastructure/persistence/PrismaAssessmentRepository.ts`
**Implements:** `IAssessmentRepository`
**Methods:**
- Implement all interface methods using Prisma
- Map domain entity ↔ Prisma model

**Acceptance Criteria:**
- All CRUD operations work
- Error handling converts Prisma errors to Result.fail()
- Unit tests with mocked Prisma

---

### Task 9: Create ProcessAssessmentJobService
**File:** `backend/src/application/services/ProcessAssessmentJobService.ts`
**Method:**
- `async execute(jobId: string): Promise<Result<void, Error>>`

**Workflow:**
1. Fetch job by ID
2. Fetch assessment
3. Fetch bank reports
4. Extract figures (BankDataExtractionService)
5. Calculate hardship (Assessment entity)
6. Update assessment with results
7. Update job status: SUCCESS
8. Handle errors → job status: FAILED + retryCount++

**Acceptance Criteria:**
- Job processing completes successfully
- Assessment data populated with hardship results
- Errors logged + job marked FAILED
- Can be called synchronously (no external queue)

---

### Task 10: Refactor HandleBankOAuthCallbackUseCase
**File:** `backend/src/application/bank-connection/HandleBankOAuthCallbackUseCase.ts`
**Changes:**
1. After token exchange, fetch expense + income data
2. Extract key figures (BankDataExtractionService)
3. Save raw JSONs to BankReports table
4. Create Assessment record (status: PENDING)
5. Create AssessmentJobs record
6. If `PROCESS_JOBS_SYNCHRONOUSLY=true`: call ProcessAssessmentJobService
7. Return: { connectionId, totalExpenses, totalIncome, assessmentId }

**Acceptance Criteria:**
- Bank data stored in BankReports
- Assessment created and ready to process
- Job created with initial PENDING status
- Callback returns new response format (with figures)
- Works with env flag for sync/async

---

### Task 11: Create AssessmentController
**File:** `backend/src/presentation/controllers/AssessmentController.ts`
**Endpoints:**
- `GET /assessments/:assessmentId` → getAssessment(req, res)

**Response:**
```json
{
  "id": "...",
  "customerId": "...",
  "monthlyIncome": 3600,
  "monthlyExpenses": 2400,
  "disposableIncome": 1200,
  "monthlyBill": 100,
  "billRatio": 8.3,
  "hardshipLevel": "LOW",
  "sustainabilityScore": "HIGH",
  "status": "COMPLETED",
  "calculatedAt": "2026-04-21T..."
}
```

**Acceptance Criteria:**
- Returns assessment data correctly
- Handles PENDING status (assessment still calculating)
- Handles FAILED status (shows error)
- Follows existing error handling pattern

---

### Task 12: Create Assessment Routes
**File:** `backend/src/presentation/routes/assessment.routes.ts`
**Routes:**
- `GET /api/assessments/:assessmentId`

**Setup:**
- Wire up dependencies (repositories, services, controller)
- Mount in main app

**Acceptance Criteria:**
- Route is accessible
- HTTP testing with mock data passes

---

### Task 13: Create Mock Customer Seed Script
**File:** `backend/scripts/seed-mock-customers.ts`
**Creates 3 customers:**

1. **SEVERE Hardship**
   - email: temp-severe@test.local
   - monthlyBill: 250
   - arrears: 2000

2. **MODERATE Hardship**
   - email: temp-moderate@test.local
   - monthlyBill: 120
   - arrears: 500

3. **LOW Hardship**
   - email: temp-low@test.local
   - monthlyBill: 60
   - arrears: 100

**Run:** `npx ts-node backend/scripts/seed-mock-customers.ts`

**Acceptance Criteria:**
- 3 customers created in database
- All have correct bill + arrears amounts
- Can be re-run without errors (idempotent or with upsert)

---

## Phase 2c: Frontend Implementation

### Task 14: Build Assessment Overview Screen
**File:** `frontend/src/screens/Assessment/Overview.tsx`
**Displays:**
- Monthly Income (from assessment.monthlyIncome)
- Monthly Expenses breakdown (housing, food, utilities, transport, other)
- Disposable Income calculation
- Bill Amount + Affordability Ratio
- Hardship Level with color/icon
- Sustainability Score
- Next button → Payment Plans screen

**API Call:**
- `GET /api/assessments/{assessmentId}`
- Handle PENDING status (show "Calculating...")
- Handle FAILED status (show error)
- Handle COMPLETED status (show full data)

**Acceptance Criteria:**
- Displays all assessment data correctly
- Responsive design (mobile + desktop)
- Error handling for API failures
- Loading state while fetching

---

## Phase 2d: Testing & Validation

### Task 15: Manual E2E Testing
**Checklist:**
- [ ] Seed script creates 3 mock customers
- [ ] Bank Connection with mock customer flow
- [ ] Callback extracts income + expenses correctly
- [ ] BankReports table populated with raw JSONs
- [ ] Assessment created with PENDING status
- [ ] ProcessAssessmentJobService runs (if PROCESS_JOBS_SYNCHRONOUSLY=true)
- [ ] Assessment calculated with correct hardship level
- [ ] GET /api/assessments/:id returns correct data
- [ ] Frontend Assessment Overview displays figures correctly
- [ ] Job status transitions: PENDING → SUCCESS
- [ ] Error case: Job transitions to FAILED + retryCount increments

---

## Summary

**Total Tasks:** 15
**Phase 2a (Schema):** 4 tasks
**Phase 2b (Backend):** 9 tasks
**Phase 2c (Frontend):** 1 task
**Phase 2d (Testing):** 1 task

**Dependencies:**
- Tasks 5-12 depend on Tasks 1-4 (schema)
- Task 10 depends on Tasks 5,9 (extraction, job processor)
- Task 14 depends on Tasks 11-12 (API)
- Task 15 depends on all previous tasks

**Estimated Effort:**
- Schema: ~30 min (straightforward Prisma changes)
- Backend domain/repos: ~2 hours (entity logic, repository pattern)
- Backend services: ~3 hours (extraction, job processing, refactoring callback)
- Backend routes: ~1 hour (controller, routes, wiring)
- Frontend: ~2 hours (API integration, display logic, styling)
- Testing: ~2 hours (manual E2E validation)
- **Total: ~10-11 hours**

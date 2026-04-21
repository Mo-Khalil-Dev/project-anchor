# Phase 2 E2E Testing Guide

## Pre-Test Setup

### 1. Environment Variables
Ensure these are set in `.env`:
```bash
PROCESS_JOBS_SYNCHRONOUSLY=true  # For immediate assessment processing
VITE_API_URL=http://localhost:3001/api
```

### 2. Start Services
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 3. Seed Mock Customers
```bash
cd backend
npx ts-node scripts/seed-mock-customers.ts
```

Expected output:
```
✓ Created/updated customer: temp-severe@test.local
✓ Created/updated customer: temp-moderate@test.local
✓ Created/updated customer: temp-low@test.local
✓ Seed completed successfully
```

---

## Test Scenarios

### Scenario 1: SEVERE Hardship Path
**Customer:** temp-severe@test.local  
**Bill:** £250/month | **Arrears:** £2,000

#### Steps:
1. Start bank connection flow for temp-severe@test.local
2. Complete OAuth flow (mock data used automatically)
3. Verify BankReports table populated with raw income/expense JSON
4. Verify Assessment created with `status: PENDING`
5. Verify AssessmentJob created with `status: PENDING`
6. **If PROCESS_JOBS_SYNCHRONOUSLY=true:**
   - Wait ~2 seconds for processing
   - Verify Assessment status → `COMPLETED`
   - Verify AssessmentJob status → `SUCCESS`
   - Verify figures calculated:
     - monthlyIncome: £3,000
     - monthlyExpenses: £2,100
     - disposableIncome: £900
     - billRatio: (250/900)*100 = 27.8%
     - hardshipLevel: `SEVERE` (>25%)
     - sustainabilityScore: `MEDIUM`
7. Call `GET /api/assessments/{assessmentId}`
   - Response includes all calculated fields
   - Status is `COMPLETED`
8. Open frontend Assessment Overview
   - Displays all figures correctly
   - Shows SEVERE badge (red)
   - Shows MEDIUM sustainability badge (amber)
   - Bill affordability shows 27.8%
   - Next button is enabled

### Scenario 2: MODERATE Hardship Path
**Customer:** temp-moderate@test.local  
**Bill:** £120/month | **Arrears:** £500

#### Expected Results:
- disposableIncome: £900
- billRatio: (120/900)*100 = 13.3%
- hardshipLevel: `MODERATE` (10-25%)
- sustainabilityScore: `HIGH`
- Badge: MODERATE (amber) + HIGH sustainability (green)

### Scenario 3: LOW Hardship Path
**Customer:** temp-low@test.local  
**Bill:** £60/month | **Arrears:** £100

#### Expected Results:
- disposableIncome: £900
- billRatio: (60/900)*100 = 6.7%
- hardshipLevel: `LOW` (<10%)
- sustainabilityScore: `HIGH`
- Badge: LOW (green) + HIGH sustainability (green)

---

## API Test Cases

### Test: GET /api/assessments/:assessmentId

#### With PENDING Status:
```bash
curl http://localhost:3001/api/assessments/{id}
```

Response:
```json
{
  "id": "...",
  "customerId": "...",
  "monthlyIncome": 3000,
  "monthlyExpenses": 2100,
  "disposableIncome": 900,
  "monthlyBill": 250,
  "billRatio": 27.8,
  "hardshipLevel": "SEVERE",
  "sustainabilityScore": "MEDIUM",
  "status": "PENDING",
  "message": "Assessment is still calculating..."
}
```

#### With COMPLETED Status:
```json
{
  "id": "...",
  "customerId": "...",
  "monthlyIncome": 3000,
  "monthlyExpenses": 2100,
  "disposableIncome": 900,
  "monthlyBill": 250,
  "billRatio": 27.8,
  "hardshipLevel": "SEVERE",
  "sustainabilityScore": "MEDIUM",
  "status": "COMPLETED",
  "calculatedAt": "2026-04-21T12:34:56Z"
}
```

#### With FAILED Status:
```json
{
  "status": "FAILED",
  "message": "Assessment calculation failed..."
}
```

---

## Database Verification

### Check BankReports Table
```sql
SELECT * FROM "BankReports" WHERE bankConnectionId = '{connectionId}';
```

Verify:
- ✅ `incomeJson` contains valid JSON with Tink income structure
- ✅ `expensesJson` contains valid JSON with Tink expense structure
- ✅ `totalMonthlyIncome`: 3000
- ✅ `totalMonthlyExpenses`: 2100

### Check Assessment Table
```sql
SELECT * FROM "Assessment" WHERE id = '{assessmentId}';
```

Verify:
- ✅ `monthlyIncome`: 3000
- ✅ `monthlyExpenses`: 2100
- ✅ `disposableIncome`: 900
- ✅ `billRatio`: 27.8 (for SEVERE case)
- ✅ `hardshipLevel`: SEVERE
- ✅ `sustainabilityScore`: MEDIUM
- ✅ `status`: COMPLETED (if job processed)

### Check AssessmentJob Table
```sql
SELECT * FROM "AssessmentJob" WHERE assessmentId = '{assessmentId}';
```

Verify:
- ✅ `status`: SUCCESS (if processed) or PENDING (if async)
- ✅ `processedAt`: Set if completed
- ✅ `retryCount`: 0 (on first run)

---

## Error Handling Tests

### Test: Missing Bank Report
1. Create assessment without calling bank data extraction
2. Manually trigger `ProcessAssessmentJobService.execute(jobId)`
3. **Expected:** Job status → `FAILED`, error message logged

### Test: Invalid JSON in BankReports
1. Insert malformed JSON in incomeJson/expensesJson
2. Trigger job processing
3. **Expected:** Job fails gracefully, assessment status → `FAILED`

### Test: Polling Behavior (Frontend)
1. Start assessment with `PROCESS_JOBS_SYNCHRONOUSLY=false`
2. Open Assessment Overview screen
3. **Expected:** Loading spinner shows "Calculating..."
4. Wait for job to complete (in another process)
5. **Expected:** Screen auto-polls every 3s and updates when complete

---

## Hardship Calculation Verification

For each scenario, verify the calculation manually:

```
Hardship Level Rules:
├─ IF ratio > 100% OR disposable ≤ 0 → SEVERE
├─ ELSE IF ratio > 25% → SEVERE
├─ ELSE IF ratio > 10% → MODERATE
├─ ELSE IF ratio ≥ 0 → LOW/NONE (based on 5% threshold)

Sustainability Score Rules:
├─ IF disposable ≤ 0 → LOW
├─ ELSE IF ratio > 100% → LOW
├─ ELSE IF ratio > 25% → MEDIUM
├─ ELSE IF ratio > 10% → HIGH
├─ ELSE → HIGH
```

**SEVERE Case:** 250/900 = 27.8% → SEVERE hardship, MEDIUM sustainability ✓  
**MODERATE Case:** 120/900 = 13.3% → MODERATE hardship, HIGH sustainability ✓  
**LOW Case:** 60/900 = 6.7% → LOW hardship, HIGH sustainability ✓

---

## Checklist

- [ ] Seed script creates 3 customers without errors
- [ ] Bank Connection flow completes successfully
- [ ] BankReports table has correct income/expense JSON
- [ ] Assessment table has calculated figures
- [ ] AssessmentJob transitions: PENDING → SUCCESS
- [ ] GET /api/assessments/:id returns correct data
- [ ] Frontend Assessment Overview displays all fields
- [ ] SEVERE case shows correct badge and figures
- [ ] MODERATE case shows correct badge and figures
- [ ] LOW case shows correct badge and figures
- [ ] Loading state works when status is PENDING
- [ ] Error message displays when status is FAILED
- [ ] Frontend polling updates automatically
- [ ] Responsive design works on mobile (375px) and desktop (1280px)
- [ ] Next button is disabled while PENDING, enabled when COMPLETED
- [ ] All hardship calculations match specifications

---

## Notes

- Mock data is hard-coded in `BankDataExtractionService` if no real Tink data provided
- Default income: £3,000/month salary
- Default expenses: £2,100/month (£800 housing, £400 food, £200 utilities, £200 transport, £500 other)
- All amounts are in GBP
- Calculations use `Math.round(value * 100) / 100` for precision (2 decimal places)

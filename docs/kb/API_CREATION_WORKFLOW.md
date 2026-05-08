# API Creation Workflow

## Overview

When creating a new API endpoint, follow this workflow to ensure consistency, type safety, and automatic validation.

```
Requirements → Schema (DTO) → Route → Handler → Response
                   ↓
              Type Export
                   ↓
              Service/Use Case
```

---

## Step-by-Step Workflow

### Step 1: Define the Schema (Your Request DTO)

**File:** `backend/src/shared/validators/schemas.ts`

The schema IS your request DTO. It defines:
- Request shape (body, params, query)
- Validation rules
- Type information

```typescript
// Schema = Request DTO
export const createAssessmentSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Must be valid UUID'),
    monthlyIncome: z.number().positive('Must be positive'),
    totalExpenses: z.number().nonnegative('Cannot be negative'),
    billAmount: z.number().positive('Must be positive'),
    incomeBreakdown: z.record(z.string(), z.number()),
    expenseBreakdown: z.record(z.string(), z.number()),
  }),
});

// Export TypeScript type from schema
export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema.shape.body>;
```

**What the schema provides:**
✅ Runtime validation  
✅ TypeScript types  
✅ API documentation  
✅ Error messages  

### Step 2: Create the Route

**File:** `backend/src/presentation/routes/assessments.ts`

Use the schema to validate before the handler:

```typescript
import { validateRequest, asyncHandler } from '@middleware';
import { createAssessmentSchema } from '@validators/schemas';
import type { CreateAssessmentInput } from '@validators/schemas';

router.post(
  '/',
  validateRequest(createAssessmentSchema),  // ← Schema validates here
  asyncHandler(async (req, res) => {
    // req.validated.body is typed as CreateAssessmentInput
    const input: CreateAssessmentInput = req.validated.body;
    
    // Now pass to service
    const assessment = await assessmentService.create(input);
    res.status(201).json(assessment);
  })
);
```

### Step 3: Use Type in Service/Use Case

**File:** `backend/src/application/services/AssessmentService.ts`

Import and use the type:

```typescript
import type { CreateAssessmentInput } from '@validators/schemas';

export class AssessmentService {
  async create(input: CreateAssessmentInput): Promise<Assessment> {
    // TypeScript knows all fields:
    // input.customerId
    // input.monthlyIncome
    // input.totalExpenses
    // etc.
    
    // No need to validate again - validation already happened
    const assessment = await this.repository.save(input);
    return assessment;
  }
}
```

### Step 4: Define Response DTO (Optional)

**File:** `backend/src/shared/validators/schemas.ts`

For responses, create output DTOs if needed:

```typescript
export const assessmentResponseSchema = z.object({
  id: z.string(),
  customerId: z.string().uuid(),
  monthlyIncome: z.number(),
  totalExpenses: z.number(),
  hardshipLevel: z.enum(['NONE', 'LOW', 'MODERATE', 'SEVERE']),
  createdAt: z.string().datetime(),
});

export type AssessmentResponse = z.infer<typeof assessmentResponseSchema>;
```

---

## Complete Example: Creating /payment-plans Endpoint

### 1. Schema (Request DTO)

```typescript
// File: src/shared/validators/schemas.ts

export const createPaymentPlanSchema = z.object({
  body: z.object({
    assessmentId: z.string().uuid('Must be valid referenceData UUID'),
    planType: z.enum(['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE']),
    monthlyAmount: z.number().positive('Amount must be positive'),
    durationMonths: z.number().int().positive('Duration must be positive'),
  }),
});

export type CreatePaymentPlanInput = z.infer<typeof createPaymentPlanSchema.shape.body>;
```

### 2. Route

```typescript
// File: src/presentation/routes/paymentPlans.ts

import { validateRequest, asyncHandler } from '@middleware';
import { createPaymentPlanSchema } from '@validators/schemas';
import { paymentPlanService } from '@usecases';

const router = express.Router();

router.post(
  '/',
  validateRequest(createPaymentPlanSchema),
  asyncHandler(async (req, res) => {
    const input = req.validated.body;
    const plan = await paymentPlanService.create(input);
    res.status(201).json(plan);
  })
);

export default router;
```

### 3. Service

```typescript
// File: src/application/usecases/PaymentPlanService.ts

import type { CreatePaymentPlanInput } from '@validators/schemas';

export class PaymentPlanService {
  async create(input: CreatePaymentPlanInput) {
    // input is fully typed and validated
    const { assessmentId, planType, monthlyAmount, durationMonths } = input;
    
    // Business logic
    const totalAmount = monthlyAmount * durationMonths;
    
    // Save
    const plan = await this.repository.save({
      assessmentId,
      planType,
      monthlyAmount,
      durationMonths,
      totalAmount,
    });
    
    return plan;
  }
}
```

---

## DTO Patterns

### Pattern 1: Request DTO (Body)

```typescript
// Input DTO - what client sends
export const createUserSchema = z.object({
  body: z.object({
    email: emailSchema,
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    password: z.string().min(8),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema.shape.body>;
```

### Pattern 2: Response DTO

```typescript
// Output DTO - what API returns
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  createdAt: z.string().datetime(),
  // Note: password NOT in response
});

export type UserResponse = z.infer<typeof userResponseSchema>;
```

### Pattern 3: ID Parameter DTO

```typescript
// Params DTO
export const getByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type GetByIdParams = z.infer<typeof getByIdSchema.shape.params>;
```

### Pattern 4: Query/Filter DTO

```typescript
// Query DTO - for filtering/pagination
export const listUsersQuerySchema = z.object({
  query: z.object({
    limit: z.string().transform(Number).pipe(z.number().positive()).default('10'),
    offset: z.string().transform(Number).pipe(z.number().nonnegative()).default('0'),
    role: z.enum(['ADMIN', 'USER']).optional(),
  }).optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema.shape.query>;
```

---

## Type Flow Diagram

```
Schema Definition
├── Runtime validation (Zod)
├── TypeScript types (z.infer)
└── API documentation

        ↓

Route Handler
├── validateRequest(schema)
├── req.validated.body (typed)
└── Pass to service

        ↓

Service/Use Case
├── Receives typed input
├── Business logic
├── Returns typed output

        ↓

Response
├── Type-safe response
└── Consistent format
```

---

## Checklist: Creating a New Endpoint

When creating `POST /api/v1/assessments`:

### 1. Define Request DTO (Schema)
- [ ] Create schema in `schemas.ts`
- [ ] Include validation rules
- [ ] Export TypeScript type with `z.infer`
- [ ] Document field requirements as error messages

```typescript
export const createAssessmentSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Must be UUID'),
    monthlyIncome: z.number().positive('Must be > 0'),
  }),
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema.shape.body>;
```

### 2. Create Route
- [ ] Import schema and type
- [ ] Add `validateRequest(schema)` middleware
- [ ] Use `asyncHandler` for async function
- [ ] Extract `req.validated.body`
- [ ] Pass to service

```typescript
router.post(
  '/',
  validateRequest(createAssessmentSchema),
  asyncHandler(async (req, res) => {
    const input: CreateAssessmentInput = req.validated.body;
    const result = await service.create(input);
    res.status(201).json(result);
  })
);
```

### 3. Create Service/Use Case
- [ ] Import input type
- [ ] Declare parameter type
- [ ] Business logic
- [ ] Return typed result

```typescript
async create(input: CreateAssessmentInput): Promise<Assessment> {
  // No validation needed - already validated
  // Use input.customerId, input.monthlyIncome, etc.
}
```

### 4. Define Response DTO (Optional)
- [ ] Create response schema
- [ ] Export response type
- [ ] Use in service return type

```typescript
export type AssessmentResponse = z.infer<typeof assessmentResponseSchema>;

// In service
async create(input: CreateAssessmentInput): Promise<AssessmentResponse>
```

### 5. Register Route
- [ ] Import router in `app.ts`
- [ ] Use `app.use('/assessments', assessmentRouter)`

### 6. Test the Endpoint
- [ ] Test with valid input → 201
- [ ] Test with invalid input → 400 validation error
- [ ] Test missing fields → 400 validation error

---

## Key Principles

### Schema is the Contract

```
Client (sends JSON) 
          ↓
      Schema (validates & types)
          ↓
      Handler (receives typed object)
          ↓
      Service (works with typed object)
          ↓
      Response (returns typed result)
```

### One Source of Truth

- Don't define types separately
- Don't duplicate validation logic
- Schema is the single source for:
  ✅ What client must send  
  ✅ What will be validated  
  ✅ What handler receives (typed)  
  ✅ What service consumes  

### Validation Happens Once

```typescript
// NOT in handler - already validated
const { customerId } = req.body; // ← Raw, untyped

// YES - via middleware
const { customerId } = req.validated.body; // ← Typed, validated
```

### Type Safety Throughout

```typescript
// Schema → Type → Service → Service knows all fields
export type CreateInput = z.infer<...>;

async create(input: CreateInput) {
  input.field1  // ✅ TypeScript knows this exists
  input.field2  // ✅ TypeScript knows type
  input.field3  // ✅ IDE autocomplete works
  input.invalid // ❌ TypeScript error
}
```

---

## Common Mistakes to Avoid

### ❌ Defining Input Types Manually

```typescript
// DON'T do this
export interface CreateAssessmentInput {
  customerId: string;
  monthlyIncome: number;
}

// Instead, use z.infer from schema
export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema.shape.body>;
```

### ❌ Validating in Handler

```typescript
// DON'T do this
router.post('/', (req, res) => {
  if (!req.body.customerId) {
    return res.json({ error: 'invalid' });
  }
});

// DO this
router.post('/', validateRequest(schema), asyncHandler(async (req, res) => {
  // req.validated.body is already validated
}));
```

### ❌ Duplicate Schemas

```typescript
// DON'T do this
const schema1 = z.object({ email: z.string().email() });
const schema2 = z.object({ email: z.string().email() });

// DO this
export const emailSchema = z.string().email();
const schema1 = z.object({ email: emailSchema });
const schema2 = z.object({ email: emailSchema });
```

---

## Benefits of This Approach

✅ **Single source of truth** - Schema defines everything  
✅ **Type safe** - No `any` types  
✅ **Validated once** - At entry point  
✅ **Consistent errors** - Unified error format  
✅ **Self-documenting** - Schema shows API contract  
✅ **Easy testing** - Clear input/output  
✅ **No duplication** - Reuse schemas across endpoints  
✅ **IDE support** - Full autocomplete in handlers  


# HTTP Request Validation Guide

## Overview

All HTTP requests to PROJECT BRIDGE endpoints must be validated using Zod schemas. The validation middleware ensures data integrity, type safety, and consistent error responses across the API.

**Benefits:**
✅ Type-safe request handling  
✅ Automatic error reporting  
✅ Reusable validation logic  
✅ Consistent response format  
✅ Clear API contracts  

---

## Architecture

```
Request → Validation Middleware → Zod Schema → ValidatedRequest → Handler → Response
                                                                       ↓
                                                            ValidationError (if fails)
                                                                       ↓
                                                          Global Error Handler
```

### Flow

1. **Middleware validates** - `validateRequest(schema)` checks incoming data
2. **Schema defined** - Reusable schemas in `src/shared/validators/schemas.ts`
3. **Attach to request** - Valid data attached to `req.validated`
4. **Handler processes** - Use validated, typed data
5. **Errors caught** - Global handler returns structured response

---

## Quick Start

### 1. Simple POST with Body Validation

```typescript
import express from 'express';
import { asyncHandler, validateRequest } from '@middleware';
import { createAssessmentSchema } from '@validators/schemas';

const router = express.Router();

router.post(
  '/assessments',
  validateRequest(createAssessmentSchema),
  asyncHandler(async (req, res) => {
    // ✅ req.validated.body is typed and validated
    const { customerId, monthlyIncome, totalExpenses, billAmount } = 
      req.validated.body;

    // Use validated data
    const assessment = await assessmentService.create({
      customerId,
      monthlyIncome,
      totalExpenses,
      billAmount,
    });

    res.status(201).json(assessment);
  })
);

export default router;
```

**What happens if validation fails:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "body.customerId": ["Must be a valid UUID"],
      "body.monthlyIncome": ["Must be a positive number"]
    },
    "traceId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-04-19T12:00:00.000Z"
  }
}
```

---

## Common Patterns

### Pattern 1: Body Only (Create/Update)

```typescript
// POST /assessments
router.post(
  '/assessments',
  validateRequest(createAssessmentSchema),
  asyncHandler(async (req, res) => {
    const assessment = await service.create(req.validated.body);
    res.json(assessment);
  })
);
```

### Pattern 2: Params Only (Get by ID)

```typescript
// GET /assessments/:id
const getAssessmentSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

router.get(
  '/assessments/:id',
  validateRequest(getAssessmentSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.validated.params;
    const assessment = await service.getById(id);
    res.json(assessment);
  })
);
```

### Pattern 3: Params + Query (List with Pagination)

```typescript
// GET /assessments?limit=10&offset=0
const listAssessmentsSchema = z.object({
  query: z.object({
    limit: z.string().transform(Number).pipe(z.number().positive()).optional(),
    offset: z.string().transform(Number).pipe(z.number().nonnegative()).optional(),
  }).optional(),
});

router.get(
  '/assessments',
  validateRequest(listAssessmentsSchema),
  asyncHandler(async (req, res) => {
    const { limit = 10, offset = 0 } = req.validated.query || {};
    const assessments = await service.list(limit, offset);
    res.json(assessments);
  })
);
```

### Pattern 4: Body + Params (Update)

```typescript
// PUT /assessments/:id
const updateAssessmentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    monthlyIncome: z.number().positive().optional(),
    totalExpenses: z.number().nonnegative().optional(),
  }),
});

router.put(
  '/assessments/:id',
  validateRequest(updateAssessmentSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.validated.params;
    const updates = req.validated.body;
    const assessment = await service.update(id, updates);
    res.json(assessment);
  })
);
```

### Pattern 5: Multiple Validators (Strict + Custom)

```typescript
// POST /users - strict validation, no unknown fields
const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
  }).strict(), // Reject unknown fields
});

router.post(
  '/users',
  validateRequest(createUserSchema),
  asyncHandler(async (req, res) => {
    const user = await service.create(req.validated.body);
    res.status(201).json(user);
  })
);
```

### Pattern 6: Partial Updates (PATCH)

```typescript
// PATCH /assessments/:id - allow partial updates
const updateAssessmentPartialSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    monthlyIncome: z.number().positive(),
    totalExpenses: z.number().nonnegative(),
  }).partial(), // All fields optional
});

router.patch(
  '/assessments/:id',
  validateRequest(updateAssessmentPartialSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.validated.params;
    const updates = req.validated.body; // Only provided fields
    const assessment = await service.update(id, updates);
    res.json(assessment);
  })
);
```

---

## Creating Custom Schemas

### For a New Endpoint

```typescript
// File: src/shared/validators/schemas.ts

// Add to the bottom of the file
export const createPaymentPlanSchema = z.object({
  body: z.object({
    assessmentId: z.string().min(1, 'Assessment ID required'),
    planType: z.enum(['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE']),
    monthlyAmount: z.number().positive('Amount must be positive'),
    durationMonths: z.number().int().positive(),
  }),
});

export type CreatePaymentPlanInput = z.infer<typeof createPaymentPlanSchema.shape.body>;
```

**Use the type in your service:**

```typescript
// File: src/application/services/PaymentPlanService.ts

import type { CreatePaymentPlanInput } from '@validators/schemas';

export class PaymentPlanService {
  async create(input: CreatePaymentPlanInput) {
    // input is typed - full IDE autocomplete
    // input is already validated
  }
}
```

### For Complex Validation

```typescript
// Custom validation with .refine()
export const signupSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    passwordConfirm: z.string(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
  }).refine(
    data => data.password === data.passwordConfirm,
    {
      message: 'Passwords do not match',
      path: ['passwordConfirm'], // Show error on this field
    }
  ),
});
```

### With Transform

```typescript
// Transform string to number
export const querySchema = z.object({
  query: z.object({
    count: z.string().transform(Number).pipe(z.number().positive()),
    filter: z.string().toLowerCase().optional(),
  }),
});
```

---

## Advanced Usage

### Compose Multiple Validators

```typescript
import { composeValidators, validateRequest } from '@middleware';

const validator1 = validateRequest(paramsSchema);
const validator2 = validateRequest(bodySchema);

router.patch(
  '/route/:id',
  composeValidators(validator1, validator2),
  handler
);

// Or chain manually:
router.patch(
  '/route/:id',
  validateRequest(paramsSchema),
  validateRequest(bodySchema),
  handler
);
```

### Conditional Validation

```typescript
// Validate based on query parameter
const schema = z.object({
  query: z.object({
    includeDetails: z.string().optional(),
  }),
  body: z.object({
    name: z.string(),
    details: z.string().optional(),
  }).refine(
    data => {
      // Only require details if query param is set
      if (data.details === undefined) {
        return false;
      }
      return true;
    },
    { message: 'Details required when includeDetails=true' }
  ),
});
```

### Reuse Base Schema

```typescript
// Define base
const baseUserSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

// Extend for different endpoints
export const createUserSchema = z.object({
  body: baseUserSchema.and(z.object({
    password: z.string().min(8),
  })),
});

export const updateUserSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: baseUserSchema.partial(), // Can update any field
});
```

---

## Error Responses

### Validation Error (400)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "body.email": ["Must be a valid email address"],
      "body.monthlyIncome": ["Must be a positive number"],
      "params.id": ["Must be a valid UUID"]
    },
    "traceId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-04-19T12:00:00.000Z"
  }
}
```

### Multiple Errors Per Field

```json
{
  "details": {
    "body.password": [
      "String must contain at least 8 character(s)",
      "Password must contain uppercase letter"
    ]
  }
}
```

---

## Testing Validation

### Unit Test Example

```typescript
import request from 'supertest';
import app from '@app';

describe('POST /assessments', () => {
  it('should reject invalid customerId', async () => {
    const response = await request(app)
      .post('/assessments')
      .send({
        customerId: 'not-a-uuid',
        monthlyIncome: 3000,
        totalExpenses: 2000,
        billAmount: 500,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details['body.customerId']).toBeDefined();
  });

  it('should accept valid request', async () => {
    const response = await request(app)
      .post('/assessments')
      .send({
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        monthlyIncome: 3000,
        totalExpenses: 2000,
        billAmount: 500,
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});
```

---

## Available Schemas

### Common Patterns
- `uuidSchema` - UUID validation
- `emailSchema` - Email validation
- `positiveNumber` - Positive numbers only
- `nonNegativeNumber` - Non-negative numbers
- `paginationSchema` - Limit/offset pagination

### Domain Schemas
- `createAssessmentSchema` - Create assessment
- `createPaymentPlanSchema` - Create payment plan
- `createCustomerSchema` - Create customer
- `loginSchema` - Login validation
- `signupSchema` - Signup with password confirmation
- `updateCaseStatusSchema` - Update case status
- `tinkCallbackSchema` - Tink OAuth callback

---

## Best Practices

### ✅ DO

1. **Always validate at the route level**
   ```typescript
   router.post('/route', validateRequest(schema), handler);
   ```

2. **Define schemas alongside related code**
   ```typescript
   // In schemas.ts with other domain schemas
   export const createAssessmentSchema = z.object({ ... });
   ```

3. **Use descriptive error messages**
   ```typescript
   monthlyIncome: z.number().positive('Monthly income must be positive')
   ```

4. **Export types from schemas**
   ```typescript
   export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema.shape.body>;
   ```

5. **Compose validators for complex requests**
   ```typescript
   composeValidators(validateParams(...), validateBody(...))
   ```

### ❌ DON'T

1. **Don't validate in the handler**
   ```typescript
   // Bad
   handler(req, res) {
     if (!req.body.email) res.json({ error: 'invalid' });
   }
   ```

2. **Don't duplicate validation logic**
   ```typescript
   // Bad - define once in schemas.ts
   const emailCheck = z.string().email();
   const anotherEmailCheck = z.string().email();
   ```

3. **Don't create inline schemas**
   ```typescript
   // Bad
   router.post('/', validateRequest(z.object({ ... })), handler);
   
   // Good
   router.post('/', validateRequest(mySchema), handler);
   ```

4. **Don't ignore validation errors in tests**
   ```typescript
   // Bad - didn't check if validation failed
   const response = await request(app).post('/route').send({});
   
   // Good
   expect(response.status).toBe(400);
   expect(response.body.error.code).toBe('VALIDATION_ERROR');
   ```

---

## Integration Checklist

When adding a new endpoint:

- [ ] Define schema in `src/shared/validators/schemas.ts`
- [ ] Export type from schema using `z.infer`
- [ ] Add validation middleware to route
- [ ] Use `asyncHandler` for async handlers
- [ ] Access validated data via `req.validated`
- [ ] Add tests for success and failure cases
- [ ] Document endpoint in API docs

---

## Example: Complete Endpoint

```typescript
// File: src/presentation/routes/assessments.ts

import express from 'express';
import { asyncHandler, validateRequest } from '@middleware';
import { ValidatedRequest } from '@middleware';
import { createAssessmentSchema } from '@validators/schemas';
import type { CreateAssessmentInput } from '@validators/schemas';
import { assessmentService } from '@services';

const router = express.Router();

/**
 * POST /assessments
 * Create a new hardship referenceData
 *
 * Body:
 * - customerId: UUID of the customer
 * - monthlyIncome: Annual income
 * - totalExpenses: Total monthly expenses
 * - billAmount: Utility bill amount
 * - incomeBreakdown: Income sources breakdown
 * - expenseBreakdown: Expense categories breakdown
 *
 * Returns: 201 Created with referenceData details
 */
router.post(
  '/',
  validateRequest(createAssessmentSchema),
  asyncHandler(async (req: ValidatedRequest, res) => {
    const input: CreateAssessmentInput = req.validated.body;

    const assessment = await assessmentService.create(input);

    res.status(201).json({
      success: true,
      data: assessment,
    });
  })
);

export default router;
```

---

## Migration Guide

If you have existing unvalidated endpoints:

### Before
```typescript
router.post('/assessments', (req, res) => {
  if (!req.body.customerId) {
    return res.status(400).json({ error: 'customerId required' });
  }
  // More manual validation...
});
```

### After
```typescript
router.post(
  '/assessments',
  validateRequest(createAssessmentSchema),
  asyncHandler(async (req, res) => {
    // Data is already validated and typed
    const assessment = await service.create(req.validated.body);
    res.json(assessment);
  })
);
```

**Benefits of migration:**
✅ Remove 50+ lines of validation code  
✅ Consistent error format  
✅ Type-safe throughout  
✅ Centralized schemas  
✅ Automatic test coverage  


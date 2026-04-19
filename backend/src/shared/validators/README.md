# Validators - Request Validation with Zod

Reusable Zod schemas for validating HTTP requests across the API.

## Quick Start

```typescript
import { validateRequest } from '@middleware';
import { createAssessmentSchema } from '@validators/schemas';

router.post(
  '/assessments',
  validateRequest(createAssessmentSchema),
  handler
);

// In handler: req.validated.body is typed and validated
```

## Schemas

### Common Patterns
- `uuidSchema` - UUID validation
- `emailSchema` - Email format
- `positiveNumber` - Must be > 0
- `nonNegativeNumber` - Must be >= 0
- `paginationSchema` - Limit/offset with defaults

### Domain Schemas
- `createAssessmentSchema` - Assessment creation
- `createPaymentPlanSchema` - Payment plan creation
- `createCustomerSchema` - Customer creation
- `loginSchema` - Login credentials
- `signupSchema` - User registration
- `updateCaseStatusSchema` - Case status update

## Creating a Schema

```typescript
// File: schemas.ts

export const mySchema = z.object({
  body: z.object({
    email: emailSchema,
    amount: positiveNumber,
  }),
});

export type MyInput = z.infer<typeof mySchema.shape.body>;
```

## Using in Routes

```typescript
import { validateRequest } from '@middleware';
import { mySchema } from '@validators/schemas';
import type { MyInput } from '@validators/schemas';

router.post(
  '/endpoint',
  validateRequest(mySchema),
  asyncHandler(async (req, res) => {
    const data: MyInput = req.validated.body;
    // TypeScript knows all fields here
  })
);
```

## Error Handling

Validation errors return 400 with field-level details:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "body.email": ["Must be a valid email"],
      "body.amount": ["Must be positive"]
    }
  }
}
```

See [VALIDATION_GUIDE.md](../../docs/VALIDATION_GUIDE.md) for complete usage documentation.

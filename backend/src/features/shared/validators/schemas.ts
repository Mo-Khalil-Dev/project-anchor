import { z } from 'zod';

/**
 * Reusable Zod validation schemas
 *
 * These schemas define the shape and validation rules for common request types.
 * Used by the validateRequest middleware to ensure data integrity.
 *
 * Usage:
 *   app.post('/endpoint',
 *     validateRequest(createUserSchema),
 *     handler
 *   );
 */

// ============ COMMON PATTERNS ============

export const uuidSchema = z.string().uuid('Must be a valid UUID');

export const emailSchema = z.string().email('Must be a valid email address');

export const positiveNumber = z.number().positive('Must be a positive number');

export const nonNegativeNumber = z.number().nonnegative('Cannot be negative');

export const paginationSchema = z
  .object({
    limit: z.number().int().positive().max(100).default(10),
    offset: z.number().int().nonnegative().default(0),
  })
  .optional();

// ============ REQUEST SCHEMAS ============

/**
 * Generic request validation schema wrapper
 * Validates body, params, and query all together
 */
export type ValidatedRequest<T> = {
  body?: T;
  params?: Record<string, string>;
  query?: Record<string, string>;
};

/**
 * Helper to create a full request schema
 */
export function createRequestSchema<B, P, Q>(
  body?: z.ZodType<B>,
  params?: z.ZodType<P>,
  query?: z.ZodType<Q>
) {
  return z.object({
    body: body?.optional() || z.unknown().optional(),
    params: params?.optional() || z.unknown().optional(),
    query: query?.optional() || z.unknown().optional(),
  });
}

// ============ DOMAIN-SPECIFIC SCHEMAS ============

/**
 * Assessment schemas
 */
export const createAssessmentSchema = z.object({
  body: z.object({
    customerId: uuidSchema,
    monthlyIncome: positiveNumber,
    totalExpenses: nonNegativeNumber,
    billAmount: positiveNumber,
    arrears: nonNegativeNumber,
    vulnerabilities: z.record(z.string(), z.boolean()).optional(),
    incomeBreakdown: z.record(z.string(), nonNegativeNumber),
    expenseBreakdown: z.record(z.string(), nonNegativeNumber),
  }),
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema.shape.body>;

export const getAssessmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Assessment ID is required'),
  }),
});

export const listAssessmentsSchema = z.object({
  params: z.object({
    customerId: uuidSchema,
  }),
  query: z
    .object({
      limit: z.string().transform(Number).pipe(positiveNumber).default('10'),
      offset: z.string().transform(Number).pipe(nonNegativeNumber).default('0'),
    })
    .optional(),
});

/**
 * Payment Plan schemas
 */
export const createPaymentPlanSchema = z.object({
  body: z.object({
    assessmentId: z.string().min(1, 'Assessment ID is required'),
    planType: z.enum(['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE']),
    monthlyAmount: positiveNumber,
    durationMonths: z.number().int().positive(),
  }),
});

export type CreatePaymentPlanInput = z.infer<typeof createPaymentPlanSchema.shape.body>;

/**
 * User/Customer schemas
 */
export const createCustomerSchema = z.object({
  body: z.object({
    email: emailSchema,
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
      .optional(),
  }),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema.shape.body>;

/**
 * Authentication schemas
 */
export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const signupSchema = z.object({
  body: z
    .object({
      email: emailSchema,
      password: z.string().min(8, 'Password must be at least 8 characters'),
      passwordConfirm: z.string(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: 'Passwords do not match',
      path: ['passwordConfirm'],
    }),
});

/**
 * Admin/Officer schemas
 */
export const updateCaseStatusSchema = z.object({
  params: z.object({
    caseId: uuidSchema,
  }),
  body: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ESCALATED']),
    notes: z.string().optional(),
    decision: z.enum(['APPROVE', 'REJECT', 'ESCALATE']),
  }),
});

/**
 * Tink OAuth schemas (placeholder for when we implement the flow)
 */
export const tinkCallbackSchema = z.object({
  query: z.object({
    reports_generation_job_id: z.string().min(1, 'Job ID is required'),
  }),
});

/**
 * Pagination schemas for list endpoints
 */
export const listWithPaginationSchema = z.object({
  query: z
    .object({
      limit: z.string().transform(Number).pipe(positiveNumber.max(100)).optional(),
      offset: z.string().transform(Number).pipe(nonNegativeNumber).optional(),
    })
    .optional(),
});

// ============ ERROR DETAILS SCHEMA ============

/**
 * Extracts field-level validation errors from Zod errors
 * Returns a flat object mapping field paths to error messages
 */
export function extractValidationErrors(errors: z.ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};

  for (const error of errors.errors) {
    const path = error.path.join('.');
    if (!details[path]) {
      details[path] = [];
    }
    details[path].push(error.message);
  }

  return details;
}

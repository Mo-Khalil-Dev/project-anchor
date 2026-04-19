import { Request, Response } from 'express';
import { z } from 'zod';
import {
  validateRequest,
  composeValidators,
} from '../../../../src/presentation/middleware/validateRequest';
import { ValidationError } from '../../../../src/shared/errors/ValidationError';
import {
  createAssessmentSchema,
  emailSchema,
  extractValidationErrors,
} from '../../../../src/shared/validators/schemas';

describe('Request Validation Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {};
    next = jest.fn();
  });

  describe('validateRequest()', () => {
    it('should validate body successfully', () => {
      const schema = z.object({
        body: z.object({
          email: emailSchema,
          name: z.string(),
        }),
      });

      req.body = { email: 'test@example.com', name: 'John' };

      validateRequest(schema)(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
      expect((req as any).validated).toEqual({
        body: { email: 'test@example.com', name: 'John' },
      });
    });

    it('should validate params successfully', () => {
      const schema = z.object({
        params: z.object({
          id: z.string().uuid(),
        }),
      });

      req.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

      validateRequest(schema)(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should validate query successfully', () => {
      const schema = z.object({
        query: z.object({
          limit: z.string().transform(Number),
          offset: z.string().transform(Number),
        }),
      });

      req.query = { limit: '10', offset: '0' };

      validateRequest(schema)(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should validate body, params, and query together', () => {
      const schema = z.object({
        body: z.object({ email: emailSchema }),
        params: z.object({ id: z.string().uuid() }),
        query: z.object({ filter: z.string() }),
      });

      req.body = { email: 'test@example.com' };
      req.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      req.query = { filter: 'active' };

      validateRequest(schema)(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
      expect((req as any).validated).toEqual({
        body: { email: 'test@example.com' },
        params: { id: '550e8400-e29b-41d4-a716-446655440000' },
        query: { filter: 'active' },
      });
    });

    it('should pass ValidationError to next on validation failure', () => {
      const schema = z.object({
        body: z.object({
          email: emailSchema,
        }),
      });

      req.body = { email: 'invalid-email' };

      validateRequest(schema)(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = next.mock.calls[0][0] as ValidationError;
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toBeDefined();
    });

    it('should extract field-level validation errors', () => {
      const schema = z.object({
        body: z.object({
          email: emailSchema,
          age: z.number().positive(),
        }),
      });

      req.body = { email: 'invalid', age: -5 };

      validateRequest(schema)(req as Request, res as Response, next);

      const error = next.mock.calls[0][0] as ValidationError;
      expect(error.details).toBeDefined();
      expect(Object.keys(error.details!).length).toBeGreaterThan(0);
    });

    it('should handle complex nested validation errors', () => {
      const schema = createAssessmentSchema;

      req.body = {
        customerId: 'not-a-uuid',
        monthlyIncome: -100,
        totalExpenses: 'not-a-number',
        billAmount: 0,
        incomeBreakdown: {},
        expenseBreakdown: {},
      };

      validateRequest(schema)(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = next.mock.calls[0][0] as ValidationError;
      expect(error.details).toBeDefined();
      expect(Object.keys(error.details!).length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('validateBody()', () => {
    it('should validate only body', () => {
      const schema = z.object({
        email: emailSchema,
      });

      req.body = { email: 'test@example.com' };
      req.params = { any: 'invalid' };
      req.query = { bad: 'query' };

      validateRequest(z.object({ body: schema }))(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should fail if body is invalid', () => {
      const schema = z.object({
        email: emailSchema,
      });

      req.body = { email: 'not-an-email' };

      validateRequest(z.object({ body: schema }))(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('validateParams()', () => {
    it('should validate only params', () => {
      const schema = z.object({
        id: z.string().uuid(),
      });

      req.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

      validateRequest(z.object({ params: schema }))(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('validateQuery()', () => {
    it('should validate only query', () => {
      const schema = z.object({
        limit: z.string().transform(Number).pipe(z.number().positive()),
      });

      req.query = { limit: '10' };

      validateRequest(z.object({ query: schema }))(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('createStrictValidator()', () => {
    it('should reject unknown fields in strict mode', () => {
      const schema = z.object({
        body: z.object({
          email: emailSchema,
        }).strict(),
      });

      req.body = { email: 'test@example.com', unknownField: 'should fail' };

      validateRequest(schema)(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should allow only known fields', () => {
      const schema = z.object({
        body: z.object({
          email: emailSchema,
          name: z.string(),
        }).strict(),
      });

      req.body = { email: 'test@example.com', name: 'John' };

      validateRequest(schema)(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('createPartialValidator()', () => {
    it('should allow partial objects in partial mode', () => {
      const schema = z.object({
        body: z.object({
          email: emailSchema,
          name: z.string(),
          age: z.number(),
        }).partial(),
      });

      req.body = { email: 'test@example.com' };

      validateRequest(schema)(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should validate provided fields even in partial mode', () => {
      const schema = z.object({
        body: z.object({
          email: emailSchema,
          name: z.string(),
        }).partial(),
      });

      req.body = { email: 'invalid-email' };

      validateRequest(schema)(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('composeValidators()', () => {
    it('should run multiple validators in sequence', () => {
      const bodySchema = z.object({
        email: emailSchema,
      });

      const paramsSchema = z.object({
        id: z.string().uuid(),
      });

      const validator1 = validateRequest(z.object({ body: bodySchema }));
      const validator2 = validateRequest(z.object({ params: paramsSchema }));

      req.body = { email: 'test@example.com' };
      req.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

      const composed = composeValidators(validator1, validator2);
      composed(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
      expect((req as any).validated).toBeDefined();
    });

    it('should stop on first validation error', () => {
      const validator1 = validateRequest(z.object({
        body: z.object({ email: emailSchema }),
      }));
      const validator2 = validateRequest(z.object({
        params: z.object({ id: z.string().uuid() }),
      }));

      req.body = { email: 'invalid' };
      req.params = { id: 'valid-id' };

      const composed = composeValidators(validator1, validator2);
      composed(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle empty validator list', () => {
      const composed = composeValidators();
      composed(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should handle single validator', () => {
      const validator = validateRequest(z.object({
        body: z.object({ email: emailSchema }),
      }));

      req.body = { email: 'test@example.com' };

      const composed = composeValidators(validator);
      composed(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('Error details extraction', () => {
    it('should extract field-level errors from ZodError', () => {
      const schema = z.object({
        email: emailSchema,
        age: z.number().positive(),
        name: z.string().min(3),
      });

      try {
        schema.parse({
          email: 'invalid',
          age: -5,
          name: 'ab',
        });
      } catch (error) {
        const details = extractValidationErrors(error as any);
        expect(details.email).toBeDefined();
        expect(details.age).toBeDefined();
        expect(details.name).toBeDefined();
      }
    });

    it('should handle nested field errors', () => {
      const schema = z.object({
        user: z.object({
          email: emailSchema,
          profile: z.object({
            age: z.number().positive(),
          }),
        }),
      });

      try {
        schema.parse({
          user: {
            email: 'invalid',
            profile: { age: -5 },
          },
        });
      } catch (error) {
        const details = extractValidationErrors(error as any);
        expect(Object.keys(details).length).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle missing body', () => {
      const schema = z.object({
        body: z.object({
          email: emailSchema,
        }).optional(),
      });

      req.body = undefined;

      validateRequest(schema)(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should handle empty request', () => {
      const schema = z.object({
        body: z.object({}).optional(),
        params: z.object({}).optional(),
        query: z.object({}).optional(),
      });

      validateRequest(schema)(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should handle type transformation errors', () => {
      const schema = z.object({
        query: z.object({
          count: z.string().transform(Number).pipe(z.number()),
        }),
      });

      req.query = { count: 'not-a-number' };

      validateRequest(schema)(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });
});

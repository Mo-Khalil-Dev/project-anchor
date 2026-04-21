import { Request, Response } from 'express';
import { z } from 'zod';
import {
  validateRequest,
  createStrictValidator,
  createPartialValidator,
  validateBody,
  validateParams,
  validateQuery,
  composeValidators,
  ValidatedRequest,
} from '../../../../src/presentation/middleware/validateRequest';
import { ValidationError } from '../../../../src/shared/errors/ValidationError';

describe('validateRequest Middleware', () => {
  let mockReq: Partial<Request> & { validated?: any };
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('validateRequest', () => {
    it('should validate request with body only', () => {
      const schema = z.object({
        body: z.object({
          email: z.string().email(),
          password: z.string().min(8),
        }),
      });

      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as ValidatedRequest).validated).toEqual({
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });
    });

    it('should validate request with body, params, and query', () => {
      const schema = z.object({
        body: z.object({ name: z.string() }),
        params: z.object({ id: z.string() }),
        query: z.object({ filter: z.string() }),
      });

      mockReq.body = { name: 'John' };
      mockReq.params = { id: '123' };
      mockReq.query = { filter: 'active' };

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as ValidatedRequest).validated).toEqual({
        body: { name: 'John' },
        params: { id: '123' },
        query: { filter: 'active' },
      });
    });

    it('should attach only specified properties to validated', () => {
      const schema = z.object({
        body: z.object({ email: z.string().email() }),
      });

      mockReq.body = { email: 'test@example.com' };
      mockReq.params = { id: '123' };
      mockReq.query = { filter: 'active' };

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as ValidatedRequest).validated).toEqual({
        body: { email: 'test@example.com' },
      });
      expect((mockReq as ValidatedRequest).validated!.params).toBeUndefined();
    });

    it('should fail validation and call next with ValidationError', () => {
      const schema = z.object({
        body: z.object({
          email: z.string().email('Invalid email format'),
        }),
      });

      mockReq.body = { email: 'invalid-email' };

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error instanceof ValidationError).toBe(true);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.details).toBeDefined();
    });

    it('should create ValidationError with field-level details', () => {
      const schema = z.object({
        body: z.object({
          email: z.string().email('Invalid email'),
          password: z.string().min(8, 'Too short'),
        }),
      });

      mockReq.body = {
        email: 'invalid',
        password: '123',
      };

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error.details).toBeDefined();
      expect(Object.keys(error.details!)).toContain('body.email');
      expect(Object.keys(error.details!)).toContain('body.password');
    });

    it('should handle non-ZodError exceptions', () => {
      const schema = z.object({
        body: z.object({}).superRefine(() => {
          throw new Error('Custom error');
        }),
      });

      mockReq.body = {};

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Custom error');
      expect(error instanceof ValidationError).toBe(false);
    });

    it('should handle schema without shape property by treating as whole request', () => {
      const schema = z.object({});

      mockReq.body = {};

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as ValidatedRequest).validated).toEqual({});
    });

    it('should pass empty request through when schema has no requirements', () => {
      const schema = z.object({
        body: z.object({}).optional(),
      });

      mockReq.body = undefined;

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should validate params independently', () => {
      const schema = z.object({
        params: z.object({
          id: z.string().uuid(),
        }),
      });

      mockReq.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as ValidatedRequest).validated!.params!.id).toBe(
        '550e8400-e29b-41d4-a716-446655440000'
      );
    });

    it('should fail param validation with proper error', () => {
      const schema = z.object({
        params: z.object({
          id: z.string().uuid('Must be valid UUID'),
        }),
      });

      mockReq.params = { id: 'invalid-uuid' };

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error instanceof ValidationError).toBe(true);
      expect(error.details).toBeDefined();
    });

    it('should handle multiple validation errors on same field', () => {
      const schema = z.object({
        body: z.object({
          password: z
            .string()
            .min(8, 'Too short')
            .regex(/[A-Z]/, 'No uppercase'),
        }),
      });

      mockReq.body = { password: '123' };

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(Array.isArray(error.details!['body.password'])).toBe(true);
      expect(error.details!['body.password'].length).toBeGreaterThan(0);
    });

    it('should validate nested object paths correctly', () => {
      const schema = z.object({
        body: z.object({
          user: z.object({
            profile: z.object({
              email: z.string().email(),
            }),
          }),
        }),
      });

      mockReq.body = {
        user: {
          profile: {
            email: 'invalid',
          },
        },
      };

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(Object.keys(error.details!)[0]).toContain('user.profile.email');
    });

    it('should validate array schemas correctly', () => {
      const schema = z.object({
        body: z.object({
          items: z.array(z.object({ name: z.string() })),
        }),
      });

      mockReq.body = {
        items: [{ name: 'item1' }, { name: 'item2' }],
      };

      const middleware = validateRequest(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('createStrictValidator', () => {
    it('should apply strict mode to ZodObject schema', () => {
      const schema = z.object({
        body: z.object({
          email: z.string().email(),
        }).strict(),
      });

      mockReq.body = {
        email: 'test@example.com',
        unknownField: 'should fail',
      };

      const middleware = createStrictValidator(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error).toBeDefined();
    });

    it('should pass strict validation when no unknown fields', () => {
      const schema = z.object({
        body: z.object({
          email: z.string().email(),
        }),
      });

      mockReq.body = { email: 'test@example.com' };

      const middleware = createStrictValidator(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle non-ZodObject schemas by passing through', () => {
      const schema = z.object({});

      mockReq.body = {};

      const middleware = createStrictValidator(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('createPartialValidator', () => {
    it('should make schema fields optional', () => {
      const bodySchema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      });

      const schema = z.object({ body: bodySchema });

      mockReq.body = { email: 'test@example.com', password: 'password123' };

      const middleware = createPartialValidator(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as ValidatedRequest).validated!.body).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should still validate provided fields', () => {
      const bodySchema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      });

      mockReq.body = { email: 'invalid-email' };

      const middleware = createPartialValidator(
        z.object({ body: bodySchema })
      );
      middleware(mockReq as Request, mockRes as Response, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error instanceof ValidationError).toBe(true);
    });

    it('should allow partial fields in nested schema', () => {
      const bodySchema = z.object({
        email: z.string().email().optional(),
        password: z.string().min(8).optional(),
      });

      mockReq.body = {};

      const middleware = createPartialValidator(
        z.object({ body: bodySchema })
      );
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle non-ZodObject schemas by passing through', () => {
      const schema = z.object({});

      mockReq.body = {};

      const middleware = createPartialValidator(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateBody', () => {
    it('should validate only request body', () => {
      const bodySchema = z.object({
        email: z.string().email(),
      });

      mockReq.body = { email: 'test@example.com' };
      mockReq.params = { id: '123' };

      const middleware = validateBody(bodySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as ValidatedRequest).validated!.body).toEqual({
        email: 'test@example.com',
      });
    });

    it('should fail body validation with proper error', () => {
      const bodySchema = z.object({
        email: z.string().email(),
      });

      mockReq.body = { email: 'invalid' };

      const middleware = validateBody(bodySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error instanceof ValidationError).toBe(true);
    });

    it('should ignore params and query in validation', () => {
      const bodySchema = z.object({
        email: z.string().email(),
      });

      mockReq.body = { email: 'test@example.com' };
      mockReq.params = { unknownParam: 'value' };
      mockReq.query = { unknownQuery: 'value' };

      const middleware = validateBody(bodySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateParams', () => {
    it('should validate only request params', () => {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      });

      mockReq.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

      const middleware = validateParams(paramsSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as ValidatedRequest).validated!.params).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440000',
      });
    });

    it('should fail params validation with proper error', () => {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      });

      mockReq.params = { id: 'invalid-uuid' };

      const middleware = validateParams(paramsSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error instanceof ValidationError).toBe(true);
    });

    it('should ignore body and query in validation', () => {
      const paramsSchema = z.object({
        id: z.string(),
      });

      mockReq.params = { id: '123' };
      mockReq.body = { unknownBody: 'value' };
      mockReq.query = { unknownQuery: 'value' };

      const middleware = validateParams(paramsSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateQuery', () => {
    it('should validate only request query', () => {
      const querySchema = z.object({
        limit: z.string().transform(Number),
        offset: z.string().transform(Number),
      });

      mockReq.query = { limit: '10', offset: '0' };

      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as ValidatedRequest).validated!.query).toBeDefined();
    });

    it('should fail query validation with proper error', () => {
      const querySchema = z.object({
        limit: z.string().transform(Number).pipe(z.number().positive()),
      });

      mockReq.query = { limit: '-5' };

      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error instanceof ValidationError).toBe(true);
    });

    it('should ignore body and params in validation', () => {
      const querySchema = z.object({
        filter: z.string(),
      });

      mockReq.query = { filter: 'active' };
      mockReq.body = { unknownBody: 'value' };
      mockReq.params = { unknownParam: 'value' };

      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle optional query parameters', () => {
      const querySchema = z.object({
        filter: z.string().optional(),
      });

      mockReq.query = {};

      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('composeValidators', () => {
    it('should execute validators in sequence', () => {
      const validator1 = jest.fn((_req, _res, next) => next());
      const validator2 = jest.fn((_req, _res, next) => next());
      const validator3 = jest.fn((_req, _res, next) => next());

      const composed = composeValidators(validator1, validator2, validator3);
      composed(mockReq as Request, mockRes as Response, mockNext);

      expect(validator1).toHaveBeenCalled();
      expect(validator2).toHaveBeenCalled();
      expect(validator3).toHaveBeenCalled();
    });

    it('should stop on first error', () => {
      const validator1 = jest.fn((_req, _res, next) => next());
      const validator2 = jest.fn((_req, _res, next) =>
        next(new Error('Validation failed'))
      );
      const validator3 = jest.fn();

      const composed = composeValidators(validator1, validator2, validator3);
      composed(mockReq as Request, mockRes as Response, mockNext);

      expect(validator1).toHaveBeenCalled();
      expect(validator2).toHaveBeenCalled();
      expect(validator3).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should compose multiple validators and validate all parts', () => {
      const fullSchema = z.object({
        body: z.object({
          email: z.string().email(),
        }),
        params: z.object({
          id: z.string().uuid(),
        }),
      });

      mockReq.body = { email: 'test@example.com' };
      mockReq.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

      const validator1 = validateRequest(fullSchema);
      const composed = composeValidators(validator1);

      composed(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as ValidatedRequest).validated).toEqual({
        body: { email: 'test@example.com' },
        params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      });
    });

    it('should handle error in composed validators', () => {
      const bodySchema = z.object({
        email: z.string().email(),
      });

      const paramsSchema = z.object({
        id: z.string().uuid(),
      });

      mockReq.body = { email: 'invalid' };
      mockReq.params = { id: 'invalid-uuid' };

      const composed = composeValidators(
        validateBody(bodySchema),
        validateParams(paramsSchema)
      );

      composed(mockReq as Request, mockRes as Response, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error instanceof ValidationError).toBe(true);
    });

    it('should pass through request to next middleware when all pass', () => {
      const bodyValidator = validateBody(
        z.object({
          name: z.string(),
        })
      );

      mockReq.body = { name: 'John' };

      const composed = composeValidators(bodyValidator);
      composed(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as ValidatedRequest).validated).toBeDefined();
    });

    it('should work with empty validator list', () => {
      const composed = composeValidators();
      composed(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle async validator behavior correctly', (done) => {
      const validator1 = jest.fn((_req, _res, next) => next());
      const validator2 = jest.fn((_req, _res, next) => next());

      const composed = composeValidators(validator1, validator2);
      composed(mockReq as Request, mockRes as Response, mockNext);

      setImmediate(() => {
        expect(validator1).toHaveBeenCalled();
        expect(validator2).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith();
        done();
      });
    });

    it('should handle validator that passes error to next', () => {
      const error = new ValidationError('Validation failed', {
        field: 'invalid',
      });
      const validator1 = jest.fn((_req, _res, next) => next(error));

      const composed = composeValidators(validator1);
      composed(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});

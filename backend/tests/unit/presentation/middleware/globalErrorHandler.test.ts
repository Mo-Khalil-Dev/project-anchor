import { Request, Response, NextFunction } from 'express';
import { globalErrorHandler, asyncHandler } from '../../../../src/features/shared/middleware/globalErrorHandler';
import { DomainError } from '../../../../src/features/shared/errors/DomainError';
import { ApplicationError } from '../../../../src/features/shared/errors/ApplicationError';
import { ValidationError } from '../../../../src/features/shared/errors/ValidationError';
import type { ILogger } from '../../../../src/features/shared/logging';

const mockLogger: ILogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

describe('Global Error Handler Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Partial<NextFunction>;
  let handler: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      path: '/test-route',
      method: 'POST',
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
    handler = globalErrorHandler(mockLogger);
  });

  describe('DomainError handling', () => {
    it('should return 400 with domain error details', () => {
      const error = new DomainError(
        'INVALID_CUSTOMER_ID',
        'Customer ID is required'
      );

      handler(error, req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INVALID_CUSTOMER_ID',
            message: 'Customer ID is required',
          }),
        })
      );
    });

    it('should include error details if provided', () => {
      const error = new DomainError(
        'INVALID_INCOME',
        'Income validation failed',
        { minIncome: 0, received: -100 }
      );

      handler(error, req as Request, res as Response, next as NextFunction);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: { minIncome: 0, received: -100 },
          }),
        })
      );
    });

    it('should include traceId for debugging', () => {
      const error = new DomainError('TEST_ERROR', 'Test message');

      handler(error, req as Request, res as Response, next as NextFunction);

      const callArg = (res.json as jest.Mock).mock.calls[0][0];
      expect(callArg.error.traceId).toBeDefined();
      expect(typeof callArg.error.traceId).toBe('string');
    });

    it('should include timestamp', () => {
      const error = new DomainError('TEST_ERROR', 'Test message');

      handler(error, req as Request, res as Response, next as NextFunction);

      const callArg = (res.json as jest.Mock).mock.calls[0][0];
      expect(callArg.error.timestamp).toBeDefined();
      expect(new Date(callArg.error.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('ValidationError handling', () => {
    it('should return 400 with validation error details', () => {
      const error = new ValidationError('Request validation failed', {
        email: 'Invalid email format',
        age: 'Must be >= 18',
      });

      handler(error, req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: {
              email: 'Invalid email format',
              age: 'Must be >= 18',
            },
          }),
        })
      );
    });
  });

  describe('ApplicationError handling', () => {
    it('should return custom status code for application errors', () => {
      const error = new ApplicationError(
        'USER_NOT_FOUND',
        'User not found',
        404
      );

      handler(error, req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          }),
        })
      );
    });

    it('should handle 4xx errors as warnings', () => {
      const error = new ApplicationError(
        'CONFLICT',
        'Email already exists',
        409
      );

      handler(error, req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('should handle 5xx errors as errors', () => {
      const error = new ApplicationError(
        'DATABASE_ERROR',
        'Database connection failed',
        500
      );

      handler(error, req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should default to 500 if statusCode not provided', () => {
      const error = new ApplicationError(
        'UNKNOWN_ERROR',
        'Something went wrong'
      );

      handler(error, req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Standard Error handling', () => {
    it('should return 500 for standard Error objects', () => {
      const error = new Error('Something went wrong');

      handler(error, req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
          }),
        })
      );
    });

    it('should include error name for debugging', () => {
      const error = new Error('Database connection failed');
      error.name = 'DatabaseError';

      handler(error, req as Request, res as Response, next as NextFunction);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR',
          }),
        })
      );
    });
  });

  describe('Unknown error types', () => {
    it('should handle non-Error objects gracefully', () => {
      const unknownError = { message: 'Some error', custom: 'field' };

      handler(unknownError, req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
          }),
        })
      );
    });

    it('should handle null/undefined errors', () => {
      handler(null, req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle string errors', () => {
      handler('Something broke', req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Request context', () => {
    it('should capture request path and method', () => {
      const error = new DomainError('TEST', 'Test error');

      handler(error, req as Request, res as Response, next as NextFunction);

      const callArg = (res.json as jest.Mock).mock.calls[0][0];
      expect(callArg.error.traceId).toBeDefined();
    });

    it('should work with different HTTP methods', () => {
      const error = new DomainError('TEST', 'Test error');

      for (const method of ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']) {
        req.method = method;
        handler(error, req as Request, res as Response, next as NextFunction);
        expect(res.status).toHaveBeenCalledWith(400);
      }
    });

    it('should work with different paths', () => {
      const error = new DomainError('TEST', 'Test error');

      for (const path of ['/users', '/assessments', '/payments', '/admin']) {
        const testReq = { ...req, path };
        handler(error, testReq as Request, res as Response, next as NextFunction);
        expect(res.status).toHaveBeenCalledWith(400);
      }
    });
  });

  describe('Response format consistency', () => {
    it('should always return success: false', () => {
      const errors = [
        new DomainError('E1', 'M1'),
        new ValidationError('E2'),
        new ApplicationError('E3', 'M3', 400),
        new Error('E4'),
      ];

      for (const error of errors) {
        handler(error, req as Request, res as Response, next as NextFunction);

        const callArg = (res.json as jest.Mock).mock.calls[
          (res.json as jest.Mock).mock.calls.length - 1
        ][0];
        expect(callArg.success).toBe(false);
      }
    });

    it('should always include error code, message, and traceId', () => {
      const errors = [
        new DomainError('CODE1', 'Message 1'),
        new ValidationError('Message 2'),
        new ApplicationError('CODE3', 'Message 3', 400),
      ];

      for (const error of errors) {
        handler(error, req as Request, res as Response, next as NextFunction);

        const callArg = (res.json as jest.Mock).mock.calls[
          (res.json as jest.Mock).mock.calls.length - 1
        ][0];
        expect(callArg.error.code).toBeDefined();
        expect(callArg.error.message).toBeDefined();
        expect(callArg.error.traceId).toBeDefined();
        expect(callArg.error.timestamp).toBeDefined();
      }
    });
  });
});

describe('Async Handler Wrapper', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Partial<NextFunction>;

  beforeEach(() => {
    req = { path: '/test', method: 'GET' };
    res = { json: jest.fn().mockReturnThis() };
    next = jest.fn();
  });

  it('should catch async errors and pass to next()', async () => {
    const asyncFn = jest.fn(async () => {
      throw new Error('Async error');
    });

    const wrapped = asyncHandler(asyncFn);
    wrapped(req as Request, res as Response, next as NextFunction);

    // Wait for promise to resolve
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(asyncFn).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should allow async function to complete normally', async () => {
    const asyncFn = jest.fn(async (_req, res) => {
      res.json({ success: true });
    });

    const wrapped = asyncHandler(asyncFn);
    wrapped(req as Request, res as Response, next as NextFunction);

    // Wait for promise to resolve
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(asyncFn).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true });
    expect(next).not.toHaveBeenCalled();
  });

  it('should pass request, response, and next to async function', async () => {
    const asyncFn = jest.fn(async (r, s, n) => {
      expect(r).toBe(req);
      expect(s).toBe(res);
      expect(n).toBe(next);
    });

    const wrapped = asyncHandler(asyncFn);
    wrapped(req as Request, res as Response, next as NextFunction);

    // Wait for promise to resolve
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(asyncFn).toHaveBeenCalled();
  });
});

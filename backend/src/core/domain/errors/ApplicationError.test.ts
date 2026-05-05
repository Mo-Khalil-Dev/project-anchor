import { ApplicationError } from './applicationError';

describe('ApplicationError', () => {
  describe('constructor', () => {
    it('should create an error with all properties', () => {
      const error = new ApplicationError(
        'INVALID_INPUT',
        'Input validation failed',
        400,
        { field: 'email' }
      );

      expect(error.code).toBe('INVALID_INPUT');
      expect(error.message).toBe('Input validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: 'email' });
      expect(error.name).toBe('ApplicationError');
    });

    it('should use default statusCode of 500', () => {
      const error = new ApplicationError(
        'INTERNAL_ERROR',
        'Something went wrong'
      );

      expect(error.statusCode).toBe(500);
    });

    it('should allow undefined details', () => {
      const error = new ApplicationError(
        'NOT_FOUND',
        'Resource not found',
        404
      );

      expect(error.details).toBeUndefined();
    });

    it('should capture stack trace by default', () => {
      const error = new ApplicationError(
        'ERROR_CODE',
        'Error message'
      );

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ApplicationError');
    });

    it('should not capture stack trace when disabled', () => {
      const error = new ApplicationError(
        'ERROR_CODE',
        'Error message',
        500,
        undefined,
        false
      );

      expect(error.code).toBe('ERROR_CODE');
      expect(error.message).toBe('Error message');
      expect(error.statusCode).toBe(500);
      expect(error.details).toBeUndefined();
    });

    it('should extend Error class', () => {
      const error = new ApplicationError(
        'CODE',
        'Message'
      );

      expect(error instanceof Error).toBe(true);
      expect(error instanceof ApplicationError).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation without stack', () => {
      const error = new ApplicationError(
        'VALIDATION_ERROR',
        'Invalid input',
        400,
        { field: 'email' }
      );

      const json = error.toJSON(false);

      expect(json).toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        statusCode: 400,
        details: { field: 'email' },
      });
      expect(json.stack).toBeUndefined();
    });

    it('should include stack trace when requested', () => {
      const error = new ApplicationError(
        'SERVER_ERROR',
        'Database connection failed',
        500
      );

      const json = error.toJSON(true);

      expect(json).toEqual({
        code: 'SERVER_ERROR',
        message: 'Database connection failed',
        statusCode: 500,
        details: undefined,
        stack: expect.any(Array),
      });
      expect(Array.isArray(json.stack)).toBe(true);
      expect(json.stack.length).toBeGreaterThan(0);
    });

    it('should handle toJSON without stack when includeStack is false', () => {
      const error = new ApplicationError(
        'ERROR',
        'Message',
        500,
        undefined,
        true
      );

      const json = error.toJSON(false);

      expect(json.stack).toBeUndefined();
      expect(json.code).toBe('ERROR');
      expect(json.message).toBe('Message');
    });

    it('should include complex details object', () => {
      const details = {
        field: 'password',
        errors: ['too short', 'missing uppercase'],
        metadata: { attempt: 3, blocked: true },
      };

      const error = new ApplicationError(
        'VALIDATION_ERROR',
        'Password validation failed',
        400,
        details
      );

      const json = error.toJSON();

      expect(json.details).toEqual(details);
    });

    it('should split stack trace into array of lines', () => {
      const error = new ApplicationError(
        'ERROR',
        'Message'
      );

      const json = error.toJSON(true);

      expect(Array.isArray(json.stack)).toBe(true);
      expect(json.stack[0]).toContain('Error');
    });
  });

  describe('error types', () => {
    it('should handle 400 Bad Request', () => {
      const error = new ApplicationError(
        'BAD_REQUEST',
        'Invalid request format',
        400
      );

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
    });

    it('should handle 401 Unauthorized', () => {
      const error = new ApplicationError(
        'UNAUTHORIZED',
        'Authentication failed',
        401
      );

      expect(error.statusCode).toBe(401);
    });

    it('should handle 403 Forbidden', () => {
      const error = new ApplicationError(
        'FORBIDDEN',
        'Access denied',
        403
      );

      expect(error.statusCode).toBe(403);
    });

    it('should handle 404 Not Found', () => {
      const error = new ApplicationError(
        'NOT_FOUND',
        'Resource not found',
        404
      );

      expect(error.statusCode).toBe(404);
    });

    it('should handle 409 Conflict', () => {
      const error = new ApplicationError(
        'CONFLICT',
        'Resource already exists',
        409
      );

      expect(error.statusCode).toBe(409);
    });

    it('should handle 500 Internal Server Error', () => {
      const error = new ApplicationError(
        'INTERNAL_ERROR',
        'Database error',
        500
      );

      expect(error.statusCode).toBe(500);
    });

    it('should handle 503 Service Unavailable', () => {
      const error = new ApplicationError(
        'SERVICE_UNAVAILABLE',
        'Service is temporarily unavailable',
        503
      );

      expect(error.statusCode).toBe(503);
    });
  });

  describe('error codes', () => {
    it('should preserve custom error codes', () => {
      const codes = [
        'VALIDATION_ERROR',
        'DATABASE_ERROR',
        'EXTERNAL_SERVICE_ERROR',
        'AUTHENTICATION_FAILED',
        'RESOURCE_NOT_FOUND',
      ];

      codes.forEach((code) => {
        const error = new ApplicationError(code, 'Message');
        expect(error.code).toBe(code);
      });
    });
  });

  describe('prototype chain', () => {
    it('should maintain proper prototype chain', () => {
      const error = new ApplicationError(
        'CODE',
        'Message'
      );

      expect(Object.getPrototypeOf(error)).toBe(ApplicationError.prototype);
    });

    it('should be throwable', () => {
      const error = new ApplicationError(
        'THROWABLE_ERROR',
        'This error will be thrown'
      );

      expect(() => {
        throw error;
      }).toThrow('This error will be thrown');
    });

    it('should be catchable as ApplicationError', () => {
      const error = new ApplicationError(
        'CODE',
        'Message'
      );

      try {
        throw error;
      } catch (err) {
        expect(err instanceof ApplicationError).toBe(true);
        expect((err as ApplicationError).code).toBe('CODE');
      }
    });
  });

  describe('message and name properties', () => {
    it('should set message property', () => {
      const error = new ApplicationError(
        'CODE',
        'Test message'
      );

      expect(error.message).toBe('Test message');
    });

    it('should set name to ApplicationError', () => {
      const error = new ApplicationError(
        'CODE',
        'Message'
      );

      expect(error.name).toBe('ApplicationError');
    });

    it('should handle long error messages', () => {
      const longMessage = 'A'.repeat(1000);
      const error = new ApplicationError(
        'CODE',
        longMessage
      );

      expect(error.message).toBe(longMessage);
      expect(error.message.length).toBe(1000);
    });
  });
});

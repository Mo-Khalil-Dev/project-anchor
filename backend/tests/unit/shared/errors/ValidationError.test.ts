import { ValidationError } from '../../../../src/shared/errors/ValidationError';
import { ApplicationError } from '../../../../src/shared/errors/ApplicationError';

describe('ValidationError', () => {
  describe('constructor', () => {
    it('should create validation error with message', () => {
      const error = new ValidationError('Email is required');

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Email is required');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('should create validation error with details', () => {
      const details = {
        email: 'Invalid email format',
        password: 'Password is too short',
      };

      const error = new ValidationError(
        'Form validation failed',
        details
      );

      expect(error.details).toEqual(details);
      expect(error.statusCode).toBe(400);
    });

    it('should extend ApplicationError', () => {
      const error = new ValidationError('Invalid input');

      expect(error instanceof ApplicationError).toBe(true);
      expect(error instanceof ValidationError).toBe(true);
    });

    it('should always set statusCode to 400', () => {
      const error = new ValidationError('Invalid request');

      expect(error.statusCode).toBe(400);
    });

    it('should always set code to VALIDATION_ERROR', () => {
      const error = new ValidationError('Validation failed');

      expect(error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('fromZod', () => {
    it('should create ValidationError from Zod error with single issue', () => {
      const zodError = {
        issues: [
          {
            path: ['email'],
            message: 'Invalid email',
          },
        ],
      };

      const error = ValidationError.fromZod(zodError);

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Request validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({
        email: ['Invalid email'],
      });
    });

    it('should create ValidationError from Zod error with multiple issues on same field', () => {
      const zodError = {
        issues: [
          {
            path: ['password'],
            message: 'Too short',
          },
          {
            path: ['password'],
            message: 'Must contain uppercase',
          },
        ],
      };

      const error = ValidationError.fromZod(zodError);

      expect(error.details).toEqual({
        password: ['Too short', 'Must contain uppercase'],
      });
    });

    it('should create ValidationError from Zod error with multiple fields', () => {
      const zodError = {
        issues: [
          {
            path: ['email'],
            message: 'Invalid format',
          },
          {
            path: ['name'],
            message: 'Required',
          },
          {
            path: ['password'],
            message: 'Too short',
          },
        ],
      };

      const error = ValidationError.fromZod(zodError);

      expect(error.details).toEqual({
        email: ['Invalid format'],
        name: ['Required'],
        password: ['Too short'],
      });
    });

    it('should handle nested field paths', () => {
      const zodError = {
        issues: [
          {
            path: ['user', 'profile', 'email'],
            message: 'Invalid email',
          },
        ],
      };

      const error = ValidationError.fromZod(zodError);

      expect(error.details).toEqual({
        'user.profile.email': ['Invalid email'],
      });
    });

    it('should handle empty issues array', () => {
      const zodError = {
        issues: [],
      };

      const error = ValidationError.fromZod(zodError);

      expect(error.details).toEqual({});
    });

    it('should handle Zod error with array fields', () => {
      const zodError = {
        issues: [
          {
            path: ['items', 0, 'name'],
            message: 'Name is required',
          },
          {
            path: ['items', 1, 'name'],
            message: 'Name is required',
          },
        ],
      };

      const error = ValidationError.fromZod(zodError);

      expect(error.details).toEqual({
        'items.0.name': ['Name is required'],
        'items.1.name': ['Name is required'],
      });
    });

    it('should handle Zod error with complex messages', () => {
      const zodError = {
        issues: [
          {
            path: ['email'],
            message: 'String must be a valid email',
          },
          {
            path: ['age'],
            message: 'Number must be greater than or equal to 18',
          },
        ],
      };

      const error = ValidationError.fromZod(zodError);

      expect(error.details).toEqual({
        email: ['String must be a valid email'],
        age: ['Number must be greater than or equal to 18'],
      });
    });

    it('should preserve message order when multiple errors on same field', () => {
      const zodError = {
        issues: [
          {
            path: ['field'],
            message: 'First error',
          },
          {
            path: ['field'],
            message: 'Second error',
          },
          {
            path: ['field'],
            message: 'Third error',
          },
        ],
      };

      const error = ValidationError.fromZod(zodError);

      expect(error.details!.field).toEqual([
        'First error',
        'Second error',
        'Third error',
      ]);
    });
  });

  describe('serialization', () => {
    it('should serialize to JSON without stack by default', () => {
      const details = { email: 'Invalid email' };
      const error = new ValidationError('Validation failed', details);

      const json = error.toJSON();

      expect(json).toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        statusCode: 400,
        details,
      });
    });

    it('should serialize to JSON with stack when requested', () => {
      const error = new ValidationError('Validation failed');

      const json = error.toJSON(true);

      expect(json.stack).toBeDefined();
      expect(Array.isArray(json.stack)).toBe(true);
    });
  });

  describe('inheritance', () => {
    it('should be throwable as ValidationError', () => {
      const error = new ValidationError('Invalid input');

      expect(() => {
        throw error;
      }).toThrow('Invalid input');
    });

    it('should be catchable as ValidationError', () => {
      const error = new ValidationError('Invalid input');

      try {
        throw error;
      } catch (err) {
        expect(err instanceof ValidationError).toBe(true);
        expect((err as ValidationError).code).toBe('VALIDATION_ERROR');
      }
    });

    it('should be catchable as ApplicationError', () => {
      const error = new ValidationError('Invalid input');

      try {
        throw error;
      } catch (err) {
        expect(err instanceof ApplicationError).toBe(true);
      }
    });

    it('should be catchable as Error', () => {
      const error = new ValidationError('Invalid input');

      try {
        throw error;
      } catch (err) {
        expect(err instanceof Error).toBe(true);
      }
    });
  });

  describe('prototype chain', () => {
    it('should maintain proper prototype chain', () => {
      const error = new ValidationError('Test');

      expect(Object.getPrototypeOf(error)).toBe(
        ValidationError.prototype
      );
    });
  });

  describe('common validation scenarios', () => {
    it('should handle required field error', () => {
      const error = new ValidationError('Validation failed', {
        email: 'Email is required',
      });

      expect(error.details).toEqual({
        email: 'Email is required',
      });
    });

    it('should handle multiple field errors', () => {
      const error = new ValidationError('Validation failed', {
        email: 'Invalid email format',
        password: 'Password is too short',
        name: 'Name is required',
      });

      expect(Object.keys(error.details!)).toHaveLength(3);
    });

    it('should handle array of errors per field', () => {
      const error = new ValidationError('Validation failed', {
        password: ['Must be at least 8 characters', 'Must contain uppercase'],
      });

      expect(error.details).toEqual({
        password: ['Must be at least 8 characters', 'Must contain uppercase'],
      });
    });
  });
});

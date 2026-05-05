import { ValidationError } from './validationError';
import { ApplicationError } from './applicationError';

describe('ValidationError', () => {
  describe('constructor', () => {
    it('should create validation error with message', () => {
      const error = new ValidationError('Email is required');

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Email is required');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
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
    });
  });

  describe('inheritance', () => {
    it('should extend ApplicationError', () => {
      const error = new ValidationError('Invalid input');

      expect(error instanceof ApplicationError).toBe(true);
      expect(error instanceof ValidationError).toBe(true);
    });
  });
});

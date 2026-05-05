import { Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from './validateRequest';
import { ValidationError } from '../../../core/domain/errors/validationError';

describe('validateRequest Middleware', () => {
  it('validates body successfully', () => {
    const req = {
      body: { email: 'test@example.com' },
      params: {},
      query: {},
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn();
    const schema = z.object({
      body: z.object({ email: z.string().email() }),
    });

    validateRequest(schema)(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('returns ValidationError on invalid payload', () => {
    const req = {
      body: { email: 'invalid' },
      params: {},
      query: {},
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn();
    const schema = z.object({
      body: z.object({ email: z.string().email() }),
    });

    validateRequest(schema)(req, res, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
  });
});

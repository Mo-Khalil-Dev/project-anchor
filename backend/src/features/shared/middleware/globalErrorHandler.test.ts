import { Request, Response, NextFunction } from 'express';
import { globalErrorHandler, asyncHandler } from './globalErrorHandler';
import { DomainError } from '../../../core/domain/errors/domainError';
import type { ILogger } from '../logging';

const mockLogger: ILogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

describe('Global Error Handler Middleware', () => {
  it('returns 400 for DomainError', () => {
    const req = { path: '/test-route', method: 'POST' } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    const next = jest.fn() as unknown as NextFunction;
    const handler = globalErrorHandler(mockLogger);

    handler(new DomainError('INVALID', 'invalid'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('Async Handler Wrapper', () => {
  it('catches async errors and passes to next', async () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = jest.fn() as unknown as NextFunction;
    const wrapped = asyncHandler(async () => {
      throw new Error('boom');
    });

    wrapped(req, res, next);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

import { createReferenceDataRouter } from './router';

jest.mock(
  '@/features/customer/infrastructure/repositories/PrismaUserRepository',
  () => ({
    PrismaUserRepository: jest.fn().mockImplementation(() => ({})),
  })
);

jest.mock(
  '@/features/customer/infrastructure/repositories/PrismaCustomerRepository',
  () => ({
    PrismaCustomerRepository: jest.fn().mockImplementation(() => ({})),
  })
);

jest.mock(
  '@/features/bankConnection/infrastructure/repositories/PrismaBankConnectionRepository',
  () => ({
    PrismaBankConnectionRepository: jest.fn().mockImplementation(() => ({})),
  })
);

jest.mock(
  '@/features/assessment/infrastructure/repositories/prisma/PrismaAssessmentRepository',
  () => ({
    PrismaAssessmentRepository: jest.fn().mockImplementation(() => ({})),
  })
);

jest.mock(
  '@/features/payment/infrastructure/repositories/prisma/PrismaMandateRepository',
  () => ({
    PrismaMandateRepository: jest.fn().mockImplementation(() => ({})),
  })
);

describe('createReferenceDataRouter', () => {
  it('registers a protected GET route on root path', () => {
    const logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      child: jest.fn().mockReturnThis(),
    } as any;
    const authenticateRequest = jest.fn((_req, _res, next) => next()) as any;

    const router = createReferenceDataRouter(logger, authenticateRequest);

    const rootGetRoute = (router as any).stack.find(
      (layer: any) => layer.route?.path === '/' && layer.route?.methods?.get
    );
    expect(rootGetRoute).toBeDefined();
  });
});

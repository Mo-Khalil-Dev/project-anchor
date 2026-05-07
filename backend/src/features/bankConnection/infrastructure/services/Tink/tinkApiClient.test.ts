/**
 * Example integration test using MSW mocks
 * Run: npm test -- tinkApiClient.test.ts
 */
import { TinkApiClient } from '@/features/bankConnection/infrastructure/services/Tink/TinkApiClient';

describe('TinkApiClient with MSW mocks', () => {
  let service: TinkApiClient;

  beforeEach(() => {
    const mockConfig = {
      tink: {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        environment: 'sandbox' as const,
        apiBaseUrl: 'https://api.tink.com',
        expensesApiBaseUrl: 'https://api.tink.com/risk/v1',
      },
      server: {
        port: 3000,
        redirectUrl: 'http://localhost:3000/callback',
      },
    };

    const mockLogger: any = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      child: jest.fn(function () {
        return this;
      }),
    };

    service = new TinkApiClient(mockConfig as any, mockLogger);
  });

  describe('generateAuthorizationUrl', () => {
    it('should generate correct authorization URL', () => {
      const url = service.generateAuthorizationUrl('test-state', 'customer-123');

      expect(url).toContain('https://link.tink.com/1.0/expense-check/create-report');
      expect(url).toContain('state=test-state');
      expect(url).toContain('market=GB');
    });
  });
});

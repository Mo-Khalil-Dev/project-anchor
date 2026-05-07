/**
 * Example integration test using MSW mocks
 * Run: npm test -- tink-oauth.integration.test.ts
 */
import { TinkOAuthService } from './TinkOAuthService';

describe('TinkOAuthService with MSW mocks', () => {
  let service: TinkOAuthService;

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
      child: jest.fn(function() { return this; }),
    };

    service = new TinkOAuthService(mockConfig as any, mockLogger);
  });

  describe('getAccessToken', () => {
    it('should fetch access token from mocked Tink API', async () => {
      const result = await service.getAccessToken();

      expect(result.isOk).toBe(true);
      expect(result.getOrThrow()).toBe('mock_access_token_12345');
    });

    it('should cache token on subsequent calls', async () => {
      const result1 = await service.getAccessToken();
      const result2 = await service.getAccessToken();

      expect(result1.getOrThrow()).toBe(result2.getOrThrow());
    });
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

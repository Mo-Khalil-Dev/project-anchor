import { NextStepService } from './NextStepService';

describe('NextStepService', () => {
  const service = new NextStepService();

  describe('determineNextStep', () => {
    // Journey: Account Setup
    it('returns ACCOUNT_SETUP when account setup is missing', () => {
      const result = service.determineNextStep(null, null, null, null);
      expect(result).toBe('ACCOUNT_SETUP');
    });

    it('returns ACCOUNT_SETUP_LOADING when account setup in progress', () => {
      const accountSetup = { status: 'IN_PROGRESS' };
      const result = service.determineNextStep(accountSetup, null, null, null);
      expect(result).toBe('ACCOUNT_SETUP_LOADING');
    });

    // Journey: Bank Connection
    it('returns BANK_CONNECTION when account setup complete but bank connection missing', () => {
      const accountSetup = { status: 'COMPLETED' };
      const result = service.determineNextStep(accountSetup, null, null, null);
      expect(result).toBe('BANK_CONNECTION');
    });

    it('returns BANK_CONNECTION when bank connection in progress', () => {
      const accountSetup = { status: 'COMPLETED' };
      const bankConnection = { status: 'IN_PROGRESS' };
      const result = service.determineNextStep(accountSetup, bankConnection, null, null);
      expect(result).toBe('BANK_CONNECTION');
    });

    // Journey: Assessment
    it('returns ASSESSMENT when bank connection complete but assessment missing', () => {
      const accountSetup = { status: 'COMPLETED' };
      const bankConnection = { status: 'CONNECTED' };
      const result = service.determineNextStep(accountSetup, bankConnection, null, null);
      expect(result).toBe('ASSESSMENT');
    });

    it('returns ASSESSMENT_CALCULATING when assessment pending', () => {
      const accountSetup = { status: 'COMPLETED' };
      const bankConnection = { status: 'CONNECTED' };
      const assessment = { status: 'PENDING' };
      const result = service.determineNextStep(accountSetup, bankConnection, assessment, null);
      expect(result).toBe('ASSESSMENT_CALCULATING');
    });

    it('returns ASSESSMENT_CALCULATING when assessment in progress', () => {
      const accountSetup = { status: 'COMPLETED' };
      const bankConnection = { status: 'CONNECTED' };
      const assessment = { status: 'IN_PROGRESS' };
      const result = service.determineNextStep(accountSetup, bankConnection, assessment, null);
      expect(result).toBe('ASSESSMENT_CALCULATING');
    });

    // Journey: Mandate
    it('returns DIRECT_DEBIT_SETUP when assessment complete but mandate missing', () => {
      const accountSetup = { status: 'COMPLETED' };
      const bankConnection = { status: 'CONNECTED' };
      const assessment = { status: 'COMPLETED' };
      const result = service.determineNextStep(accountSetup, bankConnection, assessment, null);
      expect(result).toBe('DIRECT_DEBIT_SETUP');
    });

    it('returns DIRECT_DEBIT_PENDING when mandate pending', () => {
      const accountSetup = { status: 'COMPLETED' };
      const bankConnection = { status: 'CONNECTED' };
      const assessment = { status: 'COMPLETED' };
      const mandate = { status: 'PENDING' };
      const result = service.determineNextStep(accountSetup, bankConnection, assessment, mandate);
      expect(result).toBe('DIRECT_DEBIT_PENDING');
    });

    it('returns PAYMENT_PLANS when mandate is created', () => {
      const accountSetup = { status: 'COMPLETED' };
      const bankConnection = { status: 'CONNECTED' };
      const assessment = { status: 'COMPLETED' };
      const mandate = { status: 'CREATED' };
      const result = service.determineNextStep(accountSetup, bankConnection, assessment, mandate);
      expect(result).toBe('PAYMENT_PLANS');
    });

    it('returns PAYMENT_PLANS when mandate is active', () => {
      const accountSetup = { status: 'COMPLETED' };
      const bankConnection = { status: 'CONNECTED' };
      const assessment = { status: 'COMPLETED' };
      const mandate = { status: 'ACTIVE' };
      const result = service.determineNextStep(accountSetup, bankConnection, assessment, mandate);
      expect(result).toBe('PAYMENT_PLANS');
    });

    // Edge cases
    it('returns COMPLETE when all steps are completed', () => {
      const accountSetup = { status: 'COMPLETED' };
      const bankConnection = { status: 'CONNECTED' };
      const assessment = { status: 'COMPLETED' };
      const mandate = { status: 'FAILED' };
      const result = service.determineNextStep(accountSetup, bankConnection, assessment, mandate);
      expect(result).toBe('COMPLETE');
    });

    it('returns COMPLETE when assessment status is unknown', () => {
      const accountSetup = { status: 'COMPLETED' };
      const bankConnection = { status: 'CONNECTED' };
      const assessment = { status: 'UNKNOWN' };
      const mandate = { status: 'ACTIVE' };
      const result = service.determineNextStep(accountSetup, bankConnection, assessment, mandate);
      expect(result).toBe('COMPLETE');
    });

    it('ignores mandate when assessment is missing', () => {
      const accountSetup = { status: 'COMPLETED' };
      const bankConnection = { status: 'CONNECTED' };
      const mandate = { status: 'ACTIVE' };
      const result = service.determineNextStep(accountSetup, bankConnection, null, mandate);
      expect(result).toBe('ASSESSMENT');
    });

    it('ignores mandate when assessment is not complete', () => {
      const accountSetup = { status: 'COMPLETED' };
      const bankConnection = { status: 'CONNECTED' };
      const assessment = { status: 'PENDING' };
      const mandate = { status: 'ACTIVE' };
      const result = service.determineNextStep(accountSetup, bankConnection, assessment, mandate);
      expect(result).toBe('ASSESSMENT_CALCULATING');
    });
  });
});

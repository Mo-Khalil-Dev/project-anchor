import type { NextStep } from '../useCases/GetReferenceDataUseCase.dto';

export class NextStepService {
  determineNextStep(
    accountSetup: any,
    bankConnection: any,
    assessment: any,
    mandate: any
  ): NextStep {
    // Step 1: Check account setup
    if (!accountSetup) {
      return 'ACCOUNT_SETUP';
    }

    if (accountSetup.status === 'IN_PROGRESS') {
      return 'ACCOUNT_SETUP_LOADING';
    }

    // Step 2: Check bank connection
    if (!bankConnection) {
      return 'BANK_CONNECTION';
    }

    if (bankConnection.status === 'IN_PROGRESS') {
      return 'BANK_CONNECTION';
    }

    // Step 3: Check assessment
    if (!assessment) {
      return 'ASSESSMENT';
    }

    if (assessment.status === 'PENDING' || assessment.status === 'IN_PROGRESS') {
      return 'ASSESSMENT_CALCULATING';
    }

    if (assessment.status === 'COMPLETED') {
      // Step 4: Check mandate status if assessment is complete
      if (!mandate) {
        return 'DIRECT_DEBIT_SETUP';
      }

      if (mandate.status === 'PENDING') {
        return 'DIRECT_DEBIT_PENDING';
      }

      if (mandate.status === 'CREATED' || mandate.status === 'ACTIVE') {
        return 'PAYMENT_PLANS';
      }
    }

    return 'COMPLETE';
  }
}

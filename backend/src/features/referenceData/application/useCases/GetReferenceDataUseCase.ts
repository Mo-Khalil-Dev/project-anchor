import { Result } from '../../../shared/result';
import type { ILogger } from '../../../shared/logging';
import { prisma } from '../../../shared/utils/db';
import type { ReferenceData, NextStep } from './GetReferenceDataUseCase.dto';
import { GetAccountSetupQuery } from './GetAccountSetupQuery';
import { GetBankConnectionQuery } from './GetBankConnectionQuery';
import { GetAssessmentQuery } from './GetAssessmentQuery';
import type { ICustomerRepository } from '../../../customer/types/customer.types';
import type { IBankConnectionRepository } from '../../../bankConnection/types/bankConnection.types';
import type { IAssessmentRepository } from '../../domain/entities';

export class GetReferenceDataUseCase {
  private getAccountSetupQuery: GetAccountSetupQuery;
  private getBankConnectionQuery: GetBankConnectionQuery;
  private getAssessmentQuery: GetAssessmentQuery;

  constructor(
    customerRepository: ICustomerRepository,
    bankConnectionRepository: IBankConnectionRepository,
    assessmentRepository: IAssessmentRepository,
    private logger: ILogger
  ) {
    this.getAccountSetupQuery = new GetAccountSetupQuery(customerRepository, logger);
    this.getBankConnectionQuery = new GetBankConnectionQuery(bankConnectionRepository, logger);
    this.getAssessmentQuery = new GetAssessmentQuery(assessmentRepository, logger);
  }

  async execute(input: { userId: string }): Promise<Result<ReferenceData, Error>> {
    try {
      const { userId } = input;

      // Step 1: Resolve userId to customerId
      this.logger.info('Starting reference data fetch', { userId });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { customerId: true },
      });

      if (!user) {
        this.logger.warn('User not found', { userId });
        return Result.fail(new Error('User not found'));
      }

      if (!user.customerId) {
        this.logger.info('User not linked to customer', { userId });
        return Result.ok({
          accountSetup: null,
          bankConnection: null,
          assessment: null,
          mandate: null,
          paymentPlans: [],
          nextStep: 'ACCOUNT_SETUP',
        });
      }

      const customerId = user.customerId;
      this.logger.info('Resolved userId to customerId', { userId, customerId });

      // Step 2: Execute all three queries in parallel
      this.logger.info('Fetching account setup data', { customerId });
      const accountSetupResult = await this.getAccountSetupQuery.execute({ customerId });

      this.logger.info('Fetching bank connection data', { customerId });
      const bankConnectionResult = await this.getBankConnectionQuery.execute({ customerId });

      this.logger.info('Fetching referenceData data', { customerId });
      const assessmentResult = await this.getAssessmentQuery.execute({ customerId });

      // Step 3: Determine nextStep based on completion status
      const accountSetup = accountSetupResult.isFail ? null : accountSetupResult.getOrElse(null);
      const bankConnection = bankConnectionResult.isFail
        ? null
        : bankConnectionResult.getOrElse(null);
      const assessment = assessmentResult.isFail ? null : assessmentResult.getOrElse(null);

      // Fetch mandate data if assessment exists
      let mandate = null;
      if (assessment) {
        const mandateRecord = await prisma.mandate.findFirst({
          where: { customerId },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            gocardlessId: true,
            createdAt: true,
          },
        });

        if (mandateRecord) {
          mandate = {
            id: mandateRecord.id,
            status: mandateRecord.status as 'PENDING' | 'CREATED' | 'ACTIVE' | 'FAILED' | 'CANCELLED',
            gocardlessId: mandateRecord.gocardlessId,
            createdAt: mandateRecord.createdAt.toISOString(),
          };
        }
      }

      const nextStep = this.determineNextStep(accountSetup, bankConnection, assessment, mandate);
      this.logger.info('Determined next step', { userId, customerId, nextStep });

      const referenceData: ReferenceData = {
        accountSetup,
        bankConnection,
        assessment,
        mandate,
        paymentPlans:
          assessment?.status === 'COMPLETED' ? (assessment as any).paymentPlans || [] : [],
        nextStep,
      };

      return Result.ok(referenceData);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('GetReferenceData use case failed', {
        error: message,
      });
      return Result.fail(new Error(`Failed to get reference data: ${message}`));
    }
  }

  private determineNextStep(accountSetup: any, bankConnection: any, assessment: any, mandate: any): NextStep {
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

    // Step 3: Check referenceData
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

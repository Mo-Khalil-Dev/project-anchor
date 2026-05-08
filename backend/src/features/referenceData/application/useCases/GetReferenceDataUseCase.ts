import { Result } from '../../../shared/result';
import type { ILogger } from '../../../shared/logging';
import { extractResultOrNull } from '../../../shared/utils/result-helpers';
import type { ReferenceData } from './GetReferenceDataUseCase.dto';
import { GetAccountSetupQuery } from './GetAccountSetupQuery';
import { GetBankConnectionQuery } from './GetBankConnectionQuery';
import { GetAssessmentQuery } from './GetAssessmentQuery';
import { GetUserCustomerIdQuery } from './GetUserCustomerIdQuery';
import { NextStepService } from '../services/NextStepService';
import type { IAssessmentRepository } from '@/features/assessment/domain/entities';
import { IBankConnectionRepository } from '@/features/bankConnection/application/respositories/IBankConnectionRepository';
import { ICustomerRepository } from '@/features/customer/application/repository/ICustomerRepository';
import type { IUserRepository } from '@/features/customer/application/repository/IUserRepository';
import type { IMandateRepository } from '@/features/payment/application/repositories/IMandateRepository';

export class GetReferenceDataUseCase {
  private getUserCustomerIdQuery: GetUserCustomerIdQuery;
  private getAccountSetupQuery: GetAccountSetupQuery;
  private getBankConnectionQuery: GetBankConnectionQuery;
  private getAssessmentQuery: GetAssessmentQuery;
  private nextStepService: NextStepService;

  constructor(
    userRepository: IUserRepository,
    customerRepository: ICustomerRepository,
    bankConnectionRepository: IBankConnectionRepository,
    assessmentRepository: IAssessmentRepository,
    private mandateRepository: IMandateRepository,
    private logger: ILogger
  ) {
    this.getUserCustomerIdQuery = new GetUserCustomerIdQuery(userRepository, logger);
    this.getAccountSetupQuery = new GetAccountSetupQuery(customerRepository, logger);
    this.getBankConnectionQuery = new GetBankConnectionQuery(bankConnectionRepository, logger);
    this.getAssessmentQuery = new GetAssessmentQuery(assessmentRepository, logger);
    this.nextStepService = new NextStepService();
  }

  async execute(input: { userId: string }): Promise<Result<ReferenceData, Error>> {
    try {
      const { userId } = input;

      // Step 1: Resolve userId to customerId
      this.logger.info('Starting reference data fetch', { userId });

      const userCustomerIdResult = await this.getUserCustomerIdQuery.execute({ userId });

      if (userCustomerIdResult.isFail) {
        return Result.fail(userCustomerIdResult.getError() || new Error('Failed to resolve user'));
      }

      const customerId = userCustomerIdResult.getOrElse(null);

      if (!customerId) {
        return Result.ok({
          accountSetup: null,
          bankConnection: null,
          assessment: null,
          mandate: null,
          paymentPlans: [],
          nextStep: 'ACCOUNT_SETUP',
        });
      }

      // Step 2: Execute all queries in parallel
      this.logger.info(
        'Fetching account setup, bank connection, assessment, and mandate data',
        { customerId }
      );

      const [accountSetupResult, bankConnectionResult, assessmentResult, mandateResult] =
        await Promise.all([
          this.getAccountSetupQuery.execute({ customerId }),
          this.getBankConnectionQuery.execute({ customerId }),
          this.getAssessmentQuery.execute({ customerId }),
          this.mandateRepository.findLatestByCustomerId(customerId),
        ]);

      // Extract results with graceful degradation to null on failure
      const accountSetup = extractResultOrNull(accountSetupResult);
      const bankConnection = extractResultOrNull(bankConnectionResult);
      const assessment = extractResultOrNull(assessmentResult);

      // Mandate is only relevant if assessment exists
      let mandate = extractResultOrNull(mandateResult);
      if (!assessment) {
        mandate = null;
      }

      if (mandateResult.isFail) {
        this.logger.error('Failed to fetch mandate', { customerId });
      }

      const nextStep = this.nextStepService.determineNextStep(
        accountSetup,
        bankConnection,
        assessment,
        mandate
      );
      this.logger.info('Determined next step', { userId, customerId, nextStep });

      const referenceData: ReferenceData = {
        accountSetup,
        bankConnection,
        assessment,
        mandate,
        paymentPlans: assessment?.status === 'COMPLETED' ? (assessment as any).paymentPlans || [] : [],
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
}

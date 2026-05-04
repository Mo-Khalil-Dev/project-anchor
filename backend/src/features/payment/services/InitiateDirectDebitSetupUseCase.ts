import { Result } from '../../shared/result';
import type { ILogger } from '../../shared/logging';
import type { ICustomerRepository } from '../../customer/types/customer.types';
import type { IAssessmentRepository } from '../../assessment/types/assessment.types';
import type { CreateBillingRequestUseCase } from './CreateBillingRequestUseCase';
import type { CollectCustomerDetailsUseCase } from './CollectCustomerDetailsUseCase';
import type { CollectBankAccountUseCase } from './CollectBankAccountUseCase';
import type { CreateBillingRequestFlowUseCase } from './CreateBillingRequestFlowUseCase';

export interface InitiateDirectDebitSetupInput {
  userId: string;
  accountHolderName: string;
  /** Where GC should redirect the customer back to after authorization */
  redirectUri: string;
  /** Where GC should redirect the customer if they exit the flow early */
  exitUri: string;
}

export interface InitiateDirectDebitSetupOutput {
  authorizationUrl: string;
  billingRequestId: string;
  flowId: string;
}

/**
 * InitiateDirectDebitSetupUseCase
 *
 * Orchestrates the 4-step GoCardless billing request flow:
 *   1. Create billing request (BACS, GBP)
 *   2. Collect customer details (from our Customer record)
 *   3. Collect bank account (hardcoded sandbox values for Phase 1)
 *   4. Create billing request flow → returns hosted authorization URL
 *
 * The frontend redirects the customer to authorizationUrl. After they finish,
 * GC fires webhooks (mandate.created) which we handle in Phase 2.
 */
export class InitiateDirectDebitSetupUseCase {
  constructor(
    private customerRepository: ICustomerRepository,
    private assessmentRepository: IAssessmentRepository,
    private createBillingRequest: CreateBillingRequestUseCase,
    private collectCustomerDetails: CollectCustomerDetailsUseCase,
    private collectBankAccount: CollectBankAccountUseCase,
    private createBillingRequestFlow: CreateBillingRequestFlowUseCase,
    private logger: ILogger,
  ) {}

  async execute(
    input: InitiateDirectDebitSetupInput,
  ): Promise<Result<InitiateDirectDebitSetupOutput, Error>> {
    const { userId, accountHolderName, redirectUri, exitUri } = input;

    // 1. Resolve customer
    const customerIdResult = await this.customerRepository.findCustomerIdByUserId(userId);
    if (customerIdResult.isFail) {
      return Result.fail(new Error('Failed to resolve customer'));
    }
    const customerId = customerIdResult.getOrElse(null);
    if (!customerId) {
      return Result.fail(new Error('No customer linked to user'));
    }

    const customerResult = await this.customerRepository.findById(customerId);
    if (customerResult.isFail) {
      return Result.fail(new Error('Failed to load customer'));
    }
    const customer = customerResult.getOrElse(null);
    if (!customer) {
      return Result.fail(new Error('Customer not found'));
    }

    // 2. Resolve the customer's latest assessment so we can tag the mandate
    //    with both customerId and assessmentId for the webhook to pick up later.
    const assessmentResult = await this.assessmentRepository.findLatestByCustomerId(customerId);
    if (assessmentResult.isFail) {
      return Result.fail(new Error('Failed to load assessment'));
    }
    const assessment = assessmentResult.getOrElse(null);
    if (!assessment) {
      return Result.fail(new Error('No assessment found for customer'));
    }
    const assessmentId = assessment.getId();

    // 3. Step 1 of GC flow: create billing request
    const brResult = await this.createBillingRequest.execute({
      metadataReference: `safe-${customerId}-${Date.now()}`,
      customerId,
      assessmentId,
    });
    if (brResult.isFail) {
      return Result.fail(brResult.getError() ?? new Error('Create billing request failed'));
    }
    const { billingRequestId } = brResult.getOrThrow();

    // 4. Step 2: collect customer details
    const fullName = accountHolderName.trim().split(/\s+/);
    const givenName = fullName.slice(0, -1).join(' ') || customer.firstName || 'Customer';
    const familyName = fullName.length > 1 ? fullName[fullName.length - 1] : (customer.lastName || 'Unknown');

    const detailsResult = await this.collectCustomerDetails.execute({
      billingRequestId,
      email: customer.email,
      givenName,
      familyName,
      addressLine1: customer.address || '1 Default Street',
      city: 'London',
      postalCode: customer.postcode || 'W1A 0AX',
      countryCode: 'GB',
    });
    if (detailsResult.isFail) {
      return Result.fail(detailsResult.getError() ?? new Error('Collect customer details failed'));
    }

    // 5. Step 3: collect bank account (hardcoded sandbox values)
    const bankResult = await this.collectBankAccount.execute({
      billingRequestId,
      accountHolderName,
    });
    if (bankResult.isFail) {
      return Result.fail(bankResult.getError() ?? new Error('Collect bank account failed'));
    }

    // 6. Step 4: create the billing request flow
    const flowResult = await this.createBillingRequestFlow.execute({
      billingRequestId,
      redirectUri,
      exitUri,
    });
    if (flowResult.isFail) {
      return Result.fail(flowResult.getError() ?? new Error('Create flow failed'));
    }
    const { authorizationUrl, flowId } = flowResult.getOrThrow();

    this.logger.info('Direct Debit setup initiated', {
      userId,
      customerId,
      billingRequestId,
      flowId,
    });

    return Result.ok({
      authorizationUrl,
      billingRequestId,
      flowId,
    });
  }
}

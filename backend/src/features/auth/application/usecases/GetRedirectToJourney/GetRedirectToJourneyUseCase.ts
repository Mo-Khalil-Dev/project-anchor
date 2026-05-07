import type {
  GetRedirectToJourneyInput,
  GetRedirectToJourneyOutput,
} from './GetRedirectToJourney.dto';
import type { IUserRepository } from '../../repositories/IUserRepository';

export class GetRedirectToJourneyUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: GetRedirectToJourneyInput): Promise<GetRedirectToJourneyOutput> {
    const userResult = await this.userRepository.findWithCustomerJourney(input.userId);
    const userJourney = userResult.getOrElse(null);

    if (!userJourney) {
      return { nextPage: '/login', reason: 'user_not_found' };
    }

    // Admin users go to admin dashboard
    if (userJourney.role === 'admin') {
      return { nextPage: '/admin/dashboard', reason: 'admin_user' };
    }

    // Customer journey
    // 1. Must be linked to a customer (utility account setup)
    if (!userJourney.customerId) {
      return { nextPage: '/account-setup', reason: 'customer_not_linked' };
    }

    // 2. Must have bank connection
    if (userJourney.bankConnectionCount === 0) {
      return { nextPage: '/bank-connection', reason: 'bank_not_connected' };
    }

    // 3. Has bank connection + referenceData → land them on Assessment Overview
    if (userJourney.assessmentCount > 0) {
      return { nextPage: '/referenceData', reason: 'assessment_available' };
    }

    // 4. Bank connected but no referenceData yet (still being processed)
    return { nextPage: '/referenceData', reason: 'assessment_not_completed' };
  }
}

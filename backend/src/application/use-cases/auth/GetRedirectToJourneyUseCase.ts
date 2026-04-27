import type { PrismaClient } from '@prisma/client';

export interface GetRedirectToJourneyInput {
  userId: string;
}

export interface GetRedirectToJourneyOutput {
  nextPage: string;
  reason: string;
}

export class GetRedirectToJourneyUseCase {
  constructor(private prisma: PrismaClient) {}

  async execute(input: GetRedirectToJourneyInput): Promise<GetRedirectToJourneyOutput> {
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
      include: {
        customer: {
          include: {
            bankConnections: true,
            assessments: true,
          },
        },
      },
    });

    if (!user) {
      return { nextPage: '/login', reason: 'user_not_found' };
    }

    // Admin users go to admin dashboard
    if (user.role === 'admin') {
      return { nextPage: '/admin/dashboard', reason: 'admin_user' };
    }

    // Customer journey
    // 1. Must be linked to a customer (utility account setup)
    if (!user.customerId || !user.customer) {
      return { nextPage: '/account-setup', reason: 'customer_not_linked' };
    }

    // 2. Must have bank connection
    const hasBankConnection = user.customer.bankConnections && user.customer.bankConnections.length > 0;
    if (!hasBankConnection) {
      return { nextPage: '/bank-connection', reason: 'bank_not_connected' };
    }

    // 3. Must have completed assessment
    const hasAssessment = user.customer.assessments && user.customer.assessments.length > 0;
    if (!hasAssessment) {
      return { nextPage: '/assessment', reason: 'assessment_not_completed' };
    }

    // 4. Check if payment plan is selected (optional for now)
    // const hasPaymentPlan = user.customer.paymentPlan !== null;
    // if (!hasPaymentPlan) {
    //   return { nextPage: '/payment-plan', reason: 'payment_plan_not_selected' };
    // }

    // All done, go to payment portal
    return { nextPage: '/payment-portal', reason: 'all_steps_complete' };
  }
}

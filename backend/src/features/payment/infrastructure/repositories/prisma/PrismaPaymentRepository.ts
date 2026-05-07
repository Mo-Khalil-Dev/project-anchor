import { Result } from '../../../../shared/result';
import { prisma } from '../../../../shared/utils/db';
import type {
  IPaymentRepository,
  SaveMandateInput,
  SavePaymentMethodInput,
  SavePaymentScheduleInput,
} from '../../../application/respositories/IPaymentRepository';

export class PrismaPaymentRepository implements IPaymentRepository {
  async saveMandate(input: SaveMandateInput): Promise<Result<{ id: string }, Error>> {
    try {
      const mandate = await prisma.mandate.create({
        data: {
          customerId: input.customerId,
          gocardlessId: input.gocardlessId,
          status: input.status,
          accountHolderName: input.accountHolderName,
          bankAccountNumber: input.bankAccountNumber ?? null,
          sortCode: input.sortCode ?? null,
          expiresAt: input.expiresAt ?? null,
        },
      });
      return Result.ok({ id: mandate.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save mandate';
      return Result.fail(new Error(`Mandate save failed: ${message}`));
    }
  }

  async savePaymentMethod(input: SavePaymentMethodInput): Promise<Result<void, Error>> {
    try {
      await prisma.paymentMethod.create({
        data: {
          customerId: input.customerId,
          mandateId: input.mandateId,
          type: input.type,
          isDefault: input.isDefault,
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save payment method';
      return Result.fail(new Error(`PaymentMethod save failed: ${message}`));
    }
  }

  async savePaymentSchedule(input: SavePaymentScheduleInput): Promise<Result<void, Error>> {
    try {
      await prisma.paymentSchedule.create({
        data: {
          mandateId: input.mandateId,
          assessmentId: input.assessmentId,
          gocardlessId: input.gocardlessId,
          planType: input.planType,
          monthlyAmount: input.monthlyAmount,
          totalAmount: input.totalAmount,
          dayOfMonth: input.dayOfMonth,
          status: input.status,
          firstPaymentDate: input.firstPaymentDate,
          finalPaymentDate: input.finalPaymentDate,
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save payment schedule';
      return Result.fail(new Error(`PaymentSchedule save failed: ${message}`));
    }
  }

  async findMandateByGocardlessId(
    gocardlessId: string
  ): Promise<Result<{ id: string } | null, Error>> {
    try {
      const mandate = await prisma.mandate.findUnique({
        where: { gocardlessId },
        select: { id: true },
      });
      return Result.ok(mandate);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find mandate';
      return Result.fail(new Error(`Mandate lookup failed: ${message}`));
    }
  }

  async findPaymentScheduleByAssessmentId(
    assessmentId: string
  ): Promise<Result<{ id: string; gocardlessId: string } | null, Error>> {
    try {
      const schedule = await prisma.paymentSchedule.findFirst({
        where: { assessmentId },
        select: { id: true, gocardlessId: true },
      });
      return Result.ok(schedule);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find payment schedule';
      return Result.fail(new Error(`Payment schedule lookup failed: ${message}`));
    }
  }
}

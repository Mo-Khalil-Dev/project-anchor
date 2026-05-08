import type { GoCardlessClient } from 'gocardless-nodejs';
import { Result } from '../../../../shared/result';
import type { ILogger } from '../../../../shared/logging';
import type { CreateInstalmentScheduleInput, CreateInstalmentScheduleOutput } from './CreateInstalmentSchedule.dto';

/**
 * CreateInstalmentScheduleUseCase
 *
 * Creates a GoCardless instalment schedule on top of an active mandate.
 * Called from the webhook handler once a mandate becomes ACTIVE.
 *
 * Endpoint: POST /instalment_schedules
 *
 * GC will then automatically create individual payments based on the schedule,
 * which will fire `payments.*` webhooks as they progress.
 */
export class CreateInstalmentScheduleUseCase {
  constructor(
    private gocardless: GoCardlessClient,
    private logger: ILogger
  ) {}

  async execute(
    input: CreateInstalmentScheduleInput
  ): Promise<Result<CreateInstalmentScheduleOutput, Error>> {
    try {
      const schedule = await this.gocardless.instalmentSchedules.createWithSchedule({
        name: input.name,
        currency: 'GBP',
        total_amount: input.totalAmountPence,
        instalments: {
          start_date: this.computeStartDate(input.dayOfMonth),
          interval: 1,
          interval_unit: 'monthly',
          amounts: this.computeAmounts(input.totalAmountPence, input.installmentCount),
        },
        links: {
          mandate: input.mandateId,
        },
      } as any);

      const id = schedule.id;
      if (!id) {
        return Result.fail(new Error('GoCardless did not return an instalment schedule ID'));
      }

      this.logger.info('Created GC instalment schedule', {
        instalmentScheduleId: id,
        mandateId: input.mandateId,
        totalAmountPence: input.totalAmountPence,
        installmentCount: input.installmentCount,
      });

      return Result.ok({ instalmentScheduleId: id });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown GC error';
      this.logger.error('CreateInstalmentSchedule failed', {
        mandateId: input.mandateId,
        error: message,
      });
      return Result.fail(new Error(`Failed to create instalment schedule: ${message}`));
    }
  }

  /** Compute first payment date as the next occurrence of dayOfMonth, at least 7 days from now */
  private computeStartDate(dayOfMonth: number): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minStart = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const next = new Date(minStart.getFullYear(), minStart.getMonth(), dayOfMonth);
    if (next.getTime() < minStart.getTime()) {
      next.setMonth(next.getMonth() + 1);
    }
    return next.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  /** Split total amount into N equal-ish instalments (last one absorbs rounding) */
  private computeAmounts(totalPence: number, count: number): number[] {
    const base = Math.floor(totalPence / count);
    const amounts = Array(count).fill(base);
    amounts[count - 1] = totalPence - base * (count - 1);
    return amounts;
  }
}

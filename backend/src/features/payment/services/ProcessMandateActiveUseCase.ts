import type { GoCardlessClient } from 'gocardless-nodejs';
import { Result } from '../../shared/result';
import type { ILogger } from '../../shared/logging';
import type { IAssessmentRepository } from '../../assessment/types/assessment.types';
import type { IPaymentRepository } from '../repositories/IPaymentRepository';
import type { CreateInstalmentScheduleUseCase } from './CreateInstalmentScheduleUseCase';

const DEFAULT_DAY_OF_MONTH = 15;

interface PaymentPlanRecord {
  type: 'Conservative' | 'Balanced' | 'Aggressive';
  monthlyAmount: number;
  duration: number;
  totalRepayment: number;
  sustainability: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * ProcessMandateActiveUseCase
 *
 * Triggered by the `mandates.active` webhook event. Responsibilities:
 *   1. Fetch the mandate from GC and read metadata (customerId, assessmentId)
 *   2. Short-circuit if we've already saved this mandate (idempotency)
 *   3. Load the assessment, look up the customer's selectedPlan
 *   4. Persist Mandate + PaymentMethod rows
 *   5. Call GC to create the instalment schedule
 *   6. Persist PaymentSchedule row
 *
 * Idempotency: the mandate's gocardlessId is unique. We check first, and any
 * second delivery of the same event is a no-op.
 */
export class ProcessMandateActiveUseCase {
  constructor(
    private gocardless: GoCardlessClient,
    private assessmentRepository: IAssessmentRepository,
    private paymentRepository: IPaymentRepository,
    private createInstalmentSchedule: CreateInstalmentScheduleUseCase,
    private logger: ILogger,
  ) {}

  async execute(mandateGocardlessId: string): Promise<Result<void, Error>> {
    // 2. Fetch mandate from GC to get metadata (needed for better idempotency check)
    let gcMandate: any;
    try {
      gcMandate = await this.gocardless.mandates.find(mandateGocardlessId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown GC error';
      return Result.fail(new Error(`Failed to fetch mandate from GC: ${message}`));
    }

    const metadata = (gcMandate.metadata ?? {}) as Record<string, string | undefined>;
    const customerId = metadata.customerId;
    const assessmentId = metadata.assessmentId;

    if (!customerId || !assessmentId) {
      this.logger.warn('Mandate missing required metadata — skipping schedule creation', {
        mandateGocardlessId,
        hasCustomerId: !!customerId,
        hasAssessmentId: !!assessmentId,
      });
      return Result.fail(new Error('Mandate metadata missing customerId/assessmentId'));
    }

    // 1. Idempotency check
    // A: Check if mandate already processed locally
    const existingMandateResult = await this.paymentRepository.findPaymentScheduleByAssessmentId(mandateGocardlessId);
    if (existingMandateResult.isFail) {
      return Result.fail(existingMandateResult.getError() ?? new Error('Mandate lookup failed'));
    }

    // B: Check if schedule already created for this assessment
    // This is CRITICAL because a mandate might be saved but the process failed before GC schedule creation
    // OR GC schedule was created but local persistence failed.
    const existingScheduleResult = await this.paymentRepository.findPaymentScheduleByAssessmentId(assessmentId);
    if (existingScheduleResult.isFail) {
      return Result.fail(existingScheduleResult.getError() ?? new Error('Schedule lookup failed'));
    }

    const existingMandate = existingMandateResult.getOrElse(null);
    const existingSchedule = existingScheduleResult.getOrElse(null);

    if (existingMandate && existingSchedule) {
      this.logger.info('Mandate and Schedule already processed — skipping', {
        mandateGocardlessId,
        assessmentId,
        scheduleId: existingSchedule.id,
      });
      return Result.ok(undefined);
    }

    // 3. Load assessment + selectedPlan
    const assessmentResult = await this.assessmentRepository.findById(assessmentId);
    if (assessmentResult.isFail) {
      return Result.fail(assessmentResult.getError() ?? new Error('Assessment lookup failed'));
    }
    const assessment = assessmentResult.getOrElse(null);
    if (!assessment) {
      return Result.fail(new Error(`Assessment ${assessmentId} not found`));
    }

    const selectedPlan = assessment.getSelectedPlan();
    if (!selectedPlan) {
      return Result.fail(new Error('Assessment has no selectedPlan — was T&C accepted?'));
    }

    const paymentPlansJson = assessment.getPaymentPlans();
    if (!paymentPlansJson) {
      return Result.fail(new Error('Assessment has no payment plans'));
    }

    let plans: PaymentPlanRecord[];
    try {
      plans = JSON.parse(paymentPlansJson);
    } catch {
      return Result.fail(new Error('Invalid paymentPlans JSON on assessment'));
    }

    const plan = plans.find(p => p.type === selectedPlan);
    if (!plan) {
      return Result.fail(new Error(`Plan ${selectedPlan} not found in assessment.paymentPlans`));
    }

    // 4. Save Mandate + PaymentMethod
    const accountHolderName = (gcMandate.payer_resource as any)?.name
      ?? 'Unknown';

    let localMandateId: string;
    if (existingMandate) {
      localMandateId = existingMandate.id;
    } else {
      const mandateSaveResult = await this.paymentRepository.saveMandate({
        customerId,
        gocardlessId: mandateGocardlessId,
        status: 'ACTIVE',
        accountHolderName,
        bankAccountNumber: (gcMandate.payer_resource as any)?.account_number_ending, // Last 4 if available
        sortCode: null,
      });
      if (mandateSaveResult.isFail) {
        return Result.fail(mandateSaveResult.getError() ?? new Error('Mandate save failed'));
      }
      localMandateId = mandateSaveResult.getOrThrow().id;

      const methodSaveResult = await this.paymentRepository.savePaymentMethod({
        customerId,
        mandateId: localMandateId,
        type: 'direct_debit',
        isDefault: true,
      });
      if (methodSaveResult.isFail) {
        this.logger.warn('PaymentMethod save failed (mandate exists)', {
          localMandateId,
          error: methodSaveResult.getError()?.message,
        });
        // Non-fatal — mandate is saved, schedule can still proceed
      }
    }

    // 5. Create instalment schedule via GC
    const totalAmountPence = Math.round(plan.totalRepayment * 100);
    let instalmentScheduleId: string;

    if (existingSchedule) {
      instalmentScheduleId = existingSchedule.gocardlessId;
      this.logger.info('GC Schedule already exists but local record was missing — using existing ID', {
        assessmentId,
        instalmentScheduleId,
      });
    } else {
      const scheduleResult = await this.createInstalmentSchedule.execute({
        mandateId: mandateGocardlessId,
        totalAmountPence,
        installmentCount: plan.duration,
        dayOfMonth: DEFAULT_DAY_OF_MONTH,
        name: `SAFE plan — ${selectedPlan} (${assessmentId})`,
      });
      if (scheduleResult.isFail) {
        return Result.fail(scheduleResult.getError() ?? new Error('Schedule creation failed'));
      }
      instalmentScheduleId = scheduleResult.getOrThrow().instalmentScheduleId;
    }

    // 6. Persist PaymentSchedule
    const firstPaymentDate = this.computeStartDate(DEFAULT_DAY_OF_MONTH);
    const finalPaymentDate = this.addMonths(firstPaymentDate, plan.duration - 1);

    const schedSaveResult = await this.paymentRepository.savePaymentSchedule({
      mandateId: localMandateId,
      assessmentId,
      gocardlessId: instalmentScheduleId,
      planType: selectedPlan as PaymentPlanRecord['type'],
      monthlyAmount: Math.round(plan.monthlyAmount * 100),
      totalAmount: totalAmountPence,
      dayOfMonth: DEFAULT_DAY_OF_MONTH,
      status: 'ACTIVE',
      firstPaymentDate,
      finalPaymentDate,
    });
    if (schedSaveResult.isFail) {
      this.logger.error('PaymentSchedule save failed (GC schedule exists)', {
        instalmentScheduleId,
        error: schedSaveResult.getError()?.message,
      });
      return Result.fail(schedSaveResult.getError() ?? new Error('PaymentSchedule save failed'));
    }

    this.logger.info('Mandate active processed end-to-end', {
      mandateGocardlessId,
      localMandateId,
      instalmentScheduleId,
      planType: selectedPlan,
      totalAmountPence,
      installmentCount: plan.duration,
    });

    return Result.ok(undefined);
  }

  private computeStartDate(dayOfMonth: number): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minStart = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const next = new Date(minStart.getFullYear(), minStart.getMonth(), dayOfMonth);
    if (next.getTime() < minStart.getTime()) {
      next.setMonth(next.getMonth() + 1);
    }
    return next;
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    const expectedMonth = (result.getMonth() + months) % 12;
    result.setMonth(result.getMonth() + months);

    // Handle month overflow (e.g. Jan 31 + 1 month -> March 3)
    // We want it to stay in the expected month, usually by capping at the last day.
    if (result.getMonth() !== expectedMonth) {
      result.setDate(0); // Set to last day of previous month
    }
    return result;
  }
}

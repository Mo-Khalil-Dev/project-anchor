import { PrismaClient } from '@prisma/client';
import { Result } from '../../../../shared/result';
import { BankDataExtractionService } from '../../../../bankConnection/services/BankDataExtractionService';
import type { IAssessmentRepository } from '../../../domain/entities';
import { Assessment } from '../../../domain/entities';
import type { ILogger } from '../../../../shared/logging';
import { PaymentPlanCalculationService } from '../../../application/services/paymentPlanCalculations/PaymentPlanCalculationService';
import type { IBackgroundJob } from '../../../../../core/application/services/IBackgroundJob';
import { CompleteAssessmentUseCase } from '../../../application/useCases/CompleteAssessmentUseCase';
import { FailAssessmentUseCase } from '../../../application/useCases/FailAssessmentUseCase';

export class ProcessAssessmentJob implements IBackgroundJob<string> {
  private paymentPlanService = new PaymentPlanCalculationService();

  constructor(
    private prisma: PrismaClient,
    private assessmentRepository: IAssessmentRepository,
    private logger: ILogger,
    private completeAssessmentUseCase: CompleteAssessmentUseCase,
    private failAssessmentUseCase: FailAssessmentUseCase,
  ) {}

  async execute(jobId: string): Promise<Result<void, Error>> {
    let job: any;
    try {
      job = await this.prisma.assessmentJob.findUnique({
        where: { id: jobId },
        include: { assessment: true },
      });

      if (!job) {
        const error = new Error(`Assessment job not found: ${jobId}`);
        this.logger.error('Job lookup failed', { jobId, error: error.message });
        return Result.fail(error);
      }

      const assessmentResult = await this.assessmentRepository.findById(job.assessmentId);
      if (assessmentResult.isFail) {
        const reason = assessmentResult.getError()?.message || 'Failed to fetch assessment';
        await this.updateJobStatus(jobId, 'FAILED', reason);
        return Result.fail(assessmentResult.getError() || new Error(reason));
      }

      const assessment = assessmentResult.getOrThrow();
      if (!assessment) {
        const reason = `Assessment not found for job ${jobId}`;
        await this.updateJobStatus(jobId, 'FAILED', reason);
        return Result.fail(new Error(reason));
      }

      if (!assessment.getBankConnectionId()) {
        const reason = 'Assessment missing bank connection';
        await this.markAssessmentFailed(job.assessmentId, reason);
        await this.updateJobStatus(jobId, 'FAILED', reason);
        return Result.fail(new Error(reason));
      }

      const bankReport = await this.prisma.bankReports.findUnique({
        where: { bankConnectionId: assessment.getBankConnectionId()! },
      });

      if (!bankReport) {
        const reason = 'Bank report not found';
        await this.markAssessmentFailed(job.assessmentId, reason);
        await this.updateJobStatus(jobId, 'FAILED', reason);
        return Result.fail(new Error(reason));
      }

      let incomeData: any;
      let expenseData: any;

      try {
        incomeData = JSON.parse(bankReport.incomeJson);
        expenseData = JSON.parse(bankReport.expensesJson);
      } catch (parseError) {
        const reason = 'Failed to parse bank report JSON';
        await this.markAssessmentFailed(job.assessmentId, reason);
        await this.updateJobStatus(jobId, 'FAILED', reason);
        return Result.fail(new Error(reason));
      }

      const incomeResult = BankDataExtractionService.extractIncome(incomeData);
      if (incomeResult.isFail) {
        const reason = incomeResult.getError()?.message || 'Failed to extract income';
        await this.markAssessmentFailed(job.assessmentId, reason);
        await this.updateJobStatus(jobId, 'FAILED', reason);
        return Result.fail(incomeResult.getError() || new Error(reason));
      }

      const expenseResult = BankDataExtractionService.extractExpenses(expenseData);
      if (expenseResult.isFail) {
        const reason = expenseResult.getError()?.message || 'Failed to extract expenses';
        await this.markAssessmentFailed(job.assessmentId, reason);
        await this.updateJobStatus(jobId, 'FAILED', reason);
        return Result.fail(expenseResult.getError() || new Error(reason));
      }

      const income = incomeResult.getOrThrow();
      const expenses = expenseResult.getOrThrow();

      const disposableIncome = income.total - expenses.total;
      const arrears = assessment.getArrears() ?? 0;

      // Calculate payment plans with bill consideration
      const paymentPlans = this.paymentPlanService.calculatePlans(disposableIncome, arrears, assessment.getMonthlyBill());

      // Build breakdown JSON fields for the Reference Data endpoint
      const expensesByCategory: Record<string, number> = {
        Housing: expenses.housing ?? 0,
        'Food & groceries': expenses.food ?? 0,
        Transport: expenses.transport ?? 0,
        Utilities: expenses.utilities ?? 0,
        Other: expenses.other ?? 0,
      };

      const incomeSources = [
        income.salary && { type: 'Salary (regular)', amount: income.salary, frequency: 'Monthly' },
        income.benefits && { type: 'Benefits', amount: income.benefits, frequency: 'Monthly' },
        income.pension && { type: 'Pension', amount: income.pension, frequency: 'Monthly' },
        income.other && { type: 'Other income', amount: income.other, frequency: 'Monthly' },
      ].filter(Boolean);

      // Update assessment with enriched bank data
      const enrichedAssessment = Assessment.reconstruct({
        id: assessment.getId(),
        customerId: assessment.getCustomerId(),
        bankConnectionId: assessment.getBankConnectionId(),
        monthlyIncome: income.total,
        monthlyExpenses: expenses.total,
        monthlyBill: assessment.getMonthlyBill(),
        arrears: assessment.getArrears(),
        incomeBreakdown: JSON.stringify(income),
        expenseBreakdown: JSON.stringify(expenses),
        expensesByCategory: JSON.stringify(expensesByCategory),
        incomeHistory: assessment.getIncomeHistory(),
        incomeSources: JSON.stringify(incomeSources),
        factors: assessment.getFactors(),
        paymentPlans: JSON.stringify(paymentPlans),
        selectedPlan: assessment.getSelectedPlan(),
        status: assessment.getStatus(),
        createdAt: assessment.getCreatedAt(),
        updatedAt: new Date(),
      });

      const enrichmentResult = await this.assessmentRepository.update(enrichedAssessment);
      if (enrichmentResult.isFail) {
        await this.updateJobStatus(jobId, 'FAILED', enrichmentResult.getError()?.message);
        return Result.fail(enrichmentResult.getError() || new Error('Failed to enrich assessment'));
      }

      // Use command use case to mark assessment as completed
      const completeResult = await this.completeAssessmentUseCase.execute({
        assessmentId: assessment.getId(),
      });

      if (completeResult.isFail) {
        await this.updateJobStatus(jobId, 'FAILED', completeResult.getError()?.message);
        return Result.fail(completeResult.getError() || new Error('Failed to complete assessment'));
      }

      await this.prisma.assessmentJob.update({
        where: { id: jobId },
        data: {
          status: 'SUCCESS',
          processedAt: new Date(),
        },
      });

      this.logger.info('Assessment job processed successfully', {
        jobId,
        assessmentId: job.assessmentId,
        monthlyIncome: income.total,
        monthlyExpenses: expenses.total,
        disposableIncome,
        paymentPlanCount: paymentPlans.length,
      });

      return Result.ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('Assessment job processing failed', { jobId, error: message });

      // Attempt to mark assessment as failed if we have the job context
      if (jobId && job?.assessmentId) {
        await this.markAssessmentFailed(job.assessmentId, message);
      }

      await this.updateJobStatus(jobId, 'FAILED', message);
      return Result.fail(new Error(`Job processing failed: ${message}`));
    }
  }

  private async markAssessmentFailed(assessmentId: string, reason: string): Promise<void> {
    try {
      const failResult = await this.failAssessmentUseCase.execute({
        assessmentId,
        reason,
        errorCode: 'BANK_DATA_PROCESSING_FAILED',
      });

      if (failResult.isFail) {
        this.logger.error('Failed to mark assessment as failed', {
          assessmentId,
          error: failResult.getError()?.message,
        });
      }
    } catch (error) {
      this.logger.error('Error marking assessment as failed', { assessmentId, error });
    }
  }

  private async updateJobStatus(jobId: string, status: 'FAILED' | 'SUCCESS', errorMessage?: string): Promise<void> {
    try {
      await this.prisma.assessmentJob.update({
        where: { id: jobId },
        data: {
          status,
          errorMessage: errorMessage || null,
          retryCount: status === 'FAILED' ? { increment: 1 } : undefined,
          processedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error('Failed to update job status', { jobId, error });
    }
  }
}

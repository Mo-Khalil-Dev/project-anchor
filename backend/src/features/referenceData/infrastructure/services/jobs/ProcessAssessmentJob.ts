import { PrismaClient } from '@prisma/client';
import { Result } from '../../../../shared/result';
import { BankDataExtractionService } from '../../../../bankConnection/services/BankDataExtractionService';
import type { IAssessmentRepository } from '../../../domain/entities';
import { Assessment } from '../../../domain/entities';
import type { ILogger } from '../../../../shared/logging';
import { PaymentPlanCalculationService } from '../../../application/services/paymentPlanCalculations/PaymentPlanCalculationService';
import type { IBackgroundJob } from '../../../../../core/application/services/IBackgroundJob';
import { ASSESSMENT_STATUS } from '../../../domain/entities/assessment-status';

export class ProcessAssessmentJob implements IBackgroundJob<string> {
  private paymentPlanService = new PaymentPlanCalculationService();

  constructor(
    private prisma: PrismaClient,
    private assessmentRepository: IAssessmentRepository,
    private logger: ILogger,
  ) {}

  async execute(jobId: string): Promise<Result<void, Error>> {
    try {
      const job = await this.prisma.assessmentJob.findUnique({
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
        await this.updateJobStatus(jobId, 'FAILED', assessmentResult.getError()?.message);
        return Result.fail(assessmentResult.getError() || new Error('Failed to fetch referenceData'));
      }

      const assessment = assessmentResult.getOrThrow();
      if (!assessment) {
        const error = new Error(`Assessment not found for job ${jobId}`);
        await this.updateJobStatus(jobId, 'FAILED', error.message);
        return Result.fail(error);
      }

      if (!assessment.getBankConnectionId()) {
        const error = new Error('Assessment missing bank connection');
        await this.updateJobStatus(jobId, 'FAILED', error.message);
        return Result.fail(error);
      }

      const bankReport = await this.prisma.bankReports.findUnique({
        where: { bankConnectionId: assessment.getBankConnectionId()! },
      });

      if (!bankReport) {
        const error = new Error('Bank report not found');
        await this.updateJobStatus(jobId, 'FAILED', error.message);
        return Result.fail(error);
      }

      let incomeData: any;
      let expenseData: any;

      try {
        incomeData = JSON.parse(bankReport.incomeJson);
        expenseData = JSON.parse(bankReport.expensesJson);
      } catch (parseError) {
        const error = new Error('Failed to parse bank report JSON');
        await this.updateJobStatus(jobId, 'FAILED', error.message);
        return Result.fail(error);
      }

      const incomeResult = BankDataExtractionService.extractIncome(incomeData);
      if (incomeResult.isFail) {
        await this.updateJobStatus(jobId, 'FAILED', incomeResult.getError()?.message);
        return Result.fail(incomeResult.getError() || new Error('Failed to extract income'));
      }

      const expenseResult = BankDataExtractionService.extractExpenses(expenseData);
      if (expenseResult.isFail) {
        await this.updateJobStatus(jobId, 'FAILED', expenseResult.getError()?.message);
        return Result.fail(expenseResult.getError() || new Error('Failed to extract expenses'));
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

      const updatedAssessment = Assessment.reconstruct({
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
        status: ASSESSMENT_STATUS.COMPLETED,
        createdAt: assessment.getCreatedAt(),
        updatedAt: new Date(),
      });

      const updateResult = await this.assessmentRepository.update(updatedAssessment);
      if (updateResult.isFail) {
        await this.updateJobStatus(jobId, 'FAILED', updateResult.getError()?.message);
        return Result.fail(updateResult.getError() || new Error('Failed to update referenceData'));
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
      await this.updateJobStatus(jobId, 'FAILED', message);
      return Result.fail(new Error(`Job processing failed: ${message}`));
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

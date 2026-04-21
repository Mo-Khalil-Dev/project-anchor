import { PrismaClient } from '@prisma/client';
import { Result } from '../../shared/result';
import { BankDataExtractionService } from '../../infrastructure/services/BankDataExtractionService';
import { IAssessmentRepository } from '../../domain/repositories/IAssessmentRepository';
import type { ILogger } from '../../shared/logging';

export class ProcessAssessmentJobService {
  constructor(
    private prisma: PrismaClient,
    private assessmentRepository: IAssessmentRepository,
    private logger: ILogger,
  ) {}

  async execute(jobId: string): Promise<Result<void, Error>> {
    try {
      // Fetch job by ID
      const job = await this.prisma.assessmentJob.findUnique({
        where: { id: jobId },
        include: { assessment: true },
      });

      if (!job) {
        const error = new Error(`Assessment job not found: ${jobId}`);
        this.logger.error('Job lookup failed', { jobId, error: error.message });
        return Result.fail(error);
      }

      // Fetch assessment
      const assessmentResult = await this.assessmentRepository.findById(job.assessmentId);
      if (assessmentResult.isFail) {
        await this.updateJobStatus(jobId, 'FAILED', assessmentResult.getError()?.message);
        return Result.fail(assessmentResult.getError() || new Error('Failed to fetch assessment'));
      }

      const assessment = assessmentResult.getOrThrow();
      if (!assessment) {
        const error = new Error(`Assessment not found for job ${jobId}`);
        await this.updateJobStatus(jobId, 'FAILED', error.message);
        return Result.fail(error);
      }

      // Fetch bank reports if bankConnectionId exists
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

      // Extract figures from bank data
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

      // Create updated assessment with calculated figures and breakdown data
      const updatedAssessment = new (require('../../domain/entities/Assessment.entity').Assessment)({
        id: assessment.getId(),
        customerId: assessment.getCustomerId(),
        bankConnectionId: assessment.getBankConnectionId(),
        monthlyIncome: income.total,
        monthlyExpenses: expenses.total,
        monthlyBill: assessment.getMonthlyBill(),
        arrears: assessment.getArrears(),
        incomeBreakdown: JSON.stringify(income),
        expenseBreakdown: JSON.stringify(expenses),
        status: 'COMPLETED',
        createdAt: assessment.getCreatedAt(),
        updatedAt: new Date(),
      });

      // Update assessment in repository
      const updateResult = await this.assessmentRepository.update(updatedAssessment);
      if (updateResult.isFail) {
        await this.updateJobStatus(jobId, 'FAILED', updateResult.getError()?.message);
        return Result.fail(updateResult.getError() || new Error('Failed to update assessment'));
      }

      // Update job status to SUCCESS
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

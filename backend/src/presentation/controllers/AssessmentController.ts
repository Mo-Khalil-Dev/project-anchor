import { Request, Response } from 'express';
import { CreateAssessmentUseCase } from '../../application/use-cases/CreateAssessmentUseCase';
import { IAssessmentRepository } from '../../domain/repositories/IAssessmentRepository';
import { AssessmentDomainService } from '../../domain/services/AssessmentDomainService';
import { AssessmentMapper } from '../../application/mappers/AssessmentMapper';
import { DomainError } from '../../domain/errors/DomainError';
import { logger } from '../../utils/logger';

/**
 * Assessment Controller
 *
 * Handles HTTP request/response for assessment endpoints.
 * Translates HTTP layer to application layer (use cases).
 *
 * Responsibilities:
 * - Extract and validate request data
 * - Call appropriate use case
 * - Format and return response
 * - Handle errors and return appropriate HTTP status
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles HTTP protocol
 * - Open/Closed: New endpoints don't change existing ones
 * - Liskov Substitution: Consistent error handling
 * - Interface Segregation: Express Request/Response contracts
 * - Dependency Inversion: Injects use cases and repositories
 */
export class AssessmentController {
  constructor(
    private readonly createAssessmentUseCase: CreateAssessmentUseCase,
    private readonly assessmentRepository: IAssessmentRepository,
    private readonly assessmentDomainService: AssessmentDomainService
  ) {}

  /**
   * POST /assessments
   * Create a new assessment for a customer
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createAssessmentUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /assessments/:id
   * Retrieve assessment by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const assessment = await this.assessmentRepository.findById(id);
      if (!assessment) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Assessment not found',
          },
        });
        return;
      }

      const response = AssessmentMapper.toResponse(assessment);
      res.json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /assessments/:id/breakdown
   * Retrieve assessment with detailed breakdown and recommendations
   */
  async getBreakdown(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const assessment = await this.assessmentRepository.findById(id);
      if (!assessment) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Assessment not found',
          },
        });
        return;
      }

      const breakdown = AssessmentMapper.toBreakdownResponse(assessment, this.assessmentDomainService);
      res.json(breakdown);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /assessments/customer/:customerId
   * List all assessments for a customer
   */
  async listByCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      const assessments = await this.assessmentRepository.findByCustomerId(customerId);

      const paginated = assessments.slice(offset, offset + limit);
      const responses = paginated.map((a) => AssessmentMapper.toResponse(a));

      res.json({
        assessments: responses,
        total: assessments.length,
        limit,
        offset,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /assessments/hardship/:level
   * List assessments by hardship level
   */
  async listByHardshipLevel(req: Request, res: Response): Promise<void> {
    try {
      const { level } = req.params;

      const validLevels = ['NONE', 'LOW', 'MODERATE', 'SEVERE'];
      if (!validLevels.includes(level.toUpperCase())) {
        res.status(400).json({
          error: {
            code: 'INVALID_HARDSHIP_LEVEL',
            message: `Hardship level must be one of: ${validLevels.join(', ')}`,
          },
        });
        return;
      }

      const assessments = await this.assessmentRepository.findByHardshipLevel(level as any);
      const responses = assessments.map((a) => AssessmentMapper.toResponse(a));

      res.json({
        assessments: responses,
        total: assessments.length,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /assessments/recent/:daysBack
   * List assessments created in the last N days
   * (Used by hardship detection Lambda)
   */
  async listRecent(req: Request, res: Response): Promise<void> {
    try {
      const daysBack = Math.min(parseInt(req.params.daysBack) || 1, 30);

      const assessments = await this.assessmentRepository.findRecent(daysBack);
      const responses = assessments.map((a) => AssessmentMapper.toResponse(a));

      res.json({
        assessments: responses,
        total: assessments.length,
        daysBack,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Get overall statistics
   * GET /assessments/stats
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const total = await this.assessmentRepository.count();
      const severe = await this.assessmentRepository.findByHardshipLevel('SEVERE');
      const moderate = await this.assessmentRepository.findByHardshipLevel('MODERATE');

      res.json({
        total,
        severe: severe.length,
        moderate: moderate.length,
        low: total - severe.length - moderate.length,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Centralized error handler
   */
  private handleError(error: any, res: Response): void {
    if (error instanceof DomainError) {
      // Domain errors = bad request (client error)
      logger.warn('Domain error in controller', {
        code: error.code,
        message: error.message,
      });

      res.status(400).json({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      });
      return;
    }

    // Unexpected errors = 500
    logger.error('Unexpected error in controller', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
}

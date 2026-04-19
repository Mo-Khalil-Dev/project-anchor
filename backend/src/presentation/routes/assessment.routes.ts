import { Router } from 'express';
import { AssessmentController } from '../controllers/AssessmentController';
import { CreateAssessmentUseCase } from '../../application/use-cases/CreateAssessmentUseCase';
import { PrismaAssessmentRepository } from '../../infrastructure/persistence/PrismaAssessmentRepository';
import { AssessmentDomainService } from '../../domain/services/AssessmentDomainService';
import { prisma } from '../../utils/db';

/**
 * Assessment Routes
 *
 * Defines all assessment-related HTTP endpoints.
 * Uses dependency injection to wire up controller and use cases.
 *
 * Pattern:
 * 1. Create repositories
 * 2. Create domain services
 * 3. Create use cases
 * 4. Create controller
 * 5. Define routes
 */
export function createAssessmentRoutes(): Router {
  const router = Router();

  // ========== Dependency Injection ==========

  // Infrastructure layer
  const assessmentRepository = new PrismaAssessmentRepository(prisma);

  // Domain layer
  const assessmentDomainService = new AssessmentDomainService(assessmentRepository);

  // Application layer
  const createAssessmentUseCase = new CreateAssessmentUseCase(
    assessmentRepository,
    assessmentDomainService
  );

  // Presentation layer
  const assessmentController = new AssessmentController(
    createAssessmentUseCase,
    assessmentRepository,
    assessmentDomainService
  );

  // ========== Route Definitions ==========

  /**
   * POST /assessments
   * Create new assessment
   *
   * Request body:
   * {
   *   "customerId": "customer_123",
   *   "monthlyIncome": 2500,
   *   "totalExpenses": 2000,
   *   "billAmount": 150,
   *   "arrears": 300,
   *   "vulnerabilities": { "pensioner": false, "disabled": true },
   *   "incomeBreakdown": { "salary": 2500 },
   *   "expenseBreakdown": { "housing": 1000, "food": 500, "utilities": 300, "other": 200 }
   * }
   *
   * Response (201 Created):
   * {
   *   "assessmentId": "assessment_...",
   *   "hardshipLevel": "MODERATE",
   *   "requiresManualReview": true,
   *   "createdAt": "2024-04-18T10:30:00Z"
   * }
   */
  router.post('/', (req, res) => assessmentController.create(req, res));

  /**
   * GET /assessments/:id
   * Retrieve assessment by ID
   *
   * Response (200 OK):
   * {
   *   "id": "assessment_...",
   *   "customerId": "customer_123",
   *   "monthlyIncome": 2500,
   *   "totalExpenses": 2000,
   *   "disposableIncome": 500,
   *   "billAmount": 150,
   *   "billPercentage": 6,
   *   "arrears": 300,
   *   "hardship": {
   *     "level": "MODERATE",
   *     "confidenceScore": 0.75
   *   },
   *   "vulnerabilities": { "pensioner": false, "disabled": true },
   *   "requiresManualReview": true,
   *   "createdAt": "2024-04-18T10:30:00Z",
   *   "updatedAt": "2024-04-18T10:30:00Z"
   * }
   */
  router.get('/:id', (req, res) => assessmentController.getById(req, res));

  /**
   * GET /assessments/:id/breakdown
   * Get assessment with detailed breakdown and recommendations
   *
   * Response includes:
   * - Full assessment data
   * - Confidence level (HIGH/MEDIUM/LOW)
   * - Eligibility for support
   * - Recommended payment plan tier
   * - Recommended duration in months
   */
  router.get('/:id/breakdown', (req, res) => assessmentController.getBreakdown(req, res));

  /**
   * GET /assessments/customer/:customerId
   * List all assessments for a customer
   *
   * Query params:
   * - limit: max items (default 10, max 100)
   * - offset: pagination offset (default 0)
   */
  router.get('/customer/:customerId', (req, res) =>
    assessmentController.listByCustomer(req, res)
  );

  /**
   * GET /assessments/hardship/:level
   * List assessments by hardship level (NONE, LOW, MODERATE, SEVERE)
   */
  router.get('/hardship/:level', (req, res) =>
    assessmentController.listByHardshipLevel(req, res)
  );

  /**
   * GET /assessments/recent/:daysBack
   * List recent assessments (created in last N days)
   * Used by hardship detection Lambda
   */
  router.get('/recent/:daysBack', (req, res) => assessmentController.listRecent(req, res));

  /**
   * GET /assessments/stats
   * Overall assessment statistics
   *
   * Response:
   * {
   *   "total": 150,
   *   "severe": 10,
   *   "moderate": 25,
   *   "low": 115
   * }
   */
  router.get('/stats', (req, res) => assessmentController.getStats(req, res));

  return router;
}

export default createAssessmentRoutes();

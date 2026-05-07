# PROJECT BRIDGE - Implementation Guide

This guide shows how to implement domain entities and use cases following the Clean Code, SOLID, Clean Architecture, and Domain-Driven Design (DDD) patterns established in the Assessment aggregate.

## Table of Contents

1. [Architecture Recap](#architecture-recap)
2. [Assessment Aggregate - Reference Implementation](#assessment-aggregate--reference-implementation)
3. [How to Implement PaymentPlan Aggregate](#how-to-implement-paymentplan-aggregate)
4. [How to Implement Case Aggregate](#how-to-implement-case-aggregate)
5. [Testing Strategy](#testing-strategy)
6. [Common Patterns](#common-patterns)

---

## Architecture Recap

The PROJECT BRIDGE backend follows a 4-layer Clean Architecture:

```
┌─────────────────────────────────────────────────────┐
│  Presentation Layer                                 │
│  Controllers → HTTP Request/Response                │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  Application Layer                                  │
│  Use Cases → DTOs → Mappers                         │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  Domain Layer                                       │
│  Entities → Value Objects → Repositories (Interface)│
│  Services → Errors                                  │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  Infrastructure Layer                               │
│  Prisma Repositories → Database → External Services │
└─────────────────────────────────────────────────────┘
```

**Key Principles:**
- **Dependency flows DOWN** (Presentation → Application → Domain → Infrastructure)
- **Domain layer is independent** (no framework dependencies)
- **Each layer has distinct responsibility**
- **Testable at every level** (unit, integration, HTTP)

---

## Assessment Aggregate - Reference Implementation

The Assessment aggregate is a complete working example showing all patterns. Files created:

### 1. Domain Layer (src/domain/)

**Entity:** `Assessment.entity.ts`
- Aggregate root
- Encapsulates validation in `create()` factory
- Immutable properties (private with getters)
- Business logic methods (calculateDisposableIncome, isVulnerable, etc.)
- Uses composition with Hardship value object

**Value Object:** `Hardship.vo.ts`
- Immutable representation of hardship calculation
- Complex business logic in `calculate()` factory
- Query methods (isSevere, isModerate, etc.)
- Value equality (equals, hashCode)

**Repository Interface:** `IAssessmentRepository.ts`
- Defines persistence contract
- No implementation details leaked
- Abstraction for dependency injection

**Domain Service:** `AssessmentDomainService.ts`
- Orchestrates logic across entities
- Implements business rules
- Depends on repositories (IAssessmentRepository)

**Error:** `domainError.ts`
- Custom error for business rule violations
- Includes error code, message, details

### 2. Application Layer (src/application/)

**DTOs:** `dtos/assessment.dtos.ts`
- Separate Input/Output DTOs
- Plain objects (no logic)
- Used for validation and serialization

**Mapper:** `mappers/AssessmentMapper.ts`
- Converts Entity ↔ DTO
- Validation logic in `validateCreateRequest()`
- Serialization logic in `toResponse()`

**Use Case:** `use-cases/CreateAssessmentUseCase.ts`
- Orchestrates workflow
- Calls domain layer components
- Handles errors and logging
- Returns application layer DTOs

### 3. Presentation Layer (src/presentation/)

**Controller:** `controllers/AssessmentController.ts`
- Handles HTTP protocol
- Extracts request data
- Calls use cases
- Formats responses and error codes

**Routes:** `routes/assessment.routes.ts`
- Defines HTTP endpoints
- Wires up dependency injection
- Documents endpoint contracts

### 4. Infrastructure Layer (src/infrastructure/)

**Repository Implementation:** `persistence/PrismaAssessmentRepository.ts`
- Implements IAssessmentRepository
- Uses Prisma ORM
- Translates domain → database models
- Error handling

---

## How to Implement PaymentPlan Aggregate

PaymentPlan represents generated payment plan options. Follow this template:

### Step 1: Create Domain Entity

```typescript
// src/domain/entities/PaymentPlan.entity.ts

import { DomainError } from '../errors/DomainError';
import { Sustainability } from '../value-objects/Sustainability.vo';

export class PaymentPlan {
  private constructor(
    private readonly id: string,
    private readonly assessmentId: string,
    private readonly monthlyPayment: number,
    private readonly durationMonths: number,
    private readonly planType: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE',
    private readonly sustainability: Sustainability,
    private readonly isRecommended: boolean,
    private readonly createdAt: Date
  ) {}

  /**
   * Create new payment plan with validation.
   */
  static create(props: {
    assessmentId: string;
    monthlyPayment: number;
    durationMonths: number;
    planType: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
    totalArrearsToRepay: number; // Used for validation
  }): PaymentPlan {
    // Validate inputs
    if (props.monthlyPayment <= 0) {
      throw new DomainError('INVALID_PAYMENT', 'Monthly payment must be positive');
    }

    if (props.durationMonths < 12 || props.durationMonths > 60) {
      throw new DomainError('INVALID_DURATION', 'Duration must be 12-60 months');
    }

    // Calculate sustainability
    const sustainability = Sustainability.calculate({
      monthlyPayment: props.monthlyPayment,
      durationMonths: props.durationMonths,
      planType: props.planType,
    });

    const now = new Date();
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return new PaymentPlan(
      planId,
      props.assessmentId,
      props.monthlyPayment,
      props.durationMonths,
      props.planType,
      sustainability,
      false, // isRecommended set elsewhere
      now
    );
  }

  // ... getters and business logic methods
}
```

**Key Points:**
- Validation happens in `create()` factory
- Use value objects for complex properties (Sustainability)
- Getters return copies of mutable objects
- Business logic stays in entity or domain service

### Step 2: Create Value Object (if needed)

```typescript
// src/domain/value-objects/Sustainability.vo.ts

export class Sustainability {
  private constructor(
    private readonly score: 'HIGH' | 'MEDIUM' | 'LOW',
    private readonly riskFactors: string[]
  ) {}

  static calculate(props: {
    monthlyPayment: number;
    durationMonths: number;
    planType: string;
  }): Sustainability {
    const riskFactors: string[] = [];

    // Calculate sustainability metrics
    if (props.monthlyPayment > 500) {
      riskFactors.push('HIGH_PAYMENT');
    }

    if (props.durationMonths > 48) {
      riskFactors.push('LONG_DURATION');
    }

    const score = riskFactors.length === 0 ? 'HIGH' : 'MEDIUM';

    return new Sustainability(score, riskFactors);
  }

  // ... getters and query methods
}
```

**Value Object Rules:**
- Immutable (all properties readonly)
- No ID (equality by value, not reference)
- Can be composed into entities
- Query methods for business logic

### Step 3: Create Repository Interface

```typescript
// src/domain/repositories/IPaymentPlanRepository.ts

import { PaymentPlan } from '../entities/PaymentPlan.entity';

export interface IPaymentPlanRepository {
  save(plan: PaymentPlan): Promise<void>;
  findById(id: string): Promise<PaymentPlan | null>;
  findByAssessmentId(assessmentId: string): Promise<PaymentPlan[]>;
  delete(id: string): Promise<void>;
}
```

**Interface Rules:**
- Define persistence contract
- No implementation details
- Return domain entities, not DTOs
- Async methods for I/O operations

### Step 4: Create Use Case

```typescript
// src/application/use-cases/GeneratePaymentPlansUseCase.ts

import { Assessment } from '../../domain/entities/Assessment.entity';
import { PaymentPlan } from '../../domain/entities/PaymentPlan.entity';
import { IPaymentPlanRepository } from '../../domain/repositories/IPaymentPlanRepository';
import { IAssessmentRepository } from '../../domain/repositories/IAssessmentRepository';
import { AssessmentDomainService } from '../../domain/usecases/AssessmentDomainService';

export class GeneratePaymentPlansUseCase {
  constructor(
    private readonly paymentPlanRepository: IPaymentPlanRepository,
    private readonly assessmentRepository: IAssessmentRepository,
    private readonly assessmentDomainService: AssessmentDomainService
  ) {}

  async execute(input: { assessmentId: string }): Promise<PaymentPlan[]> {
    // 1. Fetch referenceData
    const assessment = await this.assessmentRepository.findById(input.assessmentId);
    if (!assessment) {
      throw new DomainError('ASSESSMENT_NOT_FOUND', 'Assessment not found');
    }

    // 2. Generate 3 plans (CONSERVATIVE, BALANCED, AGGRESSIVE)
    const plans: PaymentPlan[] = [];

    const conservativeDuration = this.assessmentDomainService.calculateRecommendedPlanDuration(
      assessment
    );
    const conservativePlan = PaymentPlan.create({
      assessmentId: assessment.getId(),
      monthlyPayment: assessment.getBillAmount() * 0.8, // 80% of bill
      durationMonths: conservativeDuration,
      planType: 'CONSERVATIVE',
      totalArrearsToRepay: assessment.getArrears(),
    });
    plans.push(conservativePlan);

    // ... create BALANCED and AGGRESSIVE plans similarly

    // 3. Mark recommended plan
    const recommendedType = this.assessmentDomainService.recommendPaymentPlanTier(assessment);
    // (Mark plan with matching type as recommended)

    // 4. Save all plans
    for (const plan of plans) {
      await this.paymentPlanRepository.save(plan);
    }

    return plans;
  }
}
```

**Use Case Rules:**
- Orchestrates workflow
- Calls domain entities and services
- Handles errors
- Returns application layer results (DTOs or domain objects)

### Step 5: Create DTOs and Mapper

```typescript
// src/application/dtos/payment-plan.dtos.ts

export interface GeneratePaymentPlansRequest {
  assessmentId: string;
}

export interface PaymentPlanResponse {
  id: string;
  assessmentId: string;
  monthlyPayment: number;
  durationMonths: number;
  totalRepaymentAmount: number;
  planType: string;
  sustainability: {
    score: string;
    riskFactors: string[];
  };
  isRecommended: boolean;
}

// src/application/mappers/PaymentPlanMapper.ts

import { PaymentPlan } from '../../domain/entities/PaymentPlan.entity';
import { PaymentPlanResponse } from '../dtos/payment-plan.dtos';

export class PaymentPlanMapper {
  static toResponse(plan: PaymentPlan): PaymentPlanResponse {
    return {
      id: plan.getId(),
      assessmentId: plan.getAssessmentId(),
      monthlyPayment: plan.getMonthlyPayment(),
      durationMonths: plan.getDurationMonths(),
      totalRepaymentAmount: plan.getMonthlyPayment() * plan.getDurationMonths(),
      planType: plan.getPlanType(),
      sustainability: {
        score: plan.getSustainability().getScore(),
        riskFactors: plan.getSustainability().getRiskFactors(),
      },
      isRecommended: plan.isRecommended(),
    };
  }
}
```

### Step 6: Create Controller and Routes

```typescript
// src/presentation/controllers/PaymentPlanController.ts

export class PaymentPlanController {
  constructor(
    private readonly generatePaymentPlansUseCase: GeneratePaymentPlansUseCase,
    private readonly paymentPlanRepository: IPaymentPlanRepository
  ) {}

  async generate(req: Request, res: Response): Promise<void> {
    try {
      const plans = await this.generatePaymentPlansUseCase.execute(req.body);
      const responses = plans.map((p) => PaymentPlanMapper.toResponse(p));
      res.status(201).json({ plans: responses });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getByAssessment(req: Request, res: Response): Promise<void> {
    try {
      const { assessmentId } = req.params;
      const plans = await this.paymentPlanRepository.findByAssessmentId(assessmentId);
      const responses = plans.map((p) => PaymentPlanMapper.toResponse(p));
      res.json({ plans: responses });
    } catch (error) {
      this.handleError(error, res);
    }
  }
}

// src/presentation/routes/payment-plan.routes.ts

export function createPaymentPlanRoutes(): Router {
  const router = Router();
  const repository = new PrismaPaymentPlanRepository(prisma);
  const useCase = new GeneratePaymentPlansUseCase(
    repository,
    assessmentRepository,
    assessmentDomainService
  );
  const controller = new PaymentPlanController(useCase, repository);

  router.post('/', (req, res) => controller.generate(req, res));
  router.get('/assessment/:assessmentId', (req, res) =>
    controller.getByAssessment(req, res)
  );

  return router;
}
```

---

## How to Implement Case Aggregate

Cases represent officer review queue items. High-level template:

### Entity Structure

```typescript
export class Case {
  // Properties
  private readonly id: string;
  private readonly assessmentId: string;
  private readonly priority: 'HIGH' | 'MEDIUM' | 'LOW';
  private readonly flagReason: string;
  private assignedToOfficer: string | null;
  private status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'MODIFIED' | 'ESCALATED';
  private decisionAt: Date | null;
  private decisionNotes: string | null;

  // Factory method
  static create(props: {
    assessmentId: string;
    priority: string;
    flagReason: string;
  }): Case {
    // Validation
    // Generate ID
    // Return instance
  }

  // Domain logic
  assignToOfficer(officerId: string): void { /* ... */ }
  approve(notes: string): void { /* ... */ }
  requestModification(newTerms: any): void { /* ... */ }
  escalate(reason: string): void { /* ... */ }
}
```

### Domain Service for Case Logic

```typescript
export class CaseManagementService {
  // Rule: Automatically assign high priority cases to senior officers
  async assignPriorityCases(): Promise<void> { /* ... */ }

  // Rule: Cases pending >7 days should be escalated
  async escalateStaleQueueItems(): Promise<void> { /* ... */ }

  // Rule: Determine if case decision is fair
  validateDecisionFairness(caseDecision: any, assessment: Assessment): boolean { /* ... */ }
}
```

### Repository Interface

```typescript
export interface ICaseRepository {
  save(case: Case): Promise<void>;
  findById(id: string): Promise<Case | null>;
  findByStatus(status: string): Promise<Case[]>;
  findByOfficer(officerId: string): Promise<Case[]>;
  findPending(maxDays?: number): Promise<Case[]>;
}
```

---

## Testing Strategy

### Unit Tests (Domain Layer)

Test entities and value objects in isolation:

```typescript
describe('PaymentPlan Entity', () => {
  it('should calculate total repayment correctly', () => {
    const plan = PaymentPlan.create({
      assessmentId: 'assessment_123',
      monthlyPayment: 100,
      durationMonths: 24,
      planType: 'BALANCED',
      totalArrearsToRepay: 0,
    });

    expect(plan.getTotalRepaymentAmount()).toBe(2400);
  });

  it('should validate duration constraints', () => {
    expect(() => {
      PaymentPlan.create({
        assessmentId: 'assessment_123',
        monthlyPayment: 100,
        durationMonths: 5, // Too short
        planType: 'BALANCED',
        totalArrearsToRepay: 0,
      });
    }).toThrow(DomainError);
  });
});
```

### Integration Tests (Application Layer)

Test use cases with mocked repositories:

```typescript
describe('GeneratePaymentPlansUseCase', () => {
  it('should generate 3 payment plan options', async () => {
    const mockAssessment = createMockAssessment();
    const mockRepository = {
      findById: jest.fn().mockResolvedValue(mockAssessment),
    };

    const useCase = new GeneratePaymentPlansUseCase(
      mockPaymentPlanRepository,
      mockRepository,
      mockDomainService
    );

    const result = await useCase.execute({ assessmentId: 'assessment_123' });

    expect(result).toHaveLength(3);
    expect(result.map((p) => p.getPlanType())).toEqual([
      'CONSERVATIVE',
      'BALANCED',
      'AGGRESSIVE',
    ]);
  });
});
```

### HTTP Tests (Presentation Layer)

Test endpoints with real HTTP client:

```typescript
describe('POST /payment-plans', () => {
  it('should generate payment plans for valid referenceData', async () => {
    const response = await request(app)
      .post('/payment-plans')
      .send({ assessmentId: 'assessment_123' });

    expect(response.status).toBe(201);
    expect(response.body.plans).toHaveLength(3);
  });

  it('should return 404 if referenceData not found', async () => {
    const response = await request(app)
      .post('/payment-plans')
      .send({ assessmentId: 'nonexistent' });

    expect(response.status).toBe(404);
  });
});
```

---

## Common Patterns

### Pattern 1: Factory Method with Validation

```typescript
// ❌ Bad: Constructor with side effects
class Entity {
  constructor(data) {
    if (!data.id) throw new Error('ID required');
    // ...
  }
}

// ✅ Good: Factory with validation
class Entity {
  private constructor(data) { /* ... */ }

  static create(data): Entity {
    if (!data.id) throw new DomainError('INVALID_ID', 'ID required');
    return new Entity(data);
  }

  static fromPersistence(data): Entity {
    return new Entity(data); // No validation
  }
}
```

### Pattern 2: Immutability

```typescript
// ❌ Bad: Mutable properties
class Assessment {
  hardship: Hardship;
  setHardship(h) { this.hardship = h; }
}

// ✅ Good: Immutable properties
class Assessment {
  private readonly hardship: Hardship;
  getHardship(): Hardship { return this.hardship; }
}
```

### Pattern 3: Value Objects for Complex Types

```typescript
// ❌ Bad: Primitives everywhere
const duration = 24;
const type = 'CONSERVATIVE';

// ✅ Good: Value objects
class PaymentPlanType {
  static readonly CONSERVATIVE = new PaymentPlanType('CONSERVATIVE');
  readonly value: string;
}
```

### Pattern 4: Domain Service for Cross-Aggregate Logic

```typescript
// ❌ Bad: Business logic in use case
class UpdateAssessmentUseCase {
  async execute(assessment) {
    if (assessment.hardship.isSevere()) {
      const paymentPlan = await generatePaymentPlan(assessment);
      const caseQueue = await createCase(paymentPlan);
      // ...
    }
  }
}

// ✅ Good: Logic in domain service
class CaseCreationService {
  async createCaseIfNeeded(assessment) {
    if (this.shouldEscalateToCase(assessment)) {
      return await this.caseRepository.save(
        Case.create({ assessmentId: assessment.getId() })
      );
    }
  }
}
```

### Pattern 5: Dependency Injection in Routes

```typescript
// Routes wire up dependencies
function createAssessmentRoutes(): Router {
  // 1. Create infrastructure
  const repository = new PrismaAssessmentRepository(prisma);

  // 2. Create domain usecases
  const domainService = new AssessmentDomainService(repository);

  // 3. Create use cases
  const createUseCase = new CreateAssessmentUseCase(
    repository,
    domainService
  );

  // 4. Create controller
  const controller = new AssessmentController(
    createUseCase,
    repository,
    domainService
  );

  // 5. Define routes
  const router = Router();
  router.post('/', (req, res) => controller.create(req, res));
  return router;
}
```

---

## Summary Checklist

For each new aggregate:

- [ ] **Domain Layer**
  - [ ] Create Entity with `create()` factory and `fromPersistence()`
  - [ ] Create Value Objects if needed
  - [ ] Define Repository Interface
  - [ ] Create Domain Service if cross-aggregate logic needed
  - [ ] Add DomainError subclass if specialized errors needed

- [ ] **Application Layer**
  - [ ] Create Request/Response DTOs
  - [ ] Create Use Cases for main workflows
  - [ ] Create Mapper for Entity ↔ DTO conversion

- [ ] **Presentation Layer**
  - [ ] Create Controller with dependency injection
  - [ ] Define HTTP routes with request/response contracts
  - [ ] Handle errors appropriately

- [ ] **Infrastructure Layer**
  - [ ] Implement Repository interface with Prisma
  - [ ] Handle ORM to Entity mapping

- [ ] **Tests**
  - [ ] Unit tests for entity (domain layer)
  - [ ] Unit tests for value objects (domain layer)
  - [ ] Integration tests for use cases (application layer)
  - [ ] HTTP tests for endpoints (presentation layer)

Following this structure ensures consistency, testability, and maintainability across the entire backend.

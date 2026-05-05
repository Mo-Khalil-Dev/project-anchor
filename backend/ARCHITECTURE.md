# PROJECT BRIDGE - Clean Architecture Guide

## Overview

This backend follows **Clean Architecture** with **Domain-Driven Design (DDD)**, **SOLID Principles**, and **Clean Code** practices.

---

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│         Presentation Layer (HTTP)               │
│  (Express Routes, Controllers, Request/Response)│
└────────────────┬────────────────────────────────┘
                 │ depends on
┌────────────────▼────────────────────────────────┐
│       Application Layer (Use Cases)             │
│  (Orchestration, coordination, no business logic)│
└────────────────┬────────────────────────────────┘
                 │ depends on
┌────────────────▼────────────────────────────────┐
│        Domain Layer (Business Logic)            │
│  (Entities, Value Objects, Domain Services)     │
└────────────────┬────────────────────────────────┘
                 │ depends on
┌────────────────▼────────────────────────────────┐
│     Infrastructure Layer (Frameworks)           │
│  (Database, Email, External APIs, Utilities)    │
└─────────────────────────────────────────────────┘
```

**Key Rule:** Outer layers depend on inner layers. Inner layers never depend on outer layers.

---

## File Organization by Layer

```
src/
├── domain/                          ← Business Logic (Independent)
│   ├── assessment/
│   │   ├── Assessment.entity.ts     ← Entity (aggregate root)
│   │   ├── Hardship.vo.ts           ← Value Object
│   │   ├── HardshipLevel.enum.ts    ← Enum
│   │   └── IAssessmentRepository.ts ← Repository Interface
│   │
│   ├── payment-plan/
│   │   ├── PaymentPlan.entity.ts
│   │   ├── Sustainability.vo.ts
│   │   └── IPaymentPlanRepository.ts
│   │
│   ├── case/
│   │   ├── Case.entity.ts
│   │   ├── Priority.enum.ts
│   │   └── ICaseRepository.ts
│   │
│   └── shared/                      ← Shared domain concepts
│       ├── BaseEntity.ts            ← Base class
│       ├── UniqueEntityId.ts        ← ID value object
│       ├── DomainEvent.ts           ← Domain events
│       └── Result.ts                ← Result type
│
├── application/                     ← Use Cases (Orchestration)
│   ├── assessment/
│   │   ├── usecases/
│   │   │   ├── CreateAssessment.usecase.ts
│   │   │   ├── GetAssessmentBreakdown.usecase.ts
│   │   │   └── DetectHardship.usecase.ts
│   │   ├── dtos/
│   │   │   ├── CreateAssessmentRequest.dto.ts
│   │   │   └── AssessmentResponse.dto.ts
│   │   └── mappers/
│   │       └── AssessmentMapper.ts  ← DTO ↔ Entity mapping
│   │
│   ├── payment-plan/
│   │   ├── usecases/
│   │   │   ├── GeneratePaymentPlans.usecase.ts
│   │   │   └── AcceptPaymentPlan.usecase.ts
│   │   ├── dtos/
│   │   └── mappers/
│   │
│   ├── case/
│   │   ├── usecases/
│   │   │   ├── GetQueueForOfficer.usecase.ts
│   │   │   ├── ReviewCase.usecase.ts
│   │   │   └── ModifyPlan.usecase.ts
│   │   ├── dtos/
│   │   └── mappers/
│   │
│   └── shared/
│       └── UseCase.interface.ts     ← Base interface
│
├── infrastructure/                  ← External Dependencies
│   ├── persistence/
│   │   ├── PrismaAssessmentRepository.ts ← Implements domain interface
│   │   ├── PrismaCaseRepository.ts
│   │   └── PrismaPaymentPlanRepository.ts
│   │
│   ├── services/
│   │   ├── EmailService.ts          ← Sends emails
│   │   ├── BankOAuthService.ts      ← Bank integration
│   │   └── PaymentService.ts        ← Payment processing
│   │
│   └── shared/
│       ├── db.ts                    ← Prisma client
│       └── logger.ts                ← Logging
│
├── presentation/                    ← HTTP Layer
│   ├── assessment/
│   │   ├── AssessmentController.ts  ← HTTP handlers
│   │   ├── assessment.routes.ts     ← Route definitions
│   │   └── middleware/              ← Route-specific middleware
│   │
│   ├── case/
│   │   ├── CaseController.ts
│   │   └── case.routes.ts
│   │
│   └── shared/
│       ├── middleware/
│       │   ├── auth.middleware.ts
│       │   ├── rbac.middleware.ts
│       │   └── error.middleware.ts
│       └── utils/
│           └── ResponseFormatter.ts
│
├── app.ts                           ← Express setup
└── index.ts                         ← Entry point
```

---

## 1. DOMAIN LAYER (Business Logic)

### 1.1 Entity (Aggregate Root)

An **Entity** has identity and lifecycle. An **Aggregate Root** is an entity that other entities depend on.

**File: `src/domain/assessment/Assessment.entity.ts`**
```typescript
import { BaseEntity, UniqueEntityId } from '../shared';
import { HardshipLevel } from './HardshipLevel.enum';
import { Hardship } from './Hardship.vo';

export class Assessment extends BaseEntity<AssessmentProps> {
  private constructor(props: AssessmentProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(props: AssessmentProps, id?: UniqueEntityId): Result<Assessment> {
    // Validate business rules
    if (props.monthlyIncome < 0) {
      return Result.fail('Monthly income cannot be negative');
    }

    if (props.billPercentage > 100) {
      return Result.fail('Bill percentage cannot exceed 100%');
    }

    // All validations pass
    const assessment = new Assessment(props, id);
    return Result.ok(assessment);
  }

  // Getter methods
  get customerId(): string {
    return this.props.customerId;
  }

  get hardship(): Hardship {
    return this.props.hardship;
  }

  // Business logic methods
  isUnaffordable(): boolean {
    return this.props.hardship.getPercentage() > 25;
  }

  needsManualReview(): boolean {
    return this.props.previousDefault || this.isUnaffordable();
  }

  // Value object accessors
  getDisposableIncome(): number {
    return this.props.disposableIncome;
  }

  getBillPercentage(): number {
    return this.props.billPercentage;
  }
}

export interface AssessmentProps {
  customerId: string;
  monthlyIncome: number;
  totalExpenses: number;
  disposableIncome: number;
  billAmount: number;
  billPercentage: number;
  arrears: number;
  hardship: Hardship;
  previousDefault: boolean;
  vulnerabilities: string[];
  createdAt: Date;
}
```

### 1.2 Value Object (Immutable)

A **Value Object** has no identity, only value. It's immutable.

**File: `src/domain/assessment/Hardship.vo.ts`**
```typescript
import { Result } from '../shared';
import { HardshipLevel } from './HardshipLevel.enum';

export class Hardship {
  readonly percentage: number;
  readonly level: HardshipLevel;
  readonly confidence: number;

  private constructor(percentage: number, level: HardshipLevel, confidence: number) {
    this.percentage = percentage;
    this.level = level;
    this.confidence = confidence;
  }

  static create(percentage: number, confidence: number = 100): Result<Hardship> {
    // Validation
    if (percentage < 0 || percentage > 100) {
      return Result.fail('Percentage must be between 0 and 100');
    }

    if (confidence < 0 || confidence > 100) {
      return Result.fail('Confidence must be between 0 and 100');
    }

    // Determine level
    const level = this.determineLevel(percentage);

    const hardship = new Hardship(percentage, level, confidence);
    return Result.ok(hardship);
  }

  private static determineLevel(percentage: number): HardshipLevel {
    if (percentage > 25) return HardshipLevel.SEVERE;
    if (percentage > 10) return HardshipLevel.MODERATE;
    if (percentage > 5) return HardshipLevel.LOW;
    return HardshipLevel.NONE;
  }

  getPercentage(): number {
    return this.percentage;
  }

  getLevel(): HardshipLevel {
    return this.level;
  }

  getConfidence(): number {
    return this.confidence;
  }

  isSevere(): boolean {
    return this.level === HardshipLevel.SEVERE;
  }

  equals(other: Hardship): boolean {
    return (
      this.percentage === other.percentage &&
      this.level === other.level &&
      this.confidence === other.confidence
    );
  }
}
```

### 1.3 Repository Interface

**Repositories** abstract data access. Define in domain, implement in infrastructure.

**File: `src/domain/assessment/IAssessmentRepository.ts`**
```typescript
import { Assessment } from './Assessment.entity';

export interface IAssessmentRepository {
  // Queries
  findById(id: string): Promise<Assessment | null>;
  findByCustomerId(customerId: string): Promise<Assessment[]>;
  findByHardshipLevel(level: string): Promise<Assessment[]>;

  // Commands
  save(assessment: Assessment): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### 1.4 Domain Service (Orchestrates entities)

**File: `src/domain/assessment/AssessmentService.ts`**
```typescript
import { Result } from '../shared';
import { Assessment } from './Assessment.entity';
import { PaymentPlan } from '../payment-plan/PaymentPlan.entity';
import { IAssessmentRepository } from './IAssessmentRepository';

export class AssessmentDomainService {
  constructor(private assessmentRepository: IAssessmentRepository) {}

  async createAssessmentForCustomer(
    customerId: string,
    financialData: FinancialData
  ): Promise<Result<Assessment>> {
    // Business logic: Create referenceData based on financial data
    const hardshipResult = this.calculateHardship(financialData);
    if (hardshipResult.isFailure) {
      return Result.fail(hardshipResult.error);
    }

    const assessmentResult = Assessment.create({
      customerId,
      ...financialData,
      hardship: hardshipResult.value,
      previousDefault: await this.hasPreviewDefault(customerId),
      vulnerabilities: await this.detectVulnerabilities(customerId),
      createdAt: new Date(),
    });

    if (assessmentResult.isFailure) {
      return assessmentResult;
    }

    // Persist
    await this.assessmentRepository.save(assessmentResult.value);

    return assessmentResult;
  }

  private calculateHardship(data: FinancialData): Result<Hardship> {
    const percentage = (data.billAmount / data.disposableIncome) * 100;
    return Hardship.create(percentage);
  }

  private async hasPreviewDefault(customerId: string): Promise<boolean> {
    const assessments = await this.assessmentRepository.findByCustomerId(customerId);
    // Check if any previous referenceData had issues
    return assessments.length > 0; // Simplified
  }

  private async detectVulnerabilities(customerId: string): Promise<string[]> {
    // Detect pensioner, medical equipment, etc.
    return [];
  }
}
```

---

## 2. APPLICATION LAYER (Use Cases)

### 2.1 Use Case (Orchestrator)

**File: `src/application/assessment/usecases/CreateAssessment.usecase.ts`**
```typescript
import { Result } from '@/domain/shared';
import { UseCase } from '../../../shared/UseCase.interface';
import { CreateAssessmentRequest } from '../dtos/CreateAssessmentRequest.dto';
import { AssessmentResponse } from '../dtos/AssessmentResponse.dto';
import { IAssessmentRepository } from '@/domain/referenceData/IAssessmentRepository';
import { AssessmentDomainService } from '@/domain/referenceData/AssessmentService';
import { AssessmentMapper } from '../mappers/AssessmentMapper';

export class CreateAssessmentUseCase implements UseCase<CreateAssessmentRequest, AssessmentResponse> {
  constructor(
    private assessmentRepository: IAssessmentRepository,
    private assessmentDomainService: AssessmentDomainService,
    private assessmentMapper: AssessmentMapper
  ) {}

  async execute(request: CreateAssessmentRequest): Promise<Result<AssessmentResponse>> {
    // Validate request
    const validationResult = this.validateRequest(request);
    if (validationResult.isFailure) {
      return Result.fail(validationResult.error);
    }

    // Call domain service (business logic)
    const assessmentResult = await this.assessmentDomainService.createAssessmentForCustomer(
      request.customerId,
      {
        monthlyIncome: request.monthlyIncome,
        totalExpenses: request.totalExpenses,
        disposableIncome: request.disposableIncome,
        billAmount: request.billAmount,
        billPercentage: request.billPercentage,
        arrears: request.arrears,
      }
    );

    if (assessmentResult.isFailure) {
      return Result.fail(assessmentResult.error);
    }

    // Map entity to DTO for response
    const responseDto = this.assessmentMapper.toPersistence(assessmentResult.value);

    return Result.ok(responseDto);
  }

  private validateRequest(request: CreateAssessmentRequest): Result<void> {
    if (!request.customerId) {
      return Result.fail('Customer ID is required');
    }
    if (request.monthlyIncome < 0) {
      return Result.fail('Monthly income cannot be negative');
    }
    return Result.ok();
  }
}
```

### 2.2 DTO (Data Transfer Object)

**File: `src/application/assessment/dtos/CreateAssessmentRequest.dto.ts`**
```typescript
export interface CreateAssessmentRequest {
  customerId: string;
  monthlyIncome: number;
  totalExpenses: number;
  disposableIncome: number;
  billAmount: number;
  billPercentage: number;
  arrears: number;
}
```

**File: `src/application/assessment/dtos/AssessmentResponse.dto.ts`**
```typescript
export interface AssessmentResponse {
  id: string;
  customerId: string;
  monthlyIncome: number;
  disposableIncome: number;
  billPercentage: number;
  hardshipLevel: string;
  confidenceScore: number;
  arrears: number;
  needsManualReview: boolean;
  createdAt: string;
}
```

### 2.3 Mapper (DTO ↔ Entity)

**File: `src/application/assessment/mappers/AssessmentMapper.ts`**
```typescript
import { Assessment } from '@/domain/referenceData/Assessment.entity';
import { AssessmentResponse } from '../dtos/AssessmentResponse.dto';

export class AssessmentMapper {
  // Entity → DTO
  toPersistence(entity: Assessment): AssessmentResponse {
    return {
      id: entity.id.toString(),
      customerId: entity.customerId,
      monthlyIncome: entity.props.monthlyIncome,
      disposableIncome: entity.getDisposableIncome(),
      billPercentage: entity.getBillPercentage(),
      hardshipLevel: entity.hardship.getLevel(),
      confidenceScore: entity.hardship.getConfidence(),
      arrears: entity.props.arrears,
      needsManualReview: entity.needsManualReview(),
      createdAt: entity.props.createdAt.toISOString(),
    };
  }

  // Domain ← DTO (not always needed)
  toDomain(raw: any): Assessment {
    // Convert raw data to entity
    // Usually not needed - use factory instead
  }
}
```

---

## 3. INFRASTRUCTURE LAYER (External Dependencies)

### 3.1 Repository Implementation

**File: `src/infrastructure/persistence/PrismaAssessmentRepository.ts`**
```typescript
import { IAssessmentRepository } from '@/domain/referenceData/IAssessmentRepository';
import { Assessment } from '@/domain/referenceData/Assessment.entity';
import { prisma } from '../shared/db';

export class PrismaAssessmentRepository implements IAssessmentRepository {
  async findById(id: string): Promise<Assessment | null> {
    const raw = await prisma.assessment.findUnique({
      where: { id },
    });

    if (!raw) return null;

    // Map Prisma data to domain entity
    return this.toDomain(raw);
  }

  async findByCustomerId(customerId: string): Promise<Assessment[]> {
    const raws = await prisma.assessment.findMany({
      where: { customer_id: customerId },
    });

    return raws.map((raw) => this.toDomain(raw));
  }

  async save(assessment: Assessment): Promise<void> {
    const raw = this.toPersistence(assessment);

    await prisma.assessment.upsert({
      where: { id: assessment.id.toString() },
      update: raw,
      create: raw,
    });
  }

  // Private methods
  private toDomain(raw: any): Assessment {
    // Reconstruct domain entity from Prisma data
    // Implementation details...
  }

  private toPersistence(assessment: Assessment): any {
    // Convert domain entity to Prisma-compatible format
    // Implementation details...
  }
}
```

### 3.2 External Service

**File: `src/infrastructure/services/EmailService.ts`**
```typescript
import { logger } from '../shared/logger';

export interface IEmailService {
  sendHardshipDetectionEmail(customerId: string, email: string): Promise<void>;
  sendPaymentReminder(customerId: string, email: string, daysUntilDue: number): Promise<void>;
}

export class EmailService implements IEmailService {
  async sendHardshipDetectionEmail(customerId: string, email: string): Promise<void> {
    try {
      // Call SES or SendGrid
      logger.info('Sending hardship detection email', { customerId, email });
      // Implementation...
    } catch (error) {
      logger.error('Failed to send hardship email', { customerId, error });
      throw error;
    }
  }

  async sendPaymentReminder(customerId: string, email: string, daysUntilDue: number): Promise<void> {
    // Implementation...
  }
}
```

---

## 4. PRESENTATION LAYER (HTTP)

### 4.1 Controller

**File: `src/presentation/assessment/AssessmentController.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import { CreateAssessmentUseCase } from '@/application/referenceData/usecases/CreateAssessment.usecase';
import { CreateAssessmentRequest } from '@/application/referenceData/dtos/CreateAssessmentRequest.dto';

export class AssessmentController {
  constructor(private createAssessmentUseCase: CreateAssessmentUseCase) {}

  async createAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract request data
      const request: CreateAssessmentRequest = {
        customerId: req.user.id,
        monthlyIncome: req.body.monthlyIncome,
        totalExpenses: req.body.totalExpenses,
        // ... other fields
      };

      // Execute use case
      const result = await this.createAssessmentUseCase.execute(request);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      // Return response
      res.status(201).json(result.value);
    } catch (error) {
      next(error);
    }
  }

  async getAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Similar pattern
  }
}
```

### 4.2 Routes

**File: `src/presentation/assessment/assessment.routes.ts`**
```typescript
import { Router } from 'express';
import { AssessmentController } from './AssessmentController';
import { authMiddleware } from '../shared/middleware/auth.middleware';

export function createAssessmentRoutes(controller: AssessmentController): Router {
  const router = Router();

  router.post('/', authMiddleware, (req, res, next) => controller.createAssessment(req, res, next));

  router.get('/:id', authMiddleware, (req, res, next) => controller.getAssessment(req, res, next));

  return router;
}
```

---

## SOLID Principles Applied

### S - Single Responsibility
- `Assessment.entity.ts` — Only represents assessment entity
- `CreateAssessmentUseCase` — Only orchestrates creation
- `AssessmentMapper` — Only maps DTO ↔ Entity
- `PrismaAssessmentRepository` — Only handles persistence

### O - Open/Closed
- `IAssessmentRepository` interface allows new implementations without changing existing code
- Services depend on interfaces, not concrete classes

### L - Liskov Substitution
- `PrismaAssessmentRepository` can be swapped with `MongoAssessmentRepository` without breaking code

### I - Interface Segregation
- Small, focused interfaces (`IAssessmentRepository`, `IEmailService`)
- Not forcing classes to implement methods they don't need

### D - Dependency Inversion
- High-level modules (use cases) depend on abstractions (interfaces)
- Low-level modules (infrastructure) implement interfaces
- Dependencies injected via constructor

---

## DDD Tactical Patterns

| Pattern | Location | Purpose |
|---------|----------|---------|
| **Entity** | `domain/assessment/Assessment.entity.ts` | Has identity & lifecycle |
| **Value Object** | `domain/assessment/Hardship.vo.ts` | Immutable, no identity |
| **Aggregate Root** | `Assessment` entity | Entry point for aggregate |
| **Repository** | `domain/assessment/IAssessmentRepository.ts` | Abstract data access |
| **Domain Service** | `domain/assessment/AssessmentService.ts` | Business logic across entities |
| **Use Case** | `application/.../usecases/` | Application orchestration |
| **DTO** | `application/.../dtos/` | Data transfer between layers |
| **Mapper** | `application/.../mappers/` | DTO ↔ Entity conversion |

---

## Clean Code Principles

### 1. Meaningful Names
```typescript
// ❌ Bad
const d = 5; // what is d?

// ✅ Good
const billPercentageThreshold = 25;
```

### 2. Small Functions (Single Purpose)
```typescript
// ❌ Bad - Too many responsibilities
async function processAssessment(data) {
  // validate, calculate, save, email... all in one
}

// ✅ Good - Each function does one thing
class AssessmentDomainService {
  private calculateHardship(data: FinancialData): Hardship { }
  private validateData(data: FinancialData): Result<void> { }
  async persistAssessment(assessment: Assessment): Promise<void> { }
}
```

### 3. No Magic Numbers
```typescript
// ❌ Bad
if (billPercentage > 25) { /* severe */ }

// ✅ Good
const SEVERE_HARDSHIP_THRESHOLD = 25;
if (billPercentage > SEVERE_HARDSHIP_THRESHOLD) { /* severe */ }
```

### 4. Comments Explain Why, Not What
```typescript
// ❌ Bad
// Check if percentage > 25
if (billPercentage > 25) { }

// ✅ Good
// Bill exceeds 25% of disposable income - regulatory definition of severe hardship
if (billPercentage > SEVERE_HARDSHIP_THRESHOLD) { }
```

### 5. Error Handling
```typescript
// ❌ Bad - Swallows errors
try {
  await assessmentRepository.save(assessment);
} catch (e) {
  // ignore
}

// ✅ Good - Proper error propagation
try {
  await assessmentRepository.save(assessment);
} catch (error) {
  logger.error('Failed to save referenceData', { error });
  throw new AssessmentPersistenceError('Could not save referenceData', error);
}
```

---

## File Naming Conventions

| File Type | Naming Convention | Example |
|-----------|-------------------|---------|
| Entity | `*.entity.ts` | `Assessment.entity.ts` |
| Value Object | `*.vo.ts` | `Hardship.vo.ts` |
| Enum | `*.enum.ts` | `HardshipLevel.enum.ts` |
| Interface | `I*.ts` | `IAssessmentRepository.ts` |
| Repository | `Prisma*.ts` | `PrismaAssessmentRepository.ts` |
| Service | `*.service.ts` | `EmailService.ts` |
| Use Case | `*.usecase.ts` | `CreateAssessment.usecase.ts` |
| DTO | `*Request.dto.ts` / `*Response.dto.ts` | `CreateAssessmentRequest.dto.ts` |
| Mapper | `*Mapper.ts` | `AssessmentMapper.ts` |
| Controller | `*Controller.ts` | `AssessmentController.ts` |
| Routes | `*.routes.ts` | `assessment.routes.ts` |

---

## Dependency Injection

**File: `src/config/container.ts` (Service Container)**
```typescript
import { IAssessmentRepository } from '@/domain/referenceData/IAssessmentRepository';
import { PrismaAssessmentRepository } from '@/infrastructure/persistence/PrismaAssessmentRepository';
import { AssessmentDomainService } from '@/domain/referenceData/AssessmentService';
import { CreateAssessmentUseCase } from '@/application/referenceData/usecases/CreateAssessment.usecase';
import { AssessmentController } from '@/presentation/referenceData/AssessmentController';

export class Container {
  static getAssessmentController(): AssessmentController {
    // Build dependency graph bottom-up
    const assessmentRepository: IAssessmentRepository = new PrismaAssessmentRepository();
    const assessmentDomainService = new AssessmentDomainService(assessmentRepository);
    const createAssessmentUseCase = new CreateAssessmentUseCase(
      assessmentRepository,
      assessmentDomainService,
      new AssessmentMapper()
    );

    return new AssessmentController(createAssessmentUseCase);
  }
}
```

---

## Testing Strategy

### Domain Layer (Unit Tests)
```typescript
// Test business logic in isolation
describe('Assessment Entity', () => {
  it('should determine SEVERE hardship when bill > 25%', () => {
    const assessment = Assessment.create({
      billPercentage: 35,
      // ...
    });

    expect(assessment.value.isUnaffordable()).toBe(true);
  });
});
```

### Application Layer (Integration Tests)
```typescript
// Test use cases with mocked repository
describe('CreateAssessmentUseCase', () => {
  it('should create referenceData and return DTO', async () => {
    const mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const usecase = new CreateAssessmentUseCase(mockRepository, /* ... */);
    const result = await usecase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.save).toHaveBeenCalled();
  });
});
```

### Presentation Layer (HTTP Tests)
```typescript
// Test HTTP endpoints
describe('POST /assessments', () => {
  it('should create referenceData and return 201', async () => {
    const response = await request(app)
      .post('/assessments')
      .set('Authorization', 'Bearer token')
      .send({
        monthlyIncome: 1500,
        billPercentage: 12,
        // ...
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});
```

---

## Key Takeaways

1. **Domain first** — Define business logic independently of frameworks
2. **Interface-based** — Depend on abstractions, not concrete implementations
3. **Single responsibility** — Each class/function does one thing well
4. **Testable** — Clean architecture makes testing easy
5. **Maintainable** — Changes are localized to their layers
6. **Scalable** — Easy to add new features without breaking existing code

This structure lets you:
- ✅ Test business logic without Express/Prisma
- ✅ Swap databases (Prisma → MongoDB) without changing domain
- ✅ Reuse domain logic across multiple interfaces (REST, GraphQL, Lambda)
- ✅ Onboard new developers with clear separation of concerns

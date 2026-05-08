# Clean Architecture Layers

## Overview

PROJECT BRIDGE follows Clean Architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                      │
│  (Controllers, Routes, HTTP Middleware, Request/Response)│
└──────────────────────┬──────────────────────────────────┘
                       │ (ValidatedRequest)
                       ↓
┌──────────────────────────────────────────────────────────┐
│              APPLICATION LAYER (Use Cases)               │
│  (Business workflows, orchestration, data transformation)│
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ↓                             ↓
┌──────────────────┐      ┌─────────────────────┐
│  DOMAIN LAYER    │      │ INFRASTRUCTURE      │
│  (Business Rules)│      │ (Databases, APIs)   │
│  - Entities      │      │ - Repositories      │
│  - Value Objects │      │ - External Services │
│  - Services      │      │ - Mappers           │
└──────────────────┘      └─────────────────────┘
```

---

## Layer Definitions

### 1. Presentation Layer (HTTP)

**Responsibility:** Handle HTTP requests/responses

**File Location:** `src/presentation/`

**Components:**
- Routes: Define endpoints
- Controllers: Handle HTTP protocol
- Middleware: Validation, authentication, error handling
- Mappers: Convert between HTTP and application layers

```typescript
// File: src/presentation/routes/assessments.ts

router.post(
  '/',
  validateRequest(createAssessmentSchema),  // ← Validation
  asyncHandler(async (req, res) => {
    const input = req.validated.body;       // ← Extract from HTTP
    
    // Call use case
    const assessment = await useCase.execute(input);
    
    res.status(201).json(assessment);       // ← Return HTTP response
  })
);
```

**Input:** HTTP request (JSON)  
**Output:** HTTP response (JSON)  
**Should NOT:** Contain business logic

---

### 2. Application Layer (Use Cases)

**Responsibility:** Orchestrate business workflows

**File Location:** `src/application/`

**Components:**
- Use Cases: Implement a user action/story
- DTOs: Data Transfer Objects (input/output)
- Services: Application-level services
- Mappers: Convert between layers

```typescript
// File: src/application/use-cases/CreateAssessmentUseCase.ts

export class CreateAssessmentUseCase {
  constructor(
    private assessmentRepository: IAssessmentRepository,
    private assessmentService: AssessmentDomainService
  ) {}

  async execute(input: CreateAssessmentInput): Promise<AssessmentDTO> {
    // Step 1: Validate business rules
    if (input.monthlyIncome < 0) {
      throw new DomainError('INVALID_INCOME', '...');
    }

    // Step 2: Call domain service for calculations
    const hardshipLevel = this.assessmentService.calculateHardship(input);

    // Step 3: Create aggregate
    const assessment = Assessment.create({
      customerId: input.customerId,
      monthlyIncome: input.monthlyIncome,
      hardshipLevel,
    });

    // Step 4: Persist via repository
    await this.assessmentRepository.save(assessment);

    // Step 5: Return DTO for HTTP response
    return AssessmentMapper.toDTO(assessment);
  }
}
```

**Input:** Validated HTTP request (typed)  
**Output:** Business result (DTO)  
**Should:** Orchestrate, NOT calculate business logic

---

### 3. Domain Layer (Business Rules)

**Responsibility:** Implement core business logic

**File Location:** `src/domain/`

**Components:**
- **Entities:** Objects with identity (Assessment, Customer)
- **Value Objects:** Objects without identity (Hardship, Money)
- **Aggregate Roots:** Entry point for an entity group
- **Domain Services:** Complex business logic
- **Repositories (Interface):** Data persistence contract

```typescript
// File: src/domain/entities/Assessment.ts

export class Assessment {
  // Entity with identity (id)
  
  static create(props: AssessmentProps): Assessment {
    // Validation of business rules
    if (props.monthlyIncome < 0) {
      throw new DomainError('INVALID_INCOME', '...');
    }
    return new Assessment(props);
  }

  calculateDisposableIncome(): number {
    // Business logic: pure function
    return this.monthlyIncome - this.totalExpenses;
  }
}

// File: src/domain/usecases/AssessmentDomainService.ts

export class AssessmentDomainService {
  calculateHardship(income: number, expenses: number): HardshipLevel {
    // Complex business logic
    const disposableIncome = income - expenses;
    
    if (disposableIncome < 500) return 'SEVERE';
    if (disposableIncome < 1000) return 'MODERATE';
    return 'LOW';
  }
}

// File: src/domain/value-objects/Hardship.ts

export class Hardship {
  // Value object: no identity, immutable
  
  constructor(private readonly level: HardshipLevel) {}

  static calculate(income: number, expenses: number): Hardship {
    // Business logic
    if (income - expenses < threshold) {
      return new Hardship('SEVERE');
    }
    return new Hardship('LOW');
  }

  getLevel(): HardshipLevel {
    return this.level;
  }
}
```

**Input:** Domain data (entities, value objects)  
**Output:** Business results  
**Should:** Pure business logic, no external dependencies

---

### 4. Infrastructure Layer

**Responsibility:** Technical implementations

**File Location:** `src/infrastructure/`

**Components:**
- **Repositories (Impl):** Concrete persistence (Prisma, SQL)
- **External Services:** API clients, email, payment
- **Mappers:** Convert domain ↔ database models
- **Utilities:** Logger, config, database

```typescript
// File: src/infrastructure/persistence/PrismaAssessmentRepository.ts

export class PrismaAssessmentRepository implements IAssessmentRepository {
  async save(assessment: Assessment): Promise<void> {
    // Technical implementation: interact with database
    await prisma.assessment.create({
      data: {
        id: assessment.getId(),
        customerId: assessment.getCustomerId(),
        monthlyIncome: assessment.getMonthlyIncome(),
        // ...
      },
    });
  }

  async findById(id: string): Promise<Assessment | null> {
    // Technical implementation: query database
    const record = await prisma.assessment.findUnique({
      where: { id },
    });

    if (!record) return null;

    // Reconstruct domain entity from database record
    return Assessment.fromPersistence(record);
  }
}
```

**Input:** Domain entities, queries  
**Output:** Persistence results, domain entities  
**Should:** Handle database/external system details

---

## Service vs Use Case: Clarification

### Terminology in Clean Architecture

| Term | Layer | Purpose | Example |
|------|-------|---------|---------|
| **Use Case** | Application | Orchestrate a user action | `CreateAssessmentUseCase` |
| **Application Service** | Application | Implement a use case | `CreateAssessmentService` |
| **Domain Service** | Domain | Complex business logic | `AssessmentDomainService` |
| **Infrastructure Service** | Infrastructure | External integrations | `EmailService`, `PaymentService` |

### In Your Project

**When I said "Service":**
```
I meant → "Application Service" / "Use Case"
```

The terms are **used interchangeably** in Node.js, but technically:

```typescript
// This is a USE CASE (Application Layer)
export class CreateAssessmentUseCase {
  async execute(input: CreateAssessmentInput): Promise<AssessmentDTO> {
    // Orchestrate the workflow
    // 1. Validate input
    // 2. Call domain usecases
    // 3. Call repositories
    // 4. Return result
  }
}

// Can also be called an "Application Service"
export class CreateAssessmentService {
  async create(input: CreateAssessmentInput): Promise<AssessmentDTO> {
    // Same thing - both terms valid
  }
}

// This is a DOMAIN SERVICE (Domain Layer)
export class AssessmentDomainService {
  calculateHardship(income: number, expenses: number): HardshipLevel {
    // Pure business logic
    // No external dependencies
  }
}
```

---

## Request Flow Through Layers

```
1. HTTP Request
   ↓
2. PRESENTATION: validateRequest(schema)
   → Validates input
   → Extracts: req.validated.body
   ↓
3. PRESENTATION: Route handler
   → Creates use case instance
   → Calls: useCase.execute(input)
   ↓
4. APPLICATION: Use Case
   → Receives typed, validated input
   → Orchestrates workflow:
      a) Call domain service
      b) Call repository
      c) Transform result
   → Returns DTO
   ↓
5. PRESENTATION: Route handler
   → Returns HTTP response: res.json(dto)
   ↓
6. HTTP Response
```

---

## Data Flow Between Layers

```
┌──────────────┐
│ HTTP Request │  Content-Type: application/json
└──────┬───────┘
       │ req.body (raw)
       ↓
┌─────────────────────────┐
│   VALIDATION MIDDLEWARE │  Zod schema validates
└──────┬───────────────────┘
       │ req.validated.body (typed)
       ↓
┌─────────────────────────┐
│  PRESENTATION: Route    │  Extract, create use case
└──────┬───────────────────┘
       │ CreateAssessmentInput (DTO)
       ↓
┌─────────────────────────┐
│  APPLICATION: Use Case  │  Orchestrate
└──────┬───────────────────┘
       │ Domain entities + commands
       ↓
┌──────────────────────┐
│  DOMAIN: Entities    │  Business logic
└──────┬───────────────┘
       │ Aggregate root (Assessment)
       ↓
┌──────────────────────┐
│  INFRASTRUCTURE      │  Persist
└──────┬───────────────┘
       │ AssessmentDTO
       ↓
┌──────────────────────┐
│  PRESENTATION: Route │  Format response
└──────┬───────────────┘
       │ JSON
       ↓
┌──────────────────────┐
│  HTTP Response       │
└──────────────────────┘
```

---

## Dependency Direction (Dependency Inversion)

**Rule:** Inner layers should NOT depend on outer layers

```
Presentation → Application → Domain ← Infrastructure
                                ↑
                          Repositories
                          (Interface in Domain)
```

**Correct:**
```typescript
// Domain defines interface
export interface IAssessmentRepository {
  save(assessment: Assessment): Promise<void>;
}

// Application depends on interface
export class CreateAssessmentUseCase {
  constructor(private repo: IAssessmentRepository) {}
}

// Infrastructure implements interface
export class PrismaAssessmentRepository implements IAssessmentRepository {
  // Implementation
}

// Presentation creates and wires up
const repo = new PrismaAssessmentRepository();
const useCase = new CreateAssessmentUseCase(repo);
```

**Wrong:**
```typescript
// ❌ Application depending on infrastructure
export class CreateAssessmentUseCase {
  constructor(private repo: PrismaAssessmentRepository) {} // Direct!
}
```

---

## Your Current Structure

Based on your CLAUDE.md, you have:

```
src/
├── domain/                    ← Business rules
│   ├── entities/             ← Assessment, Customer
│   ├── value-objects/        ← Hardship, Money
│   ├── services/             ← Business logic (AssessmentDomainService)
│   ├── repositories/          ← Interfaces (IAssessmentRepository)
│   └── errors/               ← DomainError
│
├── application/              ← Use cases (called "services" is fine)
│   ├── use-cases/            ← CreateAssessmentUseCase
│   ├── services/             ← Application services
│   ├── dtos/                 ← Data transfer objects
│   └── mappers/              ← Entity ↔ DTO conversion
│
├── infrastructure/           ← Technical implementations
│   ├── persistence/          ← Repositories (Prisma)
│   ├── external/             ← API clients, email
│   └── mappers/              ← Domain ↔ Database
│
└── presentation/             ← HTTP layer
    ├── routes/               ← Express routes
    ├── controllers/          ← HTTP handlers
    ├── middleware/           ← Validation, auth, errors
    └── mappers/              ← HTTP ↔ Application
```

---

## Summary

| Layer | Purpose | Contains | Depends On |
|-------|---------|----------|-----------|
| **Presentation** | HTTP protocol | Routes, middleware | Application |
| **Application** | Use cases / workflows | Use cases, DTOs | Domain |
| **Domain** | Business rules | Entities, services, interfaces | Nothing (pure) |
| **Infrastructure** | Technical details | Repositories, external services | Domain interfaces |

**Service ≈ Use Case** (both terms valid, refer to Application Layer)

When creating a new API:
1. **Define schema** (Presentation)
2. **Create use case** (Application) ← This is the "service"
3. **Implement domain logic** (Domain)
4. **Implement persistence** (Infrastructure)


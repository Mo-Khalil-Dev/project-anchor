# Logging Guide

PROJECT BRIDGE uses a structured JSON logging system built on an `ILogger` abstraction. Every log entry is a typed envelope — consistent shape across all environments, CloudWatch-ready out of the box.

---

## Log Envelope

Every log entry looks like this:

```json
{
  "timestamp": "2026-04-19T13:00:00.000Z",
  "level": "info",
  "service": "bridge-backend",
  "environment": "production",
  "runtime": "ecs",
  "message": "Assessment created",
  "traceId": "8b3d1260-56fe-45e2-bf66-d6607a375260",
  "context": {
    "customerId": "cust-123",
    "assessmentId": "assess-456",
    "durationMs": 42
  }
}
```

When an error is passed, an `error` block is added:

```json
{
  "timestamp": "2026-04-19T13:00:00.000Z",
  "level": "error",
  "service": "bridge-backend",
  "environment": "production",
  "runtime": "ecs",
  "message": "Assessment creation failed",
  "traceId": "8b3d1260-56fe-45e2-bf66-d6607a375260",
  "context": {
    "customerId": "cust-123"
  },
  "error": {
    "name": "DomainError",
    "code": "INVALID_INCOME",
    "message": "Monthly income must be positive",
    "statusCode": 400,
    "details": { "received": -500 },
    "stack": "..."
  }
}
```

> `stack` is only included when `NODE_ENV=development`.

---

## ILogger Interface

```typescript
interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: unknown, context?: LogContext): void;
  child(bindings: LogContext): ILogger;
}
```

`LogContext` is `Record<string, unknown>` — any key-value pairs relevant to the operation.

---

## Getting the Logger

The logger is a singleton initialised at startup. Access it anywhere after `initLogger()` has run:

```typescript
import { getLogger } from '../shared/logging';

const logger = getLogger();
```

In services and use cases, prefer receiving the logger via the constructor rather than calling `getLogger()` inline — it keeps things testable:

```typescript
class CreateAssessmentUseCase {
  constructor(
    private readonly repo: IAssessmentRepository,
    private readonly logger: ILogger,
  ) {}
}
```

---

## Basic Usage

```typescript
logger.debug('Calculating disposable income', { customerId });
logger.info('Assessment created', { customerId, assessmentId, durationMs: 42 });
logger.warn('Low data quality score', { customerId, score: 0.6, threshold: 0.7 });
logger.error('Assessment failed', err);
logger.error('Assessment failed', err, { customerId, stage: 'income-calculation' });
```

---

## Request-Scoped Logging with `child()`

Bind context once at the start of a request or use case, then log freely without repeating those fields:

```typescript
// In Express middleware — bind traceId for the entire request
app.use((req, res, next) => {
  const traceId = req.headers['x-trace-id'] as string ?? uuidv4();
  req.logger = logger.child({ traceId });
  next();
});

// In a route handler — bind the resource ID
async function createAssessment(req, res) {
  const log = req.logger.child({ customerId: req.body.customerId });

  log.info('Starting assessment');              // traceId + customerId on every line
  const result = await useCase.execute(input);
  log.info('Assessment complete', { assessmentId: result.id });
}
```

`child()` is immutable — it returns a new logger and never mutates the parent.

---

## traceId

`traceId` is a special field. When passed in context or via `child()`, it is promoted to the top level of the envelope (not nested inside `context`). This makes it easy to query in CloudWatch Insights:

```typescript
// Both of these produce the same envelope shape
logger.info('msg', { traceId: 'abc', customerId: '123' });
logger.child({ traceId: 'abc' }).info('msg', { customerId: '123' });

// Result: { "traceId": "abc", "context": { "customerId": "123" } }
```

---

## Log Levels

| Level | When to use | Output stream |
|-------|-------------|---------------|
| `debug` | Internal state, query details, variable values | stdout |
| `info` | Normal operations — created, updated, completed | stdout |
| `warn` | Expected problems — low data quality, retries, fallbacks | stderr |
| `error` | Unexpected failures — exceptions, broken invariants | stderr |

The minimum level is controlled by `LOG_LEVEL` in your `.env`. Logs below that level are dropped silently.

```
LOG_LEVEL=debug   → all levels
LOG_LEVEL=info    → info, warn, error
LOG_LEVEL=warn    → warn, error only
LOG_LEVEL=error   → errors only
```

---

## Error Logging

Always pass the original error object as the second argument — never extract fields manually:

```typescript
// Good — full error envelope including code, statusCode, stack
logger.error('Assessment failed', err, { customerId });

// Bad — you lose the error structure and stack trace
logger.error('Assessment failed', undefined, {
  customerId,
  message: err.message,   // don't do this
});
```

For `DomainError` and `ApplicationError`, the logger automatically extracts `code`, `statusCode`, and `details` into the error envelope.

---

## In Use Cases

```typescript
export class CreateAssessmentUseCase {
  constructor(
    private readonly repo: IAssessmentRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(input: CreateAssessmentInput): Promise<Result<Assessment, DomainError>> {
    const log = this.logger.child({ customerId: input.customerId });

    log.debug('Validating assessment input');

    const assessment = Assessment.create(input);
    if (assessment.isFail) {
      log.warn('Assessment input invalid', { error: assessment.getError().message });
      return assessment;
    }

    const saved = await this.repo.save(assessment.getValue());
    log.info('Assessment created', { assessmentId: saved.id });

    return Result.ok(saved);
  }
}
```

---

## In Repositories

```typescript
export class PrismaAssessmentRepository implements IAssessmentRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: ILogger,
  ) {}

  async save(assessment: Assessment): Promise<Assessment> {
    const log = this.logger.child({ assessmentId: assessment.id });

    try {
      const record = await this.prisma.assessment.create({ data: AssessmentMapper.toPersistence(assessment) });
      log.debug('Assessment persisted');
      return AssessmentMapper.toDomain(record);
    } catch (err) {
      log.error('Failed to persist assessment', err);
      throw err;
    }
  }
}
```

---

## In Tests

Inject a mock logger — never rely on real log output in tests:

```typescript
import type { ILogger } from '../../../src/shared/logging';

const mockLogger: ILogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

const useCase = new CreateAssessmentUseCase(mockRepo, mockLogger);

// Assert logging behaviour when needed
expect(mockLogger.warn).toHaveBeenCalledWith(
  'Assessment input invalid',
  expect.objectContaining({ error: expect.any(String) }),
);
```

---

## CloudWatch Queries

Since every envelope is a single-line JSON object written to stdout, ECS routes it to CloudWatch automatically via the `awslogs` log driver. No SDK configuration needed.

Useful CloudWatch Insights queries:

```
# All errors in the last hour
fields @timestamp, message, error.code, context.customerId
| filter level = "error"
| sort @timestamp desc

# Trace a specific request end-to-end
fields @timestamp, level, message, context
| filter traceId = "8b3d1260-56fe-45e2-bf66-d6607a375260"
| sort @timestamp asc

# Slow operations
fields @timestamp, message, context.durationMs, context.customerId
| filter context.durationMs > 1000
| sort context.durationMs desc
```

# Event-Driven Architecture Implementation

## Overview

The Assessment processing system now uses event-driven architecture with environment-aware handlers:
- **Development/Demo:** BullMQ (Redis-based job queue)
- **Production:** SNS (AWS Simple Notification Service)

The use case (`HandleBankOAuthCallbackUseCase`) remains agnostic to the deployment mode through dependency injection.

## Architecture Pattern

### 1. Domain Events (Domain Layer)

**Event Definition:**
```typescript
// AssessmentReadyForProcessingEvent.ts
export class AssessmentReadyForProcessingEvent extends DomainEvent {
  readonly assessmentId: string;
  
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    payload: AssessmentReadyForProcessingPayload
  ) {
    super(aggregateId, 'Assessment', aggregateVersion);
    this.assessmentId = aggregateId;
  }
  
  getEventName(): string {
    return 'AssessmentReadyForProcessing';
  }
}
```

### 2. Aggregate Methods (Domain Layer)

**Assessment Aggregate:**

**`enrichWithBankData(income, expenses, breakdown)`** - Mutates aggregate with extracted bank data
- Parameters:
  - `income`: number (total monthly income)
  - `expenses`: number (total monthly expenses)
  - `breakdown`: JSON strings (breakdown data, history, sources, factors, payment plans)
- Behavior: Updates properties without raising event
- Use Case: Called after bank data extraction, before marking ready for processing

**`markReadyForProcessing()`** - Raises domain event
- Behavior: Raises `AssessmentReadyForProcessingEvent`
- Effect: Increments aggregate version
- Use Case: Signals that assessment is ready for background processing

### 3. Event Handlers (Infrastructure Layer)

#### BullMQ Handler (Development/Demo)
```typescript
// AssessmentReadyBullMQHandler.ts
export class AssessmentReadyBullMQHandler 
  implements IEventHandler<AssessmentReadyForProcessingEvent>
{
  // Features:
  // - Automatic retries (3 attempts)
  // - Exponential backoff (2s initial delay)
  // - Dead Letter Queue (failed jobs)
  // - Idempotency (jobId: assessment-{assessmentId})
  // - Concurrent processing (5 parallel jobs)
  // - Graceful shutdown
  // - Queue statistics
  
  async handle(event: AssessmentReadyForProcessingEvent): Promise<void> {
    await this.queue.add(
      'process-assessment',
      {
        assessmentId: event.assessmentId,
        eventName: event.getEventName(),
        timestamp: event.occurredAt.toISOString(),
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
        jobId: `assessment-${event.assessmentId}`,
      }
    );
  }
}
```

#### SNS Handler (Production)
```typescript
// AssessmentReadySnsEventHandler.ts
export class AssessmentReadySnsEventHandler 
  implements IEventHandler<AssessmentReadyForProcessingEvent>
{
  // Features:
  // - AWS SNS integration
  // - Message attributes for filtering
  // - CloudWatch logging
  // - Error handling with retry
  
  async handle(event: AssessmentReadyForProcessingEvent): Promise<void> {
    const message = {
      eventName: event.getEventName(),
      assessmentId: event.assessmentId,
      aggregateId: event.aggregateId,
      aggregateVersion: event.aggregateVersion,
      occurredAt: event.occurredAt.toISOString(),
      payload: event.payload,
    };
    
    await this.snsClient.send(
      new PublishCommand({
        TopicArn: this.topicArn,
        Message: JSON.stringify(message),
        Subject: 'AssessmentReadyForProcessing',
        MessageAttributes: {
          eventName: { DataType: 'String', StringValue: 'AssessmentReadyForProcessing' },
          assessmentId: { DataType: 'String', StringValue: event.assessmentId },
        },
      })
    );
  }
}
```

### 4. Use Case (Application Layer)

**HandleBankOAuthCallbackUseCase:**

Accepts event handler as dependency:
```typescript
constructor(
  private repository: IBankConnectionRepository,
  private assessmentRepository: IAssessmentRepository,
  private tinkService: TinkOAuthService,
  private prisma: PrismaClient,
  private logger: ILogger,
  private eventHandler: IEventHandler<AssessmentReadyForProcessingEvent>,
) { }
```

Execution flow:
1. Validate OAuth state and fetch bank connection
2. Get customer data
3. Exchange OAuth code for access token
4. Fetch income and expense data from Tink API
5. Extract key figures and save raw JSON to BankReports
6. **Create Assessment aggregate** using `Assessment.create()`
7. **Enrich with bank data** using `assessment.enrichWithBankData()`
8. **Mark as ready** using `assessment.markReadyForProcessing()` (raises event)
9. **Save assessment** using repository (persists mutable properties)
10. **Update bank connection** status
11. **Call event handler** with the raised event (publishes to queue/SNS)
12. Return success response

```typescript
// Create and enrich aggregate
const assessment = Assessment.create(connection.customerId, connection.id);
assessment.enrichWithBankData(income.total, expenses.total, {
  incomeBreakdown: JSON.stringify(income),
  expenseBreakdown: JSON.stringify(expenses),
  expensesByCategory: JSON.stringify(expenseData),
  incomeHistory: JSON.stringify(incomeData),
  incomeSources: JSON.stringify(income),
  factors: null,
  paymentPlans: null,
});

// Mark ready (raises event)
assessment.markReadyForProcessing();

// Save aggregate
const saveResult = await this.assessmentRepository.save(assessment);

// Publish event
const events = assessment.getDomainEvents();
for (const event of events) {
  if (event.getEventName() === 'AssessmentReadyForProcessing') {
    await this.eventHandler.handle(event as AssessmentReadyForProcessingEvent);
  }
}
```

### 5. Dependency Injection (Feature Router)

**BankConnection Router:**

Environment-based handler selection:
```typescript
const environment = process.env.NODE_ENV ?? 'development';
let eventHandler: IEventHandler<AssessmentReadyForProcessingEvent>;

if (environment === 'production') {
  // Production: use SNS
  const awsRegion = process.env.AWS_REGION ?? 'us-east-1';
  const topicArn = process.env.AWS_ASSESSMENT_TOPIC_ARN;
  eventHandler = new AssessmentReadySnsEventHandler(logger, awsRegion, topicArn);
} else {
  // Development/demo: use BullMQ
  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
  eventHandler = new AssessmentReadyBullMQHandler(redisUrl, processJobService as unknown as IBackgroundJob<string>, logger);
}

// Inject into use case
const handleCallback = new HandleBankOAuthCallbackUseCase(
  bankConnectionRepository,
  assessmentRepository,
  tinkService,
  prisma,
  logger,
  eventHandler
);
```

## Environment Configuration

### Development (NODE_ENV=development)
```bash
NODE_ENV=development
REDIS_URL=redis://localhost:6379
```

**Handler:** BullMQ
**Features:**
- Local Redis required
- Job persistence
- Automatic retries
- Dead Letter Queue
- Dashboard-friendly (can inspect jobs)

### Production (NODE_ENV=production)
```bash
NODE_ENV=production
AWS_REGION=us-east-1
AWS_ASSESSMENT_TOPIC_ARN=arn:aws:sns:us-east-1:ACCOUNT:assessment-topic
```

**Handler:** SNS
**Features:**
- Serverless (no infrastructure to manage)
- Multiple consumers via subscriptions
- CloudWatch integration
- Dead Letter Queue via DLQ topic

## Data Flow

```
OAuth Callback
    ↓
[Handle OAuth Callback Use Case]
    ↓
    ├─→ Validate & fetch bank connection
    ├─→ Get customer data
    ├─→ Exchange code for token
    ├─→ Fetch income/expense data
    ├─→ Extract figures & save to BankReports
    ├─→ [Create Assessment Aggregate]
    │   ├─→ Assessment.create()
    │   ├─→ assessment.enrichWithBankData()
    │   └─→ assessment.markReadyForProcessing() ← raises event
    ├─→ Save assessment (persists state + events)
    ├─→ Update bank connection
    └─→ [Publish Event]
        ├─→ [Dev] BullMQ → Redis → Background Job Worker
        └─→ [Prod] SNS → Topic Subscribers (Lambda, SQS, etc.)
```

## Background Processing

### Development (BullMQ)
1. Event published to BullMQ
2. Job added to Redis queue with idempotency key
3. Worker picks up job (max 5 concurrent)
4. Executes `ProcessAssessmentJob.execute(assessmentId)`
5. On success: job removed
6. On failure: job kept in failed set (manual inspection)
7. Automatic retry (3 attempts) with exponential backoff

### Production (SNS)
1. Event published to SNS topic
2. Subscriptions receive message (e.g., SQS queue)
3. Lambda function processes message
4. Lambda calls `ProcessAssessmentJob` via use case
5. On success: message deleted from queue
6. On failure: message moved to DLQ

## Assessment Repository Changes

Updated to support aggregate persistence:

```typescript
class PrismaAssessmentRepository implements IAssessmentRepository {
  async save(assessment: Assessment): Promise<Result<Assessment, Error>> {
    const persistenceData = this.mapper.toPersistence(assessment);
    const created = await prisma.assessment.create({
      data: {
        ...persistenceData,
        disposableIncome: assessment.calculateDisposableIncome(),
        billRatio: assessment.calculateBillRatio(),
        hardshipLevel: assessment.getHardshipLevel(),
        sustainabilityScore: assessment.getSustainabilityScore(),
      },
    });
    return Result.ok(this.mapper.toDomain(created));
  }

  async update(assessment: Assessment): Promise<Result<Assessment, Error>> {
    const persistenceData = this.mapper.toPersistence(assessment);
    const updated = await prisma.assessment.update({
      where: { id: assessment.getId() },
      data: {
        ...persistenceData,
        disposableIncome: assessment.calculateDisposableIncome(),
        billRatio: assessment.calculateBillRatio(),
        hardshipLevel: assessment.getHardshipLevel(),
        sustainabilityScore: assessment.getSustainabilityScore(),
        updatedAt: new Date(),
      },
    });
    return Result.ok(this.mapper.toDomain(updated));
  }
}
```

## Configuration Files

### .env.example
Added:
```
REDIS_URL=redis://localhost:6379
```

### docker-compose.yml
Added Redis service with BullMQ environment variables:
```yaml
redis:
  image: redis:7-alpine
  container_name: bridge-redis
  ports:
    - "6379:6379"

app:
  depends_on:
    - redis
  environment:
    REDIS_URL: redis://redis:6379
```

## Testing the Event-Driven Flow

### Setup (Development)

1. Start Redis:
```bash
# Option A: Docker
docker run -d --name bridge-redis -p 6379:6379 redis:7-alpine

# Option B: Local installation
brew install redis
redis-server
```

2. Build backend:
```bash
npm run build
```

3. Start backend:
```bash
NODE_ENV=development npm run dev
```

4. Verify BullMQ initialization by checking logs for:
```
[INFO] BullMQ handler initialized for assessment processing
[DEBUG] Assessment added to BullMQ queue
[INFO] Assessment job completed successfully
```

### End-to-End Test Flow

1. **Initiate Bank OAuth:**
   ```bash
   curl -X POST http://localhost:3001/api/bank-connections/initiate \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{"customerId": "cust_123"}'
   ```

2. **Complete OAuth in browser** with test credentials

3. **Backend processes callback:**
   - Creates Assessment aggregate
   - Enriches with bank data
   - Raises AssessmentReadyForProcessingEvent
   - Publishes to BullMQ
   - Backend responds with assessmentId

4. **BullMQ processes job:**
   - Worker picks up job from Redis queue
   - Executes ProcessAssessmentJob
   - Calculates hardship level, sustainability score
   - Updates assessment status
   - Job completes and is removed from queue

5. **Verify in database:**
   ```sql
   SELECT id, status, monthlyIncome, monthlyExpenses, 
          hardshipLevel, sustainabilityScore
   FROM Assessment
   ORDER BY createdAt DESC
   LIMIT 1;
   ```

## Production Deployment

### AWS Setup

1. Create SNS topic:
```bash
aws sns create-topic --name assessment-processing --region us-east-1
export TOPIC_ARN="arn:aws:sns:us-east-1:ACCOUNT:assessment-processing"
```

2. Create SQS queue (optional, for Lambda):
```bash
aws sqs create-queue --queue-name assessment-jobs --region us-east-1
```

3. Subscribe queue to topic:
```bash
aws sns subscribe --topic-arn $TOPIC_ARN \
  --protocol sqs \
  --notification-endpoint arn:aws:sqs:us-east-1:ACCOUNT:assessment-jobs
```

4. Deploy backend with environment:
```bash
NODE_ENV=production \
AWS_REGION=us-east-1 \
AWS_ASSESSMENT_TOPIC_ARN=$TOPIC_ARN \
npm run build && npm start
```

5. Create Lambda function to subscribe to SQS/SNS

## Key Benefits

### Dev/Demo
- **No AWS account needed:** Uses local Redis
- **Job persistence:** Survives restarts
- **Auto-retry:** Handles transient failures
- **Inspection:** Failed jobs inspectable in Redis
- **Fast iteration:** No AWS API calls

### Production
- **Serverless:** No Lambda orchestration needed
- **Scalable:** SNS handles any throughput
- **Decoupled:** Multiple consumers via subscriptions
- **Reliable:** AWS managed service (99.99% uptime)
- **Observable:** CloudWatch logs and metrics

## Migration Path (Future)

Currently:
1. Use case publishes to handler directly
2. Handler either enqueues (BullMQ) or publishes (SNS)

Future (Phase 2):
1. Use case publishes events via EventBus
2. EventBus routes to multiple handlers
3. Multiple handlers can subscribe to same event
4. Example: AssessmentReadyEvent → BullMQ + Slack notification + Analytics

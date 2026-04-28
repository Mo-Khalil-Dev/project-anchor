# Backend Coding Patterns

This document shows *how* the architectural rules described in [ARCHITECTURE.md](ARCHITECTURE.md) are applied in actual code. Each section names the pattern, explains it in two sentences, gives a minimal code example, and points to the canonical file.

---

## Table of Contents

1. [Result\<T, E\> — Railway-Oriented Error Handling](#1-resultt-e--railway-oriented-error-handling)
2. [Error Hierarchy](#2-error-hierarchy)
3. [Global Error Handler](#3-global-error-handler)
4. [Use Case Pattern](#4-use-case-pattern)
5. [Repository Pattern](#5-repository-pattern)
6. [Domain Entity Pattern](#6-domain-entity-pattern)
7. [Provider / Factory Pattern](#7-provider--factory-pattern)
8. [Dependency Injection via Route Factories](#8-dependency-injection-via-route-factories)
9. [Controller Pattern](#9-controller-pattern)
10. [asyncHandler Wrapper](#10-asynchandler-wrapper)
11. [Validation Middleware (Zod)](#11-validation-middleware-zod)
12. [Universal Response Shape](#12-universal-response-shape)
13. [Authentication Middleware](#13-authentication-middleware)
14. [Structured Logging + Child Logger](#14-structured-logging--child-logger)
15. [Configuration Management](#15-configuration-management)
16. [Token Management](#16-token-management)
17. [External Service Integration](#17-external-service-integration)
18. [Prisma Singleton](#18-prisma-singleton)
19. [Middleware Stack Order](#19-middleware-stack-order)
20. [Startup & Graceful Shutdown](#20-startup--graceful-shutdown)
21. [Test Conventions](#21-test-conventions)

---

## 1. `Result<T, E>` — Railway-Oriented Error Handling

`Result<T, E>` is used throughout the domain, application, and infrastructure layers to represent either a success value or a failure value without throwing. Methods never throw inside a `Result`-returning function — they return `Result.fail(error)` instead.

```ts
// src/shared/result/Result.ts
const result = await repository.findById(id);

if (result.isFail) {
  return Result.fail(result.getError()!);
}

const assessment = result.getOrThrow();

// Or with pattern matching
result.match(
  (data)  => res.json({ success: true, data }),
  (error) => next(error),
);
```

Key operations:
| Method | Purpose |
|--------|---------|
| `Result.ok(value)` | Wrap a success |
| `Result.fail(error)` | Wrap a failure |
| `result.isOk / isFail` | Check state |
| `result.getOrThrow()` | Extract value (throws if fail) |
| `result.map(fn)` | Transform the success value |
| `result.flatMap(fn)` | Chain result-returning functions |
| `result.match(onOk, onFail)` | Handle both branches |
| `result.tap(onOk?, onFail?)` | Side-effect without changing result |
| `combineResults(results[])` | Collect an array of results into one |
| `wrapAsync(fn)` | Wrap an async function that may throw |

Canonical file: `src/shared/result/Result.ts`

---

## 2. Error Hierarchy

Errors are classified into three categories so the global error handler can map each to the right HTTP status without inspecting messages.

```
Error (built-in)
├── DomainError          → always 400 (business rule violation)
├── ApplicationError     → status set by thrower
│   └── ValidationError  → always 400 (invalid request data)
└── Auth-specific errors (extend ApplicationError or DomainError)
    ├── AuthenticationError
    ├── InvalidTokenError
    ├── TokenExpiredError
    ├── InvalidStateError
    └── RefreshTokenRevocationError
```

```ts
// src/domain/errors/DomainError.ts
throw new DomainError('ASSESSMENT_NOT_FOUND', 'No assessment exists for this customer');

// src/shared/errors/ApplicationError.ts
throw new ApplicationError('AUTH_FAILED', 'Invalid credentials', 401);

// src/shared/errors/ValidationError.ts  (always 400)
throw new ValidationError('INVALID_INPUT', 'Validation failed', zodError.flatten().fieldErrors);
```

Canonical files:
- `src/domain/errors/DomainError.ts`
- `src/shared/errors/ApplicationError.ts`
- `src/shared/errors/ValidationError.ts`
- `src/domain/auth/AuthErrors.ts`

---

## 3. Global Error Handler

A single 4-parameter Express middleware at the end of the stack converts any thrown/passed error into a JSON response. Controllers never handle errors themselves — they either use `Result.match` or `throw`.

```ts
// src/presentation/middleware/globalErrorHandler.ts
app.use(globalErrorHandler(logger, config));

// Handler logic (simplified)
if (error instanceof ValidationError) {
  res.status(400).json({ success: false, error: { code: error.code, message: error.message, details: error.details } });
  return;
}
if (error instanceof DomainError) {
  res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
  return;
}
if (error instanceof ApplicationError) {
  res.status(error.statusCode).json({ success: false, error: { code: error.code, message: error.message } });
  return;
}
// Unknown error → 500
logger.error('Unhandled error', { traceId, error });
res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
```

Each error response also includes a unique `traceId` for correlation. Stack traces are only included when `ENABLE_ERROR_STACK_TRACES=true`.

Canonical file: `src/presentation/middleware/globalErrorHandler.ts`

---

## 4. Use Case Pattern

Each operation is a class with a single `execute(input)` method. The class constructor receives its dependencies as interfaces, not concrete implementations.

```ts
// src/application/use-cases/auth/InitiateLoginUseCase.ts
export interface InitiateLoginInput  { redirectUri: string }
export interface InitiateLoginOutput { loginUrl: string; state: string }

export class InitiateLoginUseCase {
  constructor(private authProvider: IAuthProvider) {}

  async execute(input: InitiateLoginInput): Promise<InitiateLoginOutput> {
    const { loginUrl, state } = await this.authProvider.initiateLogin(input.redirectUri);
    return { loginUrl, state };
  }
}
```

Rules:
- `Input` and `Output` interfaces are defined in the same file.
- `execute` is the only public method.
- No HTTP concepts (Request, Response, status codes) enter the use case.
- Complex use cases (e.g. `HandleBankOAuthCallbackUseCase`) still follow the same signature — complexity lives inside `execute`, not in the interface.

Canonical folder: `src/application/use-cases/`

---

## 5. Repository Pattern

Every repository has an interface in the domain layer and a Prisma implementation in the infrastructure layer. All methods return `Result<T, Error>` — they never throw.

```ts
// src/domain/repositories/IAssessmentRepository.ts
export interface IAssessmentRepository {
  save(assessment: Assessment): Promise<Result<Assessment, Error>>;
  findById(id: string): Promise<Result<Assessment | null, Error>>;
  findByCustomerId(customerId: string): Promise<Result<Assessment[], Error>>;
  update(assessment: Assessment): Promise<Result<Assessment, Error>>;
}

// src/infrastructure/persistence/PrismaAssessmentRepository.ts
export class PrismaAssessmentRepository implements IAssessmentRepository {
  async save(assessment: Assessment): Promise<Result<Assessment, Error>> {
    try {
      const record = await this.prisma.assessment.create({ data: this.toPersistence(assessment) });
      return Result.ok(this.toDomain(record));
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private toDomain(record: PrismaAssessment): Assessment { /* map fields */ }
  private toPersistence(entity: Assessment): Prisma.AssessmentCreateInput { /* map fields */ }
}
```

The `toDomain` / `toPersistence` mapping methods are always private. The domain entity never leaks Prisma types.

Canonical files:
- `src/domain/repositories/IAssessmentRepository.ts`
- `src/infrastructure/persistence/PrismaAssessmentRepository.ts`

---

## 6. Domain Entity Pattern

Entities have private constructors, a `static create()` factory, readonly properties, and no setters. Business calculations live on the entity, not in services.

```ts
// src/domain/entities/Assessment.entity.ts
export class Assessment {
  private readonly id: string;
  private readonly monthlyIncome: number;
  private readonly monthlyExpenses: number;
  private status: AssessmentStatus;  // only mutable field

  private constructor(private readonly props: AssessmentProps) {
    this.id = props.id;
    // ...
  }

  static create(props: Omit<AssessmentProps, 'createdAt' | 'updatedAt'>): Assessment {
    return new Assessment({ ...props, createdAt: new Date(), updatedAt: new Date() });
  }

  // Getters — no setters
  getId(): string { return this.id; }
  getStatus(): AssessmentStatus { return this.status; }

  // Business logic belongs here
  calculateDisposableIncome(): number {
    return Math.round((this.monthlyIncome - this.monthlyExpenses) * 100) / 100;
  }

  getHardshipLevel(): HardshipLevel {
    const ratio = this.calculateBillRatio();
    if (ratio > 25) return 'SEVERE';
    if (ratio > 10) return 'MODERATE';
    if (ratio > 0)  return 'LOW';
    return 'NONE';
  }

  // State transitions
  markAsCompleted(): void {
    this.status = 'COMPLETED';
    this.updatedAt = new Date();
  }
}
```

Canonical file: `src/domain/entities/Assessment.entity.ts`

---

## 7. Provider / Factory Pattern

When a feature has multiple possible implementations (e.g. Cognito in production, Mock in development), define an interface in the domain layer and a factory function that returns the right implementation based on config.

```ts
// src/domain/auth/IAuthProvider.ts
export interface IAuthProvider {
  initiateLogin(redirectUri: string): Promise<{ loginUrl: string; state: string }>;
  handleCallback(code: string, state: string, redirectUri: string): Promise<AuthTokens & { user: AuthUser }>;
  refreshAccessToken(refreshToken: string): Promise<AuthTokens>;
  validateAccessToken(token: string): Promise<AuthUser>;
  revokeRefreshToken(refreshToken: string): Promise<void>;
}

// src/shared/config/providers/auth-provider.factory.ts
export function createAuthProvider(config: AppConfig): IAuthProvider {
  switch (config.auth.provider) {
    case 'cognito': return new CognitoAuthProvider(config.auth.cognito);
    case 'mock':
    default:        return new MockAuthProvider(config);
  }
}
```

Use cases and services always receive `IAuthProvider`, never a concrete class.

Canonical files:
- `src/domain/auth/IAuthProvider.ts`
- `src/infrastructure/auth/CognitoAuthProvider.ts`
- `src/infrastructure/auth/MockAuthProvider.ts`

---

## 8. Dependency Injection via Route Factories

There is no DI container. Dependencies are wired manually in route factory functions that are called once at startup. Each factory instantiates repositories, services, and use cases, then passes them into the controller.

```ts
// src/presentation/routes/bankConnection.routes.ts
export function createBankConnectionRoutes(config: AppConfig, logger: ILogger): Router {
  const router = Router();

  const prisma = new PrismaClient();
  const repo   = new PrismaBankConnectionRepository();
  const tink   = new TinkOAuthService(config, logger);

  const initiateUseCase  = new InitiateBankOAuthUseCase(repo, tink, logger);
  const callbackUseCase  = new HandleBankOAuthCallbackUseCase(repo, tink, logger);
  const controller       = new BankConnectionController(initiateUseCase, callbackUseCase);

  router.post('/initiate', asyncHandler(controller.initiateOAuthFlow.bind(controller)));
  router.get('/callback',  asyncHandler(controller.handleCallback.bind(controller)));

  return router;
}

// src/app.ts — called once
app.use('/api/bank-connections', createBankConnectionRoutes(config, logger));
```

Canonical files:
- `src/presentation/routes/bankConnection.routes.ts`
- `src/infrastructure/auth/authDependencies.ts`
- `src/app.ts`

---

## 9. Controller Pattern

Controllers are thin: they translate the HTTP request into a use-case input, call `execute`, then write the response. All error handling is delegated to the global error handler via `next(error)` or via `Result.match`.

```ts
// src/presentation/controllers/AssessmentController.ts
export class AssessmentController {
  constructor(private getAssessmentUseCase: GetAssessmentUseCase) {}

  async getAssessment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const result = await this.getAssessmentUseCase.execute({ assessmentId: req.params.id });
    result.match(
      (data)  => res.json({ success: true, data, timestamp: new Date().toISOString() }),
      (error) => next(error),
    );
  }
}
```

Rules:
- One method per route.
- No business logic in controllers.
- Always bind methods in the route factory: `controller.method.bind(controller)`.

Canonical folder: `src/presentation/controllers/`

---

## 10. `asyncHandler` Wrapper

Express does not forward unhandled promise rejections to `next`. Every async route handler must be wrapped with `asyncHandler` so rejections reach the global error handler.

```ts
// src/presentation/middleware/asyncHandler.ts
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage in route factory
router.post('/initiate', asyncHandler(controller.initiateOAuthFlow.bind(controller)));
```

Never register an `async` route handler directly on the router without this wrapper.

Canonical file: `src/presentation/middleware/asyncHandler.ts`

---

## 11. Validation Middleware (Zod)

Request shapes are defined as Zod schemas in `src/shared/validators/schemas.ts` and enforced by the `validateRequest` middleware. Validated data is attached to `req.validated` so controllers never access raw `req.body` / `req.params` / `req.query`.

```ts
// src/shared/validators/schemas.ts
export const createAssessmentSchema = z.object({
  body: z.object({
    customerId:       uuidSchema,
    monthlyIncome:    positiveNumber,
    totalExpenses:    nonNegativeNumber,
    billAmount:       positiveNumber,
    arrears:          nonNegativeNumber,
    incomeBreakdown:  z.record(z.string(), nonNegativeNumber),
    expenseBreakdown: z.record(z.string(), nonNegativeNumber),
  }),
});

// Route
router.post('/assessments', validateRequest(createAssessmentSchema), asyncHandler(controller.create.bind(controller)));

// Controller
const { customerId, monthlyIncome } = req.validated.body;
```

Available validators:
| Function | Validates |
|----------|-----------|
| `validateRequest(schema)` | body + params + query |
| `validateBody(schema)` | body only |
| `validateParams(schema)` | params only |
| `createStrictValidator(schema)` | Rejects unknown fields |
| `createPartialValidator(schema)` | PATCH endpoints |

Validation failures throw a `ValidationError` with Zod field-level details, which the global error handler returns as a 400.

Canonical files:
- `src/shared/validators/schemas.ts`
- `src/presentation/middleware/validateRequest.ts`

---

## 12. Universal Response Shape

Every endpoint returns one of two shapes. Controllers and the global error handler both follow this contract so the frontend can always call `unwrap`.

```ts
// Success
{ success: true,  data: T,      timestamp: string }

// Error
{ success: false, error: { code: string; message: string; details?: unknown }, timestamp: string }
```

Never return a bare value or a different top-level structure. The `timestamp` field is always `new Date().toISOString()`.

---

## 13. Authentication Middleware

A middleware factory wraps `ValidateTokenUseCase` and attaches `req.user` for downstream handlers. Routes that require auth list it before the route handler; public routes omit it.

```ts
// src/presentation/middleware/authenticateRequest.ts
export function createAuthenticateMiddleware(validateTokenUseCase: ValidateTokenUseCase) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Missing authorization' });
      return;
    }
    const result = await validateTokenUseCase.execute({ accessToken: header.slice(7) });
    if (!result.isValid) {
      res.status(401).json({ success: false, error: result.error });
      return;
    }
    req.user = result.user;
    next();
  };
}

// Usage in auth.routes.ts
router.get('/me', authMiddleware, asyncHandler(controller.getCurrentUser.bind(controller)));
```

The middleware is created once in the route factory and reused across routes.

Canonical file: `src/presentation/middleware/authenticateRequest.ts`

---

## 14. Structured Logging + Child Logger

The `ILogger` interface is injected into use cases and services that need to log. The concrete `ConsoleLogger` emits JSON to stdout (info/debug) or stderr (warn/error).

```ts
// src/shared/logging/ILogger.ts
interface ILogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info (message: string, context?: Record<string, unknown>): void;
  warn (message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): ILogger;
}

// Request tracing — create a child once per request
const reqLogger = logger.child({ traceId: req.headers['x-trace-id'] });
reqLogger.info('HTTP request', { method: req.method, path: req.path });
```

Each log line is a JSON object with:
`timestamp · level · service · environment · runtime · message · [traceId] · [context] · [error]`

Never pass an `Error` object as `message` — use `context.error`. Stack traces appear only when `ENABLE_ERROR_STACK_TRACES=true`.

Canonical files:
- `src/shared/logging/ILogger.ts`
- `src/shared/logging/ConsoleLogger.ts`
- `src/shared/logging/LoggerFactory.ts`

---

## 15. Configuration Management

Config is loaded once at startup, validated with a Zod schema, and frozen. All code receives `AppConfig` by injection — no `process.env` reads outside the config layer.

```ts
// src/shared/config/config.schema.ts  (simplified)
const envSchema = z.object({
  NODE_ENV:          z.enum(['development', 'test', 'production']),
  PORT:              z.coerce.number().default(3001),
  DATABASE_PROVIDER: z.enum(['sqlite', 'postgresql']).optional(),
  AUTH_PROVIDER:     z.enum(['mock', 'cognito']).default('mock'),
  // ...
}).superRefine((env, ctx) => {
  if (env.DATABASE_PROVIDER === 'postgresql' && !env.DATABASE_URL) {
    ctx.addIssue({ code: 'custom', message: 'DATABASE_URL required when DATABASE_PROVIDER=postgresql' });
  }
}).transform(env => ({
  server:   { port: env.PORT },
  database: { provider: env.DATABASE_PROVIDER, url: env.DATABASE_URL },
  auth:     { provider: env.AUTH_PROVIDER, jwtSecret: env.JWT_SECRET },
  // ...
}));

// src/shared/config/index.ts  — singleton
let _config: AppConfig | undefined;
export async function initConfig(): Promise<AppConfig> {
  if (_config) return _config;
  _config = Object.freeze(await createConfig());
  return _config;
}
```

When `RUNTIME=ecs`, the factory fetches secrets from AWS Secrets Manager and merges them over the env vars before validation. Feature flags (`ENABLE_EMAIL`, `ENABLE_PAYMENT_PROCESSING`, `ENABLE_BANK_OAUTH`, `ENABLE_ERROR_STACK_TRACES`) are parsed as booleans during the transform step.

Canonical files:
- `src/shared/config/config.schema.ts`
- `src/shared/config/config.types.ts`
- `src/shared/config/config.factory.ts`
- `src/shared/config/index.ts`

---

## 16. Token Management

Access tokens are short-lived (15 min) and returned in the response body. Refresh tokens are long-lived (7 days), sent as `httpOnly` `Secure` cookies, and stored in the database as SHA-256 hashes.

```ts
// src/application/services/TokenService.ts
async issueTokens(accessToken: string, refreshToken: string, user: AuthUser) {
  const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await this.prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: hash, expiresAt: sevenDaysFromNow() },
  });
}

async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  const stored = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.revokedAt) throw new InvalidTokenError('Refresh token invalid or revoked');
  if (stored.expiresAt < new Date()) throw new InvalidTokenError('Refresh token expired');
  return this.authProvider.refreshAccessToken(refreshToken);
}
```

The raw refresh token is never stored — only its hash. Revocation sets `revokedAt` (soft delete).

Canonical file: `src/application/services/TokenService.ts`

---

## 17. External Service Integration

Calls to third-party APIs (Tink) return `Result<T, Error>` and never throw. Service-level tokens are cached in memory with a 60-second safety buffer before the actual expiry.

```ts
// src/infrastructure/services/TinkOAuthService.ts
private cachedToken: { token: string; expiresAt: number } | null = null;

async getAccessToken(): Promise<Result<string, Error>> {
  if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
    return Result.ok(this.cachedToken.token);
  }
  try {
    const res  = await fetch(`${this.baseUrl}/oauth/token`, { method: 'POST', body: formData });
    const data = await res.json() as TinkTokenResponse;
    this.cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
    return Result.ok(data.access_token);
  } catch (err) {
    return Result.fail(new Error(`Tink token fetch failed: ${err}`));
  }
}
```

Canonical file: `src/infrastructure/services/TinkOAuthService.ts`

---

## 18. Prisma Singleton

A single `PrismaClient` instance is reused across the application to prevent connection pool exhaustion on hot-reload in development.

```ts
// src/utils/db.ts
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

Import `prisma` from `src/utils/db` everywhere. Never call `new PrismaClient()` directly in service or repository files.

Canonical file: `src/utils/db.ts`

---

## 19. Middleware Stack Order

The order of `app.use()` calls in `src/app.ts` is significant. The stack is:

```
1. helmet()                          — security headers
2. Manual CORS handler               — credentials=true requires manual setup
3. express.json()
4. express.urlencoded({ extended: true })
5. cookieParser()
6. Request logging middleware         — attaches child logger with traceId
7. /health route                     — no auth, no parsing
8. Route handlers                    — auth middleware applied per-route
9. 404 handler                       — catch-all after all routes
10. globalErrorHandler(logger, config) — must be last; 4 params
```

The global error handler **must** be registered last. If any middleware is added after it, unhandled errors will not reach it.

Canonical file: `src/app.ts`

---

## 20. Startup & Graceful Shutdown

`src/index.ts` is the entry point. It initialises config and logger before creating the Express app, and registers `SIGTERM` / `SIGINT` handlers to drain the server and disconnect Prisma cleanly.

```ts
// src/index.ts
async function main() {
  const config = await initConfig();
  const logger = initLogger(config);
  const app    = createApp(config, logger, prisma);

  const server = app.listen(config.server.port, () => {
    logger.info('Bridge backend started', { port: config.server.port, runtime: config.runtime });
  });

  const shutdown = async () => {
    logger.info('Shutting down gracefully');
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT',  shutdown);

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason });
  });
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error });
    process.exit(1);
  });
}

main().catch((err) => { console.error('Failed to start', err); process.exit(1); });
```

Canonical file: `src/index.ts`

---

## 21. Test Conventions

**Location** — unit tests live under `tests/unit/` mirroring the `src/` tree; integration tests under `tests/integration/`.

**Mocking** — Jest mocks are used at the boundary of the class under test:
```ts
// Mock the dependency, not the implementation
const mockRepository = { findById: jest.fn(), save: jest.fn() };
const useCase = new GetAssessmentUseCase(mockRepository as IAssessmentRepository);
```

**Result assertions** — when testing functions that return `Result`, always assert both branches:
```ts
it('returns ok when found', async () => {
  mockRepository.findById.mockResolvedValue(Result.ok(makeAssessment()));
  const result = await useCase.execute({ assessmentId: 'abc' });
  expect(result.isOk).toBe(true);
  expect(result.getOrThrow().getId()).toBe('abc');
});

it('returns fail when not found', async () => {
  mockRepository.findById.mockResolvedValue(Result.ok(null));
  const result = await useCase.execute({ assessmentId: 'missing' });
  expect(result.isFail).toBe(true);
});
```

**Describe organisation** follows BDD style: outer `describe` names the class or function; inner `describe` groups a scenario; `it` states the expected outcome.

**Shared fixtures** — create factory helpers for domain entities rather than duplicating constructor calls across test files.

Canonical folder: `tests/unit/`

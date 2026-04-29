# Memory

## Me
Mohamed Khalil — working on PROJECT BRIDGE, a hardship assessment platform for UK utility companies

## Projects
| Name | What |
|------|------|
| **PROJECT BRIDGE** | Hardship assessment platform that helps UK utilities identify customers struggling with bills and create fair, sustainable payment plans. Prevents disconnections through automated assessment + officer review. |

## Key Concepts
| Term | Meaning |
|------|---------|
| **Assessment** | Automated analysis of customer's income, expenses, and bill affordability to determine hardship level |
| **Hardship Levels** | SEVERE (bill > 25% of disposable income), MODERATE (10-25%), LOW (< 10%), NONE |
| **Payment Plans** | 3 options offered: Conservative (safe, longer), Balanced (medium), Aggressive (faster, higher risk) |
| **Sustainability Score** | HIGH/MEDIUM/LOW - indicates if customer can realistically keep paying the plan |
| **Disposable Income** | Income remaining after essential expenses (housing, food, transport, utilities) |
| **Arrears** | Outstanding utility bill debt that needs repayment |
| **PSR** | Priority Services Register - Ofgem requirement to protect vulnerable customers from wrongful disconnection |
| **Direct Debit** | Automatic payment setup (recommended for plan adherence) |
| **OAuth** | Secure bank connection method (customer's bank → Bridge, read-only) |
| **Manual Review Queue** | Cases flagged by system that need hardship officer decision |
| **Override** | Officer makes discretionary decision different from system recommendation (must document reason) |
| **Escalate** | Send case to senior officer for complex/vulnerable situations |

## Regulators & Standards
| Acronym | Full Name | Role |
|---------|-----------|------|
| **FCA** | Financial Conduct Authority | Financial regulator - requires affordability assessments, fair treatment documentation |
| **Ofgem** | Office of Gas and Electricity Markets | Utilities regulator - requires vulnerable customer protection (PSR), no wrongful disconnection |

## Key User Roles
| Role | What They Do |
|------|--------------|
| **Customer** | Applying for hardship support, choosing payment plans, making payments |
| **Hardship Officer** | Reviews flagged cases, approves/modifies payment plans, handles missed payments |
| **Manager** | Monitors team performance, queue health, consistency metrics |
| **Compliance Officer** | Audits decisions for fairness, regulatory compliance, discrimination detection |
| **Executive** | Views ROI, business impact, strategic metrics |
| **Policy Manager** | Configures hardship rules, affordability thresholds, vulnerability protections |

## Technical Architecture
- **7 Epics** in scope (Bank Connection → Assessment → Payment Management → Admin Queue → Performance → Policy → PSR Protection)
- **37 UI Screens** total needed (7 mockups created, 30 to build)
- **Phase 1 Priority:** Customer journey (assessment → payment plans → acceptance)
- **Phase 2 Priority:** Admin workflow (queue management, case review, modify plans)
- **MVP Critical Screens:** Assessment Overview, Payment Plan Options, Case Review, Modify Plan

## Frontend Architecture Rules

### Layering
Every API call must go through these layers in order — no layer may skip one below it:
```
UI hook → service → httpService → axios (client.ts)
```
- **Hooks** (`useX.ts`) call service methods only. No axios, no fetch, no direct HTTP.
- **Services** (`src/services/`) own the domain shape: typed inputs/outputs, `ApiResponse` unwrapping, error messages.
- **httpService** (`src/api/httpService.ts`) is the only file that imports axios.

### API Response Standard
All backend endpoints **must** return responses wrapped in `ApiResponse<T>`:
```ts
{ success: boolean; data?: T; error?: string }
```
- Every service method must call `.then(unwrap)` — never return the raw `ApiResponse` to a hook.
- The shared `unwrap<T>` utility lives in `src/api/unwrap.ts`. Never copy it inline into a service.

### URL Constants
All API URL strings must be defined in `src/api/endpoints.ts` under the `API` object.  
No URL string literals anywhere else in the codebase.

### Component Structure
Every component folder contains exactly three files:
- `ComponentName.tsx` — JSX only, no logic
- `useComponentName.ts` — all UI logic
- `ComponentName.module.css` — all styles

Max 15 lines of JSX per component file. Break larger components into named sub-components.  
All SVG icons live in `src/components/core/icons.tsx`. No inline SVGs elsewhere.

### Testing
Test files are co-located beside the source file (`Component.test.tsx`).  
Mock at the service boundary — hooks test against mocked services, never mocked axios.

## Backend Architecture Rules

### Organization: Vertical Slice by Feature

The backend uses **vertical slice architecture** where each feature owns all its code:

```
src/features/
├── auth/                  # Auth feature (login, tokens, validation)
├── customer/              # Customer management
├── bankConnection/        # Bank OAuth & data extraction
├── assessment/            # Assessment calculation & jobs
└── shared/                # Cross-feature code only
    ├── middleware/
    ├── config/
    ├── logging/
    ├── errors/
    ├── result/
    ├── validators/
    ├── utils/
    └── types/
```

### Feature Folder Structure

Each feature contains exactly 4 directories:

```
features/{feature}/
├── controllers/
│   └── {Feature}Controller.ts       # HTTP handlers; depends on use cases
├── services/
│   ├── {Operation}UseCase.ts        # Individual use case (separate class)
│   ├── {Operation}UseCase.ts        # Keep use cases as separate classes
│   └── ExternalService.ts           # External integrations (optional)
├── repositories/
│   ├── I{Feature}Repository.ts      # Interface definition
│   └── Prisma{Feature}Repository.ts # Implementation
├── types/
│   └── {feature}.types.ts           # DTOs, interfaces, enums
└── router.ts                        # Route setup + dependency injection
```

### Routing & Dependency Injection

Each feature router owns all DI for that feature:

```ts
// features/auth/router.ts
export function createAuthRouter(
  authProvider: IAuthProvider,
  prisma: PrismaClient,
  logger: ILogger
): Router {
  const router = Router();
  
  // Create use cases (keep separate classes)
  const initiateLoginUseCase = new InitiateLoginUseCase(authProvider);
  const handleCallbackUseCase = new HandleAuthCallbackUseCase(authProvider, prisma);
  
  // Create controller, pass use cases individually
  const controller = new AuthController(initiateLoginUseCase, handleCallbackUseCase);
  
  // Register routes
  router.get('/initiate-login', (req, res) => controller.initiateLogin(req, res));
  
  return router;
}
```

`app.ts` mounts all features:

```ts
const authProvider = initAuthProvider(config);
app.use('/api', createAuthRouter(authProvider, prisma, logger));
app.use('/api/customer', createCustomerRouter(prisma, logger, authMiddleware));
app.use('/api/bank-connections', createBankConnectionRouter(config, logger, authMiddleware, prisma));
```

### Use Cases Remain Separate Classes

**DO:** Create individual use case classes, keep them separate
```ts
// ✅ CORRECT
export class InitiateLoginUseCase {
  execute(input): Promise<Result<Output, Error>> { ... }
}

export class HandleAuthCallbackUseCase {
  execute(input): Promise<Result<Output, Error>> { ... }
}
```

**DON'T:** Consolidate into monolithic service
```ts
// ❌ WRONG — consolidate into one service class
export class AuthService {
  initiateLogin() { ... }
  handleCallback() { ... }
}
```

### Adding a New Endpoint

1. Create the use case class in `features/{feature}/services/`
2. Add method to controller in `features/{feature}/controllers/`
3. Import use case in `features/{feature}/router.ts`
4. Instantiate use case in DI section
5. Pass to controller constructor
6. Add route handler in router

**Example:**
```ts
// 1. Create use case
export class SendNotificationUseCase {
  constructor(private notificationService: NotificationService) {}
  execute(userId: string): Promise<Result<void, Error>> { ... }
}

// 2. Add controller method
class UserController {
  constructor(private sendNotification: SendNotificationUseCase) {}
  async notify(req: AuthenticatedRequest, res: Response) {
    const result = await this.sendNotification.execute(req.user.id);
    result.match(
      () => res.json({ success: true }),
      (err) => res.status(400).json({ error: err.message })
    );
  }
}

// 3. Wire in router.ts
const sendNotificationUseCase = new SendNotificationUseCase(notificationService);
const controller = new UserController(sendNotificationUseCase);

// 4. Register route
router.post('/notify', authMiddleware, asyncHandler(
  controller.notify.bind(controller)
));
```

### Adding a New Feature

1. Create `features/{newFeature}/` with 4 subdirectories
2. Create controller, use cases, repository (if needed)
3. Create `router.ts` with complete DI setup
4. Add feature types in `features/{newFeature}/types/`
5. Import router in `app.ts` and mount it

The new feature is now isolated from others.

### Repository Pattern

Repositories have two parts — interface and implementation:

```ts
// features/{feature}/repositories/I{Feature}Repository.ts
export interface I{Feature}Repository {
  find(id: string): Promise<Result<Entity, Error>>;
  save(entity: Entity): Promise<Result<void, Error>>;
}

// features/{feature}/repositories/Prisma{Feature}Repository.ts
export class Prisma{Feature}Repository implements I{Feature}Repository {
  constructor(private prisma: PrismaClient) {}
  
  async find(id: string): Promise<Result<Entity, Error>> {
    // Prisma implementation
  }
}
```

Use cases depend on **the interface**, not the concrete class:
```ts
export class MyUseCase {
  constructor(private repo: I{Feature}Repository) {}
}
```

### Deleting a Feature

All feature code is self-contained — deletion is simple:

1. Delete `features/{feature}/` directory
2. Remove its router import from `app.ts`
3. Remove router mount from `app.ts`

No scattered files across multiple layers to clean up.

## Known Tech Debt

These are tracked TODO comments in the codebase — do not fix inline unless the task is specifically about them.

| # | File | Issue | Priority |
|---|------|-------|----------|
| 1 | `backend/.../PrismaCustomerRepository.ts` | `isUserAlreadyLinked` duplicates `findCustomerIdByUserId` — refactor to a thin wrapper | Low |
| 2 | `backend/.../LinkUserToCustomerUseCase.ts` | Postcode regex too permissive (`[A-Za-z0-9\s]+`). Tighten to full UK format: `/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i` | Medium |
| 3 | `backend/.../LinkUserToCustomerUseCase.ts` | `utilityType` from form is not cross-validated against the found customer record — a user can link to a Gas account by claiming it's Electricity | Medium |
| 4 | `backend/.../LinkUserToCustomerUseCase.ts` | `const customer = existingCustomer` is a redundant alias — remove it | Low |
| 5 | `backend/.../CustomerController.ts` | Outer `try/catch` in `linkUserToCustomer` is redundant given `result.match` error routing — remove once confident | Low |
| 6 | `frontend/.../useCustomerSetup.ts` | `customer` state is set but never consumed by callers — remove or promote to a global customer context | Low |
| 7 | `frontend/.../useLinkingState.ts` | Utility type capitalisation uses `charAt(0).toUpperCase()` — replace with an explicit `{ water: 'Water', ... }` map | Low |

## Preferences
- Working with visual mockups as reference during development
- Screens follow Claude.ai design system (CSS variables for light/dark mode)
- Focus on plain English explanations (not legal jargon) throughout
- Emphasis on transparency & fairness in all customer-facing flows

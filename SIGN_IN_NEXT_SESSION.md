# Sign-In Feature Implementation - Next Session Handoff

## Current Status

**Feature Branch**: `feature/sign-in-authentication`  
**Phase**: Ready for Phase 1 Implementation (Backend Foundation)  
**Commits**: 4 commits with planning + schema updates  
**Database**: Prisma schema updated and synced

---

## What's Been Done ✅

### Documentation Complete (Committed)
1. **`docs/SIGN_IN_FEATURE.md`** (30 KB)
   - Complete architecture (IDP abstraction, backend layers, frontend)
   - OAuth 2.0 flow with JWT
   - Local dev with MockAuthProvider
   - Cognito sandbox setup
   - 30 tasks in 10 phases

2. **`docs/CUSTOMER_DATA_SEEDING.md`** (12 KB)
   - 20 realistic UK customer records
   - Addresses + postcodes for API testing
   - Prisma seed script approach
   - SQL backup approach

3. **`docs/USER_JOURNEYS.md`** (16 KB)
   - 7 complete user journeys
   - Post-login routing logic
   - Customer linking flow
   - RBAC (role-based access control)
   - Error handling + edge cases

### Prisma Schema Updated ✅
**New models added:**
- `User` (authentication, email, externalId from Cognito, role)
- `RefreshToken` (secure storage, hashed, revocable)
- `SessionLog` (audit trail for auth actions)

**Customer model updated:**
- Added: firstName, lastName, phone, address, postcode
- Added: utilityAccountNo, utilityType (for customer linking)
- Added: userId relation (1:1 link to User)

**Database**: SQLite synced with schema

### Config Ready
- `.env` environment variables documented
- Docker Compose configured for auth vars
- Cognito sandbox provisioning script planned

---

## What's Next: Phase 1 - Backend Foundation

### 4 Tasks to Complete

#### Task 1: Create Domain Layer
**Files to create:**
- `backend/src/domain/auth/IAuthProvider.ts` - Interface for IDP abstraction
- `backend/src/domain/auth/AuthErrors.ts` - Auth-specific error classes

**What it does:**
- Defines the contract for any IDP (Cognito, Auth0, Okta)
- Allows swapping implementations via config

**Implementation time:** ~30 minutes

---

#### Task 2: Update Backend Config
**Files to update:**
- `backend/src/shared/config/config.types.ts` - Add auth config type
- `backend/src/shared/config/config.factory.ts` - IDP provider factory

**What it does:**
- Define `auth.provider` config (cognito | mock | auth0)
- Create factory to instantiate correct IDP provider
- Support env vars: AUTH_PROVIDER, JWT_SECRET, COGNITO_*

**Implementation time:** ~20 minutes

---

#### Task 3: Create Prisma Migrations
**Already done:** ✅ Schema synced with database
**Verify:**
```bash
npm run prisma:studio  # Should show User, RefreshToken, SessionLog, Customer models
```

---

#### Task 4: Review Updated Customer & User Models
**Already done:** ✅ Schema updated
**Verify in `backend/prisma/schema.prisma`:**
```prisma
model User {
  id, email, externalId, firstName, lastName, role
  customerId, customer (relation to Customer)
  refreshTokens, sessionLogs
}

model Customer {
  id, email, firstName, lastName, phone, address, postcode
  utilityAccountNo, utilityType
  monthlyBill, arrears
  user (relation to User)
  bankConnections, assessments
}
```

---

## Key References

### Architecture Overview
```
Frontend → Axios (with interceptors)
         ↓
Backend → Authentication Middleware (validate JWT, load user+customer)
        ↓
  Domain Layer (IAuthProvider interface)
        ↓
  Infrastructure Layer (CognitoAuthProvider or MockAuthProvider)
        ↓
  Token Management (TokenService)
        ↓
  Database (User, RefreshToken, SessionLog, Customer)
```

### OAuth 2.0 Flow (High Level)
1. User clicks Sign In
2. Backend returns Cognito login URL + CSRF state
3. User authenticates with Cognito
4. Cognito redirects back with auth code
5. Backend exchanges code for tokens (JWT + refresh token)
6. Backend stores refresh token (hashed) in DB
7. Backend redirects to frontend with customer data
8. Frontend routes customer based on: linked? assessed? bank-connected?

### Post-Login Routing
```
User logs in
  ├─ Admin? → /admin/dashboard
  └─ Customer?
     ├─ Not linked to customer? → /link-customer
     └─ Linked to customer?
        ├─ No bank connection? → /bank-connection
        └─ Has bank connection?
           ├─ No assessment? → /assessment
           └─ Has assessment? → /payment-plan
```

---

## How to Get Started

### 1. Verify You're on the Feature Branch
```bash
git branch -v
# Should show: * feature/sign-in-authentication
```

### 2. Read the Documentation
```bash
# Full 30KB spec
cat docs/SIGN_IN_FEATURE.md

# Or specific sections
cat docs/USER_JOURNEYS.md        # User flows + RBAC
cat docs/CUSTOMER_DATA_SEEDING.md # Test data strategy
```

### 3. Check the Schema
```bash
cat backend/prisma/schema.prisma
# Should see User, RefreshToken, SessionLog models
# Should see Customer with address, postcode, utilityAccountNo
```

### 4. Start Phase 1 Implementation
```bash
# Task 1: Domain layer
# Create: backend/src/domain/auth/IAuthProvider.ts
# Create: backend/src/domain/auth/AuthErrors.ts

# Task 2: Config updates
# Update: backend/src/shared/config/config.types.ts
# Update: backend/src/shared/config/config.factory.ts
```

---

## Implementation Tasks (36 Total) - Organized

### Phase 1: Backend Foundation (4 tasks) ← START HERE
- [ ] Task 1: Create domain layer (IAuthProvider, AuthErrors)
- [ ] Task 2: Update config (config.types, config.factory)
- [ ] Task 3: Verify Prisma migrations (already done)
- [ ] Task 4: Verify Customer/User models (already done)

### Phase 2: IDP Implementations (2 tasks)
- [ ] Task 5: MockAuthProvider (local dev, no AWS)
- [ ] Task 6: CognitoAuthProvider (production)

### Phase 3: Token Management (1 task)
- [ ] Task 7: TokenService (issue, validate, refresh, revoke)

### Phase 4: Application Layer (5 tasks)
- [ ] Task 8: InitiateLoginUseCase
- [ ] Task 9: HandleAuthCallbackUseCase
- [ ] Task 10: RefreshAccessTokenUseCase
- [ ] Task 11: ValidateTokenUseCase
- [ ] Task 12: LogoutUseCase

### Phase 5: Presentation Layer (3 tasks)
- [ ] Task 13: authenticateRequest middleware
- [ ] Task 14: auth.routes & endpoints
- [ ] Task 15: AuthController

### Phase 6: Frontend State & Services (4 tasks)
- [ ] Task 16: Redux authSlice
- [ ] Task 17: authService
- [ ] Task 18: Axios interceptors
- [ ] Task 19: useAuth hook

### Phase 7: Frontend Components (4 tasks)
- [ ] Task 20: ProtectedRoute
- [ ] Task 21: LoginPage
- [ ] Task 22: AuthCallback
- [ ] Task 23: LinkCustomerPage

### Phase 8: Integration (3 tasks)
- [ ] Task 24: /auth/me endpoint
- [ ] Task 25: GetRedirectToJourneyUseCase
- [ ] Task 26: /api/auth/redirect-to-journey endpoint

### Phase 9: Setup & Seeding (5 tasks)
- [ ] Task 27: setup-cognito-sandbox.sh
- [ ] Task 28: create-cognito-test-users.sh
- [ ] Task 29: prisma/seed.ts (20 customers)
- [ ] Task 30: prisma/seeds/customers.sql
- [ ] Task 31: link-users-to-customers.sh

### Phase 10: Testing (5 tasks)
- [ ] Task 32: Test local auth (MockAuthProvider)
- [ ] Task 33: Test Cognito sandbox
- [ ] Task 34: Test customer linking
- [ ] Task 35: Test post-login routing
- [ ] Task 36: Seed database with customers

---

## Testing Locally (No AWS)

### Setup for Local Development
```bash
# 1. Update .env for mock provider
AUTH_PROVIDER=mock
JWT_SECRET=local-secret-for-testing

# 2. Start backend
npm run dev

# 3. Visit frontend (usually http://localhost:3000)
# 4. Click "Sign In"
# 5. Redirects to local mock login (http://localhost:3001/api/auth/mock-login)
# 6. Enter any email (e.g., test@example.com)
# 7. Backend generates JWT locally, redirects back
# 8. Frontend stores token, shows dashboard
```

### No Cognito Needed Yet
- MockAuthProvider handles auth locally
- Valid JWTs signed with JWT_SECRET
- Perfect for development + CI/CD

---

## Key Files to Know

### Backend
- `backend/src/domain/` - Business logic + interfaces
- `backend/src/application/` - Use cases
- `backend/src/infrastructure/` - External integrations (Cognito, DB)
- `backend/src/presentation/` - HTTP layer (routes, controllers)
- `backend/prisma/schema.prisma` - Database schema

### Frontend
- `frontend/src/store/slices/` - Redux state
- `frontend/src/services/` - API calls
- `frontend/src/api/` - HTTP client + endpoints
- `frontend/src/journeys/` - User flow pages

### Documentation (Reference)
- `docs/SIGN_IN_FEATURE.md` - Complete spec (start here for details)
- `docs/USER_JOURNEYS.md` - All user flows + RBAC
- `docs/CUSTOMER_DATA_SEEDING.md` - Test data strategy

---

## Questions to Answer in Next Session

If you need clarification while implementing:
1. **Token expiry**: How long should access tokens last? (Spec says 15 min)
2. **Refresh token rotation**: Issue new refresh token on each refresh? (Spec says optional)
3. **Rate limiting**: Should we add rate limits to auth endpoints?
4. **Signup**: Should we plan for signup journey (for post-MVP)?

---

## Success Criteria for Phase 1

You'll know Phase 1 is complete when:
- ✅ IAuthProvider interface defined
- ✅ AuthErrors defined (AuthenticationError, InvalidTokenError, etc.)
- ✅ Config supports `AUTH_PROVIDER=mock|cognito`
- ✅ Factory pattern creates correct provider based on config
- ✅ Prisma models verified (User, RefreshToken, SessionLog, Customer)
- ✅ No TypeScript errors
- ✅ Ready to move to Phase 2 (MockAuthProvider + CognitoAuthProvider)

---

## Commit Strategy

After each task, commit:
```bash
git add <files>
git commit -m "feat: Task X - <description>

- Specific change 1
- Specific change 2

See docs/SIGN_IN_FEATURE.md for full design"
```

Keep commits focused on one task at a time.

---

**Document Version**: 1.0  
**Created**: 2026-04-26  
**Status**: Ready for Implementation  
**Next Phase**: Phase 1 - Backend Foundation

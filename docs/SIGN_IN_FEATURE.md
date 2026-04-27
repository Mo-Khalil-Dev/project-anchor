# Sign-In Feature Implementation Guide

**Status**: Planning Phase  
**Feature Branch**: `feature/sign-in-authentication`  
**Last Updated**: 2026-04-26

## Overview

This document details the comprehensive sign-in authentication system for Project Bridge. The implementation prioritizes:
- **IDP Abstraction**: Cognito, Auth0, Okta interchangeable via configuration
- **Zero Frontend Secrets**: All sensitive data server-side only
- **Local Development**: Full auth testing without AWS access
- **MVP First**: Pre-created user accounts (signup added later)

---

## Table of Contents

1. [Architecture](#architecture)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Database Schema](#database-schema)
5. [Configuration](#configuration)
6. [Local Development](#local-development)
7. [Cognito Sandbox Setup](#cognito-sandbox-setup)
8. [OAuth 2.0 Flow](#oauth-20-flow)
9. [Security Considerations](#security-considerations)
10. [Implementation Tasks](#implementation-tasks)
11. [Testing Strategy](#testing-strategy)

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                            │
│ - Secure HttpOnly cookies only (customer data)             │
│ - NO tokens, NO secrets in JavaScript                      │
│ - Redux state for UI flags (loading, error, auth status)   │
└──────────────────┬──────────────────────────────────────────┘
                   │ httpOnly cookies auto-sent by browser
                   │ OR Authorization header (from Redux)
┌──────────────────▼──────────────────────────────────────────┐
│ BACKEND (Express)                                            │
│                                                             │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ IDP Abstraction Layer (Config-Injectable)              │ │
│ │                                                        │ │
│ │ interface IAuthProvider {                              │ │
│ │   getLoginUrl()                                        │ │
│ │   exchangeCodeForTokens()                              │ │
│ │   validateAccessToken()                                │ │
│ │   refreshAccessToken()                                 │ │
│ │ }                                                      │ │
│ │                                                        │ │
│ │ Implementations:                                       │ │
│ │ - CognitoAuthProvider (production)                     │ │
│ │ - MockAuthProvider (local dev, no AWS)                 │ │
│ │ - Auth0Provider (future)                              │ │
│ │ - OktaProvider (future)                               │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Token Management Service                               │ │
│ │ - Issue tokens (access + refresh)                      │ │
│ │ - Validate JWTs                                        │ │
│ │ - Refresh expired tokens                               │ │
│ │ - Revoke/logout tokens                                 │ │
│ │ - Store tokens in database                             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Authentication Middleware                              │ │
│ │ - Validates JWT from requests                          │ │
│ │ - Loads user + customer context                        │ │
│ │ - Prevents unauthenticated access                      │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Secure Database Layer                                  │ │
│ │ - User (mapped to Customer)                            │ │
│ │ - RefreshToken (hashed, revocable)                     │ │
│ │ - SessionLog (audit trail)                             │ │
│ └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

| Principle | Implementation |
|-----------|-----------------|
| **No Frontend Secrets** | All tokens, keys, secrets remain server-side |
| **IDP Agnostic** | Interface-based, swappable implementations |
| **Local First** | Works offline with mock provider |
| **Secure by Default** | httpOnly cookies, CSRF tokens, token revocation |
| **Audit Trail** | Session logs for compliance |

---

## Backend Implementation

### 1. Domain Layer (IDP Abstraction)

**File**: `backend/src/domain/auth/IAuthProvider.ts`

```typescript
/**
 * IDP abstraction - any auth provider implements this interface
 * This is the CONTRACT between business logic and IDP-specific code
 */
export interface TokenSet {
  accessToken: string;      // Short-lived JWT
  refreshToken: string;     // Long-lived token
  idToken?: string;         // Provider-dependent
  expiresIn: number;        // Seconds
  tokenType: string;        // "Bearer"
}

export interface TokenClaims {
  sub: string;              // User ID from IDP
  email: string;
  email_verified: boolean;
  aud?: string;
  iss?: string;
  iat: number;
  exp: number;
}

export interface IAuthProvider {
  getLoginUrl(state: string, redirectUri: string): Promise<string>;
  exchangeCodeForTokens(code: string, redirectUri: string): Promise<TokenSet>;
  validateAccessToken(token: string): Promise<TokenClaims>;
  refreshAccessToken(refreshToken: string): Promise<TokenSet>;
  revokeToken?(token: string): Promise<void>;
  verifyRefreshToken?(token: string): Promise<boolean>;
}
```

**File**: `backend/src/domain/auth/AuthErrors.ts`

```typescript
export class AuthenticationError extends ApplicationError {
  constructor(message = 'Authentication failed', code = 'AUTH_FAILED', details?: unknown) {
    super(message, code, 401, details);
  }
}

export class InvalidTokenError extends AuthenticationError {
  constructor(message = 'Invalid or malformed token') {
    super(message, 'INVALID_TOKEN');
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(message = 'Token has expired') {
    super(message, 'TOKEN_EXPIRED');
  }
}

export class UnauthorizedError extends AuthenticationError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED');
  }
}
```

### 2. Infrastructure Layer (Concrete Implementations)

**File**: `backend/src/infrastructure/auth/CognitoAuthProvider.ts`

- Integrates with AWS Cognito
- Calls Cognito token endpoint
- Validates JWTs with Cognito JWKS
- Implements complete IAuthProvider interface
- Used in staging/production

**File**: `backend/src/infrastructure/auth/MockAuthProvider.ts`

- Issues valid JWTs locally (signed with jwtSecret)
- No AWS SDK dependency
- Accepts any email/password (password ignored)
- Perfect for local development, CI/CD, feature testing
- Used in development by default

**File**: `backend/src/infrastructure/auth/TokenService.ts`

- Manages token lifecycle
- Issues, validates, refreshes tokens
- Stores/retrieves from database
- Implements token revocation
- Handles refresh token rotation (optional)

### 3. Application Layer (Use Cases)

**File**: `backend/src/application/auth/InitiateLoginUseCase.ts`

```typescript
// Input: void (uses config + random state)
// Output: { loginUrl: string; state: string }
// Purpose: Generate Cognito login URL + CSRF state token
// CSRF Protection: State validated on callback
```

**File**: `backend/src/application/auth/HandleAuthCallbackUseCase.ts`

```typescript
// Input: { code: string; state: string }
// Output: { userId: string; customerId: string }
// Purpose: Exchange auth code for tokens, create/update user
// Steps:
//   1. Validate state (CSRF check)
//   2. Exchange code for tokens (via IAuthProvider)
//   3. Extract claims (sub, email, etc.)
//   4. Create or update User in DB
//   5. Find associated Customer
//   6. Store refresh token (hashed)
//   7. Return user + customer data
```

**File**: `backend/src/application/auth/RefreshAccessTokenUseCase.ts`

```typescript
// Input: { refreshToken: string }
// Output: { accessToken: string; expiresIn: number }
// Purpose: Issue new access token from refresh token
// Validation:
//   1. Verify refresh token signature + expiry
//   2. Check if revoked (logout flag)
//   3. Call IAuthProvider.refreshAccessToken()
//   4. Update database
```

**File**: `backend/src/application/auth/ValidateTokenUseCase.ts`

```typescript
// Input: { token: string }
// Output: { claims: TokenClaims; user: User; customer: Customer }
// Purpose: Validate JWT + load user context
// Used by: authenticateRequest middleware
```

**File**: `backend/src/application/auth/LogoutUseCase.ts`

```typescript
// Input: { refreshToken?: string }
// Output: void
// Purpose: Revoke tokens, end session
// Steps:
//   1. Mark refresh token as revoked
//   2. Clear secure cookies
//   3. Optional: Call IAuthProvider.revokeToken()
```

### 4. Presentation Layer

**File**: `backend/src/presentation/middleware/authenticateRequest.ts`

```typescript
/**
 * Express middleware that protects routes
 * Validates JWT + loads user + customer context
 */
export function authenticateRequest(req: Request, res: Response, next: NextFunction) {
  // 1. Extract token from "Authorization: Bearer <token>"
  // 2. Call ValidateTokenUseCase
  // 3. Attach to request:
  //    - req.user = { id, email, externalId }
  //    - req.customer = { id, email, firstName, ... }
  // 4. Call next()
  // 5. On error → throw UnauthorizedError (401)
}
```

**File**: `backend/src/presentation/routes/auth.routes.ts`

```typescript
// POST /auth/login
//   ↓ GET Cognito login URL + CSRF state token
//   ← { loginUrl: string; state: string }

// GET /auth/callback?code=XXX&state=YYY
//   ↓ Exchange code for tokens
//   ↓ Create/update User
//   ↓ Store refresh token (hashed)
//   ↓ Set httpOnly cookie with customer data
//   ← Redirect to /dashboard

// POST /auth/refresh (requires authenticateRequest)
//   ↓ Get new access token from refresh token
//   ↓ Update httpOnly cookie
//   ← { accessToken: string; expiresIn: number }

// POST /auth/logout (requires authenticateRequest)
//   ↓ Revoke refresh token
//   ↓ Clear cookies
//   ← { success: true }

// GET /api/customer/current-state (requires authenticateRequest)
//   ↓ Check if customer has assessment
//   ↓ Determine next journey (assessment | bank-connection)
//   ← { customer, nextStep, assessment? }
```

**File**: `backend/src/presentation/controllers/AuthController.ts`

- Handles HTTP requests
- Calls use cases
- Sets secure cookies
- Handles redirects

---

## Frontend Implementation

### 1. Redux Store

**File**: `frontend/src/store/slices/authSlice.ts`

```typescript
interface AuthState {
  // From secure httpOnly cookie
  customer: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  } | null;

  // Flags only
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Actions:
// - setCustomer(customer)
// - setAuthenticated(bool)
// - setLoading(bool)
// - setError(error)
// - clearAuth()
```

**Key Principle**: No tokens in Redux. Tokens stay in httpOnly cookies (browser-managed, JS-inaccessible).

### 2. Services

**File**: `frontend/src/services/authService.ts`

```typescript
export const authService = {
  // Step 1: Get Cognito login URL
  initiateLogin: async (): Promise<{ loginUrl: string }> => {
    return await httpService.post('/auth/login');
  },

  // Step 2: Check authentication status
  getCurrentCustomer: async (): Promise<Customer | null> => {
    try {
      return await httpService.get('/auth/me');
    } catch {
      return null;
    }
  },

  // Step 3: Refresh token (called by axios interceptor on 401)
  refreshToken: async (): Promise<void> => {
    await httpService.post('/auth/refresh');
  },

  // Step 4: Logout
  logout: async (): Promise<void> => {
    await httpService.post('/auth/logout');
  }
};
```

### 3. Axios Interceptors

**File**: `frontend/src/api/client.ts`

```typescript
// Response interceptor handles 401 (token expired)
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expired, refresh it
      await authService.refreshToken();
      // Retry original request
      return axiosInstance(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

**Key Point**: httpOnly cookies are automatic - no need to manually add to headers. Browser sends them automatically.

### 4. Components

**File**: `frontend/src/components/ProtectedRoute.tsx`

```typescript
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return null;
  
  return <>{children}</>;
}
```

**File**: `frontend/src/journeys/Auth/LoginPage.tsx`

- Displays "Sign In" button
- Calls authService.initiateLogin()
- Redirects to Cognito Hosted UI (or mock login)

**File**: `frontend/src/journeys/Auth/AuthCallback.tsx`

- Backend handles the OAuth callback
- Frontend checks authentication status
- Loads customer data
- Routes to assessment or bank connection
- Shows loading screen during process

---

## Database Schema

### User Table
```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  externalId      String   @unique  // From Cognito (sub)
  firstName       String?
  lastName        String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  customerId      String?  @unique
  customer        Customer? @relation(fields: [customerId], references: [id])
  
  refreshTokens   RefreshToken[]
  sessionLogs     SessionLog[]
}
```

### RefreshToken Table
```prisma
model RefreshToken {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  token           String   @unique  // Hashed refresh token
  tokenHash       String          // For fast lookup
  revokedAt       DateTime?       // null = active, set = revoked
  expiresAt       DateTime
  
  createdAt       DateTime @default(now())
  
  @@index([userId])
  @@index([tokenHash])
}
```

### SessionLog Table
```prisma
model SessionLog {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  action          String   // LOGIN, LOGOUT, REFRESH, TOKEN_EXPIRED
  ipAddress       String?
  userAgent       String?
  
  createdAt       DateTime @default(now())
  
  @@index([userId])
}
```

### Customer Updates
```prisma
model Customer {
  // ... existing fields
  
  userId          String?  @unique
  user            User?    @relation(fields: [userId], references: [id])
}
```

---

## Configuration

### Backend Config

**File**: `backend/src/shared/config/config.types.ts`

```typescript
export interface AppConfig {
  auth: {
    provider: 'cognito' | 'mock' | 'auth0'; // IDP selection
    jwtSecret: string;                      // JWT signing secret
    
    accessTokenExpiresIn: number;           // seconds (default: 900)
    refreshTokenExpiresIn: number;          // seconds (default: 604800)
    
    cognito?: {
      userPoolId: string;
      clientId: string;
      clientSecret: string;        // NEVER expose to frontend
      region: string;
      domain: string;              // For Hosted UI
    };
  };
  
  cookie: {
    secure: boolean;               // HTTPS only
    sameSite: 'strict' | 'lax';
  };
}
```

**File**: `backend/src/shared/config/config.factory.ts`

```typescript
export function createAuthProvider(config: AppConfig): IAuthProvider {
  switch (config.auth.provider) {
    case 'cognito':
      return new CognitoAuthProvider(config.auth.cognito!);
    case 'auth0':
      return new Auth0AuthProvider(config.auth.auth0!);
    case 'mock':
    default:
      return new MockAuthProvider(config.auth.jwtSecret);
  }
}
```

### Environment Variables

**`.env.local`** (development with mock)
```bash
NODE_ENV=development
AUTH_PROVIDER=mock
JWT_SECRET=my-local-jwt-secret

# Cognito not needed
```

**`.env.staging`** (with Cognito sandbox)
```bash
NODE_ENV=staging
AUTH_PROVIDER=cognito
JWT_SECRET=your-jwt-secret

COGNITO_USER_POOL_ID=us-east-1_xxxxx
COGNITO_CLIENT_ID=abc123xyz
COGNITO_CLIENT_SECRET=<secret-from-aws>
COGNITO_DOMAIN=my-app-sandbox.auth.us-east-1.amazoncognito.com
COGNITO_REGION=us-east-1
```

### Docker Compose

**File**: `docker-compose.yml`

```yaml
services:
  backend:
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      AUTH_PROVIDER: ${AUTH_PROVIDER:-mock}
      JWT_SECRET: ${JWT_SECRET:-local-secret}
      COGNITO_USER_POOL_ID: ${COGNITO_USER_POOL_ID}
      COGNITO_CLIENT_ID: ${COGNITO_CLIENT_ID}
      COGNITO_CLIENT_SECRET: ${COGNITO_CLIENT_SECRET}
      COGNITO_DOMAIN: ${COGNITO_DOMAIN}
      COGNITO_REGION: ${COGNITO_REGION}
```

---

## Local Development

### Without Cognito (No AWS Needed)

```bash
# Default: uses MockAuthProvider
npm run dev

# Backend available at: http://localhost:3001
# Frontend available at: http://localhost:3000
```

**Test Flow:**
1. Click "Sign In" on frontend
2. Redirected to http://localhost:3001/api/auth/mock-login
3. Enter any email (e.g., test@example.com)
4. Backend generates JWT, redirects back
5. Frontend stores in Redux, shows dashboard
6. All protected routes work

### With Cognito Sandbox

```bash
# Run setup script once
./scripts/setup-cognito-sandbox.sh

# This outputs: .env.cognito-sandbox

# Use the config
source .env.cognito-sandbox
AUTH_PROVIDER=cognito npm run dev
```

---

## Cognito Sandbox Setup

### Shell Script Approach (MVP)

**File**: `scripts/setup-cognito-sandbox.sh`

```bash
#!/bin/bash

# Creates Cognito User Pool, App Client, test users
# Outputs .env.cognito-sandbox with all credentials

REGION="us-east-1"
APP_NAME="bridge-sandbox"

# 1. Create User Pool
USER_POOL=$(aws cognito-idp create-user-pool \
  --pool-name "$APP_NAME" \
  --region $REGION \
  --username-attributes email \
  --output json | jq -r '.UserPool.Id')

# 2. Create App Client
APP_CLIENT=$(aws cognito-idp create-user-pool-client \
  --user-pool-id $USER_POOL \
  --client-name "$APP_NAME-client" \
  --region $REGION \
  --allowed-o-auth-flows code \
  --allowed-o-auth-scopes openid email profile \
  --callback-urls "http://localhost:3001/api/auth/callback" \
  --logout-urls "http://localhost:3001/login" \
  --output json | jq -r '.UserPoolClient.ClientId')

# 3. Create domain
DOMAIN="$APP_NAME-$(date +%s | tail -c 7)"
aws cognito-idp create-user-pool-domain \
  --domain "$DOMAIN" \
  --user-pool-id $USER_POOL \
  --region $REGION

# 4. Create test user
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL \
  --username test@example.com \
  --temporary-password TempPass123! \
  --region $REGION

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL \
  --username test@example.com \
  --password TestPass123! \
  --permanent \
  --region $REGION

# 5. Output config
cat > .env.cognito-sandbox << EOF
AUTH_PROVIDER=cognito
COGNITO_USER_POOL_ID=$USER_POOL
COGNITO_CLIENT_ID=$APP_CLIENT
COGNITO_DOMAIN=$DOMAIN
COGNITO_REGION=$REGION
JWT_SECRET=$(openssl rand -base64 32)
EOF

echo "✅ Setup complete!"
echo "Test user: test@example.com / TestPass123!"
echo "Config saved to: .env.cognito-sandbox"
```

**Usage:**
```bash
# One-time setup
./scripts/setup-cognito-sandbox.sh

# Use for development
source .env.cognito-sandbox
npm run dev
```

### Future: CloudFormation (IaC)

For post-MVP, infrastructure as code with CloudFormation or Terraform.

---

## Post-Login Routing Logic

After authentication, the application needs to determine where to send the user based on their account state:

### User Types & Routing

```
User Authenticated ✓
    │
    ├─ User Type = Admin
    │  └─ Redirect to /admin/dashboard
    │
    └─ User Type = Customer
       │
       ├─ NOT linked to Customer account
       │  └─ Redirect to /link-customer
       │     (Customer enters utility account reference)
       │
       └─ Linked to Customer account
          │
          ├─ NO bank connection + NO assessment
          │  └─ Redirect to /bank-connection (start here)
          │
          ├─ HAS bank connection + NO assessment
          │  └─ Redirect to /assessment/:assessmentId
          │
          ├─ HAS bank connection + HAS assessment
          │  └─ Redirect to /payment-plan/:planId
          │
          └─ HAS assessment + COMPLETED assessment
             └─ Redirect to /payment-plan (selection or existing)
```

### Endpoint: `GET /api/auth/redirect-to-journey`

```typescript
// Called after login callback
// Determines where to send the authenticated user

Response: {
  success: true,
  data: {
    userType: 'customer' | 'admin';
    redirectTo: string;  // '/link-customer' | '/assessment/:id' | etc.
    customer?: Customer;
    assessment?: Assessment;
  }
}
```

---

## OAuth 2.0 Flow (with Routing)

### Complete Sequence

```
1. User clicks "Sign In"
   ↓
2. Frontend: POST /auth/login
   ↓
3. Backend: Generate state token (CSRF), return Cognito login URL
   ↓
4. Frontend: Redirect to Cognito Hosted UI
   ↓
5. User: Enter email + password on Cognito
   ↓
6. Cognito: Validates, generates auth code, redirects back
   → GET /auth/callback?code=XXX&state=YYY
   ↓
7. Backend: 
   - Validate state (CSRF check)
   - Exchange code for tokens (via CognitoAuthProvider)
   - Validate JWT signature
   - Extract role from Cognito groups (if any)
   - Create/update User in DB
   - Store refresh token (hashed)
   - Set httpOnly cookie with customer info
   - Redirect to frontend auth callback page
   ↓
8. Frontend Auth Callback:
   - Check authentication status
   - Call GET /api/auth/redirect-to-journey
   - Receive: redirectTo URL + user type
   ↓
9. Frontend Routing Decision:
   - If admin → /admin/dashboard
   - If customer not linked → /link-customer
   - If customer linked, no bank connection → /bank-connection
   - If customer linked, has assessment → /assessment/:id
   - If customer linked, completed → /payment-plan
   ↓
10. All API calls include token (in cookie or header)
    Authorization header includes: Authorization: Bearer <token>
```

### JWT Claims (with Role)

```json
{
  "sub": "cognito-user-id",
  "email": "user@example.com",
  "email_verified": true,
  "role": "customer",  // From Cognito groups
  "cognito:groups": ["customers"],
  "aud": "client-id",
  "iss": "https://cognito-idp.region.amazonaws.com/...",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### State Token (CSRF Protection)

- Generated by backend on step 3
- Stored as signed JWT (expires in 10 minutes)
- Validated on step 7
- Prevents forged authentication requests

---

## Security Considerations

### ✅ Implemented

| Security Feature | Implementation |
|------------------|-----------------|
| **No Frontend Secrets** | All tokens/secrets server-side only |
| **httpOnly Cookies** | Refresh tokens not readable by JS |
| **CSRF Protection** | State token validated on callback |
| **HTTPS (Prod)** | Secure cookie flag set for production |
| **Token Expiry** | Access tokens short-lived (15 min) |
| **Token Revocation** | Logout marks tokens as revoked |
| **Secure Redirect** | Backend redirects only to known URLs |
| **Audit Logging** | SessionLog tracks all auth actions |
| **Password Hashing** | Handled by Cognito (never backend) |
| **CORS Config** | Frontend origin whitelist only |

### 🔒 Best Practices

1. **Never log tokens** - Not even in debug mode
2. **Rotate refresh tokens** - Issue new token on each refresh
3. **Rate limit auth endpoints** - Prevent brute force
4. **Validate all inputs** - State, code, token claims
5. **Monitor session logs** - Detect suspicious activity
6. **Update dependencies** - Security patches for JWT, axios, etc.

---

## Implementation Tasks

### Phase 1: Backend Foundation (4 tasks)
- [ ] Task 1: Create domain layer (IAuthProvider interface, error types)
- [ ] Task 2: Create config updates (config.types.ts, config.factory.ts)
- [ ] Task 3: Create Prisma migrations (User, RefreshToken, SessionLog)
- [ ] Task 4: Update Customer model with userId foreign key

### Phase 2: IDP Implementations (2 tasks)
- [ ] Task 5: Implement MockAuthProvider (local dev)
- [ ] Task 6: Implement CognitoAuthProvider (production)

### Phase 3: Token Management (1 task)
- [ ] Task 7: Implement TokenService (issue, validate, refresh, revoke)

### Phase 4: Application Layer (5 tasks)
- [ ] Task 8: Implement InitiateLoginUseCase
- [ ] Task 9: Implement HandleAuthCallbackUseCase
- [ ] Task 10: Implement RefreshAccessTokenUseCase
- [ ] Task 11: Implement ValidateTokenUseCase
- [ ] Task 12: Implement LogoutUseCase

### Phase 5: Presentation Layer (3 tasks)
- [ ] Task 13: Implement authenticateRequest middleware
- [ ] Task 14: Implement auth.routes (login, callback, refresh, logout)
- [ ] Task 15: Implement AuthController

### Phase 6: Frontend State & Services (4 tasks)
- [ ] Task 16: Create Redux authSlice
- [ ] Task 17: Create authService
- [ ] Task 18: Add axios interceptors
- [ ] Task 19: Create useAuth hook

### Phase 7: Frontend Components (3 tasks)
- [ ] Task 20: Create ProtectedRoute component
- [ ] Task 21: Create LoginPage
- [ ] Task 22: Create AuthCallback

### Phase 8: Integration (3 tasks)
- [ ] Task 23: Add /auth/me endpoint
- [ ] Task 24: Add GetCustomerCurrentStateUseCase
- [ ] Task 25: Update App.tsx routes

### Phase 9: Cognito & Local Setup (2 tasks)
- [ ] Task 26: Create setup-cognito-sandbox.sh script
- [ ] Task 27: Update docker-compose.yml

### Phase 10: Testing & Documentation (2 tasks)
- [ ] Task 28: Test local flow (mock provider)
- [ ] Task 29: Test Cognito sandbox flow
- [ ] Task 30: Document environment setup

---

## Testing Strategy

### Unit Tests

**Backend:**
- IAuthProvider implementations (mock + cognito)
- TokenService (issue, validate, refresh)
- Use cases (happy path + error cases)
- Middleware (valid token, expired token, invalid token)

**Frontend:**
- Redux authSlice reducers
- authService methods
- useAuth hook
- ProtectedRoute rendering

### Integration Tests

**Backend:**
- Full auth flow (mock provider)
- Full auth flow (cognito sandbox)
- Token refresh with expired token
- Logout and token revocation

**Frontend:**
- Login page → redirect to auth
- Auth callback → load customer
- Protected route redirect
- 401 → refresh → retry flow

### E2E Tests

- Complete user flow (login → assessment → logout)
- Mock provider flow (offline)
- Cognito flow (with real user pool)

---

## Deployment

### Local Development
```bash
docker-compose up
# Uses MockAuthProvider by default
# No AWS credentials needed
```

### Staging (Cognito Sandbox)
```bash
source .env.cognito-sandbox
docker-compose up
# Uses real Cognito sandbox
```

### Production (Cognito Production)
```bash
# All secrets from AWS Secrets Manager
# Cognito production user pool
# HTTPS enforced, Secure cookies enabled
```

---

## References & Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [OAuth 2.0 Authorization Code Flow](https://tools.ietf.org/html/rfc6749#section-1.3.1)
- [JWT.io - JWT Debugger](https://jwt.io/)
- [OWASP: Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [HTTP Security Headers](https://owasp.org/www-project-secure-headers/)

---

## Questions & Clarifications

| Question | Answer |
|----------|--------|
| **Does frontend store JWT?** | No, only in httpOnly cookie (auto-sent by browser) |
| **Is client secret in frontend?** | No, never. All secrets backend-only. |
| **Can we switch from Cognito to Auth0?** | Yes, 3 changes: new provider class, config flag, env vars |
| **How does local dev work without AWS?** | MockAuthProvider generates valid JWTs locally |
| **Is signup included?** | No, MVP only. Pre-created user accounts mapped to customers |
| **How are users created?** | Admin creates in Cognito, maps to Customer in DB |

---

## Next Steps

1. ✅ Review this documentation
2. ⏭️ Proceed with implementation (Phase 1: Backend Foundation)
3. ⏭️ Commit changes to `feature/sign-in-authentication` branch
4. ⏭️ Create PR with full implementation
5. ⏭️ Testing in local + staging environments
6. ⏭️ Deploy to production when ready

---

**Document Version**: 1.0  
**Last Updated**: 2026-04-26  
**Author**: Claude (AI Assistant)  
**Status**: Ready for Implementation

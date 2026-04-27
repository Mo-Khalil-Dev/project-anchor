# Phase 10 — Authentication Testing Guide

Complete testing of the sign-in authentication system across all layers.

## Pre-Test Checklist

Before running tests, verify Phase 1-9 are complete:

- [ ] Backend auth infrastructure implemented (IAuthProvider, IDPs, TokenService, use cases)
- [ ] Backend presentation layer complete (AuthController, routes, middleware)
- [ ] Frontend state, services, hooks implemented
- [ ] Frontend components created (LoginPage, AuthCallback, ProtectedRoute)
- [ ] Cognito sandbox resources created: `./scripts/setup-cognito-sandbox.sh`
- [ ] Test users created: `./scripts/create-cognito-test-users.sh`
- [ ] Customers seeded: `npx ts-node prisma/seed.ts`
- [ ] Users linked to customers: `./scripts/link-users-to-customers.sh`

## Test 10.1: Local Development Flow

**Objective:** Verify complete sign-in flow in local environment with MockAuthProvider

**Prerequisites:**
- Set `.env`: `AUTH_PROVIDER=mock`
- Backend running: `npm run dev` (from backend/)
- Frontend running: `npm run dev` (from frontend/)
- Browser DevTools open (F12)

**Steps:**

1. **Navigate to login page**
   - Visit `http://localhost:5173/login`
   - Verify LoginPage component renders with "Sign In" button
   - Status: ✓ or ✗

2. **Initiate sign-in**
   - Click "Sign In" button
   - Backend should return `loginUrl` with `state` parameter
   - Browser redirects to callback with `code` and `state`
   - Status: ✓ or ✗

3. **Handle callback**
   - AuthCallback component displays spinner
   - Backend exchanges `code` + `state` for access & refresh tokens
   - Access token added to Redux store
   - Status: ✓ or ✗

4. **Verify token storage**
   - Open DevTools > Application > Cookies
   - Verify `refreshToken` cookie exists
   - Check: httpOnly=true, Secure flag, SameSite=Strict
   - Open DevTools > Redux DevTools
   - Verify `authSlice.accessToken` is set
   - Verify `authSlice.refreshToken` does NOT exist (security fix)
   - Status: ✓ or ✗

5. **Verify user data**
   - Check Redux `authSlice.user` contains: `id`, `email`, `role`, `customerId`
   - Check Redux `authSlice.isAuthenticated = true`
   - Status: ✓ or ✗

6. **Verify redirect**
   - After callback, page redirects to `/assessment` (or appropriate journey)
   - Frontend calls `/api/auth/redirect-to-journey` to determine next page
   - Verify in Network tab > XHR: POST request to redirect endpoint
   - Status: ✓ or ✗

---

## Test 10.2: Protected Routes & Authorization

**Objective:** Verify protected routes work correctly

**Steps:**

1. **Access protected route (authenticated)**
   - Already signed in from Test 10.1
   - Navigate to protected route (e.g., `/assessment`)
   - Verify page loads (ProtectedRoute allows access)
   - Status: ✓ or ✗

2. **Logout and verify access denied**
   - Click Logout button
   - Verify refreshToken cookie cleared
   - Verify Redux auth state cleared
   - Try to access protected route
   - Verify redirected to `/login`
   - Status: ✓ or ✗

3. **Test unauthenticated redirect**
   - Delete refreshToken cookie manually (DevTools > Storage)
   - Refresh page on protected route
   - Verify redirected to `/login`
   - Status: ✓ or ✗

---

## Test 10.3: Token Refresh Flow

**Objective:** Verify automatic token refresh on 401

**Prerequisites:**
- Signed in (from Test 10.1)

**Steps:**

1. **Monitor token refresh**
   - Open DevTools > Network tab
   - Look for requests to `/api/auth/refresh`
   - Make a request that triggers 401 (manually expire token in Redux)
   - Verify interceptor calls `/api/auth/refresh`
   - Verify browser auto-sends refreshToken cookie
   - Verify new accessToken returned
   - Verify original request retried
   - Status: ✓ or ✗

2. **Verify request header**
   - Monitor any API request after sign-in
   - Open DevTools > Network > Headers
   - Verify `Authorization: Bearer <accessToken>` header present
   - Status: ✓ or ✗

---

## Test 10.4: Error Scenarios

**Objective:** Verify error handling in all cases

**Scenario A: Invalid auth code**
- Edit URL: `http://localhost:5173/auth/callback?code=invalid&state=xyz`
- Verify error message displayed
- Verify redirected to `/login` after a moment
- Status: ✓ or ✗

**Scenario B: Missing code parameter**
- Navigate to `http://localhost:5173/auth/callback?state=xyz` (no code)
- Verify redirected to `/login` immediately
- Status: ✓ or ✗

**Scenario C: Invalid state (CSRF protection)**
- Edit URL: `http://localhost:5173/auth/callback?code=123&state=invalid`
- Verify rejected (state mismatch)
- Verify error message displayed
- Status: ✓ or ✗

**Scenario D: Expired refresh token**
- Sign in normally
- Delete refreshToken cookie manually
- Try to make an API request
- Verify 401 → refresh fails → redirected to `/login`
- Status: ✓ or ✗

---

## Test 10.5: Customer Linking & Post-Login Routing

**Objective:** Verify routing logic based on customer state

**Prerequisites:**
- Customers seeded: `npx ts-node prisma/seed.ts`
- Users linked: `./scripts/link-users-to-customers.sh`
- Test users created: `./scripts/create-cognito-test-users.sh`

**Steps:**

1. **Sign in as linked customer (john@example.com)**
   - If using Cognito: Change `AUTH_PROVIDER=cognito` in .env
   - Sign in with john@example.com / TempPass123!
   - Backend finds user + linked customer
   - Redirect logic: `getRedirectToJourney()` checks customer.bankConnectionId
   - Verify redirected to `/link-bank` (next step in journey)
   - Status: ✓ or ✗

2. **Sign in as new user (not in database)**
   - Create new test user in Cognito (different email)
   - Sign in with new email
   - Backend creates new User, finds no customer
   - Redirect logic: returns `/link-customer`
   - Verify redirected to LinkCustomerPage
   - Status: ✓ or ✗

3. **Sign in as admin user**
   - Sign in with admin@example.com / TempPass123!
   - Backend detects `role: 'admin'` (from Cognito custom attribute or seed data)
   - Redirect logic: returns `/admin/dashboard`
   - Verify redirected to admin dashboard
   - Status: ✓ or ✗

---

## Test 10.6: Security Validation

**Objective:** Verify security best practices

**Steps:**

1. **Verify refreshToken not in JavaScript storage**
   - Open DevTools > Console
   - Run: `JSON.stringify(localStorage)` → Should NOT contain refreshToken
   - Run: `JSON.stringify(sessionStorage)` → Should NOT contain refreshToken
   - Run: (Redux) `getState().auth.refreshToken` → Should be undefined
   - Status: ✓ or ✗

2. **Verify refreshToken in httpOnly cookie**
   - Open DevTools > Application > Cookies > localhost
   - Find `refreshToken` cookie
   - Verify: `HttpOnly` ✓, `Secure` ✓, `SameSite=Strict` ✓
   - Status: ✓ or ✗

3. **Verify XSS resistance**
   - Open DevTools > Console
   - Try: `document.cookie` → Should NOT show refreshToken
   - Try: `fetch('/api/auth/refresh')` with no body → Should work (browser sends cookie)
   - Status: ✓ or ✗

4. **Verify CSRF protection**
   - Test that state parameter is validated on callback
   - Invalid state should be rejected
   - Status: ✓ or ✗ (already tested in 10.4 Scenario C)

---

## Test 10.7: Database State Validation

**Objective:** Verify database records created correctly

**Prerequisites:**
- PostgreSQL/SQLite running
- Prisma client configured

**Steps:**

1. **Check User records**
   ```bash
   npx prisma studio
   ```
   - Navigate to User table
   - Verify user created after sign-in with email, role, customerId
   - Status: ✓ or ✗

2. **Check RefreshToken records**
   - Navigate to RefreshToken table in Prisma Studio
   - Verify record created after sign-in
   - Verify `hashedToken` (not plaintext)
   - Verify `expiresAt` set to 7 days in future
   - Status: ✓ or ✗

3. **Check Customer links**
   - Navigate to Customer table
   - Verify linked customers have `userId` set
   - Verify unlinked customers have `userId = null`
   - Status: ✓ or ✗

4. **Check AuditLog entries**
   - Navigate to AuditLog table
   - Verify LOGIN entry after each sign-in
   - Verify LOGOUT entry after logout
   - Verify entries include timestamp, userId, action
   - Status: ✓ or ✗

---

## Test 10.8: Cognito Sandbox Integration (If Using Cognito)

**Objective:** Verify AWS Cognito integration

**Prerequisites:**
- AWS account with Cognito access
- AWS CLI configured
- `./scripts/setup-cognito-sandbox.sh` executed
- `.env` contains COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID

**Steps:**

1. **Verify Cognito resources created**
   ```bash
   aws cognito-idp list-user-pools --region us-east-1
   ```
   - Verify user pool "bridge-sandbox" exists
   - Status: ✓ or ✗

2. **Verify test users created**
   ```bash
   aws cognito-idp admin-get-user --user-pool-id <POOL_ID> --username john@example.com
   ```
   - Verify john@, jane@, admin@ users exist
   - Verify email_verified = true
   - Status: ✓ or ✗

3. **Test sign-in with Cognito**
   - Set `AUTH_PROVIDER=cognito` in .env
   - Restart backend
   - Go to `/login` and click Sign In
   - Browser redirects to Cognito hosted login
   - Sign in with john@example.com / TempPass123!
   - Cognito redirects back to callback with code + state
   - Backend exchanges code for real JWT tokens from Cognito
   - Verify tokens valid (sub = username, email claim present)
   - Status: ✓ or ✗

---

## Test 10.9: Logout & Token Revocation

**Objective:** Verify logout clears state and revokes tokens

**Steps:**

1. **Test single logout**
   - Sign in on one browser tab
   - Click Logout
   - Verify redirected to `/login`
   - Verify refreshToken cookie deleted
   - Verify Redux state cleared
   - Status: ✓ or ✗

2. **Test multi-session revocation**
   - Sign in on Tab 1
   - Sign in on Tab 2 (different browser tab, same account)
   - Both tabs have valid tokens
   - Click Logout on Tab 1
   - Refresh Tab 2 → should redirect to `/login` (all sessions revoked)
   - Status: ✓ or ✗ (requires all-sessions logout endpoint)

---

## Test 10.10: API Endpoint Validation

**Objective:** Verify all auth endpoints work correctly

Use `scripts/test-auth-flow.sh` to validate endpoints:

```bash
./scripts/test-auth-flow.sh
```

This script tests:
- ✓ POST /api/auth/initiate-login
- ✓ POST /api/auth/callback
- ✓ POST /api/auth/refresh
- ✓ POST /api/auth/logout
- ✓ GET /api/auth/current-user
- ✓ POST /api/auth/redirect-to-journey

---

## Test Summary Checklist

| Test | Result | Notes |
|------|--------|-------|
| 10.1: Local Dev Flow | ✓/✗ | Sign-in → callback → redirect |
| 10.2: Protected Routes | ✓/✗ | Auth/no-auth access control |
| 10.3: Token Refresh | ✓/✗ | 401 → refresh → retry |
| 10.4: Error Scenarios | ✓/✗ | Invalid code, missing params, etc |
| 10.5: Customer Routing | ✓/✗ | Route based on customer state |
| 10.6: Security | ✓/✗ | httpOnly cookies, no JS access |
| 10.7: Database State | ✓/✗ | Users, tokens, customers created |
| 10.8: Cognito (optional) | ✓/✗ | AWS Cognito sign-in works |
| 10.9: Logout | ✓/✗ | Token revocation, multi-session |
| 10.10: API Endpoints | ✓/✗ | All auth endpoints functional |

---

## Next Steps

After passing all tests:
1. Document any issues found
2. Create issues for bugs
3. Commit test results
4. Proceed to Phase 11 (if exists) or production deployment

---

## Support

If tests fail:
1. Check `.env` configuration
2. Verify all Phase 1-9 files created
3. Check backend/frontend logs for errors
4. Run individual test scenarios to isolate issue
5. Review error messages in browser console and Network tab

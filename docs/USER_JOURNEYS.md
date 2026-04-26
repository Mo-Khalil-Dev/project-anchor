# User Journeys - Authentication & Account Linking

This document details the complete user flows for both Customers and Admins, including authentication, account linking, and journey routing.

---

## Journey 1: New Customer - First Time Sign In

### Scenario
User creates account in Cognito (or is added by admin) but has not yet linked to a customer record.

### Flow

```
1. Visit Application
   ├─ Check if authenticated → NO
   └─ Show LoginPage
   
2. Click "Sign In"
   ├─ POST /auth/login → Get Cognito URL
   └─ Redirect to Cognito Hosted UI
   
3. Enter Email + Password on Cognito
   └─ Cognito validates credentials
   
4. Cognito Redirects with Auth Code
   ├─ GET /auth/callback?code=XXX&state=YYY
   └─ Backend:
      - Validates state (CSRF)
      - Exchanges code for tokens
      - Creates User in DB (externalId, email, role='customer')
      - Sets httpOnly cookie
      - Redirects to /auth/callback page
      
5. Frontend Auth Callback
   ├─ GET /api/auth/redirect-to-journey
   └─ Backend checks:
      - User.customerId = null? → YES
      - Return: { redirectTo: '/link-customer', userType: 'customer' }
      
6. Redirect to Link Customer Page
   └─ Show: "Enter your utility account reference number"
   
7. Customer Enters Details
   ├─ Input: Utility Account Reference (e.g., "00123456789")
   ├─ Backend finds matching Customer record
   ├─ Backend links: UPDATE User SET customerId = '<id>'
   └─ Success message: "Account linked!"
   
8. Auto-Redirect to Next Step
   ├─ GET /api/auth/redirect-to-journey
   └─ Check customer bank connection + assessment status
      - No bank connection → Redirect to /bank-connection
      - Has bank connection → Redirect to /assessment
```

---

## Journey 2: Returning Customer - Already Linked

### Scenario
User has already linked their account to a customer record in a previous session.

### Flow

```
1. Visit Application
   ├─ Check localStorage for token? → YES
   └─ Restore Redux auth state
   
2. User is Authenticated ✓
   ├─ customerId = '12345'
   └─ Skip login, proceed to step 4
   
3. [Or] User is Authenticated but No LocalStorage
   ├─ Call GET /api/auth/me (using cookie)
   ├─ Backend validates JWT from cookie
   ├─ Returns customer data
   └─ Restore Redux state
   
4. Load Journey State
   ├─ GET /api/auth/redirect-to-journey
   └─ Backend checks:
      - User linked to Customer? → YES
      - Customer.bankConnections.length > 0? 
         ├─ NO → { redirectTo: '/bank-connection' }
         └─ YES → Check assessments
            - No assessments? → { redirectTo: '/assessment' }
            - Has completed assessment? → { redirectTo: '/payment-plan' }
            - Assessment in progress? → { redirectTo: '/assessment/:id' }
            
5. Auto-Redirect to Appropriate Journey
   ├─ /bank-connection (start here if first time)
   ├─ /assessment/:id (review/complete assessment)
   └─ /payment-plan (select/review payment plan)
```

---

## Journey 3: Admin User - First Time Sign In

### Scenario
Admin user (created in Cognito with 'admin' group) logs in for first time.

### Flow

```
1. Visit Application
   └─ Show LoginPage
   
2. Click "Sign In"
   └─ Redirect to Cognito Hosted UI
   
3. Enter Admin Email + Password
   └─ Cognito validates, assigns 'admin' group
   
4. Cognito Redirects with Auth Code
   └─ Backend:
      - Extracts token
      - Role from Cognito group: role = 'admin'
      - Creates User: { role: 'admin', customerId: null }
      - Returns tokens
      
5. Frontend Auth Callback
   ├─ GET /api/auth/redirect-to-journey
   └─ Backend checks:
      - user.role = 'admin'? → YES
      - Return: { redirectTo: '/admin/dashboard', userType: 'admin' }
      
6. Redirect to Admin Dashboard
   └─ Show:
      - Queue of cases for review
      - Customer management
      - Reports/Analytics
      - User management
```

---

## Journey 4: Customer Lost Access (Expired Refresh Token)

### Scenario
Customer is using the app, access token expires, they don't interact for 7+ days (refresh token expires).

### Flow

```
1. Customer On Assessment Page
   └─ POST /api/assessment/start (includes expired access token)
   
2. Backend Returns 401 (Token Expired)
   └─ Response: { error: 'TOKEN_EXPIRED' }
   
3. Frontend Axios Interceptor
   ├─ Detects 401
   ├─ Calls POST /auth/refresh
   └─ Uses refresh token from httpOnly cookie
   
4a. [SUCCESS] Refresh Token Valid
   ├─ Backend returns new access token
   ├─ Frontend retries original request
   └─ Customer continues uninterrupted
   
4b. [FAIL] Refresh Token Expired/Revoked
   ├─ Backend returns 401
   ├─ Axios interceptor clears auth state
   ├─ Redirects to /login
   └─ Message: "Your session has expired. Please sign in again."
   
5. Customer Re-Signs In
   ├─ POST /auth/login
   ├─ Cognito login flow
   ├─ New tokens issued
   └─ Auto-routed back to /assessment
```

---

## Journey 5: Customer Logout

### Scenario
Customer explicitly clicks "Logout" button.

### Flow

```
1. Customer Clicks Logout
   └─ POST /auth/logout
   
2. Backend
   ├─ Marks refresh token as revoked
   ├─ Logs action to SessionLog
   └─ Responds: { success: true }
   
3. Frontend
   ├─ Clears Redux auth state
   ├─ Removes any stored tokens
   ├─ Clears httpOnly cookie (backend handles)
   └─ Redirects to /login
   
4. Login Page Shown
   └─ Message: "You have been logged out"
```

---

## Journey 6: Admin Links Customer to User Account (Manual)

### Scenario
Admin needs to manually link a pre-existing customer record to a user account (e.g., bulk creation).

### Flow

```
1. Admin Visits /admin/customers
   └─ See list of customers (linked + unlinked)
   
2. Find Unlinked Customer
   ├─ Filter by "Status: Not Linked"
   ├─ Find "John Smith" (E123456789)
   └─ Click "Link to User"
   
3. Search for User
   ├─ Type: "john.smith@example.com"
   └─ Results show matching user
   
4. Click "Link"
   ├─ Backend: UPDATE User SET customerId = '<customer-id>'
   ├─ Creates relationship
   └─ Success: "Linked to John Smith"
   
5. Email Sent to User (Optional)
   └─ "Your account has been linked. Click here to continue: /assessment"
   
6. User Logs In
   ├─ Auto-routed to /bank-connection or /assessment
   └─ Journey begins
```

---

## Journey 7: Security - CSRF Protection

### Scenario
Attacker tries to trick user into clicking malicious link to trigger auth flow.

### Flow

```
1. Attacker Sends Malicious Link
   └─ <iframe src="https://bridge.com/auth/callback?code=FAKE&state=ATTACKER_STATE">
   
2. User Accidentally Clicks
   └─ Frontend: GET /auth/callback?code=FAKE&state=ATTACKER_STATE
   
3. Backend Validation
   ├─ Extract state: "ATTACKER_STATE"
   ├─ Compare with stored state: "USER_STATE_TOKEN"
   ├─ Mismatch! → State validation FAILS
   └─ Throw UnauthorizedError (401)
   
4. Frontend Error
   ├─ Shows: "Authentication failed. Please try again."
   └─ Redirects to /login
   
5. Attack Prevented ✓
   └─ CSRF token prevents unauthorized auth code exchange
```

---

## Data Model Integration

### User Table (Created during auth)
```
id: cuid()
email: john.smith@example.com (unique)
externalId: cognito-sub-12345 (unique)
firstName: John
lastName: Smith
role: 'customer' | 'admin' (from Cognito groups)
customerId: customer-id-789 (nullable, NULL if not linked)
createdAt, updatedAt
```

### Customer Table (Pre-seeded)
```
id: customer-id-789
email: john.smith@example.com (unique)
firstName: John
lastName: Smith
phone: 0161 123 4567
address: 42 Deansgate
postcode: M1 1AD
utilityAccountNo: E123456789
monthlyBill: £120
arrears: £1500
userId: (nullable, set when user links account)
createdAt, updatedAt
```

### RefreshToken Table (Created during auth)
```
id: token-id-456
userId: user-id-123
token: hashed-refresh-token
revokedAt: NULL (if active) | timestamp (if revoked)
expiresAt: 2026-05-26 (7 days from login)
createdAt
```

### SessionLog Table (Audit trail)
```
id: log-id-789
userId: user-id-123
action: LOGIN | LOGOUT | REFRESH_TOKEN | TOKEN_EXPIRED | ACCOUNT_LINKED
ipAddress: 192.168.1.1
userAgent: Mozilla/5.0...
createdAt
```

---

## Role-Based Access Control (RBAC)

### Customer Role
Can access:
- ✅ `/assessment` - View/complete hardship assessment
- ✅ `/bank-connection` - Link bank account
- ✅ `/payment-plan` - Select payment plan
- ✅ `/account-settings` - Update contact details
- ❌ `/admin/*` - Admin pages blocked
- ❌ `/admin/queue` - Case review queue blocked

### Admin Role
Can access:
- ✅ `/admin/dashboard` - Overview
- ✅ `/admin/queue` - Cases for review
- ✅ `/admin/customers` - Manage customers
- ✅ `/admin/users` - Manage users
- ✅ `/admin/reports` - Analytics
- ❌ `/assessment` - Customer pages blocked
- ❌ `/bank-connection` - Customer pages blocked

### Implementation

```typescript
// ProtectedRoute component with role check
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'customer' | 'admin' }) {
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
}

// Usage
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

---

## Error Scenarios

### Scenario 1: Customer Enters Wrong Utility Account Number
```
1. Customer enters: "99999999999"
2. Backend searches: SELECT * FROM Customer WHERE utilityAccountNo = '99999999999'
3. Result: NOT FOUND
4. Return error: { error: 'Account not found. Please check your utility account number.' }
5. Customer can retry
```

### Scenario 2: Multiple Accounts with Same Email
```
Issue: Customer has gas + electricity accounts (different utilities)
Solution:
- Create separate Customer records for each utility
- At linking step, show: "You have 2 accounts. Which one would you like to link?"
- Link to selected one
```

### Scenario 3: Customer Already Linked to Another User
```
Issue: Customer record has userId set to a different user
Solution:
- At link time, check: SELECT * FROM User WHERE customerId = '<customer-id>'
- If exists: Error "This account is already linked to another user"
- Admin must unlink first
```

---

## Testing Scenarios

### Happy Path
- [ ] New customer signs in, links account, starts assessment
- [ ] Existing customer signs in, auto-routed to assessment
- [ ] Customer completes assessment, sees payment plan options
- [ ] Customer logs out, signs back in, continues where they left off
- [ ] Admin signs in, sees dashboard and case queue

### Error Cases
- [ ] Invalid utility account number → error message
- [ ] Expired token → auto-refresh works
- [ ] Refresh token expired → redirect to login
- [ ] CSRF attack → state validation fails
- [ ] Wrong password → Cognito error

### Edge Cases
- [ ] Customer with no arrears (bill < 10% of income)
- [ ] Customer with extreme arrears (> 2x annual bill)
- [ ] Customer with multiple linked utilities (future)
- [ ] Admin unlinking customer account
- [ ] Concurrent login from different browsers

---

## Sequence Diagrams

### Complete Auth + Linking + Routing Flow

```
Customer                Frontend               Backend                Cognito
   │                      │                      │                       │
   ├─ Click Login ────────>│                      │                       │
   │                      ├─ POST /auth/login ──>│                       │
   │                      │<─ loginUrl ──────────┤                       │
   │                      │                      │                       │
   │<─── Redirect to Cognito ─────────────────────────────────────────────>
   │                                             │                       │
   ├─ Enter credentials ───────────────────────────────────────────────>│
   │                                             │                       │
   │<─── Redirect with code ────────────────────────────────────────────┤
   │                      │                      │                       │
   │                      ├─ GET /auth/callback?code=X&state=Y ──────>│
   │                      │                      │                       │
   │                      │<─ Verify state, exchange code ───────────>│
   │                      │                      │                       │
   │                      │                      │ Create User           │
   │                      │                      │ Store refresh token   │
   │                      │                      │ Set httpOnly cookie   │
   │                      │<─ Redirect to /auth/callback ────────────┤
   │                      │                      │                       │
   │                      ├─ GET /api/auth/redirect-to-journey ──────>│
   │                      │                      │                       │
   │                      │<─ { redirectTo: '/link-customer' } ───────┤
   │                      │                      │                       │
   │<─── Show Link Customer Page ────────────────┤                       │
   │                      │                      │                       │
   ├─ Enter utility ref ──>│                      │                       │
   │  "00123456789"       ├─ POST /api/customers/link ───────────────>│
   │                      │                      │ Find customer         │
   │                      │                      │ Link to user          │
   │                      │<─ { success: true } ──────────────────────┤
   │                      │                      │                       │
   │                      ├─ GET /api/auth/redirect-to-journey ──────>│
   │                      │                      │ Check bank/assessment │
   │                      │<─ { redirectTo: '/assessment' } ──────────┤
   │                      │                      │                       │
   │<─── Auto-Redirect to /assessment ──────────┤                       │
   │                      │                      │                       │
   └─ Begin Assessment ───>│                      │                       │
```

---

## Next Steps for Implementation

1. ✅ Implement all auth flows (login, callback, refresh, logout)
2. ✅ Create JWT with role claims from Cognito groups
3. ⏭️ Implement `/api/auth/redirect-to-journey` endpoint
4. ⏭️ Create LinkCustomerPage component + linking API
5. ⏭️ Implement role-based ProtectedRoute
6. ⏭️ Add admin routes + dashboard
7. ⏭️ Test all customer journeys
8. ⏭️ Test all admin journeys
9. ⏭️ Error handling for edge cases
10. ⏭️ Documentation + user guide

---

**Document Version**: 1.0  
**Status**: Ready for Implementation

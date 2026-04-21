# setTestJwtToken Logic

## Overview
`setTestJwtToken()` is a development utility that creates and stores a mock JWT token in localStorage, allowing testing of the Bank Connection flow without backend authentication.

## Function Location
`/frontend/src/utils/auth.ts`

## How It Works

### 1. Header Creation
```typescript
const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
```
- Creates a JWT header object with algorithm (`HS256`) and type (`JWT`)
- Converts to JSON, then Base64-encodes using `btoa()` (browser's native Base64 function)
- Result: Standard JWT header format

### 2. Payload Creation
```typescript
const payload = btoa(
  JSON.stringify({
    sub: 'test-customer-123',
    email: 'test@example.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 365,
  })
);
```
- Creates token payload with:
  - `sub`: Subject (customer ID) = `test-customer-123`
  - `email`: Test email address
  - `iat`: Issued-at time (current Unix timestamp)
  - `exp`: Expiration time (1 year from now = very long-lived)
- Converts to JSON, then Base64-encodes using `btoa()` (browser's native Base64 function)

### 3. Signature Creation
```typescript
const signature = 'test_signature_not_valid';
```
- Uses a placeholder string instead of cryptographic signature
- Makes token structurally valid but cryptographically fake
- Safe for development/testing only

### 4. Token Assembly
```typescript
const token = `${header}.${payload}.${signature}`;
```
- Joins three parts with dots in standard JWT format
- Example: `eyJhbGc...eyJzdWI...test_signature_not_valid`

### 5. Storage & Return
```typescript
localStorage.setItem('auth_token', token);
console.log('Test JWT token set in localStorage');
return token;
```
- Saves token to browser localStorage under key `auth_token`
- Logs confirmation to browser console
- Returns the token string

## Why This Approach

**Problem**: Bank Connection flow requires JWT authentication headers for API calls, but you want to test without a real backend login.

**Solution**: Mock JWT token with:
- Valid structure (header.payload.signature format)
- Test customer data embedded
- No cryptographic validation needed
- Persisted in localStorage for axios interceptor to use

## Browser Compatibility

**btoa() vs Buffer**: This function uses `btoa()` (browser's native Base64 encoding) instead of Node.js `Buffer`. This allows the code to run in the browser without errors. `btoa()` is available in all modern browsers.

## Related Functions

| Function | Purpose |
|----------|---------|
| `clearTestJwtToken()` | Removes token from localStorage |
| `getJwtToken()` | Retrieves token from localStorage |
| Axios interceptor | Uses token from localStorage for API requests |

## Usage Example

```typescript
// In BankConnectionRoot.tsx on mount:
useEffect(() => {
  if (!localStorage.getItem('auth_token')) {
    setTestJwtToken();
  }
}, []);
```

This ensures a valid token exists before making API calls to `/bank-connections/initiate` and `/bank-connections/callback`.

## Security Note

⚠️ **Development Only**: This is for testing/development only. Never use in production. The signature is not cryptographically valid and any backend should reject it with proper JWT verification.

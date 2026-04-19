# Bridge - Tink OAuth Postman Collection

Complete API collection for testing the Tink OAuth bank connection flow in PROJECT BRIDGE.

## Files

- **Bridge-Tink-OAuth.postman_collection.json** — Main API collection with 3 endpoints
- **Bridge-Dev-Environment.postman_environment.json** — Development environment variables

## Quick Start

### 1. Import into Postman

1. Open Postman
2. Click **Import** (top left)
3. Select **Bridge-Tink-OAuth.postman_collection.json**
4. Click **Import**
5. Repeat for **Bridge-Dev-Environment.postman_environment.json**

### 2. Select Environment

1. Top right, click environment dropdown
2. Select **"Bridge - Development"**

### 3. Generate JWT Token

Run this in terminal to generate a test token:

```bash
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { sub: 'test-customer-123', email: 'test@example.com' },
  'dev_secret_key_change_in_production',
  { expiresIn: '1h' }
);
console.log(token);
"
```

Copy the output and set it as `{{jwt_token}}` in Postman:
- Click **Environment** (top right)
- Find `jwt_token` variable
- Paste the token

### 4. Health Check

Run **Utilities > Health Check** to verify backend is running.

Response should be:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-19T15:45:00.123Z"
}
```

## API Flow

### Step 1: Initiate OAuth Flow

**Request:** `POST /api/bank-connections/initiate`

Requirements:
- JWT token in Authorization header
- Backend running on `{{base_url}}`

Response:
```json
{
  "authUrl": "https://console.tink.com/connect/oauth/authorize?...",
  "state": "abc123..."
}
```

Automatically saves:
- `{{oauth_state}}` — CSRF token
- `{{auth_url}}` — Authorization URL

---

### Step 2: Handle OAuth Callback

**Request:** `GET /api/bank-connections/callback?code=XXX&state=YYY`

Steps:
1. Copy `{{auth_url}}` from Step 1 response
2. Paste into browser and complete Tink authorization
3. You'll be redirected to: `http://localhost:3000/api/bank-connections/callback?code=AUTH_CODE&state=STATE`
4. Extract the `code` parameter
5. Paste it as `{{auth_code}}` in Postman environment

Response:
```json
{
  "connectionId": "a4cf5fc1-e16a-40ec-bd45-b0a9f063d037"
}
```

Automatically saves:
- `{{connection_id}}` — Used for polling

---

### Step 3: Poll Bank Data

**Request:** `GET /api/bank-connections/{{connection_id}}/status`

Requirements:
- JWT token in Authorization header
- Must complete Step 2 first

Poll every 2-3 seconds. Response varies by status:

**Pending:**
```json
{
  "status": "PENDING",
  "isReady": false
}
```

**Completed:**
```json
{
  "status": "COMPLETED",
  "isReady": true,
  "data": {
    "income": { "monthlyIncome": 3000, ... },
    "expense": { "monthlyExpenses": 2000, ... },
    "risk": { "accountBalance": 5000, ... }
  }
}
```

**Failed:**
```json
{
  "status": "FAILED",
  "error": "..."
}
```

## Common Issues

### "Invalid or expired token" (401)

- Regenerate JWT token (see Quick Start step 3)
- Make sure it's set in `{{jwt_token}}`
- Token expires in 1 hour

### "Missing code or state parameter" (400)

- Make sure you completed Step 2
- Extract code from Tink redirect URL
- Set `{{auth_code}}` in environment

### "Invalid OAuth state token"

- State token only valid for a few minutes
- Start over from Step 1 if it expires
- State is automatically saved, don't modify it

### "Connection not found or not authorized" (404)

- Must complete Steps 1 & 2 before Step 3
- `{{connection_id}}` must be set from Step 2 response

### Report still PENDING after 30 seconds

- Tink processing can take 5-30 seconds normally
- Keep polling
- Check server logs for errors

## Testing Tips

### Quick Smoke Test

1. Run Health Check ✓
2. Run Initiate OAuth Flow ✓
3. Check database for new BankConnection record

### Full Flow Test

1. Initiate OAuth (Step 1) ✓
2. Complete Tink authorization (Step 2) ✓
3. Poll status repeatedly (Step 3) until COMPLETED ✓

### Mock Testing (Without Real Tink)

Use the collection to test error handling:
- Try invalid JWT → 401
- Try missing state → 400
- Try wrong connection_id → 404

## Environment Variables

All variables are auto-managed by Postman. Manual changes only needed for:

| Variable | Purpose | Manual Set? |
|----------|---------|------------|
| `base_url` | Backend URL | Yes (if not localhost:3000) |
| `jwt_token` | Authentication token | Yes (generate once) |
| `customer_id` | Test customer ID | No (informational only) |
| `oauth_state` | CSRF token | No (auto from Step 1) |
| `auth_url` | Tink URL | No (auto from Step 1) |
| `auth_code` | Tink callback code | Yes (extract from redirect) |
| `connection_id` | Bank connection ID | No (auto from Step 2) |

## Debugging

Enable request/response logging in Postman:
1. **Settings** → **General**
2. Toggle **"Request logging"** ON
3. Requests will appear in console (View → Show Postman Console)

## For Different Environments

Copy **Bridge-Dev-Environment.postman_environment.json** and modify:

```json
{
  "name": "Bridge - Staging",
  "values": [
    {
      "key": "base_url",
      "value": "https://api-staging.bridge.example.com",
      ...
    }
  ]
}
```

Then import into Postman and select it.

## Next Steps

- Add similar environments for Staging & Production
- Create pre-request script to auto-generate JWT tokens
- Add tests to validate financial data structure
- Create Collection Runner script for automated testing

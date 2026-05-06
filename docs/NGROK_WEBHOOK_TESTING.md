# Testing Webhooks Locally with ngrok

This guide shows how to test the GoCardless Direct Debit webhook flow locally using ngrok.

---

## Setup

### 1. Install ngrok

**macOS (with Homebrew):**
```bash
brew install ngrok
```

**Or download from:** https://ngrok.com/download

### 2. Start Your Local Backend

```bash
cd backend
npm run dev
# Backend running on http://localhost:3001
```

### 3. Start ngrok Tunnel

In a **new terminal**, expose your backend to the internet:

```bash
ngrok http 3001
```

You'll see output like:

```
ngrok                                       (Ctrl+C to quit)

Session Status                online
Account                       your-email@gmail.com
Version                       3.3.5
Region                        us-cal
Forwarding                    https://1234-56-789-012-34.ngrok-free.app -> http://localhost:3001
Forwarding                    http://1234-56-789-012-34.ngrok-free.app -> http://localhost:3001

Web Interface                 http://127.0.0.1:4040
Inspect logs for Requests     POST /some-path -> your-backend
```

**Copy the HTTPS forwarding URL:** `https://1234-56-789-012-34.ngrok-free.app`

This URL is **public and temporary**. Every time you restart ngrok, you get a new URL.

---

## Configure GoCardless Webhook Endpoint

### Option A: Update in GoCardless Dashboard (Sandbox)

1. Go to https://dashboard-sandbox.gocardless.com
2. Navigate to **Settings** → **Webhooks** (or **API Settings** → **Webhooks**)
3. Add or update the webhook endpoint:
   ```
   https://1234-56-789-012-34.ngrok-free.app/api/payments/webhook
   ```

### Option B: Set in .env (Recommended for Local Dev)

**backend/.env:**
```
GOCARDLESS_WEBHOOK_URL=https://1234-56-789-012-34.ngrok-free.app/api/payments/webhook
```

Then in your router or config, use this URL when creating subscriptions/schedules.

---

## Test the Connection

### 1. Check ngrok Inspector

Open http://127.0.0.1:4040 in your browser. This shows all requests hitting your tunnel in real-time.

### 2. Test a Manual Webhook (via curl)

Send a test webhook from your terminal:

```bash
curl -X POST https://1234-56-789-012-34.ngrok-free.app/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "Webhook-Signature: test-signature" \
  -d '{
    "events": [{
      "id": "evt_test_123",
      "created_at": "2024-05-06T12:00:00Z",
      "resource_type": "mandates",
      "action": "created",
      "links": {
        "mandate": "MD123456"
      }
    }]
  }'
```

**Check ngrok Inspector:**
- You should see a `POST /api/payments/webhook` request
- Status should be `200` or `202`
- Check the **Response Body** for any errors

### 3. Check Backend Logs

Your backend should log the webhook:

```
[INFO] Processing GC webhook event { eventId: 'evt_test_123', resourceType: 'mandates', action: 'created' }
```

---

## Full E2E Webhook Test Flow

### Step 1: Start Everything

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — ngrok:**
```bash
ngrok http 3001
```
Copy the HTTPS URL: `https://1234-56-789-012-34.ngrok-free.app`

**Terminal 3 — Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 4 — ngrok Inspector (optional):**
```bash
open http://127.0.0.1:4040
```

### Step 2: Configure GoCardless Sandbox

Update GoCardless sandbox webhook endpoint to your ngrok URL:
```
https://1234-56-789-012-34.ngrok-free.app/api/payments/webhook
```

### Step 3: Complete Direct Debit Flow

1. Open http://localhost:5173
2. Log in and navigate to payment setup
3. Fill in Direct Debit form
4. Click "Authorize with GoCardless"
5. Redirect to GoCardless sandbox authorization
6. Authorize (use test credentials)
7. GoCardless redirects back to http://localhost:5173/payment-plans/dd-callback
8. Frontend navigates to holding screen
9. Holding screen polls Reference Data API

### Step 4: Watch the Webhook Arrive

**In ngrok Inspector (http://127.0.0.1:4040):**
- You should see `POST /api/payments/webhook`
- Click it to see full request/response details

**In Backend Logs:**
- Should see: `ProcessMandateActive end-to-end { mandateGocardlessId, localMandateId, ... }`

**In Database:**
- Check `Mandate` table — new record created
- Check `PaymentSchedule` table — schedule created

**On Frontend:**
- Holding screen detects `mandate.status = 'CREATED'`
- Auto-navigates to success screen

---

## Troubleshooting

### 1. "Connection Refused" in ngrok

**Problem:** ngrok shows `error_code=ECONNREFUSED`

**Solution:** Verify backend is running:
```bash
curl http://localhost:3001/health
# Should return 200
```

### 2. Webhook Hits Backend but Returns 500

**Problem:** POST returns 500 in ngrok Inspector

**Solution:**
1. Check backend logs for the actual error
2. Verify HMAC signature verification isn't failing (comment it out temporarily)
3. Ensure webhook JSON matches expected schema

**Temporarily disable signature verification** (in PaymentController):
```typescript
// TODO: Re-enable after testing
// const isValid = verifyHMACSignature(rawBody, signature, webhookKey);
const isValid = true;
```

### 3. ngrok URL Changed After Restart

**Problem:** Restarted ngrok and got a new URL

**Solution:**
- Update GoCardless webhook endpoint to the new URL
- Update `.env` or config with new URL
- Restart backend to pick up new env var

**Pro tip:** Upgrade ngrok account for **static domains** (paid feature) to keep the same URL.

### 4. Webhook Never Arrives

**Problem:** Holding screen polls forever, no webhook received

**Possible causes:**
1. GoCardless webhook endpoint not configured
2. Webhook endpoint is still pointing to old ngrok URL
3. User authorization in GC sandbox didn't complete
4. Backend signature verification is rejecting the webhook

**Debugging:**
- Check GoCardless sandbox logs
- Check ngrok Inspector for incoming requests
- Add logging to webhook handler in backend

---

## What the Webhook Payload Looks Like

**Sample `mandates.created` event:**

```json
{
  "events": [
    {
      "id": "evt_0012345678",
      "created_at": "2024-05-06T12:34:56Z",
      "resource_type": "mandates",
      "action": "created",
      "links": {
        "mandate": "MD001A1C1C1C1C1C1C"
      },
      "details": {
        "origin": "api"
      }
    }
  ]
}
```

The backend extracts:
- `events[0].links.mandate` → GoCardless mandate ID
- Uses it to fetch the full mandate from GC API
- Reads metadata (customerId, assessmentId) from the mandate
- Creates local `Mandate` and `PaymentSchedule` records

---

## Advanced: Replay Webhooks

If you need to re-test the same webhook without restarting GoCardless:

### Option 1: Use ngrok Inspector Replay

In ngrok Inspector (http://127.0.0.1:4040):
1. Find the webhook request
2. Click the three-dot menu
3. Select "Replay"

The exact same request is sent again.

### Option 2: Manual curl Replay

```bash
curl -X POST https://YOUR_NGROK_URL/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "Webhook-Signature: YOUR_SIGNATURE" \
  -d @webhook-payload.json
```

---

## Tunnel Stays Active Longer

If you're testing for extended periods, use a **paid ngrok account** with:
- Static domains (URL never changes)
- Longer session duration
- Better inspection tools

Free tier:
- Session lasts ~8 hours
- New URL on restart
- Limited to 40 requests/minute

---

## Common Commands

```bash
# Start tunnel
ngrok http 3001

# Start with static domain (paid)
ngrok http 3001 --domain=your-static-domain.ngrok.io

# View tunnel logs in real-time
ngrok logs

# Check ngrok status
ngrok config check

# Kill ngrok
Ctrl+C
```

---

## Checklist Before E2E Testing

- [ ] Backend running on `http://localhost:3001`
- [ ] Frontend running on `http://localhost:5173`
- [ ] ngrok tunnel active: `ngrok http 3001`
- [ ] GoCardless webhook endpoint updated to ngrok URL
- [ ] GoCardless test credentials ready
- [ ] Database migrations run (`npx prisma migrate dev`)
- [ ] Backend env vars include `GOCARDLESS_*` credentials
- [ ] ngrok Inspector open at `http://127.0.0.1:4040`

# Deployment Guide: Railway

This guide walks through deploying both frontend and backend to Railway with PostgreSQL database and user seeding.

---

## Prerequisites

- GitHub repo connected and pushed
- Railway account (free tier available at https://railway.app)
- Git CLI installed locally

---

## Step 1: Create Railway Project

1. Go to https://railway.app and sign up (free)
2. Create a new project: **New Project** → **Deploy from GitHub**
3. Select your repository: `mohamedkhalil/project-anchor`
4. Railway will detect `package.json` files and create services

---

## Step 2: Add PostgreSQL Database

1. In Railway project, click **+ Add Service**
2. Select **Database** → **PostgreSQL**
3. Railway will:
   - Create a PostgreSQL instance
   - Generate `DATABASE_URL` automatically
   - Make it available to your backend

---

## Step 3: Configure Backend Service

### 3.1 Set Environment Variables

Click on the **backend** service → **Variables** tab. Railway will auto-detect `DATABASE_URL` from PostgreSQL, but you must manually add these **required** variables:

#### Required (must set):
```
# Random string for JWT token signing
JWT_SECRET=your-random-secret-key-min-32-chars-here

# Tink bank connection API (get from https://console.tink.com)
TINK_CLIENT_ID=test_client_id_here
TINK_CLIENT_SECRET=test_client_secret_here

# Stripe payment keys (get test keys from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_test_your_webhook_secret
```

#### Optional but recommended:
```
# Server config
NODE_ENV=production
RUNTIME=ecs
PORT=3000
LOG_LEVEL=info
DATABASE_PROVIDER=postgresql

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-url.railway.app

# AWS region (for SES email)
AWS_REGION=us-east-1
SES_FROM_ADDRESS=noreply@safe.local

# GoCardless (for Direct Debit feature, can leave empty for now)
GOCARDLESS_ACCESS_TOKEN=
GOCARDLESS_WEBHOOK_KEY=

# Cognito (can use mock auth if not set up)
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
COGNITO_REGION=us-east-1

# Feature flags
ENABLE_EMAIL=false
ENABLE_PAYMENT_PROCESSING=false
ENABLE_BANK_OAUTH=true
```

#### Test Values for Development
If you don't have real API keys yet, use these test values to get the app running:
```
JWT_SECRET=super-secret-jwt-key-for-testing-min-32-characters-long
TINK_CLIENT_ID=test_mock_client_id
TINK_CLIENT_SECRET=test_mock_secret
STRIPE_SECRET_KEY=sk_test_mock_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_test_mock_webhook
```

#### How to Add Environment Variables in Railway

1. Open your Railway project: https://railway.app
2. Click the **backend** service
3. Go to **Variables** tab
4. Click **+ Add Variable** (or paste multiple at once in the text editor)
5. Add each required variable from the list above
6. Click **Save**
7. Railway will automatically redeploy with the new variables

**Note:** `DATABASE_URL` is auto-set by the PostgreSQL service — you don't need to add it manually.

### 3.2 Configure Build & Start Commands

1. Click **backend** service → **Settings**
2. Set **Build Command**:
   ```bash
   npm run build
   ```
3. Set **Start Command**:
   ```bash
   npx prisma migrate deploy && npm run start
   ```

This ensures:
- Prisma migrations run before startup
- Database is created/updated
- Backend starts

### 3.3 Seed Database (First Deploy Only)

After first deployment, click **backend** service → **Deployments** tab.

For the first deployment to seed users:
1. Click the running deployment
2. Go to **Logs**
3. You should see migrations running

To manually seed (if not auto-seeded):
1. Click **backend** → **Shell** tab
2. Run:
   ```bash
   npx prisma db seed
   ```

---

## Step 4: Configure Frontend Service

### 4.1 Set Environment Variables

Click on the **frontend** service → **Variables** tab, add:

```
VITE_API_URL=https://your-backend-url.railway.app
NODE_ENV=production
```

The `VITE_API_URL` should be the backend's Railway domain (found in backend service settings).

### 4.2 Configure Build & Start Commands

1. Click **frontend** service → **Settings**
2. Set **Build Command**:
   ```bash
   npm run build
   ```
3. Set **Start Command**:
   ```bash
   npm run preview
   ```
   
   OR use a static server for the `dist/` folder (Railway auto-detects Vite builds)

### 4.3 Set Framework

1. In **Settings**, look for **Framework**
2. Select **Vite** or **Node.js**
3. If Node.js, ensure it serves `dist/` folder

---

## Step 5: Get URLs and Test

Once deployed:

1. Click **frontend** service → **Settings** → Find **Domain**
   - Your frontend URL: `https://frontend-xxx.railway.app`

2. Click **backend** service → **Settings** → Find **Domain**
   - Your backend URL: `https://backend-xxx.railway.app`

3. Update frontend env var `VITE_API_URL` to point to backend URL

4. Test:
   ```bash
   # Test backend
   curl https://backend-xxx.railway.app/health
   
   # Test frontend
   open https://frontend-xxx.railway.app
   ```

---

## Step 6: Database Seeding Verification

Check that users were seeded:

1. Go to **PostgreSQL** service in Railway
2. Click **Data** tab (if available) or use a tool like DBeaver
3. Check `users` table has seeded data:
   ```sql
   SELECT COUNT(*) FROM "User";
   -- Should return 20+ seeded users
   ```

Or via backend:
```bash
curl https://backend-xxx.railway.app/api/me \
  -H "Authorization: Bearer <your_test_token>"
```

---

## Troubleshooting

### Backend won't start: "Configuration validation failed: JWT_SECRET: Required"
- **Cause:** Missing required environment variables in Railway's Variables tab
- **Fix:** Go to **backend** service → **Variables** tab → Add the 5 required variables from section 3.1 above
- **Verify:** After saving, Railway auto-redeploys. Check **Deployments** tab for new build

### Backend won't start: "TINK_CLIENT_ID is required"
- **Cause:** Missing Tink credentials
- **Fix:** Add `TINK_CLIENT_ID` and `TINK_CLIENT_SECRET` to Variables tab. Use test values if you don't have real ones yet.

### Backend won't start: "STRIPE_SECRET_KEY is required"
- **Cause:** Missing Stripe credentials
- **Fix:** Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to Variables tab. Get test keys from https://dashboard.stripe.com/apikeys or use dummy values.

### Backend won't start: "DATABASE_URL not found"
- **Cause:** PostgreSQL service not linked or database not created
- **Fix:** Ensure PostgreSQL service is created and linked. Check Variables tab has DATABASE_URL.

### Frontend shows blank/error
- **Fix:** Check VITE_API_URL points to correct backend domain. Check CORS is enabled in backend.

### Seed data not appearing
- **Fix:** Run `npx prisma db seed` in backend shell, or check logs for seed errors.

### Migrations fail on deploy
- **Fix:** Check migrations are in `backend/prisma/migrations/`. May need to run locally first:
  ```bash
  npm run prisma:migrate
  git add prisma/migrations
  git commit -m "add migrations"
  git push
  ```

### Deployment keeps failing
- **Fix:** Check logs in Railway. Common issues:
  - Missing environment variables
  - Node version mismatch (use Node 18+)
  - Outdated dependencies

---

## Cost

**Free tier includes:**
- 5GB bandwidth/month
- 500 hours compute/month (enough for small project)
- 1 PostgreSQL database (1GB storage)
- 1 web service

**Estimate for this app:**
- Backend: ~50 hours/month (mostly idle)
- Frontend: ~20 hours/month
- Database: Minimal usage
- **Total: FREE** (with $5/month credit buffer)

To monitor usage: Project → **Usage** tab

---

## Next Steps

After deployment:

1. **Test the full flow:**
   - Log in via frontend
   - Complete assessment
   - View payment plans
   - Webhook testing (see NGROK_WEBHOOK_TESTING.md)

2. **Configure integrations:**
   - Cognito (auth)
   - GoCardless (webhooks)
   - Tink (bank connection)
   - SES (email)

3. **Set up CI/CD:**
   - Railway deploys on `git push` automatically
   - Monitor deployments in Railway dashboard

4. **Enable HTTPS:**
   - Railway provides automatic HTTPS
   - Update FRONTEND_URL in backend env var if needed

---

## Redeploying

After making code changes:

```bash
git add .
git commit -m "your changes"
git push origin refactor/backend-refactoring
```

Railway will **automatically redeploy** within 1-2 minutes.

To force redeploy in Railway:
1. Click service
2. Click **Redeploy** button next to latest deployment

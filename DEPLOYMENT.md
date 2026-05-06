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

Click on the **backend** service → **Variables** tab, add:

```
NODE_ENV=production
RUNTIME=ecs
PORT=3000
LOG_LEVEL=info
DATABASE_PROVIDER=postgresql
# DATABASE_URL will be auto-detected from PostgreSQL service

# Authentication (Cognito)
COGNITO_USER_POOL_ID=your_pool_id
COGNITO_CLIENT_ID=your_client_id
COGNITO_REGION=us-east-1
JWT_SECRET=your_production_secret

# GoCardless (from sandbox)
GOCARDLESS_ACCESS_TOKEN=sandbox_...
GOCARDLESS_WEBHOOK_KEY=...

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-url.vercel.app

# Other integrations (fill in as needed)
AWS_REGION=us-east-1
TINK_CLIENT_ID=...
TINK_CLIENT_SECRET=...
SES_FROM_ADDRESS=noreply@safe.local
```

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

### Backend won't start: "DATABASE_URL not found"
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

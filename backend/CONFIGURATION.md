# Configuration Guide

PROJECT BRIDGE uses a typed configuration system built on Zod. All config is validated at startup — the server will refuse to start with a clear error message if anything is missing or invalid.

---

## How It Works

```
.env file / docker-compose env vars / ECS task definition
        ↓
dotenv loads .env (no-op if file doesn't exist)
        ↓
RUNTIME=ecs? → fetch sensitive secrets from AWS Secrets Manager
        ↓
Zod validates + transforms flat env vars → typed AppConfig
        ↓
Frozen singleton available via getConfig() anywhere in the app
```

Config is loaded once at startup in `src/index.ts`. After that, use `getConfig()`:

```typescript
import { getConfig } from './shared/config';

const config = getConfig();
config.database.provider  // 'sqlite' | 'postgresql'
config.server.port        // number
config.features.bankOAuth // boolean
```

---

## Environment Variables Reference

### Application

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | `development` \| `production` \| `test` |
| `RUNTIME` | No | `local` | `local` \| `docker` \| `ecs` — controls how config is loaded |
| `PORT` | No | `3000` | HTTP port the server listens on |
| `LOG_LEVEL` | No | `info` | `debug` \| `info` \| `warn` \| `error` |
| `FRONTEND_URL` | No | `http://localhost:5173` | Allowed CORS origin |

### Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_PROVIDER` | No | `sqlite` (local), `postgresql` (docker/ecs) | Which database engine to use |
| `DATABASE_URL` | Conditional | `file:./prisma/dev.db` | Required when `DATABASE_PROVIDER=postgresql`. SQLite defaults to the file path. |

**SQLite URL format:** `file:./prisma/dev.db` or `file:/absolute/path.db`

**PostgreSQL URL format:** `postgresql://user:password@host:port/database`

### Authentication

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | **Yes** | — | Secret for signing JWTs. Use a long random string in production. |
| `COGNITO_USER_POOL_ID` | **Yes** | — | AWS Cognito user pool ID (e.g. `us-east-1_AbCdEfGhI`) |
| `COGNITO_CLIENT_ID` | **Yes** | — | AWS Cognito app client ID |
| `COGNITO_REGION` | No | `us-east-1` | AWS region where the Cognito pool lives |

### AWS

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AWS_REGION` | No | `us-east-1` | Default AWS region for all SDK calls |
| `AWS_ACCOUNT_ID` | No | — | Your AWS account ID |
| `SECRETS_MANAGER_SECRET_NAME` | Conditional | — | **Required when `RUNTIME=ecs`**. Name/ARN of the Secrets Manager secret. |

### Bank Integration (Tink)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TINK_CLIENT_ID` | **Yes** | — | Tink OAuth client ID |
| `TINK_CLIENT_SECRET` | **Yes** | — | Tink OAuth client secret |
| `TINK_ENVIRONMENT` | No | `sandbox` | `sandbox` \| `production` |

### Email (AWS SES)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SES_REGION` | No | `us-east-1` | Region where SES is configured |
| `SES_FROM_ADDRESS` | No | `noreply@bridge.local` | Sender address for all outbound emails |

### Payments (Stripe)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STRIPE_SECRET_KEY` | **Yes** | — | Stripe secret key (`sk_test_...` or `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | **Yes** | — | Stripe webhook signing secret (`whsec_...`) |

### Feature Flags

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENABLE_EMAIL` | No | `true` | Set `false` to skip all SES calls |
| `ENABLE_PAYMENT_PROCESSING` | No | `true` | Set `false` to disable Stripe integration |
| `ENABLE_BANK_OAUTH` | No | `true` | Set `false` to disable Tink OAuth flow |

---

## Environment Setup

### Local Dev (SQLite — fastest setup)

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required values. Minimum viable `.env` for local dev:
   ```env
   NODE_ENV=development
   RUNTIME=local
   DATABASE_PROVIDER=sqlite

   JWT_SECRET=any-long-string-for-local-dev

   COGNITO_USER_POOL_ID=us-east-1_anything
   COGNITO_CLIENT_ID=anything

   TINK_CLIENT_ID=sandbox-id
   TINK_CLIENT_SECRET=sandbox-secret

   STRIPE_SECRET_KEY=sk_test_your_key
   STRIPE_WEBHOOK_SECRET=whsec_your_secret
   ```

3. Generate the Prisma client and create the database:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

4. Start the server:
   ```bash
   npm run dev
   # Bridge backend running on port 3000 [local]
   ```

The SQLite file is created at `prisma/dev.db` and is gitignored.

---

### Local Dev (PostgreSQL — if you want production parity locally)

1. In your `.env`, set:
   ```env
   DATABASE_PROVIDER=postgresql
   DATABASE_URL=postgresql://bridge_user:dev_password@localhost:5432/bridge
   ```

2. Start Postgres:
   ```bash
   npm run docker:up
   ```

3. Generate and push:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

---

### Local Docker (PostgreSQL via docker-compose)

No `.env` file needed. All variables are set in `docker-compose.yml`.

```bash
npm run docker:up
# Bridge backend running on port 3000 [docker]
```

`RUNTIME=docker` and `DATABASE_PROVIDER=postgresql` are set automatically in the compose file.

---

### AWS ECS (Production)

Config is split across two sources:

**ECS Task Definition — non-sensitive vars (set as `environment`):**
```json
{
  "NODE_ENV": "production",
  "RUNTIME": "ecs",
  "DATABASE_PROVIDER": "postgresql",
  "PORT": "3000",
  "LOG_LEVEL": "info",
  "AWS_REGION": "eu-west-2",
  "COGNITO_USER_POOL_ID": "eu-west-2_XxXxXxXx",
  "COGNITO_CLIENT_ID": "your-client-id",
  "TINK_ENVIRONMENT": "production",
  "SES_FROM_ADDRESS": "noreply@bridge.co.uk",
  "FRONTEND_URL": "https://app.bridge.co.uk",
  "SECRETS_MANAGER_SECRET_NAME": "bridge/production/secrets"
}
```

**AWS Secrets Manager — sensitive vars (a single JSON secret):**

Create a secret named `bridge/production/secrets`:
```json
{
  "DATABASE_URL": "postgresql://bridge_user:password@rds-endpoint:5432/bridge",
  "JWT_SECRET": "long-random-secret",
  "TINK_CLIENT_ID": "production-tink-id",
  "TINK_CLIENT_SECRET": "production-tink-secret",
  "STRIPE_SECRET_KEY": "sk_live_...",
  "STRIPE_WEBHOOK_SECRET": "whsec_..."
}
```

At startup, the app fetches this secret and merges it with the task definition env vars. Secrets Manager values take precedence for any overlapping keys.

The ECS task's IAM role must have `secretsmanager:GetSecretValue` on that secret ARN.

---

## Prisma Scripts Reference

There is one schema (`prisma/schema.prisma`) that works for both SQLite and PostgreSQL. The `DATABASE_PROVIDER` env var tells Prisma which engine to use at generate/push time.

| Script | Description |
|--------|-------------|
| `prisma:generate` | Generate Prisma client (reads `DATABASE_PROVIDER` from `.env`) |
| `prisma:push` | Sync schema to the database — use this during development |
| `prisma:migrate` | Create and run a migration file — use this for staging/production |
| `prisma:studio` | Open Prisma Studio to browse the database |
| `prisma:seed` | Run the seed script |

> Use `prisma:push` during development (fast, no migration history). Switch to `prisma:migrate` when you need an auditable migration trail for production deployments.

---

## Startup Failure Messages

If required config is missing, the server exits immediately with a clear error:

```
Failed to start server: Configuration validation failed:
  DATABASE_URL: DATABASE_URL is required when DATABASE_PROVIDER=postgresql
  JWT_SECRET: JWT_SECRET is required
```

Fix the listed variables in your `.env` (local) or task definition / Secrets Manager (ECS) and restart.

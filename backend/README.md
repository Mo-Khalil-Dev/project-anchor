# PROJECT BRIDGE - Backend

Hardship Assessment Platform Backend API

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 14+ (RDS)
- **ORM:** Prisma
- **Authentication:** AWS Cognito
- **Deployment:** AWS ECS + Lambda
- **Infrastructure:** AWS CDK

## Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app setup
│   ├── index.ts               # Entry point
│   ├── routes/                # API endpoints
│   ├── services/              # Business logic
│   ├── middleware/            # Express middleware
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Utilities (db, logger, etc)
│   ├── config/                # Configuration
│   └── lambda/                # Lambda handlers
├── prisma/
│   └── schema.prisma          # Database schema
├── tests/                     # Unit & integration tests
├── infra/                     # AWS CDK
├── docker/                    # Docker files
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+ (or use Docker)
- AWS account (for deployment)

### Local Development

1. **Clone and install:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Start PostgreSQL + app:**
   ```bash
   docker-compose up
   ```

4. **In another terminal, apply migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed test data (optional):**
   ```bash
   npm run prisma:seed
   ```

6. **Access the app:**
   - Backend: http://localhost:3000
   - Database GUI: `npm run prisma:studio`

### Available Commands

```bash
# Development
npm run dev              # Run with ts-node (live reload)
npm run build            # Compile TypeScript

# Database
npx prisma migrate dev   # Create & apply migration
npx prisma generate     # Regenerate Prisma client
npm run prisma:studio   # Open Prisma Studio (GUI)
npm run prisma:seed     # Seed test data

# Testing
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:cov        # Coverage report

# Docker
npm run docker:build    # Build image
npm run docker:up       # Start containers
npm run docker:down     # Stop containers
npm run docker:logs     # View logs

# Linting & Formatting
npm run lint            # Run ESLint
npm run format          # Format with Prettier

# Deployment
npm run cdk:deploy      # Deploy to AWS
```

## API Endpoints

### Authentication
```
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
```

### Assessments
```
GET    /assessments/:customerId
GET    /assessments/:id/breakdown
POST   /assessments
```

### Payment Plans
```
GET    /payment-plans/:assessmentId
POST   /payment-plans/:id/accept
```

### Admin - Cases
```
GET    /admin/queue
GET    /admin/cases/:id
PATCH  /admin/cases/:id/decision
PATCH  /admin/cases/:id/modify-plan
POST   /admin/cases/:id/escalate
```

### Dashboards
```
GET    /manager/dashboard
GET    /compliance/dashboard
GET    /executive/dashboard
```

## Database

### Schema Overview

**Core Tables:**
- `customers` - User accounts
- `assessments` - Financial assessments
- `payment_plans` - Generated payment plans
- `accepted_plans` - Customer-selected plans
- `payments` - Individual payment records
- `cases` - Officer review queue
- `audit_logs` - Immutable decision log

**Configuration:**
- `hardship_policy` - Global thresholds
- `policy_change_log` - Policy audit trail

**Analytics:**
- `compliance_metrics` - Pre-calculated KPIs

### Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# View migration status
npx prisma migrate status

# Reset database (dev only)
npx prisma migrate reset
```

## Environment Variables

See `.env.example` for all available variables:

**Critical:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `COGNITO_USER_POOL_ID` - AWS Cognito pool ID

**Optional:**
- `NODE_ENV` - development|staging|production
- `LOG_LEVEL` - info|warn|error|debug
- `PORT` - Server port (default: 3000)

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test assessmentService.test.ts

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

## Logging

All logs are JSON-formatted and sent to CloudWatch in production.

**Log Levels:**
- `INFO` - General information
- `WARN` - Warning messages
- `ERROR` - Error messages
- `DEBUG` - Debug info (dev only)

```typescript
import { logger } from '@/utils/logger';

logger.info('Assessment created', { customerId, assessmentId });
logger.error('Failed to fetch bank data', { error });
```

## Error Handling

Structured error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid payment amount",
    "details": { "limit": 120, "requested": 150 },
    "timestamp": "2024-04-18T10:30:00Z",
    "traceId": "abc123"
  }
}
```

**HTTP Status Codes:**
- `200` - OK
- `201` - Created
- `400` - Bad Request (validation)
- `401` - Unauthorized (auth failed)
- `403` - Forbidden (RBAC denied)
- `404` - Not Found
- `409` - Conflict (state error)
- `422` - Unprocessable Entity (business logic)
- `500` - Internal Server Error

## Deployment

### Docker

```bash
# Build image
docker build -t bridge:latest .

# Push to ECR
docker tag bridge:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/bridge:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/bridge:latest
```

### AWS ECS

```bash
# Deploy infrastructure
cd infra
npm install
npm run cdk deploy
```

## Contributing

1. Create a feature branch
2. Make changes
3. Write tests
4. Format code: `npm run format`
5. Lint: `npm run lint`
6. Commit with clear message
7. Create pull request

## Monitoring

- **Logs:** CloudWatch Logs
- **Metrics:** CloudWatch Metrics
- **Alarms:** CloudWatch Alarms
- **Traces:** X-Ray (optional)

## Support

For issues or questions:
1. Check the [documentation](../../docs/)
2. Review [project plan](../../.claude/plans/)
3. Open an issue on GitHub

## License

MIT

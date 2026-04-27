# Customer Data Seeding Guide

**Purpose**: Populate the Customer table with 20 realistic UK customer records for testing and MVP development.

**Data Included**:
- Real UK postcodes (for 3rd party API queries)
- Realistic utility account numbers
- Varied bill amounts (£50 - £200/month)
- Varied arrears figures (£0 - £2000)
- Full addresses (street, city, postcode)
- Different hardship scenarios

---

## Customer Archetypes

We'll create 20 customers representing different hardship scenarios:

| # | Name | Postcode | Arrears | Monthly Bill | Scenario |
|---|------|----------|---------|--------------|----------|
| 1 | John Smith | M1 1AD (Manchester) | £1500 | £120 | Heavy arrears |
| 2 | Sarah Johnson | B1 1AA (Birmingham) | £800 | £95 | Moderate arrears |
| 3 | Emma Williams | LS1 1AA (Leeds) | £200 | £110 | Small arrears |
| 4 | Michael Brown | EH8 8DX (Edinburgh) | £0 | £85 | No arrears (vulnerable) |
| 5 | Lisa Davis | NP1 4PJ (Newport) | £600 | £100 | Moderate arrears |
| 6 | James Miller | BS1 5TR (Bristol) | £2000 | £150 | Severe arrears |
| 7 | Amanda Taylor | CB1 1AA (Cambridge) | £150 | £90 | Minimal arrears |
| 8 | David Anderson | OX1 1AA (Oxford) | £0 | £75 | Low bill, vulnerable |
| 9 | Sophie Thomas | CF10 1AR (Cardiff) | £1200 | £130 | Significant arrears |
| 10 | Robert Jackson | E1 6AN (London East) | £400 | £140 | Moderate arrears |
| 11 | Rachel White | SW1A 1AA (London West) | £800 | £125 | Moderate arrears |
| 12 | Christopher Harris | G1 1XA (Glasgow) | £0 | £95 | No arrears |
| 13 | Victoria Martin | DN1 1AA (Doncaster) | £1000 | £105 | Significant arrears |
| 14 | Anthony Thompson | SK1 1AA (Stockport) | £600 | £115 | Moderate arrears |
| 15 | Eleanor Garcia | PL1 1AA (Plymouth) | £300 | £100 | Small arrears |
| 16 | Daniel Rodriguez | SN1 1AA (Swindon) | £1600 | £135 | Heavy arrears |
| 17 | Margaret Lee | DE1 1AA (Derby) | £50 | £80 | Minimal arrears |
| 18 | Paul Walker | ST1 1AA (Stoke) | £0 | £110 | No arrears, low income |
| 19 | Jennifer Young | L1 1AA (Liverpool) | £1200 | £120 | Significant arrears |
| 20 | Mark Hernandez | KY1 1AA (Kirkcaldy) | £700 | £105 | Moderate arrears |

---

## Seeding Approach

### Option 1: Prisma Seed Script (Recommended)

**File**: `backend/prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CustomerSeed {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  postcode: string;
  utilityAccountNo: string;
  utilityType: 'Electricity' | 'Gas' | 'Water';
  monthlyBill: number;
  arrears: number;
}

const CUSTOMERS: CustomerSeed[] = [
  {
    email: 'john.smith@example.com',
    firstName: 'John',
    lastName: 'Smith',
    phone: '0161 123 4567',
    address: '42 Deansgate, Manchester',
    postcode: 'M1 1AD',
    utilityAccountNo: 'E123456789',
    utilityType: 'Electricity',
    monthlyBill: 120,
    arrears: 1500,
  },
  {
    email: 'sarah.johnson@example.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '0121 234 5678',
    address: '78 Broad Street, Birmingham',
    postcode: 'B1 1AA',
    utilityAccountNo: 'E234567890',
    utilityType: 'Gas',
    monthlyBill: 95,
    arrears: 800,
  },
  // ... 18 more records
];

async function main() {
  console.log('🌱 Starting customer seeding...');

  // Clear existing customers (optional, for clean seed)
  // await prisma.customer.deleteMany({});

  for (const customerData of CUSTOMERS) {
    const customer = await prisma.customer.upsert({
      where: { email: customerData.email },
      update: customerData,
      create: customerData,
    });
    console.log(`✅ Created/updated customer: ${customer.firstName} ${customer.lastName}`);
  }

  console.log('✅ Seeding completed!');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Seeding failed:', e);
  process.exit(1);
});
```

**Usage**:
```bash
npm run prisma:seed
```

### Option 2: SQL Seed Script

**File**: `backend/prisma/seeds/customers.sql`

```sql
-- Insert 20 customer records with realistic UK data

INSERT INTO "Customer" 
  (email, firstName, lastName, phone, address, postcode, utilityAccountNo, utilityType, monthlyBill, arrears, createdAt, updatedAt)
VALUES
  ('john.smith@example.com', 'John', 'Smith', '0161 123 4567', '42 Deansgate', 'M1 1AD', 'E123456789', 'Electricity', 120.00, 1500.00, NOW(), NOW()),
  ('sarah.johnson@example.com', 'Sarah', 'Johnson', '0121 234 5678', '78 Broad Street', 'B1 1AA', 'E234567890', 'Gas', 95.00, 800.00, NOW(), NOW()),
  ('emma.williams@example.com', 'Emma', 'Williams', '0113 345 6789', '15 City Square', 'LS1 1AA', 'E345678901', 'Electricity', 110.00, 200.00, NOW(), NOW()),
  ('michael.brown@example.com', 'Michael', 'Brown', '0131 456 7890', '33 Royal Mile', 'EH8 8DX', 'E456789012', 'Gas', 85.00, 0.00, NOW(), NOW()),
  ('lisa.davis@example.com', 'Lisa', 'Davis', '01633 567 8901', '22 High Street', 'NP1 4PJ', 'E567890123', 'Water', 100.00, 600.00, NOW(), NOW()),
  ('james.miller@example.com', 'James', 'Miller', '0117 678 9012', '99 Park Row', 'BS1 5TR', 'E678901234', 'Electricity', 150.00, 2000.00, NOW(), NOW()),
  ('amanda.taylor@example.com', 'Amanda', 'Taylor', '01223 789 0123', '11 Senate House', 'CB1 1AA', 'E789012345', 'Gas', 90.00, 150.00, NOW(), NOW()),
  ('david.anderson@example.com', 'David', 'Anderson', '01865 890 1234', '55 High Street', 'OX1 1AA', 'E890123456', 'Electricity', 75.00, 0.00, NOW(), NOW()),
  ('sophie.thomas@example.com', 'Sophie', 'Thomas', '029 2039 0123', '44 Park Place', 'CF10 1AR', 'E901234567', 'Gas', 130.00, 1200.00, NOW(), NOW()),
  ('robert.jackson@example.com', 'Robert', 'Jackson', '020 3123 0456', '88 Bishopsgate', 'E1 6AN', 'E012345678', 'Water', 140.00, 400.00, NOW(), NOW()),
  ('rachel.white@example.com', 'Rachel', 'White', '020 7946 0123', '1 Parliament Street', 'SW1A 1AA', 'G123456789', 'Electricity', 125.00, 800.00, NOW(), NOW()),
  ('christopher.harris@example.com', 'Christopher', 'Harris', '0141 2765 0123', '123 Sauchiehall Street', 'G1 1XA', 'G234567890', 'Gas', 95.00, 0.00, NOW(), NOW()),
  ('victoria.martin@example.com', 'Victoria', 'Martin', '01302 123 0456', '27 Chequer Road', 'DN1 1AA', 'G345678901', 'Electricity', 105.00, 1000.00, NOW(), NOW()),
  ('anthony.thompson@example.com', 'Anthony', 'Thompson', '0161 456 0789', '71 Mersey Square', 'SK1 1AA', 'G456789012', 'Gas', 115.00, 600.00, NOW(), NOW()),
  ('eleanor.garcia@example.com', 'Eleanor', 'Garcia', '01752 234 0567', '14 Mayflower Street', 'PL1 1AA', 'G567890123', 'Water', 100.00, 300.00, NOW(), NOW()),
  ('daniel.rodriguez@example.com', 'Daniel', 'Rodriguez', '01793 567 0123', '99 Regent Street', 'SN1 1AA', 'G678901234', 'Electricity', 135.00, 1600.00, NOW(), NOW()),
  ('margaret.lee@example.com', 'Margaret', 'Lee', '01332 345 0678', '33 Cornmarket Street', 'DE1 1AA', 'G789012345', 'Gas', 80.00, 50.00, NOW(), NOW()),
  ('paul.walker@example.com', 'Paul', 'Walker', '01782 234 0567', '22 Stafford Street', 'ST1 1AA', 'G890123456', 'Water', 110.00, 0.00, NOW(), NOW()),
  ('jennifer.young@example.com', 'Jennifer', 'Young', '0151 234 0678', '88 Church Street', 'L1 1AA', 'G901234567', 'Electricity', 120.00, 1200.00, NOW(), NOW()),
  ('mark.hernandez@example.com', 'Mark', 'Hernandez', '01592 345 0678', '11 High Street', 'KY1 1AA', 'G012345678', 'Gas', 105.00, 700.00, NOW(), NOW());
```

**Usage**:
```bash
# Using psql (for PostgreSQL)
psql -U postgres -d bridge_db -f backend/prisma/seeds/customers.sql

# Or via Prisma queryRaw
npx prisma db execute --stdin < backend/prisma/seeds/customers.sql
```

---

## Postcode Data Strategy

### Why Real Postcodes?

The UK postcodes allow querying external APIs for:
- **Deprivation Index** (IMD - Index of Multiple Deprivation)
- **Average Income Data** (for hardship assessment)
- **Council Tax Data** (for affordability)
- **Fuel Poverty Indicators**

### Example: UK Postcode Lookup APIs

**Free Options:**
1. **Postcodes.io** - Free postcode lookup
   ```bash
   curl https://api.postcodes.io/postcodes/M1%201AD
   ```

2. **UK Government IMD Data** - Deprivation index by postcode
   - Available via Open Data Commons

3. **Local Council Tax APIs** - Some councils publish band data

### Postcode Configuration

**File**: `backend/src/config/postcodes.ts`

```typescript
/**
 * Real UK postcodes with hardship indicators
 * Used for testing 3rd party API integrations
 */

export const POSTCODE_CONFIG = {
  'M1 1AD': { region: 'Manchester', imdDecile: 1, avgIncome: 25000 },
  'B1 1AA': { region: 'Birmingham', imdDecile: 2, avgIncome: 26000 },
  'LS1 1AA': { region: 'Leeds', imdDecile: 3, avgIncome: 27500 },
  'EH8 8DX': { region: 'Edinburgh', imdDecile: 4, avgIncome: 29000 },
  // ... more postcodes
};
```

---

## Realistic Bill & Arrears Distribution

### Bill Amount Distribution

```
Gas only:      £70 - £110/month
Electricity:   £80 - £150/month
Water:         £50 - £80/month (less common in MVP)
Mixed/Dual:    £120 - £180/month
```

### Arrears Scenarios

| Severity | Amount | % of Customers | Hardship Level |
|----------|--------|----------------|-----------------|
| None | £0 | 25% | LOW |
| Small | £50-300 | 15% | LOW |
| Moderate | £300-900 | 35% | MODERATE |
| Significant | £900-1500 | 20% | SEVERE |
| Critical | £1500+ | 5% | SEVERE |

**Our 20 customers:**
- 4 with no arrears (20%)
- 4 with small arrears £50-300 (20%)
- 7 with moderate arrears £300-900 (35%)
- 4 with significant/critical £1200+ (25%)

---

## Implementation Steps

### Step 1: Create Seed File

Create `backend/prisma/seed.ts` with all 20 customer records (see code above).

### Step 2: Create SQL Backup

Create `backend/prisma/seeds/customers.sql` for manual execution or backup.

### Step 3: Add Seed Command

Update `backend/package.json`:
```json
{
  "scripts": {
    "prisma:seed": "ts-node prisma/seed.ts"
  }
}
```

### Step 4: Run in Development

```bash
# Run seed
npm run prisma:seed

# Verify (check database)
npm run prisma:studio
```

### Step 5: Document Seed Data

Create data dictionary in docs:
```
Customer Reference Data
- 20 customers with realistic addresses
- Postcodes valid for external API testing
- Varied hardship scenarios for assessment testing
- See: backend/prisma/seed.ts
```

---

## Integration with Auth

### User-Customer Linking

After seeding customers, create test users in Cognito and manually link:

```bash
# 1. Seed customers (database)
npm run prisma:seed

# 2. Create users in Cognito (via script or AWS console)
./scripts/create-cognito-test-users.sh

# 3. Link users to customers (via admin UI or direct DB update)
# UPDATE "User" SET customerId = '<customer-id>' WHERE email = 'john.smith@example.com';
```

### Test User Account

Create a test user linked to customer #1 (John Smith):

```
Email: john.smith@example.com
Password: TestPass123!
Customer Link: ✓ Linked to John Smith customer record
Arrears: £1500 (testing SEVERE hardship)
Bill: £120/month
```

---

## Validation Checklist

- [ ] All 20 customers created in database
- [ ] Each customer has unique email
- [ ] Postcodes are valid UK postcodes
- [ ] Utility account numbers are unique
- [ ] Monthly bills range from £75-£150
- [ ] Arrears cover all severity levels
- [ ] Addresses are realistic and complete
- [ ] Phone numbers follow UK format (11 digits with area code)
- [ ] Test user created and linked to customer #1
- [ ] Seed script can be re-run idempotently (upsert pattern)

---

## Future Enhancements

1. **Faker.js Integration**: Generate more realistic names and addresses
2. **CSV Import**: Allow bulk import from CSV (for real customer data)
3. **Soft Delete**: Archive old seed data rather than deleting
4. **Test Environments**: Different seed data for staging vs. production
5. **External API Integration**: Auto-populate IMD scores from real APIs

---

## Files to Create

1. **`backend/prisma/seed.ts`** - TypeScript seed script
2. **`backend/prisma/seeds/customers.sql`** - SQL seed backup
3. **`scripts/create-cognito-test-users.sh`** - Create test users in Cognito
4. **`scripts/link-users-to-customers.sh`** - Link users to customers (admin task)
5. **Update `backend/package.json`** - Add `prisma:seed` script

---

## Related Tasks

- Update todo list with seeding tasks
- Create companion script for Cognito test user creation
- Document test user credentials in `.env.example`
- Add seed data to CI/CD pipeline (optional)

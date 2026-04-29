import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 20 realistic UK customers with full details
const customers = [
  {
    email: 'john.smith@example.com',
    firstName: 'John',
    lastName: 'Smith',
    phone: '07700 900001',
    address: '42 Oak Street',
    postcode: 'M1 1AA',
    utilityAccountNo: 'GAS00001234',
    utilityType: 'Gas',
    monthlyBill: 89.50,
    arrears: 245.00,
  },
  {
    email: 'jane.doe@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    phone: '07700 900002',
    address: '17 Maple Road',
    postcode: 'B5 5RD',
    utilityAccountNo: 'ELEC00005678',
    utilityType: 'Electricity',
    monthlyBill: 125.75,
    arrears: 0.00,
  },
  {
    email: 'robert.johnson@example.com',
    firstName: 'Robert',
    lastName: 'Johnson',
    phone: '07700 900003',
    address: '88 Church Lane',
    postcode: 'E1 6AN',
    utilityAccountNo: 'GAS00002345',
    utilityType: 'Gas',
    monthlyBill: 65.00,
    arrears: 195.00,
  },
  {
    email: 'sarah.williams@example.com',
    firstName: 'Sarah',
    lastName: 'Williams',
    phone: '07700 900004',
    address: '52 Queens Avenue',
    postcode: 'SW1 1AA',
    utilityAccountNo: 'ELEC00006789',
    utilityType: 'Electricity',
    monthlyBill: 98.50,
    arrears: 392.00,
  },
  {
    email: 'michael.brown@example.com',
    firstName: 'Michael',
    lastName: 'Brown',
    phone: '07700 900005',
    address: '73 Park Road',
    postcode: 'L1 1AA',
    utilityAccountNo: 'GAS00003456',
    utilityType: 'Gas',
    monthlyBill: 72.25,
    arrears: 144.50,
  },
  {
    email: 'emily.davis@example.com',
    firstName: 'Emily',
    lastName: 'Davis',
    phone: '07700 900006',
    address: '99 High Street',
    postcode: 'E8 1AA',
    utilityAccountNo: 'ELEC00007890',
    utilityType: 'Electricity',
    monthlyBill: 110.00,
    arrears: 550.00,
  },
  {
    email: 'david.miller@example.com',
    firstName: 'David',
    lastName: 'Miller',
    phone: '07700 900007',
    address: '34 Main Street',
    postcode: 'G1 1AA',
    utilityAccountNo: 'GAS00004567',
    utilityType: 'Gas',
    monthlyBill: 81.75,
    arrears: 0.00,
  },
  {
    email: 'laura.wilson@example.com',
    firstName: 'Laura',
    lastName: 'Wilson',
    phone: '07700 900008',
    address: '15 Central Avenue',
    postcode: 'M2 1AA',
    utilityAccountNo: 'WATER0008901',
    utilityType: 'Water',
    monthlyBill: 45.00,
    arrears: 90.00,
  },
  {
    email: 'james.moore@example.com',
    firstName: 'James',
    lastName: 'Moore',
    phone: '07700 900009',
    address: '66 West Lane',
    postcode: 'S1 1AA',
    utilityAccountNo: 'ELEC00008901',
    utilityType: 'Electricity',
    monthlyBill: 105.50,
    arrears: 317.00,
  },
  {
    email: 'sophia.taylor@example.com',
    firstName: 'Sophia',
    lastName: 'Taylor',
    phone: '07700 900010',
    address: '28 South Road',
    postcode: 'B1 1AA',
    utilityAccountNo: 'GAS00005678',
    utilityType: 'Gas',
    monthlyBill: 58.00,
    arrears: 232.00,
  },
  {
    email: 'daniel.anderson@example.com',
    firstName: 'Daniel',
    lastName: 'Anderson',
    phone: '07700 900011',
    address: '44 North Street',
    postcode: 'N1 1AA',
    utilityAccountNo: 'ELEC00009012',
    utilityType: 'Electricity',
    monthlyBill: 135.00,
    arrears: 0.00,
  },
  {
    email: 'olivia.thomas@example.com',
    firstName: 'Olivia',
    lastName: 'Thomas',
    phone: '07700 900012',
    address: '11 Park Lane',
    postcode: 'E2 1AA',
    utilityAccountNo: 'GAS00006789',
    utilityType: 'Gas',
    monthlyBill: 76.50,
    arrears: 153.00,
  },
  {
    email: 'william.jackson@example.com',
    firstName: 'William',
    lastName: 'Jackson',
    phone: '07700 900013',
    address: '89 Garden Road',
    postcode: 'CV1 1AA',
    utilityAccountNo: 'WATER0009012',
    utilityType: 'Water',
    monthlyBill: 52.00,
    arrears: 0.00,
  },
  {
    email: 'isabella.white@example.com',
    firstName: 'Isabella',
    lastName: 'White',
    phone: '07700 900014',
    address: '21 Forest Street',
    postcode: 'N2 1AA',
    utilityAccountNo: 'ELEC00000123',
    utilityType: 'Electricity',
    monthlyBill: 99.75,
    arrears: 598.50,
  },
  {
    email: 'alexander.harris@example.com',
    firstName: 'Alexander',
    lastName: 'Harris',
    phone: '07700 900015',
    address: '57 Maple Drive',
    postcode: 'M3 1AA',
    utilityAccountNo: 'GAS00007890',
    utilityType: 'Gas',
    monthlyBill: 68.00,
    arrears: 68.00,
  },
  {
    email: 'amelia.martin@example.com',
    firstName: 'Amelia',
    lastName: 'Martin',
    phone: '07700 900016',
    address: '33 Cherry Lane',
    postcode: 'B2 1AA',
    utilityAccountNo: 'ELEC00001234',
    utilityType: 'Electricity',
    monthlyBill: 115.25,
    arrears: 345.75,
  },
  {
    email: 'christopher.lee@example.com',
    firstName: 'Christopher',
    lastName: 'Lee',
    phone: '07700 900017',
    address: '74 Birch Road',
    postcode: 'S2 1AA',
    utilityAccountNo: 'GAS00008901',
    utilityType: 'Gas',
    monthlyBill: 79.50,
    arrears: 0.00,
  },
  {
    email: 'mia.perez@example.com',
    firstName: 'Mia',
    lastName: 'Perez',
    phone: '07700 900018',
    address: '46 Elm Street',
    postcode: 'L2 1AA',
    utilityAccountNo: 'WATER0000123',
    utilityType: 'Water',
    monthlyBill: 48.00,
    arrears: 144.00,
  },
  {
    email: 'benjamin.clark@example.com',
    firstName: 'Benjamin',
    lastName: 'Clark',
    phone: '07700 900019',
    address: '19 Oak Avenue',
    postcode: 'G2 1AA',
    utilityAccountNo: 'ELEC00002345',
    utilityType: 'Electricity',
    monthlyBill: 122.00,
    arrears: 610.00,
  },
  {
    email: 'charlotte.lewis@example.com',
    firstName: 'Charlotte',
    lastName: 'Lewis',
    phone: '07700 900020',
    address: '63 Ash Lane',
    postcode: 'E3 1AA',
    utilityAccountNo: 'GAS00009012',
    utilityType: 'Gas',
    monthlyBill: 85.00,
    arrears: 170.00,
  },
];

function createMockAssessment(customerId: string, monthlyBill: number) {
  // Realistic UK household: disposable income £2,100/month
  const disposableIncome = 2100;

  // Expenses breakdown (realistic UK values)
  const expensesByCategory = {
    Housing: 1200,
    Utilities: 280,
    Food: 300,
    Transport: 150,
    Other: 170,
  };

  // 6-month income history (varying slightly)
  const incomeHistory = [
    { month: 'Oct 2025', amount: 1950 },
    { month: 'Nov 2025', amount: 2100 },
    { month: 'Dec 2025', amount: 1800 },
    { month: 'Jan 2026', amount: 2050 },
    { month: 'Feb 2026', amount: 2200 },
    { month: 'Mar 2026', amount: 2100 },
  ];

  // Income sources
  const incomeSources = [
    { type: 'Employment', amount: 1950, frequency: 'Monthly' },
    { type: 'Benefits', amount: 150, frequency: 'Monthly' },
  ];

  // Assessment factors
  const factors = [
    {
      title: 'Household size: 4 dependents',
      description: 'Four dependents increases essential expenses (food, transport).',
    },
    {
      title: 'Recent illness (3 months)',
      description: 'Recent medical costs impacted disposable income during recovery period.',
    },
    {
      title: 'Utility bill high for postcode',
      description: 'Your utility bill is 15% above average for your area (M1).',
    },
  ];

  // Calculate payment plans (Formula 5)
  const conservativeAmount = Math.round(disposableIncome * 0.14);
  const balancedAmount = Math.round(disposableIncome * 0.18);
  const aggressiveAmount = Math.round(disposableIncome * 0.20);

  // Assuming £3,000 in arrears
  const arrears = 3000;

  const paymentPlans = [
    {
      type: 'Conservative',
      monthlyAmount: conservativeAmount,
      duration: Math.ceil(arrears / conservativeAmount),
      totalRepayment: arrears,
      sustainability: 'HIGH',
    },
    {
      type: 'Balanced',
      monthlyAmount: balancedAmount,
      duration: Math.ceil(arrears / balancedAmount),
      totalRepayment: arrears,
      sustainability: 'MEDIUM',
    },
    {
      type: 'Aggressive',
      monthlyAmount: aggressiveAmount,
      duration: Math.ceil(arrears / aggressiveAmount),
      totalRepayment: arrears,
      sustainability: 'MEDIUM',
    },
  ];

  // Determine hardship level based on bill ratio
  const billRatio = (monthlyBill / disposableIncome) * 100;
  let hardshipLevel = 'NONE';
  if (billRatio > 25) hardshipLevel = 'SEVERE';
  else if (billRatio > 10) hardshipLevel = 'MODERATE';
  else if (billRatio > 0) hardshipLevel = 'LOW';

  return {
    customerId,
    monthlyIncome: 2100,
    monthlyExpenses: 2100,
    monthlyBill,
    arrears: 3000,
    disposableIncome,
    billRatio,
    hardshipLevel,
    sustainabilityScore: 'MEDIUM',
    incomeBreakdown: JSON.stringify({}),
    expenseBreakdown: JSON.stringify({}),
    expensesByCategory: JSON.stringify(expensesByCategory),
    incomeHistory: JSON.stringify(incomeHistory),
    incomeSources: JSON.stringify(incomeSources),
    factors: JSON.stringify(factors),
    paymentPlans: JSON.stringify(paymentPlans),
    status: 'COMPLETED',
  };
}

async function main() {
  console.log('🌱 Seeding database with 20 test customers...');

  for (const customer of customers) {
    const existing = await prisma.customer.findUnique({
      where: { email: customer.email },
    });

    if (existing) {
      console.log(`  ✅ ${customer.email} (already exists)`);

      // Create assessment for existing customer if not already present
      const existingAssessment = await prisma.assessment.findFirst({
        where: { customerId: existing.id },
      });

      if (!existingAssessment) {
        const assessment = createMockAssessment(existing.id, customer.monthlyBill);
        await prisma.assessment.create({ data: assessment });
        console.log(`     └─ Assessment created (breakdown data included)`);
      }
    } else {
      const newCustomer = await prisma.customer.create({
        data: customer,
      });
      console.log(`  ✅ ${customer.email} (created)`);

      // Create assessment for new customer
      const assessment = createMockAssessment(newCustomer.id, customer.monthlyBill);
      await prisma.assessment.create({ data: assessment });
      console.log(`     └─ Assessment created (breakdown data included)`);
    }
  }

  console.log('');
  console.log('✅ Seeding complete!');
  console.log('');
  console.log('Assessment data includes:');
  console.log('  • expensesByCategory (5 categories with realistic UK values)');
  console.log('  • incomeHistory (6 months of income data)');
  console.log('  • incomeSources (employment + benefits)');
  console.log('  • factors (3 assessment factors explaining hardship)');
  console.log('  • paymentPlans (3 plans: Conservative, Balanced, Aggressive)');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Run: ./scripts/link-users-to-customers.sh');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

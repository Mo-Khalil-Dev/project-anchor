import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const customers = [
    {
      email: 'temp-severe@test.local',
      monthlyBill: 250,
      arrears: 2000,
    },
    {
      email: 'temp-moderate@test.local',
      monthlyBill: 120,
      arrears: 500,
    },
    {
      email: 'temp-low@test.local',
      monthlyBill: 60,
      arrears: 100,
    },
  ];

  for (const customer of customers) {
    const created = await prisma.customer.upsert({
      where: { email: customer.email },
      update: {
        monthlyBill: customer.monthlyBill,
        arrears: customer.arrears,
      },
      create: {
        email: customer.email,
        monthlyBill: customer.monthlyBill,
        arrears: customer.arrears,
      },
    });

    console.log(`✓ Created/updated customer: ${created.email}`);
  }

  console.log('\n✓ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

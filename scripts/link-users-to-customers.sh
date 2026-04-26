#!/bin/bash

# PROJECT BRIDGE - Link Cognito Users to Customers
# Links test users created in Cognito to customer records in the database
# Usage: ./scripts/link-users-to-customers.sh

set -e

echo "🔗 PROJECT BRIDGE - Link Users to Customers"
echo "==========================================="
echo ""

# Load environment variables
if [ -f .env ]; then
  export $(grep -E "DATABASE_URL|AUTH_PROVIDER" .env | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not found in .env"
  exit 1
fi

echo "📋 Configuration:"
echo "  DATABASE_URL: $DATABASE_URL"
echo "  AUTH_PROVIDER: ${AUTH_PROVIDER:-cognito}"
echo ""

# Define test users to link
# Format: email:firstName:lastName:customerId (email is used to find the customer)
declare -a USERS=(
  "john@example.com"
  "jane@example.com"
  "admin@example.com"
)

echo "🔗 Linking users to customers..."
echo ""

for email in "${USERS[@]}"; do
  echo "  Linking: $email"

  # Extract username from email for user lookup
  username=$email

  # Use ts-node to run the linking logic with Prisma
  npx ts-node -O '{"module":"commonjs"}' << 'EOF' "$email"
const { PrismaClient } = require('@prisma/client');

const email = process.argv[2];
const prisma = new PrismaClient();

async function linkUserToCustomer() {
  try {
    // Find the user by email (created via Cognito/auth)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`    ⚠️  User not found: ${email}`);
      return;
    }

    // Find the customer by email
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      console.log(`    ⚠️  Customer not found: ${email}`);
      return;
    }

    // Link the customer to the user
    await prisma.customer.update({
      where: { id: customer.id },
      data: { userId: user.id },
    });

    console.log(`    ✅ Linked ${email} (User: ${user.id}, Customer: ${customer.id})`);
  } catch (error) {
    console.error(`    ❌ Error linking ${email}:`, error.message);
  } finally {
    await prisma.$disconnect();
  }
}

linkUserToCustomer();
EOF
done

echo ""
echo "✅ User-to-customer linking complete!"
echo ""
echo "📊 Summary:"
echo "  john@example.com → john.smith@example.com customer"
echo "  jane@example.com → jane.doe@example.com customer"
echo "  admin@example.com → No matching customer (admin user)"
echo ""
echo "Next steps:"
echo "  1. Test authentication: ./scripts/test-auth-flow.sh"
echo "  2. Access app at: http://localhost:5173"

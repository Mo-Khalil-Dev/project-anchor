#!/bin/bash

# PROJECT BRIDGE - Create Cognito Test Users
# Creates test users in the Cognito sandbox
# Usage: ./scripts/create-cognito-test-users.sh

set -e

echo "👥 PROJECT BRIDGE - Create Test Users"
echo "======================================"
echo ""

# Load environment variables from .env
if [ -f .env ]; then
  export $(grep "COGNITO" .env | xargs)
fi

USER_POOL_ID="${COGNITO_USER_POOL_ID}"
REGION="${COGNITO_REGION:-us-east-1}"
TEMP_PASSWORD="TempPass123!"

if [ -z "$USER_POOL_ID" ]; then
  echo "❌ COGNITO_USER_POOL_ID not found in .env"
  echo "Please run: ./scripts/setup-cognito-sandbox.sh"
  exit 1
fi

echo "📋 Configuration:"
echo "  User Pool: $USER_POOL_ID"
echo "  Region: $REGION"
echo "  Temporary Password: $TEMP_PASSWORD"
echo ""

# Test users
declare -a USERS=(
  "john@example.com:John:Smith"
  "jane@example.com:Jane:Doe"
  "admin@example.com:Admin:User"
)

echo "👤 Creating test users..."
for user_data in "${USERS[@]}"; do
  IFS=':' read -r email firstname lastname <<< "$user_data"

  echo ""
  echo "  Creating: $email"

  # Check if user exists
  USER_EXISTS=$(aws cognito-idp admin-get-user \
    --region "$REGION" \
    --user-pool-id "$USER_POOL_ID" \
    --username "$email" 2>/dev/null || echo "")

  if [ -n "$USER_EXISTS" ]; then
    echo "    ✅ User already exists"
  else
    # Create user
    aws cognito-idp admin-create-user \
      --region "$REGION" \
      --user-pool-id "$USER_POOL_ID" \
      --username "$email" \
      --user-attributes Name=email,Value="$email" Name=email_verified,Value=true Name=given_name,Value="$firstname" Name=family_name,Value="$lastname" \
      --temporary-password "$TEMP_PASSWORD" \
      --message-action SUPPRESS > /dev/null

    # Set permanent password
    aws cognito-idp admin-set-user-password \
      --region "$REGION" \
      --user-pool-id "$USER_POOL_ID" \
      --username "$email" \
      --password "$TEMP_PASSWORD" \
      --permanent > /dev/null

    echo "    ✅ User created"
  fi
done

echo ""
echo "✅ Test users ready!"
echo ""
echo "📝 Test credentials:"
echo "==========================================="
for user_data in "${USERS[@]}"; do
  IFS=':' read -r email firstname lastname <<< "$user_data"
  echo "Email: $email"
  echo "Password: $TEMP_PASSWORD"
  echo ""
done
echo "==========================================="
echo ""
echo "Next steps:"
echo "  1. Run: npx ts-node prisma/seed.ts (seed customers)"
echo "  2. Run: ./scripts/link-users-to-customers.sh (link users)"

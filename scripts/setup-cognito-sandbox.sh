#!/bin/bash

# PROJECT BRIDGE - Cognito Sandbox Setup
# One-time setup script to create Cognito resources
# Usage: ./scripts/setup-cognito-sandbox.sh

set -e

echo "🔧 PROJECT BRIDGE - Cognito Sandbox Setup"
echo "==========================================="
echo ""

# Configuration
REGION="${AWS_REGION:-us-east-1}"
USER_POOL_NAME="bridge-sandbox"
APP_CLIENT_NAME="bridge-frontend"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"

echo "📋 Configuration:"
echo "  Region: $REGION"
echo "  User Pool: $USER_POOL_NAME"
echo "  Frontend URL: $FRONTEND_URL"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo "❌ AWS CLI is not installed. Please install it first."
  exit 1
fi

# Check if jq is installed (for JSON parsing)
if ! command -v jq &> /dev/null; then
  echo "❌ jq is not installed. Please install it first (brew install jq)."
  exit 1
fi

echo "🔍 Checking for existing user pool..."
EXISTING_POOL=$(aws cognito-idp list-user-pools --region "$REGION" --max-results 10 | jq -r ".UserPools[] | select(.Name==\"$USER_POOL_NAME\") | .Id" 2>/dev/null || echo "")

if [ -n "$EXISTING_POOL" ]; then
  echo "✅ User pool already exists: $EXISTING_POOL"
  USER_POOL_ID=$EXISTING_POOL
else
  echo "📦 Creating user pool: $USER_POOL_NAME"
  POOL_RESPONSE=$(aws cognito-idp create-user-pool \
    --region "$REGION" \
    --pool-name "$USER_POOL_NAME" \
    --policies PasswordPolicy="{MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" \
    --schema Name=email,AttributeDataType=String,Required=true,Mutable=true Name=given_name,AttributeDataType=String,Mutable=true Name=family_name,AttributeDataType=String,Mutable=true \
    --auto-verified-attributes email)

  USER_POOL_ID=$(echo "$POOL_RESPONSE" | jq -r '.UserPool.Id')
  echo "✅ User pool created: $USER_POOL_ID"
fi

echo ""
echo "🔍 Checking for existing app client..."
EXISTING_CLIENT=$(aws cognito-idp list-user-pool-clients --region "$REGION" --user-pool-id "$USER_POOL_ID" | jq -r ".UserPoolClients[] | select(.ClientName==\"$APP_CLIENT_NAME\") | .ClientId" 2>/dev/null || echo "")

if [ -n "$EXISTING_CLIENT" ]; then
  echo "✅ App client already exists: $EXISTING_CLIENT"
  CLIENT_ID=$EXISTING_CLIENT
else
  echo "📦 Creating app client: $APP_CLIENT_NAME"
  CLIENT_RESPONSE=$(aws cognito-idp create-user-pool-client \
    --region "$REGION" \
    --user-pool-id "$USER_POOL_ID" \
    --client-name "$APP_CLIENT_NAME" \
    --generate-secret \
    --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_SRP_AUTH \
    --callback-urls "http://localhost:3001/api/auth/callback" "$FRONTEND_URL/auth/callback" \
    --logout-urls "http://localhost:5173" "$FRONTEND_URL" \
    --allowed-o-auth-flows code implicit \
    --allowed-o-auth-scopes openid email profile)

  CLIENT_ID=$(echo "$CLIENT_RESPONSE" | jq -r '.UserPoolClient.ClientId')
  echo "✅ App client created: $CLIENT_ID"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Add these to your .env file:"
echo "==========================================="
echo "COGNITO_USER_POOL_ID=$USER_POOL_ID"
echo "COGNITO_CLIENT_ID=$CLIENT_ID"
echo "COGNITO_REGION=$REGION"
echo "AUTH_PROVIDER=cognito"
echo "==========================================="
echo ""
echo "Next steps:"
echo "  1. Update .env with the values above"
echo "  2. Run: ./scripts/create-cognito-test-users.sh"
echo "  3. Run: npx ts-node prisma/seed.ts"
echo "  4. Run: ./scripts/link-users-to-customers.sh"

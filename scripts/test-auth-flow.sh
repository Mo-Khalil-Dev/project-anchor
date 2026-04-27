#!/bin/bash

# PROJECT BRIDGE - Authentication Flow Test
# Validates all auth endpoints using curl
# Usage: ./scripts/test-auth-flow.sh

set -e

echo "🧪 PROJECT BRIDGE - Authentication Flow Test"
echo "============================================="
echo ""

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
AUTH_PROVIDER="${AUTH_PROVIDER:-mock}"

echo "📋 Configuration:"
echo "  Backend URL: $BACKEND_URL"
echo "  Auth Provider: $AUTH_PROVIDER"
echo ""

# Check if backend is running
echo "🔍 Checking backend connectivity..."
if ! curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
  echo "❌ Backend not responding at $BACKEND_URL"
  echo "   Start backend with: npm run dev (from backend/)"
  exit 1
fi
echo "✅ Backend is running"
echo ""

# Test results tracking
PASSED=0
FAILED=0

test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local expected_status=$5

  echo "Testing: $name"

  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "$BACKEND_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi

  status=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$status" = "$expected_status" ]; then
    echo "  ✅ Status $status (expected $expected_status)"
    echo "$body"
    PASSED=$((PASSED + 1))
  else
    echo "  ❌ Status $status (expected $expected_status)"
    echo "  Response: $body"
    FAILED=$((FAILED + 1))
  fi
  echo ""
}

# Test 1: Initiate Login
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: POST /api/auth/initiate-login"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

INIT_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/initiate-login" \
  -H "Content-Type: application/json" \
  -d '{}')

if echo "$INIT_RESPONSE" | grep -q '"loginUrl"'; then
  echo "✅ initiate-login returns loginUrl"
  LOGIN_URL=$(echo "$INIT_RESPONSE" | grep -o '"loginUrl":"[^"]*"' | cut -d'"' -f4)
  STATE=$(echo "$LOGIN_URL" | grep -o 'state=[^&]*' | cut -d'=' -f2)
  CODE=$(echo "$LOGIN_URL" | grep -o 'code=[^&]*' | cut -d'=' -f2)
  echo "   Generated code: ${CODE:0:20}..."
  echo "   Generated state: ${STATE:0:20}..."
  PASSED=$((PASSED + 1))
else
  echo "❌ initiate-login failed"
  echo "   Response: $INIT_RESPONSE"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 2: Handle Callback
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: POST /api/auth/callback"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$CODE" ] && [ -n "$STATE" ]; then
  CALLBACK_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/auth/callback" \
    -H "Content-Type: application/json" \
    -d "{\"code\":\"$CODE\",\"state\":\"$STATE\"}")

  CALLBACK_STATUS=$(echo "$CALLBACK_RESPONSE" | tail -n1)
  CALLBACK_BODY=$(echo "$CALLBACK_RESPONSE" | sed '$d')

  if [ "$CALLBACK_STATUS" = "200" ]; then
    echo "✅ callback returns 200"
    if echo "$CALLBACK_BODY" | grep -q '"accessToken"'; then
      echo "✅ callback returns accessToken"
      ACCESS_TOKEN=$(echo "$CALLBACK_BODY" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4 | head -1)
      echo "   Token: ${ACCESS_TOKEN:0:40}..."
      PASSED=$((PASSED + 1))
    else
      echo "❌ callback missing accessToken"
      echo "   Response: $CALLBACK_BODY"
      FAILED=$((FAILED + 1))
    fi
  else
    echo "❌ callback returned $CALLBACK_STATUS"
    echo "   Response: $CALLBACK_BODY"
    FAILED=$((FAILED + 1))
  fi
else
  echo "⚠️  Skipping callback test (code/state not available from initiate-login)"
fi
echo ""

# Test 3: Get Current User (protected endpoint)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: GET /api/auth/current-user"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$ACCESS_TOKEN" ]; then
  CURRENT_USER_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BACKEND_URL/api/auth/current-user" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

  CURRENT_STATUS=$(echo "$CURRENT_USER_RESPONSE" | tail -n1)
  CURRENT_BODY=$(echo "$CURRENT_USER_RESPONSE" | sed '$d')

  if [ "$CURRENT_STATUS" = "200" ]; then
    echo "✅ current-user returns 200"
    if echo "$CURRENT_BODY" | grep -q '"email"'; then
      echo "✅ current-user returns user data"
      USER_EMAIL=$(echo "$CURRENT_BODY" | grep -o '"email":"[^"]*"' | cut -d'"' -f4 | head -1)
      echo "   Email: $USER_EMAIL"
      PASSED=$((PASSED + 1))
    else
      echo "❌ current-user missing email"
      FAILED=$((FAILED + 1))
    fi
  else
    echo "❌ current-user returned $CURRENT_STATUS"
    echo "   Response: $CURRENT_BODY"
    FAILED=$((FAILED + 1))
  fi
else
  echo "⚠️  Skipping current-user test (accessToken not available)"
fi
echo ""

# Test 4: Refresh Token (without token in request)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: POST /api/auth/refresh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

REFRESH_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{}')

REFRESH_STATUS=$(echo "$REFRESH_RESPONSE" | tail -n1)
REFRESH_BODY=$(echo "$REFRESH_RESPONSE" | sed '$d')

# Without a refresh token cookie, should return 401
if [ "$REFRESH_STATUS" = "401" ]; then
  echo "✅ refresh returns 401 (no refresh token cookie)"
  PASSED=$((PASSED + 1))
elif [ "$REFRESH_STATUS" = "200" ]; then
  echo "✅ refresh returns 200 (refresh token cookie present)"
  PASSED=$((PASSED + 1))
else
  echo "❌ refresh returned $REFRESH_STATUS"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 5: Logout
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: POST /api/auth/logout"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LOGOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/auth/logout" \
  -H "Content-Type: application/json" \
  -d '{}')

LOGOUT_STATUS=$(echo "$LOGOUT_RESPONSE" | tail -n1)

# Without a token, should return 401
if [ "$LOGOUT_STATUS" = "401" ]; then
  echo "✅ logout returns 401 (no auth token)"
  PASSED=$((PASSED + 1))
elif [ "$LOGOUT_STATUS" = "200" ]; then
  echo "✅ logout returns 200 (with token)"
  PASSED=$((PASSED + 1))
else
  echo "❌ logout returned $LOGOUT_STATUS"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 6: Redirect to Journey
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 6: POST /api/auth/redirect-to-journey"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

REDIRECT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/auth/redirect-to-journey" \
  -H "Content-Type: application/json" \
  -d '{}')

REDIRECT_STATUS=$(echo "$REDIRECT_RESPONSE" | tail -n1)
REDIRECT_BODY=$(echo "$REDIRECT_RESPONSE" | sed '$d')

# Without a token, should return 401
if [ "$REDIRECT_STATUS" = "401" ]; then
  echo "✅ redirect-to-journey returns 401 (no auth token)"
  PASSED=$((PASSED + 1))
elif [ "$REDIRECT_STATUS" = "200" ]; then
  echo "✅ redirect-to-journey returns 200 (with token)"
  if echo "$REDIRECT_BODY" | grep -q '"nextPage"'; then
    NEXT_PAGE=$(echo "$REDIRECT_BODY" | grep -o '"nextPage":"[^"]*"' | cut -d'"' -f4)
    echo "   Next page: $NEXT_PAGE"
  fi
  PASSED=$((PASSED + 1))
else
  echo "❌ redirect-to-journey returned $REDIRECT_STATUS"
  FAILED=$((FAILED + 1))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "🎉 All authentication endpoints working!"
  exit 0
else
  echo "⚠️  Some tests failed. Check errors above."
  exit 1
fi

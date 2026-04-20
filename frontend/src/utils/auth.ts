// Test utility for setting mock JWT tokens during development
export function setTestJwtToken() {
  // Simple mock JWT (not cryptographically valid, just for testing)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'test-customer-123',
      email: 'test@example.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 365, // 1 year expiry
    })
  ).toString('base64');
  const signature = 'test_signature_not_valid';

  const token = `${header}.${payload}.${signature}`;
  localStorage.setItem('auth_token', token);
  console.log('Test JWT token set in localStorage');
  return token;
}

export function clearTestJwtToken() {
  localStorage.removeItem('auth_token');
  console.log('Test JWT token cleared from localStorage');
}

export function getJwtToken(): string | null {
  return localStorage.getItem('auth_token');
}

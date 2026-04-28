import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Seeded customer emails for quick testing (keep in sync with backend/prisma/seed.ts)
const SEEDED_CUSTOMERS = [
  { email: 'john.smith@example.com', name: 'John Smith' },
  { email: 'jane.doe@example.com', name: 'Jane Doe' },
  { email: 'robert.johnson@example.com', name: 'Robert Johnson' },
  { email: 'sarah.williams@example.com', name: 'Sarah Williams' },
  { email: 'michael.brown@example.com', name: 'Michael Brown' },
];

export function useLoginPage() {
  const navigate = useNavigate();
  const { initiateLogin, isLoading, error } = useAuth();
  const [mockEmail, setMockEmail] = useState(SEEDED_CUSTOMERS[0].email); // Pre-populate with first customer

  const handleSignIn = useCallback(async () => {
    try {
      const { loginUrl } = await initiateLogin();
      window.location.href = loginUrl;
    } catch (err) {
      console.error('Failed to initiate login:', err);
    }
  }, [initiateLogin]);

  const handleMockLogin = useCallback(async () => {
    if (!mockEmail.trim()) {
      return;
    }

    try {
      // For mock auth, encode email as base64 to use as "code"
      const code = btoa(mockEmail);
      navigate(`/auth/callback?code=${encodeURIComponent(code)}&state=mock`);
    } catch (err) {
      console.error('Failed to initiate mock login:', err);
    }
  }, [mockEmail, navigate]);

  return {
    mockEmail,
    setMockEmail,
    handleSignIn,
    handleMockLogin,
    isLoading,
    error,
    seededCustomers: SEEDED_CUSTOMERS,
  };
}

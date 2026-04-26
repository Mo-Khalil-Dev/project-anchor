import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function useAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleCallback, isLoading, error } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      navigate('/login', { replace: true });
      return;
    }

    const handleAuth = async () => {
      try {
        await handleCallback(code, state);
        // Redirect based on customer state
        // For now, redirect to assessment
        // In real app: check if customer is linked, if not go to /link-customer
        navigate('/assessment', { replace: true });
      } catch (err) {
        console.error('Auth callback failed:', err);
        navigate('/login', { replace: true });
      }
    };

    handleAuth();
  }, [searchParams, handleCallback, navigate]);

  return {
    isLoading,
    error,
  };
}

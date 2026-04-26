import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { redirectService } from '../../services/redirectService';

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

        // Get the next page based on user's customer state
        const redirect = await redirectService.getRedirectToJourney();
        navigate(redirect.nextPage, { replace: true });
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

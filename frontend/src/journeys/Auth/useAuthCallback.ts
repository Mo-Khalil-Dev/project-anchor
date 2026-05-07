import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { redirectService } from '@/services/redirectService';

export function useAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleCallback, isLoading, error } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      navigate('/login', { replace: true });
      return;
    }

    // Prevent processing the same callback twice
    if (processedRef.current) {
      return;
    }

    processedRef.current = true;

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
  }, [searchParams, navigate, handleCallback]);

  return {
    isLoading,
    error,
  };
}

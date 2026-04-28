import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { redirectService } from '@/services/redirectService';

type GuardStatus = 'checking' | 'allowed' | 'redirecting';

/**
 * useJourneyGuard
 *
 * Calls GET /auth/redirect-to-journey and redirects the user away from the
 * current page if they have not completed all prior journey steps.
 *
 * Each page declares which earlier steps block it via `blockedNextPages`.
 * If the backend says the user belongs on one of those earlier pages,
 * they get redirected there immediately.
 *
 * Journey order:
 *   /account-setup → /bank-connection → /assessment → / (home/payment-portal)
 *
 * Usage:
 *   // Block if no account is set up yet
 *   const { status } = useJourneyGuard({ blockedNextPages: ['/account-setup'] });
 *
 *   if (status === 'checking') return <Spinner />;
 *   if (status === 'redirecting') return null;
 */
export function useJourneyGuard({ blockedNextPages }: { blockedNextPages: string[] }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<GuardStatus>('checking');

  useEffect(() => {
    let cancelled = false;

    const checkJourney = async () => {
      try {
        const { nextPage } = await redirectService.getRedirectToJourney();

        if (cancelled) return;

        if (blockedNextPages.includes(nextPage)) {
          setStatus('redirecting');
          navigate(nextPage, { replace: true });
        } else {
          setStatus('allowed');
        }
      } catch {
        // If the check fails (e.g. token expired) ProtectedRoute will handle it
        if (!cancelled) setStatus('allowed');
      }
    };

    checkJourney();
    return () => { cancelled = true; };
  // blockedNextPages is defined inline at call sites, so we stringify to avoid
  // infinite re-runs from reference inequality
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, JSON.stringify(blockedNextPages)]);

  return { status };
}

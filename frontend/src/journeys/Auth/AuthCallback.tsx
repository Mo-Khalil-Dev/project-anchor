import { useAuthCallback } from './useAuthCallback';

export function AuthCallback() {
  const { error } = useAuthCallback();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-accent-bg via-bg to-bg px-4">
      <div className="w-full max-w-md">
        {error ? (
          <div className="bg-card rounded-card shadow-card-elevated p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-bg rounded-full mb-4">
              <svg className="w-6 h-6 text-red" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <h2 className="text-section-title text-text mb-2">Authentication Failed</h2>
            <p className="text-sm text-sub mb-6">{error}</p>
            <a
              href="/login"
              className="btn-secondary w-full inline-flex items-center justify-center py-3 font-semibold text-base"
            >
              Back to Sign In
            </a>
          </div>
        ) : (
          <div className="bg-card rounded-card shadow-card-elevated p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 border-4 border-border border-t-accent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-section-title text-text mb-2">Completing Sign In...</h2>
            <p className="text-sm text-sub">Please wait while we authenticate your account.</p>
          </div>
        )}
      </div>
    </div>
  );
}

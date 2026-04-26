import { useAuthCallback } from './useAuthCallback';

export function AuthCallback() {
  const { error } = useAuthCallback();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-accent-bg via-bg to-bg px-4">
      <div className="card w-full max-w-sm">
        {error ? (
          <div className="text-center space-y-4">
            <div className="text-red text-2xl">⚠️</div>
            <h2 className="text-xl font-bold text-text">Authentication Failed</h2>
            <p className="text-sm text-muted">{error}</p>
            <a
              href="/login"
              className="btn-secondary w-full inline-block text-center"
            >
              Back to Sign In
            </a>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin"></div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text mb-2">Completing Sign In...</h2>
              <p className="text-sm text-muted">Please wait while we authenticate your account.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

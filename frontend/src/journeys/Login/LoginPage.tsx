import { useLoginPage } from './useLoginPage';

export function LoginPage() {
  const { mockEmail, setMockEmail, handleSignIn, handleMockLogin, isLoading, error } = useLoginPage();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-accent-bg via-bg to-bg px-4 py-8">
      <div className="w-full max-w-md">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
          <h1 className="text-page-title text-text mb-2">PROJECT BRIDGE</h1>
          <p className="text-sm text-sub">Hardship Assessment Platform</p>
        </div>

        {/* Main Card */}
        <div className="bg-card rounded-card shadow-card-elevated p-8 mb-6">
          <div className="space-y-5">
            {error && (
              <div className="bg-red-bg border border-red/20 rounded-stat p-4 text-red text-sm">
                <div className="font-semibold mb-1">Authentication Failed</div>
                <div>{error}</div>
              </div>
            )}

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base font-semibold shadow-button-primary hover:shadow-lg transition-all duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Redirecting...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </div>

        {/* Development Section */}
        <div className="bg-card rounded-card shadow-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-section-label text-muted">Development Only</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="mockEmail" className="label block mb-2">
                Email (Mock Auth)
              </label>
              <input
                id="mockEmail"
                type="email"
                placeholder="test@example.com"
                value={mockEmail}
                onChange={(e) => setMockEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-input bg-bg text-text placeholder-muted text-sm font-medium focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
              />
            </div>
            <button
              onClick={handleMockLogin}
              disabled={isLoading || !mockEmail.trim()}
              className="btn-secondary w-full py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-bg transition-colors duration-200"
            >
              {isLoading ? 'Loading...' : 'Mock Login'}
            </button>
          </div>
        </div>

        {/* Security Badge */}
        <div className="text-center mt-6 text-xs text-muted flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
          <span>Bank-level security · OAuth 2.0 · Encrypted</span>
        </div>
      </div>
    </div>
  );
}

import { useLoginPage } from './useLoginPage';

export function LoginPage() {
  const { mockEmail, setMockEmail, handleSignIn, handleMockLogin, isLoading, error } = useLoginPage();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-accent-bg via-bg to-bg px-4">
      <div className="card w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">PROJECT BRIDGE</h1>
          <p className="text-sm text-muted">Hardship Assessment Platform</p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red/10 border border-red/30 rounded-lg p-3 text-red text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Redirecting...' : 'Sign In'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs uppercase text-muted tracking-widest">Development Only</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <div className="space-y-3">
            <label htmlFor="mockEmail" className="label block">
              Email (Mock Auth)
            </label>
            <input
              id="mockEmail"
              type="email"
              placeholder="test@example.com"
              value={mockEmail}
              onChange={(e) => setMockEmail(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-bg text-text placeholder-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition"
            />
            <button
              onClick={handleMockLogin}
              disabled={isLoading || !mockEmail.trim()}
              className="btn-secondary w-full"
            >
              {isLoading ? 'Loading...' : 'Mock Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

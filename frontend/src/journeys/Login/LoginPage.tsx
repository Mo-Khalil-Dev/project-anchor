import { useLoginPage } from './useLoginPage';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { mockEmail, setMockEmail, handleSignIn, handleMockLogin, isLoading, error } = useLoginPage();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>PROJECT BRIDGE</h1>
        <p className={styles.subtitle}>Hardship Assessment Platform</p>

        <div className={styles.content}>
          {error && <div className={styles.error}>{error}</div>}

          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className={styles.primaryButton}
          >
            {isLoading ? 'Redirecting...' : 'Sign In'}
          </button>

          <div className={styles.divider}>
            <span>Development Only</span>
          </div>

          <div className={styles.mockForm}>
            <label htmlFor="mockEmail" className={styles.label}>
              Email (Mock Auth)
            </label>
            <input
              id="mockEmail"
              type="email"
              placeholder="test@example.com"
              value={mockEmail}
              onChange={(e) => setMockEmail(e.target.value)}
              className={styles.input}
            />
            <button
              onClick={handleMockLogin}
              disabled={isLoading || !mockEmail.trim()}
              className={styles.secondaryButton}
            >
              {isLoading ? 'Loading...' : 'Mock Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

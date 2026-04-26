import { useAuthCallback } from './useAuthCallback';
import styles from './AuthCallback.module.css';

export function AuthCallback() {
  const { error } = useAuthCallback();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {error ? (
          <>
            <div className={styles.error}>
              <h2>Authentication Failed</h2>
              <p>{error}</p>
            </div>
          </>
        ) : (
          <>
            <div className={styles.spinner}></div>
            <h2>Completing Sign In...</h2>
            <p>Please wait while we authenticate your account.</p>
          </>
        )}
      </div>
    </div>
  );
}

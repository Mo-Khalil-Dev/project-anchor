import { useLinkCustomerPage } from './useLinkCustomerPage';
import styles from './LinkCustomerPage.module.css';

export function LinkCustomerPage() {
  const { user, isLoading, error, handleLinkCustomer, handleCancel } = useLinkCustomerPage();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Link Your Account</h1>
        <p className={styles.subtitle}>Connect your utility account to get started</p>

        <div className={styles.content}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.info}>
            <h2>Your Account</h2>
            <div className={styles.infoBox}>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Name:</strong> {user?.firstName} {user?.lastName}
              </p>
            </div>
          </div>

          <div className={styles.instructions}>
            <p>
              To proceed, please select or enter your utility account details. This helps us assess your hardship situation accurately.
            </p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="customerRef" className={styles.label}>
              Customer Reference
            </label>
            <input
              id="customerRef"
              type="text"
              placeholder="e.g., 12345678"
              className={styles.input}
            />
          </div>

          <div className={styles.actions}>
            <button
              onClick={() => handleLinkCustomer('placeholder')}
              disabled={isLoading}
              className={styles.primaryButton}
            >
              {isLoading ? 'Linking...' : 'Link Account'}
            </button>
            <button onClick={handleCancel} className={styles.secondaryButton}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

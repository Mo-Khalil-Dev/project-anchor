import styles from './EmailNotifyCard.module.css';

interface Props {
  email: string;
}

export function EmailNotifyCard({ email }: Props) {
  return (
    <aside className={styles.card} aria-label="Email notification">
      <span className={styles.iconWrap}>
        <BellIcon />
      </span>
      <div className={styles.body}>
        <p className={styles.title}>Get notified when it's ready</p>
        <p className={styles.text}>
          We'll email <span className={styles.email}>{email}</span> when your assessment is complete.
        </p>
      </div>
    </aside>
  );
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M11 3a5 5 0 00-5 5v3.2c0 .8-.3 1.6-.9 2.2L4 15h14l-1.1-1.6c-.6-.6-.9-1.4-.9-2.2V8a5 5 0 00-5-5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9.5 18a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

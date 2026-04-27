import styles from './CommonReasonsList.module.css';

interface Props {
  heading: string;
  reasons: string[];
}

export function CommonReasonsList({ heading, reasons }: Props) {
  return (
    <section className={styles.box} aria-label={heading}>
      <p className={styles.heading}>{heading}</p>
      {reasons.map((reason) => (
        <div key={reason} className={styles.row}>
          <ReasonIcon />
          <span className={styles.text}>{reason}</span>
        </div>
      ))}
    </section>
  );
}

function ReasonIcon() {
  return (
    <svg className={styles.icon} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7" cy="10" r="0.6" fill="currentColor" />
    </svg>
  );
}

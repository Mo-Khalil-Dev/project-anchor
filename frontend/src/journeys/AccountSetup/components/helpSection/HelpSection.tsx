import styles from './HelpSection.module.css';

interface Props {
  title: string;
  steps: string[];
}

export function HelpSection({ title, steps }: Props) {
  return (
    <section className={styles.section}>
      <h3 className={styles.title}>{title}</h3>
      {steps.map((step, idx) => (
        <div key={step} className={styles.row}>
          <span className={styles.bullet} aria-hidden="true">
            <span className={styles.bulletNumber}>{idx + 1}</span>
          </span>
          <span className={styles.text}>{step}</span>
        </div>
      ))}
    </section>
  );
}

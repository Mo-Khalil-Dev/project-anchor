import styles from './NextStepCallout.module.css';

interface Props {
  eyebrow: string;
  title: string;
  body: string;
}

export function NextStepCallout({ eyebrow, title, body }: Props) {
  return (
    <div className={styles.callout}>
      <span className={styles.decoration} aria-hidden="true" />
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.body}>{body}</p>
    </div>
  );
}

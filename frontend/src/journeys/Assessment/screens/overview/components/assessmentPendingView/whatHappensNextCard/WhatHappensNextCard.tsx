import styles from './WhatHappensNextCard.module.css';

interface NextStep {
  title: string;
  description: string;
}

const NEXT_STEPS: NextStep[] = [
  { title: 'Assessment ready', description: 'We finalise your hardship score and disposable income calculation.' },
  { title: 'View your results', description: 'See a full breakdown of your income, spending, and hardship level.' },
  { title: 'Choose your plan', description: 'Pick a payment plan that fits your budget — from as low as £35/month.' },
];

export function WhatHappensNextCard() {
  return (
    <section className={styles.card} aria-labelledby="what-happens-next-label">
      <p id="what-happens-next-label" className={styles.label}>What happens next</p>
      <ol className={styles.grid}>
        {NEXT_STEPS.map((step, idx) => (
          <li key={step.title} className={styles.item}>
            <span className={styles.numberCircle} aria-hidden="true">{idx + 1}</span>
            <p className={styles.title}>{step.title}</p>
            <p className={styles.description}>{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

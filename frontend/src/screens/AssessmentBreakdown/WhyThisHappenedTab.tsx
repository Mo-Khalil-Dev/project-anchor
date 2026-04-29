import type { AssessmentDetailedDTO } from '../../types';
import styles from './WhyThisHappenedTab.module.css';

export function WhyThisHappenedTab({ assessment }: { assessment: AssessmentDetailedDTO }) {
  return (
    <div className={styles.container}>
      <p className={styles.intro}>These factors contributed to your hardship assessment:</p>
      <div className={styles.factors}>
        {assessment.factors.map((factor, idx) => (
          <div key={idx} className={styles.card}>
            <h4>{factor.title}</h4>
            <p>{factor.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

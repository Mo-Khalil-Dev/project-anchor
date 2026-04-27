import { CircularProgress } from './circularProgress/CircularProgress';
import { EmailNotifyCard } from './emailNotifyCard/EmailNotifyCard';
import { LinearProgressBar } from './linearProgressBar/LinearProgressBar';
import { PendingStepRow } from './pendingStepRow/PendingStepRow';
import { useAssessmentPendingView } from './useAssessmentPendingView';
import { WhatHappensNextCard } from './whatHappensNextCard/WhatHappensNextCard';
import styles from './AssessmentPendingView.module.css';

interface Props {
  calculatedAt: string;
}

export function AssessmentPendingView({ calculatedAt }: Props) {
  const { progress, steps, activeStepLabel, userEmail } = useAssessmentPendingView({ calculatedAt });
  return (
    <div className={styles.container}>
      <section className={styles.mainCard} aria-busy="true" aria-label="Assessment in progress">
        <CircularProgress progress={progress} />
        <h1 className={styles.title}>Analysing your finances…</h1>
        <p className={styles.subtitle}>
          We're processing your Barclays data. This usually takes under 2 minutes —
          you don't need to stay on this page.
        </p>
        <div className={styles.progressBarWrap}>
          <LinearProgressBar progress={progress} />
        </div>
        <p key={activeStepLabel} className={styles.activeLabel} aria-live="polite">{activeStepLabel}</p>
        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step.label}>
              <PendingStepRow label={step.label} status={step.status} />
            </li>
          ))}
        </ol>
        <div className={styles.notify}>
          <EmailNotifyCard email={userEmail} />
        </div>
      </section>
      <WhatHappensNextCard />
    </div>
  );
}

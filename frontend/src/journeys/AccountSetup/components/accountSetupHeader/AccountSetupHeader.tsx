import { BridgeLogo } from '@/components/core/icons';
import { cn } from '@/lib/cn';
import styles from './AccountSetupHeader.module.css';

interface Props {
  currentStep: number;
  totalSteps: number;
  userName: string;
  userInitials: string;
}

export function AccountSetupHeader({ currentStep, totalSteps, userName, userInitials }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <BridgeLogo />
        <span className={styles.wordmark}>Bridge</span>
        <span className={styles.portalPill}>Customer Portal</span>
      </div>
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div className={styles.user}>
        <span className={styles.userName}>{userName}</span>
        <span className={styles.avatar} aria-hidden="true">{userInitials}</span>
      </div>
    </header>
  );
}

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className={styles.stepIndicator} aria-label={`Step ${currentStep} of ${totalSteps}`}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
        <span
          key={s}
          className={cn(styles.stepDot, s === currentStep && styles.stepDotActive, s < currentStep && styles.stepDotDone)}
        />
      ))}
      <span className={styles.stepLabel}>Step {currentStep} of {totalSteps}</span>
    </div>
  );
}

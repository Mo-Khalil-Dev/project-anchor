import type { LinkDetails } from '../../types';
import { AccountDetailsStep } from '../accountDetailsStep';
import { AccountSetupHeader } from '../accountSetupHeader';
import { UtilityTypeStep } from '../utilityTypeStep';
import { useLinkingState } from './useLinkingState';
import styles from './LinkingState.module.css';

interface Props {
  userName: string;
  userInitials: string;
  onSuccess: (details: LinkDetails) => void;
  onError: (details: LinkDetails) => void;
}

export function LinkingState({ userName, userInitials, onSuccess, onError }: Props) {
  const { step, utilityType, loading, setUtilityType, goToDetails, goBackToTypeSelection, submitDetails } =
    useLinkingState({ onSuccess, onError });

  return (
    <div className={styles.page}>
      <AccountSetupHeader currentStep={step} totalSteps={2} userName={userName} userInitials={userInitials} />
      <main className={styles.main}>
        {step === 1 && (
          <UtilityTypeStep selectedType={utilityType} onSelectType={setUtilityType} onContinue={goToDetails} />
        )}
        {step === 2 && utilityType && (
          <AccountDetailsStep utilityType={utilityType} loading={loading} onBack={goBackToTypeSelection} onSubmit={submitDetails} />
        )}
      </main>
    </div>
  );
}

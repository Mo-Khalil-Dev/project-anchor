import { findUtilityType } from '../../data/utilityTypes';
import type { LinkDetails } from '../../types';
import { NextStepCallout } from '../nextStepCallout';
import { PrimaryButton } from '../primaryButton';
import { StatusIcon } from '../statusIcon';
import { SummaryCard, type SummaryRow } from '../summaryCard';
import styles from './SuccessState.module.css';

interface Props {
  details: LinkDetails;
  onContinue: () => void;
}

export function SuccessState({ details, onContinue }: Props) {
  const typeDef = findUtilityType(details.utilityType);
  const summaryRows: SummaryRow[] = [
    { label: 'Utility type', value: typeDef?.label ?? details.utilityType },
    { label: 'Postcode', value: details.postcode },
    { label: 'Account reference', value: details.accountRef },
    { label: 'Status', value: <VerifiedBadge /> },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <StatusIcon variant="success" />
        <header className={styles.heading}>
          <h1 className={styles.title}>Account linked!</h1>
          <p className={styles.subtitle}>Your {(typeDef?.label ?? '').toLowerCase()} account has been successfully connected to Bridge.</p>
        </header>
        <SummaryCard title="Account summary" rows={summaryRows} />
        <div className={styles.summarySpacer} />
        <NextStepCallout eyebrow="Next step" title="Connect your bank account" body="We'll now securely connect to your bank via Open Banking to complete your financial assessment." />
        <PrimaryButton onClick={onContinue}>Continue to bank connection</PrimaryButton>
      </div>
    </div>
  );
}

function VerifiedBadge() {
  return (
    <span className={styles.statusBadge}>
      <span className={styles.statusDot} aria-hidden="true" />
      Verified
    </span>
  );
}

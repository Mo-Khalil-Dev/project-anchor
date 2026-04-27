import { findUtilityType } from '../../data/utilityTypes';
import type { LinkDetails } from '../../types';
import { CommonReasonsList } from '../commonReasonsList/CommonReasonsList';
import { PrimaryButton } from '../primaryButton/PrimaryButton';
import { SecondaryButton } from '../secondaryButton/SecondaryButton';
import { StatusIcon } from '../statusIcon/StatusIcon';
import { SummaryCard, type SummaryRow } from '../summaryCard/SummaryCard';
import styles from './ErrorState.module.css';

const COMMON_REASONS = [
  "Postcode doesn't match the account address",
  'Account reference copied incorrectly — check for spaces',
  'Account may be registered under a different name',
];

interface Props {
  details: LinkDetails;
  onRetry: () => void;
  onHelp: () => void;
}

export function ErrorState({ details, onRetry, onHelp }: Props) {
  const typeDef = findUtilityType(details.utilityType);
  const summaryRows: SummaryRow[] = [
    { label: 'Utility type', value: typeDef?.label ?? details.utilityType },
    { label: 'Postcode', value: details.postcode },
    { label: 'Account reference', value: details.accountRef },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <StatusIcon variant="error" />
        <header className={styles.heading}>
          <h1 className={styles.title}>Couldn't verify account</h1>
          <p className={styles.subtitle}>We couldn't match these details to a {(typeDef?.label ?? '').toLowerCase()} account. Please check and try again.</p>
        </header>
        <SummaryCard title="Details you entered" rows={summaryRows} />
        <div className={styles.summarySpacer} />
        <CommonReasonsList heading="Common reasons this happens" reasons={COMMON_REASONS} />
        <div className={styles.actions}>
          <PrimaryButton onClick={onRetry}>Try again</PrimaryButton>
          <SecondaryButton onClick={onHelp}>I need help finding my details</SecondaryButton>
        </div>
      </div>
    </div>
  );
}

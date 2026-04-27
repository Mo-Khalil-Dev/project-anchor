import { findUtilityType } from '../../data/utilityTypes';
import type { UtilityType } from '../../types';
import { InputField } from '../inputField/InputField';
import { PrimaryButton } from '../primaryButton/PrimaryButton';
import { useAccountDetailsStep } from './useAccountDetailsStep';
import styles from './AccountDetailsStep.module.css';

interface Props {
  utilityType: UtilityType;
  loading: boolean;
  onBack: () => void;
  onSubmit: (details: { postcode: string; accountRef: string }) => void;
}

export function AccountDetailsStep({ utilityType, loading, onBack, onSubmit }: Props) {
  const { postcode, accountRef, errors, handlePostcodeChange, handleAccountRefChange, handleSubmit } = useAccountDetailsStep({ onSubmit });
  const typeDef = findUtilityType(utilityType);

  return (
    <>
      <BackButton onClick={onBack} />
      <DetailsStepHeader typeLabel={typeDef?.label ?? ''} typeIcon={typeDef?.icon('oklch(56% 0.14 200)')} />
      <div className={styles.formCard}>
        <div className={styles.formGrid}>
          <InputField label="Postcode" value={postcode} onChange={handlePostcodeChange} placeholder="e.g. SW1A 1AA" hint="The postcode associated with your utility account" error={errors.postcode} autoFocus icon={<PostcodeIcon />} />
          <InputField label="Account reference number" value={accountRef} onChange={handleAccountRefChange} placeholder="e.g. 123456789" hint="Found on your bill, usually 8–12 digits" error={errors.accountRef} icon={<RefIcon />} />
        </div>
      </div>
      <TipBox typeLabel={typeDef?.label?.toLowerCase() ?? 'utility'} />
      <PrimaryButton onClick={handleSubmit} loading={loading} disabled={loading}>
        {loading ? 'Verifying your account…' : 'Link account'}
      </PrimaryButton>
      <PrivacyFooter />
    </>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={styles.backBtn}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}

function DetailsStepHeader({ typeLabel, typeIcon }: { typeLabel: string; typeIcon: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <span className={styles.typePill}>
        {typeIcon}
        <span className={styles.typePillLabel}>{typeLabel} account</span>
      </span>
      <h1 className={styles.title}>Account details</h1>
      <p className={styles.subtitle}>Enter the details from your {typeLabel.toLowerCase()} bill or welcome letter.</p>
    </div>
  );
}

function TipBox({ typeLabel }: { typeLabel: string }) {
  return (
    <div className={styles.tipBox}>
      <svg className={styles.tipBoxIcon} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="8" stroke="oklch(56% 0.14 200)" strokeWidth="1.5" />
        <path d="M9 8v5" stroke="oklch(56% 0.14 200)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="5.5" r="0.8" fill="oklch(56% 0.14 200)" />
      </svg>
      <p className={styles.tipText}>
        <span className={styles.tipStrong}>Tip:</span>{' '}
        Your account reference is printed at the top of any recent {typeLabel} bill, labelled "Account No." or "Reference". You can also find it in your online account portal.
      </p>
    </div>
  );
}

function PostcodeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M7.5 1C5 1 3 3 3 5.5c0 3.5 4.5 8.5 4.5 8.5S12 9 12 5.5C12 3 10 1 7.5 1Z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="7.5" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function RefIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1" y="2" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 6h7M4 9h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function PrivacyFooter() {
  return (
    <p className={styles.footer}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <rect x="1" y="4" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M3.5 4V3a2.5 2.5 0 015 0v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      Your data is encrypted and never shared with third parties
    </p>
  );
}

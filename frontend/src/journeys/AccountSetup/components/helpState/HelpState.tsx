import { BridgeLogo } from '@/components/core/icons';
import { HelpSection } from '../helpSection/HelpSection';
import styles from './HelpState.module.css';

interface Props {
  onBack: () => void;
}

interface HelpEntry {
  title: string;
  steps: string[];
}

const HELP_ENTRIES: HelpEntry[] = [
  {
    title: 'Water',
    steps: [
      'Look for "Account No." at the top of your water bill',
      "Check your online account at your supplier's website",
      'Contact your water provider directly on the number on your bill',
    ],
  },
  {
    title: 'Gas',
    steps: [
      'Your gas account reference appears as "Account Number" on all correspondence',
      "It's also visible in your online portal under Account Settings",
      'British Gas, EDF and others use 8–10 digit references',
    ],
  },
  {
    title: 'Electricity',
    steps: [
      'Find your electricity reference labelled "Supply Number" or "Account Ref"',
      "Log into your supplier's app — it's shown on the dashboard",
      'Found on the top-right of any printed statement',
    ],
  },
];

export function HelpState({ onBack }: Props) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" onClick={onBack} className={styles.backBtn} aria-label="Back">
          <BackArrow />
          Back
        </button>
        <div className={styles.brand}>
          <BridgeLogo />
          <span className={styles.brandLabel}>Bridge Support</span>
        </div>
      </header>
      <main className={styles.main}>
        <h1 className={styles.title}>Finding your account details</h1>
        <p className={styles.subtitle}>Here's how to locate your account reference for each utility type.</p>
        {HELP_ENTRIES.map((entry) => (
          <HelpSection key={entry.title} title={entry.title} steps={entry.steps} />
        ))}
        <SupportBox />
      </main>
    </div>
  );
}

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SupportBox() {
  return (
    <div className={styles.supportBox}>
      <p className={styles.supportText}>
        Still stuck? Call our helpline: <span className={styles.supportNumber}>0800 123 4567</span> (Mon–Fri 9am–5pm)
      </p>
    </div>
  );
}

import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { Button, Card } from '@/components/core';
import { usePaymentSetup, type PaymentMethod } from './usePaymentSetup';
import styles from './PaymentSetupScreen.module.css';

const PAYMENT_METHODS = [
  {
    id: 'dd' as PaymentMethod,
    label: 'Direct Debit',
    badge: 'Recommended',
    badgeColor: '#10b981',
    description: 'Automatic monthly payment — set it and forget it. Most reliable way to keep your plan on track.',
    icon: (isSelected: boolean) => (
      <svg width="24" height="20" viewBox="0 0 26 22" fill="none">
        <rect x="1" y="4" width="24" height="15" rx="3" stroke={isSelected ? '#fff' : 'var(--color-accent)'} strokeWidth="1.7" fill={isSelected ? 'var(--color-accent)' : 'var(--color-accent-bg)'} />
        <path d="M1 8h24" stroke={isSelected ? '#fff' : 'var(--color-accent)'} strokeWidth="1.7" />
        <rect x="4" y="13" width="6" height="3" rx="1.5" fill={isSelected ? '#fff' : 'var(--color-accent)'} />
      </svg>
    ),
  },
  {
    id: 'card' as PaymentMethod,
    label: 'Card or Bank Transfer',
    badge: 'Manual',
    badgeColor: '#f59e0b',
    description: 'Pay each month manually online or via bank transfer. You\'ll receive a reminder 7 days before each payment.',
    icon: (isSelected: boolean) => (
      <svg width="24" height="20" viewBox="0 0 26 22" fill="none">
        <rect x="1" y="4" width="24" height="15" rx="3" stroke={isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)'} strokeWidth="1.7" fill={isSelected ? 'var(--color-accent-bg)' : 'var(--color-bg)'} />
        <path d="M1 8h24" stroke={isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)'} strokeWidth="1.7" />
        <rect x="4" y="13" width="4" height="3" rx="1.5" fill={isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)'} opacity="0.5" />
        <rect x="10" y="13" width="6" height="3" rx="1.5" fill={isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)'} opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'cash' as PaymentMethod,
    label: 'Cash at Post Office',
    badge: 'In-person',
    badgeColor: '#6b7280',
    description: 'Pay cash at any Post Office branch with your payment reference. Allow 2 business days for processing.',
    icon: (isSelected: boolean) => (
      <svg width="24" height="20" viewBox="0 0 26 22" fill="none">
        <rect x="1" y="4" width="24" height="15" rx="3" stroke={isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)'} strokeWidth="1.7" fill={isSelected ? 'var(--color-accent-bg)' : 'var(--color-bg)'} />
        <path d="M13 8v8M9 10h8M9 14h8" stroke={isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)'} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function PaymentSetupScreen() {
  const { selected, setSelected, handleContinue, handleBack } = usePaymentSetup();

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === selected);

  return (
    <CustomerLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>How would you like to pay?</h1>
          <p className={styles.subtitle}>Choose your preferred payment method. You can change this at any time.</p>
        </div>

        {/* Payment method cards */}
        <div className={styles.methodsGrid}>
          {PAYMENT_METHODS.map(method => (
            <Card
              key={method.id}
              className={`${styles.methodCard} ${selected === method.id ? styles.selected : ''}`}
              onClick={() => setSelected(method.id)}
            >
              <div className={`${styles.iconBox} ${selected === method.id ? styles.iconBoxSelected : ''}`}>
                {method.icon(selected === method.id)}
              </div>
              <div className={styles.methodContent}>
                <div className={styles.methodHeader}>
                  <span className={styles.methodLabel}>{method.label}</span>
                  <span
                    className={styles.badge}
                    style={{ backgroundColor: `${method.badgeColor}18`, color: method.badgeColor }}
                  >
                    {method.badge}
                  </span>
                </div>
                <p className={styles.methodDescription}>{method.description}</p>
              </div>
              <div className={styles.radio}>
                {selected === method.id && <div className={styles.radioDot} />}
              </div>
            </Card>
          ))}
        </div>

        {/* DD Guarantee info */}
        {selected === 'dd' && (
          <div className={styles.infoBox}>
            ✓ Direct Debit is the most reliable method. Payments are protected by the Direct Debit Guarantee — you can cancel at any time.
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <Button variant="primary" className="w-full" onClick={handleContinue}>
            Set Up {selectedMethod?.label}
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleBack}>
            Back
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
}

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
  },
  {
    id: 'card' as PaymentMethod,
    label: 'Card or Bank Transfer',
    badge: 'Manual',
    badgeColor: '#f59e0b',
    description: 'Pay each month manually online or via bank transfer. You\'ll receive a reminder 7 days before each payment.',
  },
  {
    id: 'cash' as PaymentMethod,
    label: 'Cash at Post Office',
    badge: 'In-person',
    badgeColor: '#6b7280',
    description: 'Pay cash at any Post Office branch with your payment reference. Allow 2 business days for processing.',
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

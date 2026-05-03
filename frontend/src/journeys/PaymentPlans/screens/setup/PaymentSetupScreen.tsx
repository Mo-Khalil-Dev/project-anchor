import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { Button } from '@/components/core';
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {PAYMENT_METHODS.map(method => (
            <div
              key={method.id}
              onClick={() => setSelected(method.id)}
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '20px 22px',
                border: `${selected === method.id ? 2 : 1.5}px solid ${selected === method.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                cursor: 'pointer',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: '16px',
                alignItems: 'center',
                boxShadow: selected === method.id ? `0 3px 14px rgba(var(--accent-rgb), 0.1)` : '0 1px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.15s',
              }}
            >
              {/* Icon box */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: selected === method.id ? 'var(--color-accent-bg)' : 'var(--color-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="24" height="20" viewBox="0 0 26 22" fill="none">
                  {method.id === 'dd' && (
                    <>
                      <rect x="1" y="4" width="24" height="15" rx="3" stroke={selected === method.id ? '#fff' : 'var(--color-accent)'} strokeWidth="1.7" fill={selected === method.id ? 'var(--color-accent)' : 'var(--color-accent-bg)'} />
                      <path d="M1 8h24" stroke={selected === method.id ? '#fff' : 'var(--color-accent)'} strokeWidth="1.7" />
                      <rect x="4" y="13" width="6" height="3" rx="1.5" fill={selected === method.id ? '#fff' : 'var(--color-accent)'} />
                    </>
                  )}
                  {method.id === 'card' && (
                    <>
                      <rect x="1" y="4" width="24" height="15" rx="3" stroke={selected === method.id ? 'var(--color-accent)' : 'var(--color-text-secondary)'} strokeWidth="1.7" fill={selected === method.id ? 'var(--color-accent-bg)' : 'var(--color-bg)'} />
                      <path d="M1 8h24" stroke={selected === method.id ? 'var(--color-accent)' : 'var(--color-text-secondary)'} strokeWidth="1.7" />
                      <rect x="4" y="13" width="4" height="3" rx="1.5" fill={selected === method.id ? 'var(--color-accent)' : 'var(--color-text-secondary)'} opacity="0.5" />
                      <rect x="10" y="13" width="6" height="3" rx="1.5" fill={selected === method.id ? 'var(--color-accent)' : 'var(--color-text-secondary)'} opacity="0.5" />
                    </>
                  )}
                  {method.id === 'cash' && (
                    <>
                      <rect x="1" y="4" width="24" height="15" rx="3" stroke={selected === method.id ? 'var(--color-accent)' : 'var(--color-text-secondary)'} strokeWidth="1.7" fill={selected === method.id ? 'var(--color-accent-bg)' : 'var(--color-bg)'} />
                      <path d="M13 8v8M9 10h8M9 14h8" stroke={selected === method.id ? 'var(--color-accent)' : 'var(--color-text-secondary)'} strokeWidth="1.4" strokeLinecap="round" />
                    </>
                  )}
                </svg>
              </div>

              {/* Content */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{method.label}</span>
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '100px',
                      backgroundColor: `${method.badgeColor}18`,
                      color: method.badgeColor,
                    }}
                  >
                    {method.badge}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{method.description}</div>
              </div>

              {/* Radio button */}
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: `2px solid ${selected === method.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {selected === method.id && (
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'var(--color-accent)',
                    }}
                  />
                )}
              </div>
            </div>
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

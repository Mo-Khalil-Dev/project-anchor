import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { Button } from '@/components/core';
import { usePaymentSetup, type PaymentMethod } from './usePaymentSetup';

// Colors from Tailwind config (Bridge design tokens)
const Bridge = {
  accent: 'oklch(52% 0.18 270)',
  accentBg: 'oklch(96.5% 0.03 270)',
  green: 'oklch(51% 0.17 145)',
  greenBg: 'oklch(96.5% 0.04 145)',
  amber: 'oklch(62% 0.16 76)',
  text: '#0d0f14',
  sub: '#5a5f72',
  muted: '#9197ab',
  border: 'rgba(0,0,0,0.08)',
  bg: '#f4f5f9',
  divider: 'rgba(0,0,0,0.07)',
};

const PAYMENT_METHODS = [
  {
    id: 'dd' as PaymentMethod,
    label: 'Direct Debit',
    badge: 'Recommended',
    badgeColor: Bridge.green,
    description: 'Automatic monthly payment — set it and forget it. Most reliable way to keep your plan on track.',
    icon: (
      <svg width="24" height="20" viewBox="0 0 26 22" fill="none">
        <rect x="1" y="4" width="24" height="15" rx="3" stroke={Bridge.accent} strokeWidth="1.7" fill={Bridge.accentBg} />
        <path d="M1 8h24" stroke={Bridge.accent} strokeWidth="1.7" />
        <rect x="4" y="13" width="6" height="3" rx="1.5" fill={Bridge.accent} />
      </svg>
    ),
  },
  {
    id: 'card' as PaymentMethod,
    label: 'Card or Bank Transfer',
    badge: 'Manual',
    badgeColor: Bridge.amber,
    description: 'Pay each month manually online or via bank transfer. You\'ll receive a reminder 7 days before each payment.',
    icon: (
      <svg width="24" height="20" viewBox="0 0 26 22" fill="none">
        <rect x="1" y="4" width="24" height="15" rx="3" stroke={Bridge.sub} strokeWidth="1.7" fill={Bridge.bg} />
        <path d="M1 8h24" stroke={Bridge.sub} strokeWidth="1.7" />
        <rect x="4" y="13" width="4" height="3" rx="1.5" fill={Bridge.sub} opacity="0.5" />
        <rect x="10" y="13" width="6" height="3" rx="1.5" fill={Bridge.sub} opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'cash' as PaymentMethod,
    label: 'Cash at Post Office',
    badge: 'In-person',
    badgeColor: Bridge.sub,
    description: 'Pay cash at any Post Office branch with your payment reference. Allow 2 business days for processing.',
    icon: (
      <svg width="24" height="20" viewBox="0 0 26 22" fill="none">
        <rect x="1" y="4" width="24" height="15" rx="3" stroke={Bridge.sub} strokeWidth="1.7" fill={Bridge.bg} />
        <path d="M13 8v8M9 10h8M9 14h8" stroke={Bridge.sub} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function PaymentSetupScreen() {
  const { selected, setSelected, handleContinue, handleBack } = usePaymentSetup();

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === selected);

  return (
    <CustomerLayout>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: Bridge.text, letterSpacing: '-0.6px', margin: 0, marginBottom: 8 }}>
            How would you like to pay?
          </h1>
          <p style={{ fontSize: 15, color: Bridge.sub, margin: 0 }}>
            Choose your preferred payment method. You can change this at any time.
          </p>
        </div>

        {/* Payment method cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {PAYMENT_METHODS.map(method => {
            const isSelected = selected === method.id;
            return (
              <div
                key={method.id}
                onClick={() => setSelected(method.id)}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '20px 22px',
                  border: `${isSelected ? 2 : 1.5}px solid ${isSelected ? Bridge.accent : Bridge.border}`,
                  cursor: 'pointer',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: 16,
                  alignItems: 'center',
                  boxShadow: isSelected ? `0 3px 14px oklch(52% 0.18 270 / 0.18)` : '0 1px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s',
                }}
              >
                {/* Icon box */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: isSelected ? Bridge.accentBg : Bridge.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {method.icon}
                </div>

                {/* Content */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: Bridge.text }}>{method.label}</span>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 100,
                        background: `${method.badgeColor}18`,
                        color: method.badgeColor,
                      }}
                    >
                      {method.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: Bridge.sub, lineHeight: 1.5 }}>
                    {method.description}
                  </div>
                </div>

                {/* Radio button */}
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? Bridge.accent : Bridge.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isSelected && (
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: Bridge.accent,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* DD Guarantee info */}
        {selected === 'dd' && (
          <div
            style={{
              background: Bridge.greenBg,
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 20,
              fontSize: 13,
              color: 'oklch(38% 0.17 145)',
              lineHeight: 1.55,
            }}
          >
            ✓ Direct Debit is the most reliable method. Payments are protected by the Direct Debit Guarantee — you can cancel at any time.
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

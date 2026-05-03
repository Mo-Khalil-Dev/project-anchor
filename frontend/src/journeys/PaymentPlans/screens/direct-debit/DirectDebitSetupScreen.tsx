import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAssessmentBreakdown } from '@/hooks/useAssessmentBreakdown';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { Button } from '@/components/core';
import { useDirectDebitSetup } from './useDirectDebitSetup';

// Bridge design tokens (matching tailwind.config.js)
const Bridge = {
  accent: 'oklch(52% 0.18 270)',
  accentBg: 'oklch(96.5% 0.03 270)',
  green: 'oklch(51% 0.17 145)',
  greenBg: 'oklch(96.5% 0.04 145)',
  text: '#0d0f14',
  sub: '#5a5f72',
  muted: '#9197ab',
  border: 'rgba(0,0,0,0.08)',
  bg: '#f4f5f9',
  divider: 'rgba(0,0,0,0.07)',
};

const inputStyle = (focused: boolean): React.CSSProperties => ({
  width: '100%',
  height: 48,
  border: `1.5px solid ${focused ? Bridge.accent : Bridge.border}`,
  borderRadius: 12,
  padding: '0 16px',
  fontSize: 15,
  color: Bridge.text,
  outline: 'none',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  background: '#fff',
  boxShadow: focused ? `0 0 0 3px oklch(52% 0.18 270 / 0.1)` : 'none',
  transition: 'all 0.15s',
});

const labelStyle: React.CSSProperties = {
  fontSize: 13.5,
  fontWeight: 600,
  color: Bridge.text,
  marginBottom: 6,
  display: 'block',
};

interface FormFieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

function FormField({ label, hint, children }: FormFieldProps) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}</label>
      {hint && <div style={{ fontSize: 12, color: Bridge.muted, marginBottom: 6 }}>{hint}</div>}
      {children}
    </div>
  );
}

export function DirectDebitSetupScreen() {
  const { assessment } = useAssessmentBreakdown();
  const selectedPlan = useSelector((state: any) => state.customer.selectedPlan);
  const { form, updateField, paymentDay, setPaymentDay, isComplete, paymentDays, handleConfirm, handleBack } = useDirectDebitSetup();
  const [focused, setFocused] = useState<string | null>(null);

  const plan = assessment?.paymentPlans.find(p => p.type.toLowerCase() === selectedPlan);

  if (!plan || !assessment) {
    return (
      <CustomerLayout>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
          <p style={{ textAlign: 'center', color: Bridge.sub, padding: '2rem 0' }}>No plan selected</p>
        </div>
      </CustomerLayout>
    );
  }

  const firstPaymentDate = new Date();
  firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
  firstPaymentDate.setDate(15);
  const dateStr = firstPaymentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <CustomerLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: Bridge.text, letterSpacing: '-0.6px', margin: 0, marginBottom: 8 }}>
            Set Up Direct Debit
          </h1>
          <p style={{ fontSize: 15, color: Bridge.sub, margin: 0 }}>
            Your bank details are encrypted and only used to set up your payment plan.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Left column: Form */}
          <div>
            {/* Bank details form */}
            <div
              style={{
                background: '#fff',
                borderRadius: 18,
                border: `1px solid ${Bridge.border}`,
                padding: '24px 24px',
                marginBottom: 16,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <FormField label="Account holder name" hint="As it appears on your bank account">
                <input
                  type="text"
                  value={form.accountHolderName}
                  onChange={e => updateField('accountHolderName', e.target.value)}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  placeholder="Sarah Mitchell"
                  style={inputStyle(focused === 'name')}
                />
              </FormField>

              <FormField label="Sort code" hint="6 digits, e.g. 12-34-56">
                <input
                  type="text"
                  value={form.sortCode}
                  onChange={e => updateField('sortCode', e.target.value)}
                  onFocus={() => setFocused('sort')}
                  onBlur={() => setFocused(null)}
                  placeholder="20-00-00"
                  maxLength={8}
                  style={inputStyle(focused === 'sort')}
                />
              </FormField>

              <FormField label="Account number" hint="8 digits">
                <input
                  type="text"
                  value={form.accountNumber}
                  onChange={e => updateField('accountNumber', e.target.value)}
                  onFocus={() => setFocused('acc')}
                  onBlur={() => setFocused(null)}
                  placeholder="12345678"
                  maxLength={8}
                  style={inputStyle(focused === 'acc')}
                />
              </FormField>
            </div>

            {/* Payment date selector */}
            <div
              style={{
                background: '#fff',
                borderRadius: 18,
                border: `1px solid ${Bridge.border}`,
                padding: '20px 24px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 700, color: Bridge.text, marginBottom: 12 }}>
                Preferred payment date
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {paymentDays.map(day => {
                  const isActive = paymentDay === day;
                  return (
                    <button
                      key={day}
                      onClick={() => setPaymentDay(day)}
                      style={{
                        width: 48,
                        height: 40,
                        borderRadius: 10,
                        border: `1.5px solid ${isActive ? Bridge.accent : Bridge.border}`,
                        background: isActive ? Bridge.accentBg : '#fff',
                        color: isActive ? Bridge.accent : Bridge.sub,
                        fontWeight: isActive ? 700 : 400,
                        fontSize: 14,
                        cursor: 'pointer',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        transition: 'all 0.15s',
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 12.5, color: Bridge.muted, marginTop: 10 }}>
                Payment will be taken on the {paymentDay}
                {paymentDay === 1 ? 'st' : paymentDay === 2 ? 'nd' : paymentDay === 3 ? 'rd' : 'th'} of each month
              </div>
            </div>
          </div>

          {/* Right column: Summary + Guarantee */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Payment summary */}
            <div
              style={{
                background: Bridge.accentBg,
                borderRadius: 18,
                border: `1px solid oklch(52% 0.18 270 / 0.1)`,
                padding: '20px 22px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: Bridge.sub,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: 12,
                }}
              >
                Payment summary
              </div>
              {[
                ['Account name', form.accountHolderName || '—'],
                ['Sort code', form.sortCode || '—'],
                ['Account number', form.accountNumber || '—'],
                ['First payment', dateStr],
                ['Amount', `£${plan.monthlyAmount.toFixed(2)}`],
                ['Frequency', 'Monthly'],
                ['Duration', `${plan.duration} payments`],
              ].map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '7px 0',
                    borderBottom: `1px solid oklch(52% 0.18 270 / 0.15)`,
                    fontSize: 13.5,
                  }}
                >
                  <span style={{ color: Bridge.sub }}>{key}</span>
                  <span style={{ fontWeight: 600, color: Bridge.text }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Guarantee box */}
            <div
              style={{
                background: Bridge.greenBg,
                borderRadius: 12,
                padding: '14px 16px',
                fontSize: 13,
                color: 'oklch(38% 0.17 145)',
                lineHeight: 1.55,
              }}
            >
              🔒 Protected by the <strong>Direct Debit Guarantee</strong>. You have the right to cancel at any time and claim an immediate refund for any incorrect payment.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
          <Button variant="primary" className="w-full" disabled={!isComplete} onClick={handleConfirm}>
            Confirm Direct Debit
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleBack}>
            Back
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
}

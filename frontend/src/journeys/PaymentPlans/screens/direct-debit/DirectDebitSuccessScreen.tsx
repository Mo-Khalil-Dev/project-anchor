import { useNavigate } from 'react-router-dom';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { Button } from '@/components/core';

const Bridge = {
  text: '#0d0f14',
  sub: '#5a5f72',
  muted: '#9197ab',
  accent: 'oklch(52% 0.18 270)',
  green: 'oklch(51% 0.17 145)',
  greenBg: 'oklch(96.5% 0.04 145)',
  amber: 'oklch(75% 0.1 70)',
  amberBg: 'oklch(97% 0.04 70)',
  border: 'rgba(0,0,0,0.08)',
  divider: 'rgba(0,0,0,0.07)',
};

export function DirectDebitSuccessScreen() {
  const navigate = useNavigate();

  // TODO: Fetch dynamic values from referenceData when assessment is persisted
  // const { data: referenceData } = useReferenceDataContext();
  // const selectedPlan = referenceData?.assessment?.selectedPlan || 'Conservative';
  // const monthlyAmount = /* calculate from plan */ 35.0;

  // Placeholder values (would be dynamic in production)
  const customerName = 'Sarah';
  const customerEmail = 'sarah.mitchell@email.com';
  const selectedPlan = 'Conservative';
  const monthlyAmount = 35.0;
  const duration = 12;
  const totalAmount = monthlyAmount * duration;

  const firstPaymentDate = new Date();
  firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
  firstPaymentDate.setDate(15);

  const finalPaymentDate = new Date(firstPaymentDate);
  finalPaymentDate.setMonth(finalPaymentDate.getMonth() + duration - 1);

  const dateFormatter = (date: Date) =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <CustomerLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Success hero */}
        <div style={{ textAlign: 'center', padding: '40px 0 32px' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: Bridge.greenBg,
              border: `3px solid ${Bridge.green}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
              <path
                d="M3 14l10 10L33 3"
                stroke={Bridge.green}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: Bridge.text,
              letterSpacing: -0.8,
              margin: 0,
              marginBottom: 10,
            }}
          >
            You're all set, {customerName}!
          </h1>
          <p
            style={{
              fontSize: 15,
              color: Bridge.sub,
              maxWidth: 480,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Your {selectedPlan} payment plan is now active. A confirmation email has been sent to{' '}
            <strong>{customerEmail}</strong>
          </p>
        </div>

        {/* Two-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Left: Plan summary */}
          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              border: `1px solid ${Bridge.border}`,
              padding: '22px 24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: Bridge.sub,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: 16,
              }}
            >
              Your plan summary
            </div>
            {[
              ['Plan', selectedPlan],
              ['Monthly payment', `£${monthlyAmount.toFixed(2)}`],
              ['Payment method', 'Direct Debit'],
              ['First payment', dateFormatter(firstPaymentDate)],
              ['Final payment', dateFormatter(finalPaymentDate)],
              ['Total payments', `${duration}`],
              ['Total amount', `£${totalAmount.toFixed(2)}`],
              ['Account', 'Barclays ····1234'],
            ].map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '7px 0',
                  borderBottom: `1px solid ${Bridge.border}`,
                  fontSize: 13.5,
                }}
              >
                <span style={{ color: Bridge.sub }}>{key}</span>
                <span style={{ fontWeight: 600, color: Bridge.text }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Right: What happens next + Can't make payment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* What happens next */}
            <div
              style={{
                background: '#fff',
                borderRadius: 18,
                border: `1px solid ${Bridge.border}`,
                padding: '20px 22px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
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
                What happens next
              </div>
              {[
                { icon: '📧', text: 'Confirmation email sent to your inbox' },
                {
                  icon: '📅',
                  text: `First payment taken ${dateFormatter(firstPaymentDate)} via Direct Debit`,
                },
                { icon: '📊', text: 'Track your progress in the payment portal' },
                { icon: '🔔', text: 'Reminders sent 7 days before each payment' },
                { icon: '🔁', text: 'Reassessment offered after 6 months' },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    padding: '8px 0',
                    borderBottom: `1px solid ${Bridge.divider}`,
                  }}
                >
                  <span style={{ fontSize: 16, marginTop: 2 }}>{icon}</span>
                  <span style={{ fontSize: 13.5, color: Bridge.sub, lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Can't make a payment */}
            <div
              style={{
                background: Bridge.amberBg,
                borderRadius: 12,
                border: `1px solid ${Bridge.amber}40`,
                padding: '18px 20px',
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 700, color: Bridge.text, marginBottom: 6 }}>
                Can't make a payment?
              </div>
              <div style={{ fontSize: 13, color: Bridge.sub, lineHeight: 1.55, marginBottom: 10 }}>
                Life happens. Call us <strong>before</strong> the payment date and we'll reschedule with no
                penalty.
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: Bridge.accent }}>0800 000 0000</div>
              <div style={{ fontSize: 12, color: Bridge.muted }}>Mon–Fri 8am–8pm · Sat 9am–5pm</div>
            </div>
          </div>
        </div>

        {/* Button */}
        <Button variant="primary" className="w-full" onClick={() => navigate('/assessment/breakdown')}>
          Go to My Dashboard
        </Button>
      </div>
    </CustomerLayout>
  );
}

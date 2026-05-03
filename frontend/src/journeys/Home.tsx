import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setCurrentStep } from '@/store/slices/customerSlice';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { colors } from '@/lib/theme';
import { useJourneyGuard } from '@/hooks/useJourneyGuard';
import { useReferenceDataContext } from '@/context/ReferenceDataContext';

export const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: referenceData, isLoading } = useReferenceDataContext();

  // Block access if any prior step is incomplete
  const { status } = useJourneyGuard({
    blockedNextPages: ['/account-setup', '/bank-connection', '/assessment'],
  });

  // Redirect to assessment breakdown if user has completed bank connection + assessment
  useEffect(() => {
    if (isLoading || !referenceData) return;

    // If bank connection AND assessment are complete → go to assessment breakdown
    if (
      referenceData.bankConnection?.status === 'CONNECTED' &&
      referenceData.assessment?.status === 'COMPLETED'
    ) {
      navigate('/assessment/breakdown', { replace: true });
    }
  }, [referenceData, isLoading, navigate]);

  // Redirect to the correct journey step if the customer is not ready for this page
  if (status === 'checking' || isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
    </div>
  );
  if (status === 'redirecting') return null;

  const handleBankConnection = () => {
    dispatch(setCurrentStep('bank-connection'));
    navigate('/bank-connection');
  };

  const handleUploadStatements = () => {
    console.log('Upload statements not yet implemented');
  };

  return (
    <CustomerLayout>
      {/* Hero Section - WebHero equivalent */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
          borderRadius: '20px',
          padding: '36px 40px',
          marginBottom: '24px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            right: '-20px',
            top: '-20px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '60px',
            bottom: '-40px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>
            Hello, Sarah. Let's sort your account.
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.78)',
              lineHeight: '1.55',
              maxWidth: '500px',
              marginBottom: '20px',
            }}
          >
            Your account has an outstanding balance. We're here to help you find a payment plan that genuinely works for your situation — no pressure, no jargon.
          </p>

          {/* Account summary pills */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'Account', value: '#BR-2847' },
              { label: 'Outstanding', value: '£420' },
              { label: 'Due', value: 'Overdue' },
            ].map((pill) => (
              <div
                key={pill.label}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  padding: '6px 14px',
                  fontSize: '12.5px',
                  color: '#fff',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <span style={{ opacity: 0.7 }}>{pill.label}: </span>
                <strong>{pill.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How Bridge Works Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '24px 28px',
          marginBottom: '20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {/* Section Label */}
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: colors.muted,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            padding: '14px 0 6px 0',
            marginBottom: '0px',
          }}
        >
          How SAFE works
        </div>

        {/* Steps Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0,
            marginTop: '12px',
          }}
        >
          {[
            {
              n: 1,
              title: 'Connect your bank',
              desc: 'Securely link your account so we understand your finances. Takes 2 minutes.',
            },
            {
              n: 2,
              title: 'Get your assessment',
              desc: 'We analyse 6 months of data and calculate a hardship score and disposable income.',
            },
            {
              n: 3,
              title: 'Choose your plan',
              desc: 'Pick a payment plan that fits. We offer options from £35/month — no one-size-fits-all.',
            },
          ].map((step, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '14px',
                padding: '8px 20px 8px 0',
                borderRight: i < 2 ? `1px solid rgba(0,0,0,0.07)` : 'none',
                marginRight: i < 2 ? '20px' : '0',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: colors.accentBg,
                  color: colors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '14px',
                  flexShrink: 0,
                }}
              >
                {step.n}
              </div>
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: colors.text,
                    marginBottom: '4px',
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: '12.5px',
                    color: colors.sub,
                    lineHeight: '1.55',
                  }}
                >
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Option Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        {[
          {
            icon: (
              <svg width="22" height="20" viewBox="0 0 24 22" fill="none">
                <rect x="2" y="5" width="20" height="15" rx="3" stroke={colors.accent} strokeWidth="1.8" />
                <path d="M2 9h20" stroke={colors.accent} strokeWidth="1.8" />
                <path d="M6 14h4M6 17h2" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ),
            title: 'Connect Your Bank Account',
            desc: 'Fastest option — secure read-only access, no passwords stored. Verified by Tink and FCA regulated.',
            cta: 'Get Started',
            primary: true,
          },
          {
            icon: (
              <svg width="20" height="22" viewBox="0 0 22 24" fill="none">
                <rect x="3" y="3" width="16" height="18" rx="2.5" stroke={colors.sub} strokeWidth="1.7" />
                <path d="M7 9h8M7 13h5M7 17h3" stroke={colors.sub} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ),
            title: 'Upload Bank Statements',
            desc: 'Upload PDF statements for the last 6 months. Takes a little longer to process but is equally secure.',
            cta: 'Upload Files',
            primary: false,
          },
        ].map((option, i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              borderRadius: '18px',
              padding: '28px 24px',
              border: `${option.primary ? 2 : 1.5}px solid ${option.primary ? colors.accent : 'rgba(0,0,0,0.08)'}`,
              cursor: 'pointer',
              transition: 'box-shadow 0.15s',
            }}
            onClick={option.primary ? handleBankConnection : handleUploadStatements}
          >
            {/* Icon */}
            <div
              style={{
                width: '46px',
                height: '46px',
                background: option.primary ? colors.accentBg : '#f4f4f8',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              {option.icon}
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: colors.text,
                marginBottom: '8px',
              }}
            >
              {option.title}
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: '13px',
                color: colors.sub,
                lineHeight: '1.55',
                marginBottom: '22px',
              }}
            >
              {option.desc}
            </div>

            {/* Button */}
            <button
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '14px',
                border: 'none',
                fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.1s',
                background: option.primary ? colors.accent : 'transparent',
                color: option.primary ? '#fff' : colors.sub,
                borderWidth: option.primary ? '0' : '1.5px',
                borderColor: option.primary ? 'transparent' : 'rgba(0,0,0,0.08)',
                boxShadow: option.primary ? `0 4px 18px ${colors.accent}` : 'none',
              }}
              onClick={(e) => {
                e.stopPropagation();
                option.primary ? handleBankConnection() : handleUploadStatements();
              }}
            >
              {option.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Footer Security Text */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '12.5px',
          color: colors.muted,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
          <path
            d="M6.5 1L1 3.5v5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5v-5L6.5 1z"
            fill={colors.muted}
            opacity="0.5"
          />
        </svg>
        256-bit encryption · Read-only access · GDPR compliant · Data deleted after 3 years
      </div>
    </CustomerLayout>
  );
};

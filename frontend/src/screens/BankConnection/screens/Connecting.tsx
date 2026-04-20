import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setBankJourneyState } from '@/store/slices/customerSlice';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';

export function Connecting() {
  const dispatch = useAppDispatch();
  const currentJourneyState = useAppSelector((s) => s.customer.bankJourneyState);
  const [step, setStep] = useState(0);
  const STEPS = ['Connecting to Barclays...', 'Fetching your transactions...', 'Running financial assessment...'];

  useEffect(() => {
    const t = [
      setTimeout(() => setStep(1), 1600),
      setTimeout(() => setStep(2), 3400),
      setTimeout(() => setStep(3), 5200),
      setTimeout(() => {
        if (currentJourneyState === 'connecting') {
          dispatch(setBankJourneyState('success'));
        }
      }, 6200),
    ];
    return () => t.forEach(clearTimeout);
  }, [dispatch, currentJourneyState]);

  return (
    <CustomerLayout currentStep={3} totalSteps={4}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spinHG {
          0%, 45% { transform: rotate(0deg); }
          55%, 100% { transform: rotate(180deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        @keyframes stepSlide {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .page {
          animation: fadeUp 0.22s ease both;
        }

        .card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          padding: 52px 40px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
          text-align: center;
        }

        .spinner {
          width: 84px;
          height: 84px;
          background-color: #f0f0ff;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px;
          animation: spinHG 2.2s ease-in-out infinite;
        }

        .spinner-svg {
          width: 44px;
          height: 44px;
        }

        .heading {
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: #0d0f14;
          letter-spacing: -0.5px;
        }

        .description {
          font-size: 14px;
          color: #5a5f72;
          margin-bottom: 36px;
        }

        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 440px;
          margin: 0 auto;
          text-align: left;
          margin-bottom: 28px;
        }

        .step-row {
          display: flex;
          gap: 14px;
          align-items: center;
          padding: 14px 18px;
          border-radius: 14px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .step-row.completed {
          background: #e8f5e9;
          border-color: rgba(30, 125, 63, 0.15);
        }

        .step-row.active {
          animation: stepSlide 0.3s ease;
        }

        .step-indicator {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 700;
        }

        .step-indicator.completed {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #1e7d3f;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .step-indicator.completed svg {
          width: 10px;
          height: 8px;
        }

        .step-indicator.active {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2.5px solid #5b5bd6;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          animation: pulse 1s ease-in-out infinite;
        }

        .step-indicator.active::after {
          content: '';
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #5b5bd6;
        }

        .step-indicator.pending {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1.5px solid rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #9197ab;
          font-weight: 700;
          font-size: 11.5px;
        }

        .step-text {
          font-size: 14px;
          color: #0d0f14;
          transition: all 0.3s;
        }

        .step-row.completed .step-text {
          color: #1e7d3f;
          font-weight: 600;
        }

        .step-row.active .step-text {
          color: #0d0f14;
          font-weight: 600;
        }

        .step-row.pending .step-text {
          color: #9197ab;
          font-weight: 400;
        }

        .trust-footer {
          font-size: 12.5px;
          color: #9197ab;
          margin-top: 28px;
        }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="spinner">
            <svg className="spinner-svg" viewBox="0 0 44 44" fill="none">
              <path d="M8 4h28l-9 16H17L8 4z" fill="#f0f0ff" stroke="#5b5bd6" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M8 40h28l-9-16H17L8 40z" fill="#f0f0ff" stroke="#5b5bd6" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M17 24s1.5 3 5 3 5-3 5-3" stroke="#5b5bd6" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
              <line x1="7" y1="4" x2="37" y2="4" stroke="#5b5bd6" strokeWidth="2.2" strokeLinecap="round"/>
              <line x1="7" y1="40" x2="37" y2="40" stroke="#5b5bd6" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="heading">Connecting to your bank...</h2>
          <p className="description">This usually takes 30–60 seconds. Please don't close this window.</p>
          <div className="steps-container">
            {STEPS.map((s, i) => {
              const isCompleted = i < step;
              const isActive = i === step;
              return (
                <div
                  key={i}
                  className={`step-row ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}
                >
                  {isCompleted ? (
                    <div className="step-indicator completed">
                      <svg viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  ) : isActive ? (
                    <div className="step-indicator active" />
                  ) : (
                    <div className="step-indicator pending">{i + 1}</div>
                  )}
                  <span className="step-text">{s}</span>
                </div>
              );
            })}
          </div>
          <p className="trust-footer">
            🔒 Secured by Tink · Open Banking · FCA regulated
          </p>
        </div>
      </div>
    </CustomerLayout>
  );
}

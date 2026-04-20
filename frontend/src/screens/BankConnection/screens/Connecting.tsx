import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setBankJourneyState } from '@/store/slices/customerSlice';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { StepProgress } from '../components/StepProgress';

export function Connecting() {
  const dispatch = useAppDispatch();
  const currentJourneyState = useAppSelector((s) => s.customer.bankJourneyState);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const steps = [
      { delay: 1600, step: 1 },
      { delay: 3400, step: 2 },
      { delay: 5200, step: 3 },
    ];

    const timers = steps.map((s) => setTimeout(() => setCurrentStep(s.step), s.delay));

    const finalTimer = setTimeout(() => {
      if (currentJourneyState === 'connecting') {
        dispatch(setBankJourneyState('success'));
      }
    }, 6200);

    return () => {
      timers.forEach((t) => clearTimeout(t));
      clearTimeout(finalTimer);
    };
  }, [dispatch, currentJourneyState]);

  const progressSteps = [
    { label: 'Connecting to Barclays...' },
    { label: 'Fetching your transactions...' },
    { label: 'Running financial assessment...' },
  ];

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

        .page {
          animation: fadeUp 0.22s ease both;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }

        .icon-container {
          width: 84px;
          height: 84px;
          background-color: #5b5bd6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
          animation: spinHG 2.2s ease-in-out infinite;
        }

        .icon {
          width: 48px;
          height: 48px;
          color: white;
        }

        .heading {
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 24px 0;
          color: #0d0f14;
          letter-spacing: -0.6px;
        }

        .progress-container {
          width: 100%;
          max-width: 400px;
          margin-bottom: 32px;
        }

        .description {
          font-size: 13px;
          color: #5a5f72;
          text-align: center;
          line-height: 1.6;
          margin-bottom: 32px;
          max-width: 400px;
        }

        .trust-footer {
          font-size: 13px;
          color: #9197ab;
          text-align: center;
        }
      `}</style>

      <div className="page">
        <div className="icon-container">
          <svg className="icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="progress-container">
          <StepProgress steps={progressSteps} currentStep={currentStep} />
        </div>

        <p className="description">This usually takes 30–60 seconds. Please don't close this window.</p>

        <div className="trust-footer">🔒 Secured by Tink · Open Banking · FCA regulated</div>
      </div>
    </CustomerLayout>
  );
}

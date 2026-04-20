interface Step {
  label: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepProgress({ steps, currentStep, className = '' }: StepProgressProps) {
  return (
    <div className={className}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        @keyframes stepSlide {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .step-item {
          animation: stepSlide 0.3s ease forwards;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 10px;
          background-color: rgba(91, 91, 214, 0.04);
          transition: all 0.3s ease;
        }

        .step-indicator {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .step-indicator.completed {
          background-color: var(--green);
          color: white;
        }

        .step-indicator.active {
          border: 2px solid var(--accent);
          color: var(--accent);
          animation: pulse 1s ease-in-out infinite;
          background-color: transparent;
        }

        .step-indicator.active::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 6px;
          background-color: var(--accent);
          border-radius: 50%;
        }

        .step-indicator.pending {
          border: 2px solid var(--muted);
          color: var(--muted);
          background-color: transparent;
        }

        .step-label {
          font-size: 13px;
          font-weight: 400;
          color: var(--text);
        }
      `}</style>

      {steps.map((step, idx) => (
        <div key={idx} className="step-item">
          <div
            className={`step-indicator ${
              idx < currentStep ? 'completed' : idx === currentStep ? 'active' : 'pending'
            }`}
            style={{
              position: 'relative',
            }}
          >
            {idx < currentStep ? '✓' : idx === currentStep ? '' : idx + 1}
          </div>
          <div className="step-label">{step.label}</div>
        </div>
      ))}
    </div>
  );
}

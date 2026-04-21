import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import { setCurrentStep } from '@/store/slices/customerSlice';
import { Button } from '@/components/core/Button';
import { HardshipBadge } from '@/components/core/HardshipBadge';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import axiosInstance from '@/api/client';

interface IncomeBreakdown {
  salary: number;
  pension: number;
  benefits: number;
  cashDeposits: number;
  other: number;
  total: number;
}

interface ExpenseBreakdown {
  housing: number;
  food: number;
  utilities: number;
  transport: number;
  other: number;
  total: number;
}

interface Assessment {
  id: string;
  customerId: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  disposableIncome: number;
  monthlyBill: number;
  billRatio: number;
  hardshipLevel: 'SEVERE' | 'MODERATE' | 'LOW' | 'NONE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  arrears?: number | null;
  incomeBreakdown?: IncomeBreakdown | null;
  expenseBreakdown?: ExpenseBreakdown | null;
  calculatedAt: string;
}

export function AssessmentOverview() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssessment();
    const pollInterval = setInterval(() => {
      fetchAssessment();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [assessmentId]);

  const fetchAssessment = async () => {
    try {
      if (!assessmentId) {
        setError('Assessment ID is required');
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get(`/assessments/${assessmentId}`);
      const data = response.data as Assessment;

      setAssessment(data);
      setError(null);

      if (data.status === 'COMPLETED' || data.status === 'FAILED') {
        setLoading(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch assessment';
      setError(message);
      setLoading(false);
    }
  };

  const handleExplorePaymentPlans = () => {
    dispatch(setCurrentStep('plan-select'));
    navigate('/plan-select');
  };

  if (loading && !assessment) {
    return (
      <CustomerLayout currentStep={5} totalSteps={6}>
        <style>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }

          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-top-color: #0d0f14;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .loading-text {
            margin-top: 24px;
            font-size: 16px;
            color: #5a5f72;
            font-weight: 500;
          }
        `}</style>
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Calculating your assessment...</p>
        </div>
      </CustomerLayout>
    );
  }

  if (error && !assessment) {
    return (
      <CustomerLayout currentStep={5} totalSteps={6}>
        <style>{`
          .error-container {
            background: #ffebee;
            border: 1px solid #ef5350;
            border-radius: 12px;
            padding: 32px 24px;
            text-align: center;
            margin: 40px 0;
          }

          .error-title {
            font-size: 18px;
            font-weight: 700;
            color: #c62828;
            margin-bottom: 8px;
          }

          .error-message {
            font-size: 14px;
            color: #d32f2f;
            line-height: 1.6;
          }

          .back-button {
            margin-top: 20px;
          }
        `}</style>
        <div className="error-container">
          <div className="error-title">Assessment Failed</div>
          <div className="error-message">{error}</div>
          <div className="back-button">
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!assessment) {
    return null;
  }

  const isPending = assessment.status === 'PENDING';
  const isFailed = assessment.status === 'FAILED';
  const isCompleted = assessment.status === 'COMPLETED';

  const getAssessmentDate = () => {
    const date = new Date(assessment.calculatedAt);
    return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <CustomerLayout currentStep={5} totalSteps={6}>
      <style>{`
        .page {
          animation: fadeUp 0.22s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .badge-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .account-info {
          font-size: 12.5px;
          color: #9197ab;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: #fff;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
          border-top: 3px solid;
        }

        .stat-card.green { border-top-color: #059669; }
        .stat-card.amber { border-top-color: #d97706; }
        .stat-card.red { border-top-color: #dc2626; }

        .stat-value {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.8px;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 13.5px;
          font-weight: 600;
          color: #0d0f14;
          margin-bottom: 3px;
        }

        .stat-sub {
          font-size: 12px;
          color: #6b7280;
        }

        .stat-card.green .stat-value { color: #059669; }
        .stat-card.amber .stat-value { color: #d97706; }
        .stat-card.red .stat-value { color: #dc2626; }

        .bill-card {
          background: #fff;
          border-radius: 14px;
          padding: 22px 24px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
          margin-bottom: 16px;
        }

        .bill-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .bill-left {
          flex: 1;
        }

        .bill-label {
          font-size: 13px;
          font-weight: 600;
          color: #9197ab;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }

        .bill-ratio-container {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .bill-ratio {
          font-size: 36px;
          font-weight: 800;
          color: #ef4444;
          letter-spacing: -1px;
        }

        .bill-ratio-sub {
          font-size: 13px;
          color: #6b7280;
        }

        .bill-right {
          text-align: right;
        }

        .bill-balance-label {
          font-size: 12px;
          color: #9197ab;
          margin-bottom: 3px;
        }

        .bill-balance {
          font-size: 18px;
          font-weight: 700;
          color: #0d0f14;
        }

        .benchmark-section {
          margin-bottom: 14px;
        }

        .benchmark-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #9197ab;
          margin-bottom: 6px;
        }

        .benchmark-bar {
          height: 10px;
          border-radius: 100px;
          background: #e5e7eb;
          position: relative;
          overflow: hidden;
        }

        .benchmark-gradient {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 100%;
          background: linear-gradient(90deg, #059669 0%, #059669 8%, #d97706 20%, #dc2626 45%);
        }

        .benchmark-marker-left {
          position: absolute;
          left: 8%;
          top: -3px;
          height: 16px;
          width: 2px;
          background: #fff;
          border-radius: 1px;
        }

        .benchmark-marker-right {
          position: absolute;
          right: 4px;
          top: -4px;
          font-size: 11px;
          color: #fff;
          font-weight: 700;
          background: #ef4444;
          border-radius: 100px;
          padding: 2px 6px;
        }

        .bill-explanation {
          background: #fef2f2;
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 13px;
          color: #991b1b;
          line-height: 1.5;
        }

        .formula-card {
          background: #fff;
          border-radius: 14px;
          padding: 18px 24px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
          margin-bottom: 20px;
        }

        .formula-label {
          font-size: 13px;
          font-weight: 600;
          color: #9197ab;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 16px;
        }

        .formula-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .formula-op {
          font-size: 22px;
          color: #9197ab;
          font-weight: 300;
        }

        .formula-item {
          border-radius: 10px;
          padding: 8px 14px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: #f9fafb;
        }

        .formula-item.green { background: #d1fae5; border-color: #6ee7b7; }
        .formula-item.amber { background: #fef3c7; border-color: #fcd34d; }
        .formula-item.red { background: #fee2e2; border-color: #fca5a5; }

        .formula-item-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }

        .formula-item.green .formula-item-label { color: #059669; }
        .formula-item.amber .formula-item-label { color: #d97706; }
        .formula-item.red .formula-item-label { color: #dc2626; }
        .formula-item:not(.green):not(.amber):not(.red) .formula-item-label { color: #9197ab; }

        .formula-item-value {
          font-size: 16px;
          font-weight: 700;
          color: #0d0f14;
        }

        .cta-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .pending-message {
          background: #dbeafe;
          border: 1px solid #93c5fd;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 13px;
          color: #1d4ed8;
          margin-bottom: 20px;
        }

        .failed-message {
          background: #fee2e2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 13px;
          color: #991b1b;
          margin-bottom: 20px;
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .bill-header {
            flex-direction: column;
            gap: 16px;
          }

          .cta-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page">
        {/* Page heading */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0', color: '#0d0f14', letterSpacing: '-0.8px' }}>
            Your Financial Assessment
          </h1>
          <p style={{ fontSize: '15px', color: '#6b7280', margin: '0', lineHeight: '1.6' }}>
            Based on 6 months of transaction data from your connected bank, assessed on {getAssessmentDate()}.
          </p>
        </div>

        {isPending && (
          <div className="pending-message">
            ⏳ Your assessment is still calculating. We're analysing your financial situation...
          </div>
        )}

        {isFailed && (
          <div className="failed-message">
            ❌ Assessment calculation failed. Please try again or contact support.
          </div>
        )}

        {isCompleted && (
          <>
            {/* Badge row */}
            <div className="badge-row">
              <HardshipBadge level={assessment.hardshipLevel} />
              <span className="account-info">Assessed on {getAssessmentDate()}</span>
            </div>

            {/* 3 stat cards */}
            <div className="stats-grid">
              <div className="stat-card green">
                <div className="stat-value">£{assessment.monthlyIncome.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</div>
                <div className="stat-label">Monthly Income</div>
                <div className="stat-sub">Average over 6 months</div>
              </div>
              <div className="stat-card amber">
                <div className="stat-value">£{assessment.monthlyExpenses.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</div>
                <div className="stat-label">Total Expenses</div>
                <div className="stat-sub">Essential spending</div>
              </div>
              <div className="stat-card red">
                <div className="stat-value">£{assessment.disposableIncome.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</div>
                <div className="stat-label">Disposable Income</div>
                <div className="stat-sub">After essentials</div>
              </div>
            </div>

            {/* Bill ratio card */}
            <div className="bill-card">
              <div className="bill-header">
                <div className="bill-left">
                  <div className="bill-label">Bill as % of Disposable Income</div>
                  <div className="bill-ratio-container">
                    <span className="bill-ratio">{Math.round(assessment.billRatio)}%</span>
                    <span className="bill-ratio-sub">of your disposable income</span>
                  </div>
                </div>
                <div className="bill-right">
                  <div className="bill-balance-label">Your balance</div>
                  <div className="bill-balance">£{assessment.monthlyBill}</div>
                </div>
              </div>

              {/* Benchmark visual */}
              <div className="benchmark-section">
                <div className="benchmark-labels">
                  <span>0%</span>
                  <span>Benchmark: 5–8%</span>
                  <span>Your ratio: {Math.round(assessment.billRatio)}%</span>
                </div>
                <div className="benchmark-bar">
                  <div className="benchmark-gradient"></div>
                  <div className="benchmark-marker-left"></div>
                  <div className="benchmark-marker-right">You</div>
                </div>
              </div>

              <div className="bill-explanation">
                <strong>What this means:</strong> The average household spends 5–8% of disposable income on energy bills. Your outstanding balance represents {Math.round(assessment.billRatio)}% of your monthly disposable income — this qualifies as <strong>{assessment.hardshipLevel.toLowerCase()} financial hardship</strong> under Ofgem guidelines.
              </div>
            </div>

            {/* Formula card */}
            <div className="formula-card">
              <div className="formula-label">How we calculated this</div>
              <div className="formula-row">
                <div className="formula-item green">
                  <div className="formula-item-label">Income</div>
                  <div className="formula-item-value">£{assessment.monthlyIncome.toLocaleString('en-GB', { maximumFractionDigits: 0 })}/mo</div>
                </div>
                <span className="formula-op">−</span>
                <div className="formula-item amber">
                  <div className="formula-item-label">Essentials</div>
                  <div className="formula-item-value">£{assessment.monthlyExpenses.toLocaleString('en-GB', { maximumFractionDigits: 0 })}/mo</div>
                </div>
                <span className="formula-op">=</span>
                <div className="formula-item red">
                  <div className="formula-item-label">Disposable</div>
                  <div className="formula-item-value">£{assessment.disposableIncome.toLocaleString('en-GB', { maximumFractionDigits: 0 })}/mo</div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="cta-row">
              <Button variant="primary" onClick={handleExplorePaymentPlans} style={{ width: '100%' }}>
                Explore Payment Plans
              </Button>
              <Button variant="ghost" style={{ width: '100%' }}>
                View Detailed Breakdown
              </Button>
            </div>
          </>
        )}
      </div>
    </CustomerLayout>
  );
}

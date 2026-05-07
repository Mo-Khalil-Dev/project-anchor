import { useNavigate } from 'react-router-dom';
import { useAssessmentBreakdown } from '@/hooks/useAssessmentBreakdown';
import { useJourneyGuard } from '@/hooks/useJourneyGuard';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { Button } from '@/components/core';
import { OverviewTab } from './OverviewTab';
import { ExpensesTab } from './ExpensesTab';
import { IncomeStabilityTab } from './IncomeStabilityTab';
import { WhyThisHappenedTab } from './WhyThisHappenedTab';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'income', label: 'Income Stability' },
  { id: 'factors', label: 'Why This Happened' },
] as const;

export function AssessmentBreakdown() {
  const navigate = useNavigate();

  // Redirect if account setup or bank connection not yet complete
  const { status: guardStatus } = useJourneyGuard({
    blockedNextPages: ['/account-setup', '/bank-connection'],
  });

  const { assessment, activeTab, setActiveTab, isLoading, error } = useAssessmentBreakdown();

  if (guardStatus === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
      </div>
    );
  }
  if (guardStatus === 'redirecting') return null;

  if (isLoading) return <CustomerLayout><div className="text-sub py-12 text-center">Loading assessment...</div></CustomerLayout>;
  if (error) return <CustomerLayout><div className="text-red py-12 text-center">Error: {error}</div></CustomerLayout>;
  if (!assessment) return <CustomerLayout><div className="text-sub py-12 text-center">No assessment found</div></CustomerLayout>;

  return (
    <CustomerLayout>
      <div className="mb-6">
        <h1 className="text-page-title text-text mb-2">Detailed Assessment Breakdown</h1>
        <p className="text-sub text-sm">A full breakdown of your financial position based on bank data from Barclays.</p>
      </div>

      <div className="flex gap-1 border-b border-divider mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as typeof activeTab)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === t.id ? 'text-accent border-accent' : 'text-sub border-transparent hover:text-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab assessment={assessment} />}
      {activeTab === 'expenses' && <ExpensesTab assessment={assessment} />}
      {activeTab === 'income' && <IncomeStabilityTab assessment={assessment} />}
      {activeTab === 'factors' && <WhyThisHappenedTab assessment={assessment} />}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="primary" onClick={() => navigate('/payment-plans')}>View Payment Plan Options</Button>
        <Button variant="secondary" onClick={() => navigate('/')}>Back to Overview</Button>
      </div>
    </CustomerLayout>
  );
}

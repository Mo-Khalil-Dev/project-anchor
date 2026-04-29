import { useState } from 'react';
import type { AssessmentDetailedDTO, PaymentPlanDTO } from '../../types';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { Card, Button, SustBadge } from '@/components/core';

const PROS: Record<string, string[]> = {
  Conservative: [
    'Leaves the most monthly buffer for emergencies',
    'Lowest monthly commitment',
    'Highest chance of completing the plan',
  ],
  Balanced: [
    'Clears debt sooner',
    'Moderate risk if unexpected expense',
    'Reasonable monthly buffer remains',
  ],
  Aggressive: [
    'Clears debt fastest',
    'Saves on any interest accumulation',
  ],
};

const COLORS: Record<string, { text: string; bg: string; ring: string; border: string }> = {
  Conservative: { text: 'text-green', bg: 'bg-green', ring: 'oklch(51% 0.17 145)', border: 'border-green' },
  Balanced: { text: 'text-amber', bg: 'bg-amber', ring: 'oklch(62% 0.16 76)', border: 'border-amber' },
  Aggressive: { text: 'text-red', bg: 'bg-red', ring: 'oklch(52% 0.18 25)', border: 'border-red' },
};

function PlanCard({
  plan,
  buffer,
  isSelected,
  isRecommended,
  onSelect,
}: {
  plan: PaymentPlanDTO;
  buffer: number;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: (type: string) => void;
}) {
  const c = COLORS[plan.type];
  const warning =
    plan.type === 'Aggressive'
      ? 'Monthly payment exceeds your disposable income. High risk of missing payments.'
      : plan.type === 'Balanced'
      ? 'If an unexpected expense arises, you may struggle to make a payment.'
      : null;

  return (
    <div
      onClick={() => onSelect(plan.type)}
      className={`bg-white rounded-card p-6 cursor-pointer transition-all relative ${
        isSelected ? `border-2 ${c.border} shadow-lg` : 'border border-border shadow-sm hover:shadow-md'
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
          ★ Recommended
        </div>
      )}
      <div className="mb-4">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">{plan.type}</div>
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-extrabold ${c.text}`} style={{ letterSpacing: -1.5 }}>£{plan.monthlyAmount}</span>
          <span className="text-sm text-sub">/month</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-divider">
        {[
          ['Duration', `${plan.duration} months`],
          ['Total paid', `£${plan.totalRepayment.toLocaleString()}`],
          ['Monthly buffer', buffer >= 0 ? `£${buffer}` : 'Over budget'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-sub">{k}</span>
            <span className={`font-semibold ${k === 'Monthly buffer' && buffer < 0 ? 'text-red' : 'text-text'}`}>{v}</span>
          </div>
        ))}
      </div>

      <SustBadge level={plan.sustainability} />

      <div className="mt-4 flex flex-col gap-1.5">
        {(PROS[plan.type] || []).map(p => (
          <div key={p} className="flex gap-2 items-start">
            <span className={`font-bold text-sm mt-0.5 ${c.text}`}>·</span>
            <span className="text-xs text-sub leading-snug">{p}</span>
          </div>
        ))}
      </div>

      {warning && (
        <div className="mt-3 bg-red-bg rounded-lg p-3 text-xs text-red leading-snug">
          ⚠ {warning}
        </div>
      )}

      <div className="mt-4">
        <Button variant={isSelected ? 'primary' : 'ghost'} size="sm" className="w-full">
          {isSelected ? '✓ Selected — Continue' : 'Select This Plan'}
        </Button>
      </div>
    </div>
  );
}

export function PaymentPlanOptions({ assessment }: { assessment: AssessmentDetailedDTO }) {
  const [selectedType, setSelectedType] = useState<string>('Conservative');
  const recommendedPlan = assessment.paymentPlans.find(p => p.sustainability === 'HIGH')?.type || 'Conservative';

  return (
    <CustomerLayout>
      <div className="mb-5">
        <h1 className="text-page-title text-text mb-2">Choose a Payment Plan</h1>
        <p className="text-sub text-sm">
          All plans clear your full £{assessment.arrears} balance. We recommend Conservative — it leaves you a safety buffer each month.
        </p>
      </div>

      <Card className="mb-5">
        <div className="flex gap-6 flex-wrap">
          {[
            ['Balance to clear', `£${assessment.arrears}`],
            ['Your disposable income', `£${assessment.disposableIncome}/month`],
            ['Hardship level', assessment.hardshipLevel],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">{k}</div>
              <div className="text-base font-bold text-text">{v}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-5 mb-6 mt-6">
        {assessment.paymentPlans.map(p => (
          <PlanCard
            key={p.type}
            plan={p}
            buffer={assessment.disposableIncome - p.monthlyAmount}
            isSelected={selectedType === p.type}
            isRecommended={p.type === recommendedPlan}
            onSelect={setSelectedType}
          />
        ))}
      </div>

      <div className="flex justify-center gap-3">
        <Button variant="primary">Continue with {selectedType} Plan</Button>
        <Button variant="secondary">Compare in detail</Button>
      </div>

      <p className="text-center text-xs text-muted mt-3">
        You can adjust or pause your plan at any time.{' '}
        <span className="text-accent cursor-pointer">Need advice? Talk to us.</span>
      </p>
    </CustomerLayout>
  );
}

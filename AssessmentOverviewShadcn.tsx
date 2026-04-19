import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface AssessmentData {
  accountNumber: string;
  userName: string;
  monthlyIncome: number;
  billPercentage: number;
  gasBoill: number;
  arrears: number;
  hardshipLevel: 'NONE' | 'LOW' | 'MODERATE' | 'SEVERE';
  hardshipDescription: string;
  assessmentDate: string;
}

const HARDSHIP_COLORS = {
  NONE: { badge: 'bg-green-100 text-green-800' },
  LOW: { badge: 'bg-blue-100 text-blue-800' },
  MODERATE: { badge: 'bg-amber-100 text-amber-800' },
  SEVERE: { badge: 'bg-red-100 text-red-800' },
};

export function AssessmentOverviewShadcn({ data }: { data: AssessmentData }) {
  const colors = HARDSHIP_COLORS[data.hardshipLevel];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Utility Affordability Assessment</h1>
            <p className="text-sm text-gray-600 mt-1">British Gas • Account: {data.accountNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="text-base font-semibold text-gray-900">{data.userName}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT COLUMN: Your Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Your Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hardship Status */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={colors.badge}>{data.hardshipLevel}</Badge>
                  <span className="text-xs text-gray-600">HARDSHIP</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Your situation</p>
                <p className="text-sm text-gray-600 mt-1">{data.hardshipDescription}</p>
              </div>

              {/* Financial Summary Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Monthly Income */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium uppercase">Monthly Income</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">£{data.monthlyIncome.toLocaleString()}</p>
                </div>

                {/* Bill as % of Income */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium uppercase">Bill as % of income</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{data.billPercentage}%</p>
                </div>

                {/* Gas Bill */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium uppercase">Your gas bill</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">£{data.gasBoill.toLocaleString()}</p>
                </div>

                {/* You Owe */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium uppercase">You owe</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">£{data.arrears.toLocaleString()}</p>
                </div>
              </div>

              {/* Assessment Date */}
              <p className="text-xs text-gray-500">Assessment date: {data.assessmentDate}</p>
            </CardContent>
          </Card>

          {/* RIGHT COLUMN: What Happens Next */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Completed Steps */}
              <div className="space-y-4">
                {/* Step 1: Bank Connected */}
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Bank data connected</p>
                    <p className="text-sm text-gray-600">6 months of transactions analyzed</p>
                  </div>
                </div>

                {/* Step 2: Assessment Complete */}
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Assessment complete</p>
                    <p className="text-sm text-gray-600">Your financial situation analyzed</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* Next Steps */}
              <div className="space-y-4">
                {/* Step 3: View Payment Plans */}
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">View payment plan options</p>
                    <p className="text-sm text-gray-600">3 affordable payment plans available</p>
                  </div>
                </div>

                {/* Step 4: Get Support */}
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Get support recommendations</p>
                    <p className="text-sm text-gray-600">Debt advice, warm home discount, more</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 font-semibold py-6">
                View Payment Plans →
              </Button>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}

// Mock data for demo
export const MOCK_ASSESSMENT: AssessmentData = {
  accountNumber: 'GAS-12345',
  userName: 'Mohamed Ahmed',
  monthlyIncome: 1500,
  billPercentage: 12,
  gasBoill: 180,
  arrears: 420,
  hardshipLevel: 'MODERATE',
  hardshipDescription: "You're struggling but support is available",
  assessmentDate: '15 April 2024',
};

// Demo Page Component
export default function AssessmentOverviewDemo() {
  return <AssessmentOverviewShadcn data={MOCK_ASSESSMENT} />;
}

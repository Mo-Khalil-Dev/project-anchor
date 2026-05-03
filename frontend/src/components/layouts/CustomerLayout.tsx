import React from 'react';
import { cn } from '@/lib/cn';
import { BridgeLogo } from '@/components/core/icons';

interface CustomerLayoutProps {
  children: React.ReactNode;
  currentStep?: number;
  totalSteps?: number;
  className?: string;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  children,
  currentStep = 0,
  totalSteps = 0,
  className,
}) => {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border h-15 flex items-center px-8">
        <div className="flex items-center gap-3">
          <BridgeLogo />
          <span className="text-xl font-bold text-text">SAFE</span>
        </div>

        {/* Step indicators */}
        {totalSteps > 0 && (
          <div className="flex items-center gap-2 mx-auto">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'transition-all h-2 rounded-full',
                  i < currentStep
                    ? 'w-6 bg-accent'
                    : i === currentStep
                      ? 'w-6 bg-accent'
                      : 'w-2 bg-muted'
                )}
              />
            ))}
          </div>
        )}

        {/* Avatar placeholder */}
        <div className="ml-auto h-10 w-10 rounded-full bg-accent-bg flex items-center justify-center">
          <span className="text-sm font-bold text-accent">U</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className={cn(
          'max-w-screen-lg mx-auto px-8 py-10',
          className
        )}>
          {children}
        </div>
      </main>
    </div>
  );
};

import React from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, variant = 'default' }, ref) => (
    <div
      ref={ref}
      className={cn(
        'card p-6',
        variant === 'elevated' && 'shadow-card-elevated',
        className
      )}
    >
      {children}
    </div>
  )
);

Card.displayName = 'Card';

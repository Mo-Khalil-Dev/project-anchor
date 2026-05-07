import React from 'react';
import { cn } from '@/lib/cn';
import { Card } from '.';

interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  subLabel?: string;
  borderColor?: 'accent' | 'green' | 'amber' | 'red' | 'blue';
  className?: string;
}

const borderColorMap = {
  accent: 'border-t-accent',
  green: 'border-t-green',
  amber: 'border-t-amber',
  red: 'border-t-red',
  blue: 'border-t-blue-500',
};

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  subLabel,
  borderColor = 'accent',
  className,
}) => {
  return (
    <Card
      className={cn(
        'border-t-4',
        borderColorMap[borderColor],
        className
      )}
    >
      {icon && <div className="mb-3 text-2xl">{icon}</div>}
      <label className="label">{label}</label>
      <div className="text-2xl font-bold text-text">{value}</div>
      {subLabel && <p className="mt-1 text-xs text-muted">{subLabel}</p>}
    </Card>
  );
};

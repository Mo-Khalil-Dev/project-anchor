import React from 'react';
import { cn } from '@/lib/cn';

interface SustBadgeProps {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  className?: string;
}

const colorMap = {
  HIGH: {
    bg: 'bg-green-bg',
    dot: 'bg-green',
    text: 'text-green',
  },
  MEDIUM: {
    bg: 'bg-amber-bg',
    dot: 'bg-amber',
    text: 'text-amber',
  },
  LOW: {
    bg: 'bg-red-bg',
    dot: 'bg-red',
    text: 'text-red',
  },
};

export const SustBadge: React.FC<SustBadgeProps> = ({
  level,
  className,
}) => {
  const colors = colorMap[level];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2',
        colors.bg,
        className
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', colors.dot)} />
      <span className={cn('text-sm font-semibold', colors.text)}>
        {level} sustainability
      </span>
    </div>
  );
};

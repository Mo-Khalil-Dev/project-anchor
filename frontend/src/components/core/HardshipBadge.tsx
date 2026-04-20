import React from 'react';
import { cn } from '@/lib/cn';

interface HardshipBadgeProps {
  level: 'SEVERE' | 'MODERATE' | 'LOW' | 'NONE';
  className?: string;
}

const colorMap = {
  SEVERE: {
    bg: 'bg-red-bg',
    dot: 'bg-red',
    text: 'text-red',
  },
  MODERATE: {
    bg: 'bg-amber-bg',
    dot: 'bg-amber',
    text: 'text-amber',
  },
  LOW: {
    bg: 'bg-green-bg',
    dot: 'bg-green',
    text: 'text-green',
  },
  NONE: {
    bg: 'bg-gray-100',
    dot: 'bg-muted',
    text: 'text-muted',
  },
};

export const HardshipBadge: React.FC<HardshipBadgeProps> = ({
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
        {level}
      </span>
    </div>
  );
};

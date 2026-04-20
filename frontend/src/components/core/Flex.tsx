import React from 'react';
import { cn } from '@/lib/cn';

interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'between' | 'end';
  className?: string;
}

const gapMap = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
};

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  between: 'justify-between',
  end: 'justify-end',
};

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      children,
      direction = 'row',
      gap = 'md',
      align = 'start',
      justify = 'start',
      className,
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        'flex',
        `flex-${direction}`,
        gapMap[gap],
        alignMap[align],
        justifyMap[justify],
        className
      )}
    >
      {children}
    </div>
  )
);

Flex.displayName = 'Flex';

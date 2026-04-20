import React from 'react';
import { cn } from '@/lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  isLoading?: boolean;
}

const variantMap = {
  primary: 'bg-accent text-white hover:bg-accent-dark shadow-button-primary disabled:opacity-50',
  secondary: 'bg-transparent border border-border text-text hover:bg-accent-bg disabled:opacity-50',
  danger: 'bg-red text-white hover:opacity-90 disabled:opacity-50',
  success: 'bg-green text-white hover:opacity-90 disabled:opacity-50',
  ghost: 'bg-transparent text-accent hover:bg-accent-bg disabled:opacity-50',
};

const sizeMap = {
  sm: 'h-10 px-3 py-2 text-sm rounded-button-sm',
  md: 'h-12 px-6 py-3 text-base rounded-button',
  lg: 'h-14 px-8 py-4 text-base rounded-button',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      children,
      className,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all active:scale-97 disabled:cursor-not-allowed',
        variantMap[variant],
        sizeMap[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  )
);

Button.displayName = 'Button';

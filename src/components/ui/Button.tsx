import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'bull' | 'bear' | 'subtle';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary: 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm hover:shadow-brand-500/20',
      secondary: 'bg-surface-100 hover:bg-surface-50 text-slate-200 border border-surface-50/60',
      outline: 'bg-transparent hover:bg-surface-100 text-slate-300 border border-slate-700 hover:border-slate-500',
      ghost: 'bg-transparent hover:bg-surface-100 text-slate-300 hover:text-white',
      bull: 'bg-bull hover:bg-bull-light text-slate-950 font-semibold shadow-sm hover:shadow-bull/20',
      bear: 'bg-bear hover:bg-bear-light text-white font-semibold shadow-sm hover:shadow-bear/20',
      subtle: 'bg-surface-200/80 hover:bg-surface-100 text-slate-300 border border-slate-800',
    };

    const sizes = {
      xs: 'px-2 py-1 text-xs gap-1',
      sm: 'px-2.5 py-1.5 text-xs font-medium gap-1.5',
      md: 'px-3.5 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

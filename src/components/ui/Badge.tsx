import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'bull' | 'bear' | 'brand' | 'warning' | 'purple' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-md select-none';

  const variants = {
    default: 'bg-surface-100 text-slate-300 border border-slate-700/60',
    bull: 'bg-bull-bg text-bull border border-bull/30',
    bear: 'bg-bear-bg text-bear border border-bear/30',
    brand: 'bg-brand-500/15 text-brand-accent border border-brand-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    outline: 'bg-transparent text-slate-400 border border-slate-700',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-1 leading-tight',
    md: 'px-2 py-0.5 text-xs gap-1.5',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {children}
    </span>
  );
};

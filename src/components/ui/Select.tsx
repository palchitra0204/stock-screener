import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-surface-200 border border-slate-700/80 rounded-lg text-slate-100 text-sm py-2 pl-3 pr-8 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 appearance-none transition-colors duration-150',
                error && 'border-bear focus:border-bear focus:ring-bear',
                className
              )
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface-300 text-slate-100">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-bear">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

import React from 'react';
import { clsx } from 'clsx';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
}) => {
  return (
    <label className="inline-flex items-center cursor-pointer select-none gap-2.5">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={clsx(
            'rounded-full transition-colors duration-200 ease-in-out',
            size === 'sm' ? 'w-8 h-4.5' : 'w-10 h-5.5',
            checked ? 'bg-brand-500' : 'bg-surface-100 border border-slate-700',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <div
          className={clsx(
            'absolute top-0.5 bg-white rounded-full transition-transform duration-200 ease-in-out shadow',
            size === 'sm' ? 'w-3.5 h-3.5 left-0.5' : 'w-4.5 h-4.5 left-0.5',
            checked ? (size === 'sm' ? 'translate-x-3.5' : 'translate-x-4.5') : 'translate-x-0'
          )}
        />
      </div>
      {(label || description) && (
        <div className="text-left">
          {label && <span className="text-xs font-medium text-slate-200 block">{label}</span>}
          {description && <span className="text-[11px] text-slate-400 block">{description}</span>}
        </div>
      )}
    </label>
  );
};

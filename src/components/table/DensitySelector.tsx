import React from 'react';
import { TableDensity } from '@/types/stock';
import { useStockStore } from '@/stores/useStockStore';
import { AlignJustify, List, Rows } from 'lucide-react';
import { clsx } from 'clsx';

export const DensitySelector: React.FC = () => {
  const density = useStockStore((state) => state.density);
  const setDensity = useStockStore((state) => state.setDensity);

  const densities: { id: TableDensity; label: string; icon: React.ReactNode }[] = [
    { id: 'compact', label: 'Compact', icon: <AlignJustify className="w-3.5 h-3.5" /> },
    { id: 'normal', label: 'Normal', icon: <List className="w-3.5 h-3.5" /> },
    { id: 'comfortable', label: 'Comfortable', icon: <Rows className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="inline-flex bg-surface-400 p-0.5 rounded-lg border border-slate-800" role="group" aria-label="Table Density">
      {densities.map((d) => {
        const isActive = density === d.id;
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => setDensity(d.id)}
            className={clsx(
              'flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-all',
              isActive
                ? 'bg-surface-100 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
            title={`${d.label} Row Density`}
          >
            {d.icon}
            <span className="hidden sm:inline">{d.label}</span>
          </button>
        );
      })}
    </div>
  );
};

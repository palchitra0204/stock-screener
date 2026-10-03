import React from 'react';
import { PresetScreen } from '@/types/filter';
import { PRESET_SCREENS } from '@/lib/constants';
import { useFilterStore } from '@/stores/useFilterStore';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Trash2, Check } from 'lucide-react';

export const PresetScreens: React.FC = () => {
  const activePresetId = useFilterStore((state) => state.activePresetId);
  const applyPreset = useFilterStore((state) => state.applyPreset);
  const customPresets = useFilterStore((state) => state.customPresets);
  const deleteCustomPreset = useFilterStore((state) => state.deleteCustomPreset);

  const allPresets = [...PRESET_SCREENS, ...customPresets];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
          <span>Preset Screeners ({allPresets.length})</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {allPresets.map((preset) => {
          const isActive = activePresetId === preset.id;

          return (
            <div
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between relative group ${
                isActive
                  ? 'bg-brand-500/15 border-brand-500 shadow-md shadow-brand-500/10'
                  : 'bg-surface-300 hover:bg-surface-200/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-semibold text-xs text-slate-100 line-clamp-1">
                    {preset.name}
                  </span>
                  {isActive && (
                    <span className="w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60">
                <Badge
                  variant={preset.isCustom ? 'purple' : 'brand'}
                  size="sm"
                >
                  {preset.badge || (preset.isCustom ? 'Custom' : 'Preset')}
                </Badge>

                {preset.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCustomPreset(preset.id);
                    }}
                    className="text-slate-500 hover:text-bear p-1 rounded transition-colors"
                    title="Delete custom preset"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

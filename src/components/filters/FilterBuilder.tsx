import React, { useState } from 'react';
import { useFilterStore } from '@/stores/useFilterStore';
import { useStockStore } from '@/stores/useStockStore';
import { SECTORS, MARKET_CAP_CATEGORIES } from '@/lib/constants';
import { FilterGroupComponent } from './FilterGroupComponent';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { SlidersHorizontal, BookmarkPlus, Sparkles, Building2, PieChart } from 'lucide-react';
import { clsx } from 'clsx';

export const FilterBuilder: React.FC = () => {
  const isFilterDrawerOpen = useStockStore((state) => state.isFilterDrawerOpen);
  const setFilterDrawerOpen = useStockStore((state) => state.setFilterDrawerOpen);
  const filteredStocks = useStockStore((state) => state.filteredStocks);
  const stocks = useStockStore((state) => state.stocks);
  const lastFilterDurationMs = useStockStore((state) => state.lastFilterDurationMs);

  const filterGroup = useFilterStore((state) => state.filterGroup);
  const selectedSectors = useFilterStore((state) => state.selectedSectors);
  const toggleSector = useFilterStore((state) => state.toggleSector);
  const setSelectedSectors = useFilterStore((state) => state.setSelectedSectors);
  const selectedMcap = useFilterStore((state) => state.selectedMcap);
  const toggleMcap = useFilterStore((state) => state.toggleMcap);
  const setSelectedMcap = useFilterStore((state) => state.setSelectedMcap);

  const setCombinator = useFilterStore((state) => state.setCombinator);
  const addRule = useFilterStore((state) => state.addRule);
  const updateRule = useFilterStore((state) => state.updateRule);
  const removeRule = useFilterStore((state) => state.removeRule);
  const toggleRule = useFilterStore((state) => state.toggleRule);
  const resetFilters = useFilterStore((state) => state.resetFilters);
  const saveCustomPreset = useFilterStore((state) => state.saveCustomPreset);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDesc, setPresetDesc] = useState('');

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;
    saveCustomPreset(presetName.trim(), presetDesc.trim() || 'Custom user screener');
    setPresetName('');
    setPresetDesc('');
    setIsSaveModalOpen(false);
  };

  return (
    <>
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-brand-accent" />
            <span>Financial & Technical Screener Builder</span>
          </div>
        }
        subtitle="Filter 5,000+ Indian stocks with composite AND / OR logical rules"
        size="xl"
      >
        <div className="space-y-6">
          {/* Live Screener Match Header Banner */}
          <div className="bg-gradient-to-r from-brand-600/20 via-surface-400 to-cyan-500/10 border border-brand-500/30 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  {filteredStocks.length}
                </span>
                <span className="text-xs text-slate-300">
                  stocks matched out of <span className="font-mono text-slate-200">{stocks.length}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Evaluation latency:{' '}
                <span className="text-bull font-mono font-medium">{lastFilterDurationMs}ms</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSaveModalOpen(true)}
                leftIcon={<BookmarkPlus className="w-3.5 h-3.5 text-brand-accent" />}
                disabled={filterGroup.rules.length === 0}
              >
                Save as Preset
              </Button>
            </div>
          </div>

          {/* Market Cap Segments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-brand-accent" />
                <span>Market Cap Segment</span>
              </label>
              {selectedMcap.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedMcap([])}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                >
                  Clear ({selectedMcap.length})
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {MARKET_CAP_CATEGORIES.map((mcap) => {
                const isSelected = selectedMcap.includes(mcap);
                return (
                  <button
                    key={mcap}
                    type="button"
                    onClick={() => toggleMcap(mcap)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150',
                      isSelected
                        ? 'bg-brand-600 border-brand-500 text-white shadow-sm'
                        : 'bg-surface-200 hover:bg-surface-100 border-slate-700/80 text-slate-300'
                    )}
                  >
                    {mcap}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sectors Multi-Select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand-accent" />
                <span>Sectors ({selectedSectors.length ? selectedSectors.length : 'All 18'})</span>
              </label>
              {selectedSectors.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSectors([])}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                >
                  Clear ({selectedSectors.length})
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {SECTORS.map((sector) => {
                const isSelected = selectedSectors.includes(sector);
                return (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => toggleSector(sector)}
                    className={clsx(
                      'px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all duration-150',
                      isSelected
                        ? 'bg-brand-500/20 border-brand-500 text-brand-accent shadow-sm'
                        : 'bg-surface-200/80 hover:bg-surface-100 border-slate-800 text-slate-400'
                    )}
                  >
                    {sector}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic AND/OR Group & Rules */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
                <span>Custom Filter Rules</span>
              </label>
            </div>

            <FilterGroupComponent
              group={filterGroup}
              onUpdateRule={updateRule}
              onRemoveRule={removeRule}
              onToggleRule={toggleRule}
              onAddRule={addRule}
              onSetCombinator={setCombinator}
              onReset={resetFilters}
            />
          </div>
        </div>
      </Drawer>

      {/* Save Custom Preset Modal */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save Screener as Custom Preset"
        description="Save your current filter configuration for one-click access in the future."
        maxWidth="md"
      >
        <form onSubmit={handleSavePreset} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Preset Name *
            </label>
            <Input
              required
              placeholder="e.g. My High Momentum Value Picks"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Description (Optional)
            </label>
            <Input
              placeholder="e.g. Companies with ROE > 20% and RSI oversold bounce"
              value={presetDesc}
              onChange={(e) => setPresetDesc(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsSaveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Screener
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

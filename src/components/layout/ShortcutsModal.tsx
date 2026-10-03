import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { useStockStore } from '@/stores/useStockStore';
import { Command, Sparkles } from 'lucide-react';

export const ShortcutsModal: React.FC = () => {
  const isShortcutsModalOpen = useStockStore((state) => state.isShortcutsModalOpen);
  const setShortcutsModalOpen = useStockStore((state) => state.setShortcutsModalOpen);

  const shortcuts = [
    { key: '/', description: 'Focus Quick Search bar across 5,000+ stocks' },
    { key: 'F', description: 'Toggle Financial & Technical Filter Builder' },
    { key: 'W', description: 'Open Watchlists & Portfolios Drawer' },
    { key: 'C', description: 'Open Interactive Candlestick Chart for selected stock' },
    { key: 'B', description: 'Open Performance & Latency Benchmark modal' },
    { key: 'P', description: 'Toggle Real-Time WebSocket Streaming (Pause / Resume)' },
    { key: 'Esc', description: 'Close any open modal or drawer' },
    { key: '?', description: 'Show this keyboard shortcuts guide' },
  ];

  return (
    <Modal
      isOpen={isShortcutsModalOpen}
      onClose={() => setShortcutsModalOpen(false)}
      title={
        <div className="flex items-center gap-2">
          <Command className="w-5 h-5 text-brand-accent" />
          <span>Keyboard Shortcuts</span>
        </div>
      }
      description="Navigate the Indian stock screener at terminal velocity"
      maxWidth="md"
    >
      <div className="space-y-3">
        <div className="bg-surface-200/50 p-3 rounded-lg border border-slate-800 flex items-center gap-2 text-xs text-brand-accent">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>Press any of the shortcut keys anywhere on the dashboard for instant action.</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-slate-300">{s.description}</span>
              <kbd className="px-2.5 py-1 bg-surface-100 border border-slate-700 rounded text-xs font-mono text-slate-200 shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

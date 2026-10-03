import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { useStockStore } from '@/stores/useStockStore';
import { CandlestickChart } from './CandlestickChart';
import { LineChart } from 'lucide-react';

export const ChartModal: React.FC = () => {
  const isChartModalOpen = useStockStore((state) => state.isChartModalOpen);
  const setChartModalOpen = useStockStore((state) => state.setChartModalOpen);
  const selectedStock = useStockStore((state) => state.selectedStock);

  if (!selectedStock) return null;

  return (
    <Modal
      isOpen={isChartModalOpen}
      onClose={() => setChartModalOpen(false)}
      title={
        <div className="flex items-center gap-2">
          <LineChart className="w-5 h-5 text-brand-accent" />
          <span>
            {selectedStock.symbol} • {selectedStock.name}
          </span>
        </div>
      }
      description={`252-Day Interactive Candlestick & Technical Analysis • ${selectedStock.exchange}`}
      maxWidth="6xl"
    >
      <div className="py-2">
        <CandlestickChart stock={selectedStock} height={520} />
      </div>
    </Modal>
  );
};

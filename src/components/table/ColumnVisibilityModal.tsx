import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { useStockStore } from '@/stores/useStockStore';
import { FILTER_METRICS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Columns3, CheckSquare, Square, RotateCcw } from 'lucide-react';

export interface ColumnVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_AVAILABLE_COLUMNS = [
  // Overview
  { id: 'symbol', label: 'Symbol', category: 'Overview' },
  { id: 'name', label: 'Company Name', category: 'Overview' },
  { id: 'sector', label: 'Sector', category: 'Overview' },
  { id: 'industry', label: 'Industry', category: 'Overview' },
  { id: 'marketCapCategory', label: 'Market Cap Class', category: 'Overview' },
  // Price & Volume
  { id: 'price', label: 'Current Price', category: 'Price & Volume' },
  { id: 'changePercent', label: '1D Change (%)', category: 'Price & Volume' },
  { id: 'change', label: '1D Change (₹)', category: 'Price & Volume' },
  { id: 'volume', label: 'Volume (Shares)', category: 'Price & Volume' },
  { id: 'volumeSpike', label: 'Volume Spike (x)', category: 'Price & Volume' },
  { id: 'deliveryPercent', label: 'Delivery (%)', category: 'Price & Volume' },
  { id: 'dayHigh', label: 'Day High', category: 'Price & Volume' },
  { id: 'dayLow', label: 'Day Low', category: 'Price & Volume' },
  // Valuation
  { id: 'marketCap', label: 'Market Cap (₹ Cr)', category: 'Valuation' },
  { id: 'pe', label: 'P/E (TTM)', category: 'Valuation' },
  { id: 'industryPe', label: 'Industry P/E', category: 'Valuation' },
  { id: 'pb', label: 'P/B Ratio', category: 'Valuation' },
  { id: 'evToEbitda', label: 'EV / EBITDA', category: 'Valuation' },
  { id: 'dividendYield', label: 'Dividend Yield (%)', category: 'Valuation' },
  { id: 'pegRatio', label: 'PEG Ratio', category: 'Valuation' },
  // Quality & Financials
  { id: 'roe', label: 'ROE (%)', category: 'Quality & Financials' },
  { id: 'roce', label: 'ROCE (%)', category: 'Quality & Financials' },
  { id: 'debtToEquity', label: 'Debt to Equity', category: 'Quality & Financials' },
  { id: 'operatingMargin', label: 'Operating Margin (%)', category: 'Quality & Financials' },
  { id: 'profitMargin', label: 'Net Profit Margin (%)', category: 'Quality & Financials' },
  { id: 'freeCashFlow', label: 'Free Cash Flow (₹ Cr)', category: 'Quality & Financials' },
  { id: 'revenueGrowth1Y', label: '1Y Revenue Growth (%)', category: 'Quality & Financials' },
  { id: 'epsGrowth3Y', label: '3Y EPS CAGR (%)', category: 'Quality & Financials' },
  // Technicals
  { id: 'rsi14', label: 'RSI (14)', category: 'Technicals' },
  { id: 'week52High', label: '52W High', category: 'Technicals' },
  { id: 'week52Low', label: '52W Low', category: 'Technicals' },
  { id: 'distanceFrom52WHigh', label: 'Distance from 52W High (%)', category: 'Technicals' },
  { id: 'distanceFrom52WLow', label: 'Distance from 52W Low (%)', category: 'Technicals' },
  { id: 'beta', label: 'Beta (Volatility)', category: 'Technicals' },
  { id: 'change1W', label: '1W Return (%)', category: 'Technicals' },
  { id: 'change1M', label: '1M Return (%)', category: 'Technicals' },
  { id: 'change1Y', label: '1Y Return (%)', category: 'Technicals' },
];

const DEFAULT_VISIBLE = [
  'symbol',
  'name',
  'price',
  'changePercent',
  'volume',
  'marketCap',
  'pe',
  'roe',
  'rsi14',
  'sector',
  'week52High',
  'week52Low',
];

export const ColumnVisibilityModal: React.FC<ColumnVisibilityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const visibleColumns = useStockStore((state) => state.visibleColumns);
  const toggleColumnVisibility = useStockStore((state) => state.toggleColumnVisibility);
  const setVisibleColumns = useStockStore((state) => state.setVisibleColumns);

  const categories = Array.from(new Set(ALL_AVAILABLE_COLUMNS.map((c) => c.category)));

  const handleSelectAll = () => {
    setVisibleColumns(ALL_AVAILABLE_COLUMNS.map((c) => c.id));
  };

  const handleReset = () => {
    setVisibleColumns(DEFAULT_VISIBLE);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Columns3 className="w-5 h-5 text-brand-accent" />
          <span>Customize Stock Table Columns</span>
        </div>
      }
      description="Choose the financial ratios, valuation metrics, and technical indicators to display."
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs text-slate-400 font-mono">
            {visibleColumns.length} of {ALL_AVAILABLE_COLUMNS.length} columns active
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-brand-accent hover:underline"
            >
              Select All
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => {
            const cols = ALL_AVAILABLE_COLUMNS.filter((c) => c.category === cat);
            return (
              <div key={cat} className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-1 border-b border-slate-800/80">
                  {cat}
                </h4>
                <div className="space-y-1.5">
                  {cols.map((col) => {
                    const isVisible = visibleColumns.includes(col.id);
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => toggleColumnVisibility(col.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                          isVisible
                            ? 'bg-surface-200 text-slate-100 hover:bg-surface-100'
                            : 'bg-surface-400/60 text-slate-500 hover:text-slate-300 hover:bg-surface-400'
                        }`}
                      >
                        <span className="font-medium">{col.label}</span>
                        {isVisible ? (
                          <CheckSquare className="w-4 h-4 text-brand-500 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

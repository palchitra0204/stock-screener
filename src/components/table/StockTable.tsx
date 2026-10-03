import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { StockQuote } from '@/types/stock';
import { useStockStore } from '@/stores/useStockStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { DensitySelector } from './DensitySelector';
import { ColumnVisibilityModal } from './ColumnVisibilityModal';
import {
  formatINR,
  formatMarketCap,
  formatPercent,
  formatRatio,
  formatVolume,
} from '@/lib/formatters';
import { exportToCSV, exportToJSON } from '@/lib/export-utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  LineChart,
  Download,
  Columns3,
  TrendingUp,
  TrendingDown,
  Info,
  Layers,
} from 'lucide-react';
import { clsx } from 'clsx';

export const StockTable: React.FC = () => {
  const filteredStocks = useStockStore((state) => state.filteredStocks);
  const density = useStockStore((state) => state.density);
  const visibleColumns = useStockStore((state) => state.visibleColumns);
  const tickFlashes = useStockStore((state) => state.tickFlashes);
  const setSelectedStock = useStockStore((state) => state.setSelectedStock);
  const setDetailDrawerOpen = useStockStore((state) => state.setDetailDrawerOpen);
  const setChartModalOpen = useStockStore((state) => state.setChartModalOpen);
  const sortColumn = useStockStore((state) => state.sortColumn);
  const sortDirection = useStockStore((state) => state.sortDirection);
  const setSortingState = useStockStore((state) => state.setSorting);

  const toggleWatchlistSymbol = useWatchlistStore((state) => state.toggleSymbol);
  const isSymbolInActiveWatchlist = useWatchlistStore((state) => state.isSymbolInActiveWatchlist);

  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: sortColumn, desc: sortDirection === 'desc' },
  ]);

  const parentRef = useRef<HTMLDivElement>(null);

  // Sync sorting with Zustand
  const handleSortingChange = (updater: any) => {
    const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
    setSorting(newSorting);
    if (newSorting.length > 0) {
      setSortingState(newSorting[0].id, newSorting[0].desc ? 'desc' : 'asc');
    }
  };

  // Row heights based on density
  const rowHeight = useMemo(() => {
    switch (density) {
      case 'compact':
        return 36;
      case 'comfortable':
        return 56;
      case 'normal':
      default:
        return 46;
    }
  }, [density]);

  // Define columns
  const columns = useMemo<ColumnDef<StockQuote>[]>(() => {
    const allCols: ColumnDef<StockQuote>[] = [
      // Actions & Star Column (Sticky left)
      {
        id: 'actions',
        header: '',
        size: 70,
        enableSorting: false,
        cell: ({ row }) => {
          const isStarred = isSymbolInActiveWatchlist(row.original.symbol);
          return (
            <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => toggleWatchlistSymbol(row.original.symbol)}
                className={clsx(
                  'p-1 rounded transition-colors',
                  isStarred
                    ? 'text-amber-400 hover:text-amber-300'
                    : 'text-slate-600 hover:text-slate-400'
                )}
                title={isStarred ? 'Remove from watchlist' : 'Add to watchlist'}
                aria-label={`Toggle watchlist for ${row.original.symbol}`}
              >
                <Star className={clsx('w-3.5 h-3.5', isStarred && 'fill-amber-400')} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedStock(row.original);
                  setChartModalOpen(true);
                }}
                className="p-1 rounded text-slate-500 hover:text-brand-accent transition-colors"
                title="Open Candlestick Chart"
                aria-label={`Open chart for ${row.original.symbol}`}
              >
                <LineChart className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
      },
      // Symbol (Sticky Left)
      {
        accessorKey: 'symbol',
        id: 'symbol',
        header: 'Symbol',
        size: 110,
        cell: ({ row }) => (
          <div className="font-mono font-bold text-slate-100 flex items-center gap-1.5">
            <span>{row.original.symbol}</span>
            <span className="text-[10px] px-1 py-0.2 bg-surface-100 text-slate-400 rounded font-sans">
              {row.original.exchange}
            </span>
          </div>
        ),
      },
      // Company Name
      {
        accessorKey: 'name',
        id: 'name',
        header: 'Company Name',
        size: 210,
        cell: ({ row }) => (
          <div className="truncate max-w-[200px]" title={row.original.name}>
            <span className="text-slate-200 font-medium text-xs">{row.original.name}</span>
            <span className="text-[11px] text-slate-400 block truncate font-normal">
              {row.original.industry}
            </span>
          </div>
        ),
      },
      // Price (Live updating)
      {
        accessorKey: 'price',
        id: 'price',
        header: 'Price (₹)',
        size: 110,
        cell: ({ row }) => {
          const flash = tickFlashes[row.original.symbol];
          return (
            <div
              className={clsx(
                'font-mono font-semibold tabular-nums text-right px-2 py-0.5 rounded transition-colors',
                flash?.direction === 'up' && 'animate-flash-green text-bull',
                flash?.direction === 'down' && 'animate-flash-red text-bear'
              )}
            >
              {formatINR(row.original.price)}
            </div>
          );
        },
      },
      // 1D Change (%)
      {
        accessorKey: 'changePercent',
        id: 'changePercent',
        header: '1D Change (%)',
        size: 115,
        cell: ({ row }) => {
          const isGain = row.original.changePercent >= 0;
          return (
            <div
              className={clsx(
                'flex items-center justify-end font-mono font-semibold text-xs tabular-nums',
                isGain ? 'text-bull' : 'text-bear'
              )}
            >
              {isGain ? (
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 mr-1" />
              )}
              <span>{formatPercent(row.original.changePercent)}</span>
            </div>
          );
        },
      },
      // 1D Change (₹)
      {
        accessorKey: 'change',
        id: 'change',
        header: '1D Change (₹)',
        size: 105,
        cell: ({ row }) => {
          const isGain = row.original.change >= 0;
          return (
            <div
              className={clsx(
                'text-right font-mono text-xs tabular-nums',
                isGain ? 'text-bull' : 'text-bear'
              )}
            >
              {formatINR(row.original.change)}
            </div>
          );
        },
      },
      // Market Cap (₹ Cr)
      {
        accessorKey: 'marketCap',
        id: 'marketCap',
        header: 'Market Cap',
        size: 130,
        cell: ({ row }) => (
          <div className="text-right font-mono font-medium text-slate-200">
            {formatMarketCap(row.original.marketCap)}
          </div>
        ),
      },
      // P/E Ratio
      {
        accessorKey: 'pe',
        id: 'pe',
        header: 'P/E (TTM)',
        size: 90,
        cell: ({ row }) => (
          <div className="text-right font-mono text-slate-300">
            {formatRatio(row.original.pe, 1)}
          </div>
        ),
      },
      // ROE (%)
      {
        accessorKey: 'roe',
        id: 'roe',
        header: 'ROE (%)',
        size: 95,
        cell: ({ row }) => {
          const roe = row.original.roe;
          return (
            <div
              className={clsx(
                'text-right font-mono font-medium',
                roe >= 20 ? 'text-bull font-bold' : roe >= 12 ? 'text-slate-200' : 'text-slate-400'
              )}
            >
              {formatPercent(roe, false)}
            </div>
          );
        },
      },
      // RSI (14)
      {
        accessorKey: 'rsi14',
        id: 'rsi14',
        header: 'RSI (14)',
        size: 95,
        cell: ({ row }) => {
          const rsi = row.original.rsi14;
          return (
            <div className="text-right font-mono">
              <span
                className={clsx(
                  'px-1.5 py-0.5 rounded text-xs',
                  rsi >= 70
                    ? 'bg-bear-bg text-bear font-semibold'
                    : rsi <= 30
                    ? 'bg-bull-bg text-bull font-semibold'
                    : 'text-slate-300'
                )}
              >
                {rsi.toFixed(1)}
              </span>
            </div>
          );
        },
      },
      // Volume
      {
        accessorKey: 'volume',
        id: 'volume',
        header: 'Volume',
        size: 105,
        cell: ({ row }) => (
          <div className="text-right font-mono text-slate-300">
            {formatVolume(row.original.volume)}
          </div>
        ),
      },
      // Volume Spike (x)
      {
        accessorKey: 'volumeSpike',
        id: 'volumeSpike',
        header: 'Vol Spike',
        size: 95,
        cell: ({ row }) => {
          const spike = row.original.volumeSpike;
          return (
            <div
              className={clsx(
                'text-right font-mono text-xs',
                spike >= 2.0 ? 'text-cyan-400 font-bold' : 'text-slate-400'
              )}
            >
              {formatRatio(spike, 2)}
            </div>
          );
        },
      },
      // Sector
      {
        accessorKey: 'sector',
        id: 'sector',
        header: 'Sector',
        size: 180,
        cell: ({ row }) => (
          <div className="truncate max-w-[170px] text-xs text-slate-300" title={row.original.sector}>
            {row.original.sector}
          </div>
        ),
      },
      // 52W High
      {
        accessorKey: 'week52High',
        id: 'week52High',
        header: '52W High',
        size: 105,
        cell: ({ row }) => (
          <div className="text-right font-mono text-slate-300 text-xs">
            {formatINR(row.original.week52High)}
          </div>
        ),
      },
      // 52W Low
      {
        accessorKey: 'week52Low',
        id: 'week52Low',
        header: '52W Low',
        size: 105,
        cell: ({ row }) => (
          <div className="text-right font-mono text-slate-300 text-xs">
            {formatINR(row.original.week52Low)}
          </div>
        ),
      },
      // Distance from 52W High
      {
        accessorKey: 'distanceFrom52WHigh',
        id: 'distanceFrom52WHigh',
        header: 'vs 52W High',
        size: 105,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-slate-400">
            {formatPercent(row.original.distanceFrom52WHigh)}
          </div>
        ),
      },
      // P/B Ratio
      {
        accessorKey: 'pb',
        id: 'pb',
        header: 'P/B',
        size: 85,
        cell: ({ row }) => (
          <div className="text-right font-mono text-slate-300 text-xs">
            {formatRatio(row.original.pb, 2)}
          </div>
        ),
      },
      // Dividend Yield (%)
      {
        accessorKey: 'dividendYield',
        id: 'dividendYield',
        header: 'Div Yield',
        size: 95,
        cell: ({ row }) => (
          <div className="text-right font-mono text-slate-300 text-xs">
            {formatPercent(row.original.dividendYield, false)}
          </div>
        ),
      },
      // ROCE (%)
      {
        accessorKey: 'roce',
        id: 'roce',
        header: 'ROCE (%)',
        size: 95,
        cell: ({ row }) => (
          <div className="text-right font-mono text-slate-300 text-xs">
            {formatPercent(row.original.roce, false)}
          </div>
        ),
      },
      // Debt to Equity
      {
        accessorKey: 'debtToEquity',
        id: 'debtToEquity',
        header: 'D/E Ratio',
        size: 95,
        cell: ({ row }) => (
          <div className="text-right font-mono text-slate-300 text-xs">
            {formatRatio(row.original.debtToEquity, 2)}
          </div>
        ),
      },
      // 1Y Return (%)
      {
        accessorKey: 'change1Y',
        id: 'change1Y',
        header: '1Y Return',
        size: 105,
        cell: ({ row }) => {
          const isGain = row.original.change1Y >= 0;
          return (
            <div
              className={clsx(
                'text-right font-mono text-xs font-medium',
                isGain ? 'text-bull' : 'text-bear'
              )}
            >
              {formatPercent(row.original.change1Y)}
            </div>
          );
        },
      },
      // Market Cap Category
      {
        accessorKey: 'marketCapCategory',
        id: 'marketCapCategory',
        header: 'Cap Class',
        size: 110,
        cell: ({ row }) => {
          const cat = row.original.marketCapCategory;
          const variant =
            cat === 'Large Cap'
              ? 'brand'
              : cat === 'Mid Cap'
              ? 'purple'
              : cat === 'Small Cap'
              ? 'warning'
              : 'default';
          return (
            <Badge variant={variant} size="sm">
              {cat}
            </Badge>
          );
        },
      },
    ];

    // Filter columns based on visibleColumns preference (always keep actions & symbol)
    return allCols.filter(
      (c) => c.id === 'actions' || c.id === 'symbol' || visibleColumns.includes(c.id as string)
    );
  }, [visibleColumns, isSymbolInActiveWatchlist, tickFlashes, toggleWatchlistSymbol, setSelectedStock, setChartModalOpen]);

  const table = useReactTable({
    data: filteredStocks,
    columns,
    state: { sorting },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  // Virtualizer for 5,000+ items
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 15,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();

  const handleRowClick = (stock: StockQuote) => {
    setSelectedStock(stock);
    setDetailDrawerOpen(true);
  };

  return (
    <div className="w-full bg-surface-300 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Table Toolbar */}
      <div className="p-3 bg-surface-400/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-accent" />
              <span>Stock Grid</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-accent font-mono font-medium">
              {filteredStocks.length.toLocaleString('en-IN')} stocks
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Table Density selector */}
          <DensitySelector />
        </div>

        <div className="flex items-center space-x-2">
          {/* Columns customization */}
          <Button
            variant="subtle"
            size="sm"
            onClick={() => setIsColumnModalOpen(true)}
            leftIcon={<Columns3 className="w-3.5 h-3.5" />}
          >
            Columns ({visibleColumns.length})
          </Button>

          {/* Export Actions */}
          <div className="relative inline-flex rounded-lg shadow-sm">
            <Button
              variant="subtle"
              size="sm"
              onClick={() => exportToCSV(filteredStocks)}
              leftIcon={<Download className="w-3.5 h-3.5 text-slate-300" />}
              title="Export filtered stocks to CSV"
            >
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Virtual Table Container */}
      <div
        ref={parentRef}
        className="w-full h-[640px] overflow-auto relative bg-surface-500/40 select-text"
        role="grid"
        aria-rowcount={rows.length}
        aria-colcount={columns.length}
      >
        <table className="w-full border-collapse text-left text-xs font-sans">
          {/* Sticky Table Header */}
          <thead className="sticky top-0 z-20 bg-surface-300 shadow-md">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-800">
                {headerGroup.headers.map((header) => {
                  const isStickyAction = header.column.id === 'actions';
                  const isStickySymbol = header.column.id === 'symbol';
                  const sortDir = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={clsx(
                        'px-3 py-3 text-slate-400 font-semibold uppercase tracking-wider text-[11px] select-none',
                        header.column.getCanSort() && 'cursor-pointer hover:text-slate-100 hover:bg-surface-200/50',
                        isStickyAction && 'sticky left-0 z-30 bg-surface-300 w-[70px]',
                        isStickySymbol && 'sticky left-[70px] z-30 bg-surface-300 w-[110px]'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                          <span className="text-slate-500">
                            {sortDir === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-brand-accent" />
                            ) : sortDir === 'desc' ? (
                              <ArrowDown className="w-3 h-3 text-brand-accent" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* Virtual Rows Body */}
          <tbody
            style={{
              height: `${totalHeight}px`,
              position: 'relative',
            }}
          >
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              const isGain = row.original.changePercent >= 0;

              return (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row.original)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="border-b border-slate-800/60 hover:bg-surface-200/90 cursor-pointer transition-colors flex items-center group"
                >
                  {row.getVisibleCells().map((cell) => {
                    const isStickyAction = cell.column.id === 'actions';
                    const isStickySymbol = cell.column.id === 'symbol';

                    return (
                      <td
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className={clsx(
                          'px-3 text-slate-200 shrink-0 flex items-center h-full',
                          isStickyAction && 'sticky left-0 z-10 bg-surface-300 group-hover:bg-surface-200/90 shadow-r',
                          isStickySymbol && 'sticky left-[70px] z-10 bg-surface-300 group-hover:bg-surface-200/90 shadow-r'
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Info className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No stocks match your filter criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try broadening your search or resetting some filter conditions.</p>
          </div>
        )}
      </div>

      {/* Column Visibility Customizer Modal */}
      <ColumnVisibilityModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
      />
    </div>
  );
};

import React, { useEffect, useTransition } from 'react';
import Head from 'next/head';
import { useStockStore } from '@/stores/useStockStore';
import { useFilterStore } from '@/stores/useFilterStore';
import { filterStocks } from '@/lib/filter-engine';

// Components
import { Header } from '@/components/layout/Header';
import { TickerTape } from '@/components/layout/TickerTape';
import { Footer } from '@/components/layout/Footer';
import { ShortcutsModal } from '@/components/layout/ShortcutsModal';

import { MarketOverviewCards } from '@/components/analytics/MarketOverviewCards';
import { SectorHeatmap } from '@/components/analytics/SectorHeatmap';
import { PerformanceBenchmarkModal } from '@/components/analytics/PerformanceBenchmarkModal';

import { PresetScreens } from '@/components/filters/PresetScreens';
import { ActiveFilterChips } from '@/components/filters/ActiveFilterChips';
import { FilterBuilder } from '@/components/filters/FilterBuilder';

import { StockTable } from '@/components/table/StockTable';
import { StockDetailDrawer } from '@/components/stock-detail/StockDetailDrawer';
import { ChartModal } from '@/components/chart/ChartModal';
import { WatchlistDrawer } from '@/components/watchlist/WatchlistDrawer';

export default function Home() {
  const stocks = useStockStore((state) => state.stocks);
  const setFilteredStocks = useStockStore((state) => state.setFilteredStocks);

  const filterGroup = useFilterStore((state) => state.filterGroup);
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const selectedSectors = useFilterStore((state) => state.selectedSectors);
  const selectedMcap = useFilterStore((state) => state.selectedMcap);

  const [, startTransition] = useTransition();

  // Run high-performance filtering pipeline when dependencies change
  useEffect(() => {
    if (stocks.length === 0) return;

    startTransition(() => {
      const result = filterStocks(
        stocks,
        filterGroup,
        searchQuery,
        selectedSectors,
        selectedMcap
      );
      setFilteredStocks(result.data, result.durationMs);
    });
  }, [stocks, filterGroup, searchQuery, selectedSectors, selectedMcap, setFilteredStocks]);

  return (
    <>
      <Head>
        <title>BharatScreener Pro 1A | Real-Time Indian Stock Screener</title>
        <meta
          name="description"
          content="High-performance real-time Indian stock screener with 5,000+ stocks, 30+ financial filters, AND/OR logic, 252-day candlestick charts, and sub-50ms WebSocket streaming."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-background text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
        {/* Header */}
        <Header />

        {/* Real-time Ticker Tape Marquee */}
        <TickerTape />

        {/* Main Content Dashboard */}
        <main className="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-6 py-4 space-y-4">
          {/* Top: Market Overview Metrics */}
          <MarketOverviewCards />

          {/* Strategy Preset Screeners */}
          <PresetScreens />

          {/* Active Filter Removable Badges */}
          <ActiveFilterChips />

          {/* Sector Heatmap & Treemap */}
          <SectorHeatmap />

          {/* Main Virtualized Stock Table */}
          <StockTable />
        </main>

        {/* Modals and Side Drawers */}
        <FilterBuilder />
        <StockDetailDrawer />
        <ChartModal />
        <WatchlistDrawer />
        <PerformanceBenchmarkModal />
        <ShortcutsModal />

        {/* Footer with Performance Telemetry */}
        <Footer />
      </div>
    </>
  );
}

import type { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStockStore } from '@/stores/useStockStore';
import { useFilterStore } from '@/stores/useFilterStore';
import { useWatchlistStore } from '@/stores/useWatchlistStore';
import { useWebSocketStore } from '@/stores/useWebSocketStore';
import { wsClient } from '@/lib/websocket-client';
import { getCachedStockQuotes } from '@/lib/mock-generator';
import { storage } from '@/lib/storage';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  const setStocks = useStockStore((state) => state.setStocks);
  const applyPriceTicks = useStockStore((state) => state.applyPriceTicks);
  const setOfflineStatus = useStockStore((state) => state.setOfflineStatus);
  const setFPS = useStockStore((state) => state.setFPS);

  const setWSStatus = useWebSocketStore((state) => state.setStatus);
  const setLatency = useWebSocketStore((state) => state.setLatency);
  const incrementTicks = useWebSocketStore((state) => state.incrementTicks);

  // Global App Lifecycle Initialization
  useEffect(() => {
    // 1. Initialize 5,000+ realistic stocks
    const allStocks = getCachedStockQuotes(5000);
    setStocks(allStocks);
    wsClient.setStockCatalog(allStocks);
    storage.cacheStockQuotes(allStocks);

    // 2. Hydrate client-side saved presets and watchlists
    const savedWatchlists = storage.getWatchlists();
    if (savedWatchlists && savedWatchlists.length > 0) {
      useWatchlistStore.setState({ watchlists: savedWatchlists, activeWatchlistId: savedWatchlists[0].id });
    }
    const savedPresets = storage.getCustomPresets();
    if (savedPresets && savedPresets.length > 0) {
      useFilterStore.setState({ customPresets: savedPresets });
    }

    // 3. Setup WebSocket client subscriptions
    const unsubTicks = wsClient.onTicks((ticks) => {
      applyPriceTicks(ticks);
      incrementTicks(ticks.length);
    });

    const unsubStatus = wsClient.onStatusChange((status) => {
      setWSStatus(status);
    });

    const unsubLatency = wsClient.onLatency((lat) => {
      setLatency(lat);
    });

    wsClient.connect();

    // 4. Online/Offline network listeners
    const handleOnline = () => {
      setOfflineStatus(false);
      wsClient.connect();
    };

    const handleOffline = () => {
      setOfflineStatus(true);
      wsClient.pause();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 5. Smooth FPS monitor
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const calcFPS = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const measuredFPS = Math.round((frameCount * 1000) / (now - lastTime));
        setFPS(measuredFPS);
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(calcFPS);
    };

    animId = requestAnimationFrame(calcFPS);

    return () => {
      unsubTicks();
      unsubStatus();
      unsubLatency();
      wsClient.disconnect();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      cancelAnimationFrame(animId);
    };
  }, [
    setStocks,
    applyPriceTicks,
    setOfflineStatus,
    setFPS,
    setWSStatus,
    setLatency,
    incrementTicks,
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

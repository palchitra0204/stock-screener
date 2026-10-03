# BharatScreener Pro 1A: Errata, Trade-Offs & Edge Cases

## 1. High-Frequency WebSocket Streaming vs React 18 Concurrent Render Thrashing

### Issue:
Disptaching 50+ individual WebSocket ticks per second directly into React `setState` causes severe render thrashing, dropped frames, and input latency spikes on interactive elements (such as typing in the search bar).

### Mitigation & Solution:
Implemented a **Two-Tier Tick Ingestion Pipeline**:
1. Incoming WebSocket payloads are written directly into a high-performance hash map buffer (`pendingTicks: Map<string, PriceTick>`).
2. A debounced `requestAnimationFrame` loop flushes the buffer into Zustand state exactly once per monitor refresh cycle (~16.6ms at 60Hz), consolidating dozens of micro-ticks into a single batched atomic UI update.

---

## 2. LocalStorage 5MB Quota vs 5,000 Stocks Snapshot Caching

### Issue:
Persisting 5,000 full stock quotes with all 38 financial metrics and 252-day OHLCV series exceeds the standard browser `localStorage` 5MB quota (measuring ~8.4MB JSON).

### Mitigation & Solution:
1. **Tiered Offline Compression**: Offline caching in `src/lib/storage.ts` saves a compact projection (Top 500 equities with basic pricing and valuation) taking only ~240KB.
2. **Deterministic Seed Reconstruction**: Full 252-day OHLCV series are generated on-the-fly using deterministic seeded pseudo-random number generator algorithms (`SeededRandom`), requiring zero network bandwidth or persistent storage footprint.

---

## 3. Next.js Server-Side Rendering (SSR) vs Lightweight Charts & Canvas

### Issue:
TradingView `lightweight-charts` relies on DOM `HTMLCanvasElement` and `window` APIs, throwing `ReferenceError: window is not defined` during Next.js SSR build phase.

### Mitigation & Solution:
1. Chart instantiation is wrapped inside React `useEffect` hooks that execute exclusively on client mount.
2. Dynamic layout sizing uses a `ResizeObserver` lifecycle listener with cleanup on unmount.

---

## 4. TanStack Virtual Sticky Column Sync on High-DPI Displays

### Issue:
On Safari and high-DPI displays (Retina/4K), virtualized rows with absolute positioning combined with sticky table headers can exhibit sub-pixel border misalignment during fast diagonal scrolling.

### Mitigation & Solution:
1. Set explicit pixel widths for all sticky columns (`actions`: 70px, `symbol`: 110px).
2. Applied CSS `backface-visibility: hidden` and `transform: translate3d(0, 0, 0)` to promote the virtual table rows to dedicated GPU compositing layers.

---

## 5. Division by Zero in Financial Valuation Metrics

### Issue:
Companies reporting negative or near-zero trailing twelve-month earnings (loss-making startups) result in undefined or infinite P/E ratios and infinite EV/EBITDA multiples.

### Mitigation & Solution:
1. Financial formatters (`src/lib/formatters.ts`) safely sanitize `NaN`, `null`, and `Infinity` to display clean `—` dashes.
2. Filter engine evaluates numeric bounds with null checks to ensure loss-making firms do not corrupt mathematical sorting ranges.

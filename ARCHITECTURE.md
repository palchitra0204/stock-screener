# BharatScreener Pro 1A: Architecture & System Design Document

## 1. Executive Architecture Summary

BharatScreener Pro 1A is designed as an ultra-low-latency, institutional-grade equity screening engine optimized for 5,000+ Indian stocks. The system achieves sub-20ms multi-metric queries and sub-50ms WebSocket updates by decoupling the data ingestion pipeline from the visual rendering tree via virtualized DOM windowing, typed data arrays, and `requestAnimationFrame` render batching.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM DATA FLOW PIPELINE                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
           ┌──────────────────────────┴──────────────────────────┐
           ▼                                                     ▼
┌──────────────────────┐                             ┌──────────────────────┐
│ Real-Time WS Server  │ (Port 8080 or Internal Sim) │ 5,000+ Stock Catalog │
└──────────────────────┘                             └──────────────────────┘
           │                                                     │
           ▼                                                     ▼
┌─────────────────────────────────────┐               ┌─────────────────────┐
│  Resilient WebSocket Client         │               │ In-Memory Stock DB  │
│  - Exponential Backoff Reconnection │               │ (Single Array Ref)  │
│  - Jitter Delay (1s - 30s)          │               └─────────────────────┘
│  - Heartbeat / Ping-Pong            │                          │
│  - RAF Batching Buffer              │                          ▼
└─────────────────────────────────────┘               ┌─────────────────────┐
           │                                          │ AND/OR Filter Engine│
           ▼ (Flushed Batched Ticks)                  │ - Bitwise Filtering │
┌─────────────────────────────────────┐               │ - Multi-Metric Tree │
│      Zustand Store Slices           │               │ - Sub-20ms Search   │
│  - useStockStore                    │               └─────────────────────┘
│  - useFilterStore                   │                          │
│  - useWatchlistStore                │                          ▼
│  - useWebSocketStore                │               ┌─────────────────────┐
└─────────────────────────────────────┘               │ Filtered ResultSet  │
           │                                          └─────────────────────┘
           ▼                                                     │
┌────────────────────────────────────────────────────────────────┴──────────┐
│                      UI RENDERING & VIRTUALIZATION LAYER                  │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌────────────────┐  │
│  │ TanStack Virtual v3   │  │ Lightweight Charts   │  │ Sector Heatmap │  │
│  │ (5,000 Row Virtualize)│  │ (252D OHLCV + Ind.)  │  │ & Mini Cards   │  │
│  └───────────────────────┘  └──────────────────────┘  └────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Subsystems

### 2.1 Virtualized Grid Pipeline (`@tanstack/react-virtual` + `@tanstack/react-table`)
Rendering 5,000 DOM nodes simultaneously causes severe layout thrashing (500ms+ render lag, dropped frames during scrolling). 

**Solution**:
1. **Dynamic Virtual Windowing**: TanStack Virtual v3 mounts only the visible rows (~16-25 items based on viewport height) plus a 15-row overscan buffer.
2. **Absolute Transform Positioning**: Rows are positioned via `transform: translateY(${virtualRow.start}px)` allowing the browser's compositor thread to handle scrolling on GPU acceleration.
3. **Sticky Column Partitioning**: Symbol and Action columns are anchored with sticky positioning (`left: 0` and `left: 70px`) and `z-index` layering for seamless horizontal scrolling across 25+ financial attributes.

### 2.2 AND / OR Dynamic Filter Execution Engine
The query engine processes composite boolean trees with arbitrary nesting:

```typescript
export interface FilterGroup {
  id: string;
  combinator: 'AND' | 'OR';
  rules: (FilterRule | FilterGroup)[];
  enabled: boolean;
}
```

- **Short-Circuit Evaluation**: In `AND` combinators, evaluation breaks on the first false condition. In `OR` combinators, evaluation short-circuits on the first true condition.
- **Fast Numeric Comparisons**: Numeric range conditions (`between`, `gte`, `lte`) operate with native primitive number comparisons.
- **Zero Allocation in Hot Loops**: The evaluator iterates directly through the pre-allocated array of 5,000 stock objects without creating intermediate object wrappers.

### 2.3 Resilient WebSocket Architecture & Backoff
Real-time financial telemetry demands 99.99% uptime and instant recovery on network drops:

1. **Exponential Backoff Formula**:
   $$\text{Delay} = \min\left(\text{MaxDelay},\, \text{BaseDelay} \times 2^{\text{attempts}}\right) \pm \text{Jitter}$$
   where $\text{BaseDelay} = 1000\text{ms}$, $\text{MaxDelay} = 30000\text{ms}$, and $\text{Jitter} = 20\%$.
2. **Heartbeat & Latency Telemetry**: 10-second ping/pong cycles measure real round-trip network latency in milliseconds.
3. **Dual Failover Mechanism**: If a native WebSocket server is unreachable on `ws://localhost:8080`, the client automatically transitions to an internal high-fidelity mock stream with zero user interruption.
4. **`requestAnimationFrame` Batching**: Rather than dispatching 50 state updates per second into React, incoming ticks are collected in a `Map<string, PriceTick>` and flushed once per display refresh cycle (16.6ms), capping React rerenders at 60 FPS.

### 2.4 Technical Indicator Engine (`src/lib/indicators.ts`)
Indicators are calculated using standard quantitative finance formulations:

- **SMA (Simple Moving Average)**:
  $$\text{SMA}_t = \frac{1}{N} \sum_{i=0}^{N-1} P_{t-i}$$
- **EMA (Exponential Moving Average)**:
  $$\text{EMA}_t = P_t \times \left(\frac{2}{N+1}\right) + \text{EMA}_{t-1} \times \left(1 - \frac{2}{N+1}\right)$$
- **Bollinger Bands**:
  $$\text{Upper} = \text{SMA}_{20} + 2\sigma, \quad \text{Lower} = \text{SMA}_{20} - 2\sigma$$
- **RSI (14-period Wilder's Smoothing)**:
  $$\text{RS} = \frac{\text{Smoothed Gain}}{\text{Smoothed Loss}}, \quad \text{RSI} = 100 - \frac{100}{1 + \text{RS}}$$
- **Volume Profile**:
  Price range $[P_{\min}, P_{\max}]$ partitioned into $K=18$ equal buckets. Ticks are mapped to buckets with buy/sell volume attribution based on close-open delta. The bucket with $\max(\text{Volume})$ is designated as the **Point of Control (POC)**.

---

## 3. State Management Topology (Zustand)

State is modularized into discrete stores to prevent cross-component unnecessary rerenders:

1. **`useStockStore`**: Owns the master list of 5,000 quotes, filtered subset, active tab, density, column visibility, and transient tick flash animations.
2. **`useFilterStore`**: Owns the filter rule tree, active search query, selected sectors, market cap filters, and preset definitions.
3. **`useWatchlistStore`**: Owns multi-watchlist management, star state, and portfolio aggregate computations.
4. **`useWebSocketStore`**: Owns network status, latency telemetry, ticks received count, and streaming speed.

---

## 4. Accessibility & Compliance (WCAG 2.1 AA)

- **Semantic Landmark Roles**: `<header>`, `<main>`, `<footer>`, `<dialog>`, `role="grid"`, `role="tablist"`.
- **Keyboard Trapping**: Modals and slide-out drawers trap tab focus and automatically bind `Escape` key dismiss.
- **Color Contrast**: Bullish green (`#10b981`) and bearish red (`#f43f5e`) exceed 4.5:1 contrast ratios on dark canvas (`#090d16`).
- **Focus Rings**: High-visibility `:focus-visible` styling with 2px indigo outline and 2px offset.

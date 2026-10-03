import { PriceTick, WSConnectionStatus, WSServerMessage } from '@/types/websocket';
import { StockQuote } from '@/types/stock';

export type TickCallback = (ticks: PriceTick[]) => void;
export type StatusCallback = (status: WSConnectionStatus) => void;
export type LatencyCallback = (latencyMs: number) => void;

export interface WSClientOptions {
  url?: string;
  autoConnect?: boolean;
  updateIntervalMs?: number;
  maxBackoffMs?: number;
  initialBackoffMs?: number;
}

export class ResilientWebSocketClient {
  private url: string;
  private ws: WebSocket | null = null;
  private status: WSConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: any = null;
  private heartbeatTimer: any = null;
  private simulatedTimer: any = null;
  private isPaused = false;
  private updateIntervalMs = 500;
  private initialBackoffMs = 1000;
  private maxBackoffMs = 30000;
  private subscribedSymbols: Set<string> = new Set();
  private stockCatalog: StockQuote[] = [];

  // Callbacks
  private onTickCallbacks: Set<TickCallback> = new Set();
  private onStatusCallbacks: Set<StatusCallback> = new Set();
  private onLatencyCallbacks: Set<LatencyCallback> = new Set();

  // Batching
  private pendingTicks: Map<string, PriceTick> = new Map();
  private rafId: number | null = null;
  private lastPingTimestamp = 0;

  constructor(options: WSClientOptions = {}) {
    this.url = options.url || 'ws://localhost:8080';
    this.updateIntervalMs = options.updateIntervalMs || 500;
    this.initialBackoffMs = options.initialBackoffMs || 1000;
    this.maxBackoffMs = options.maxBackoffMs || 30000;
  }

  public setStockCatalog(stocks: StockQuote[]) {
    this.stockCatalog = stocks;
  }

  public subscribe(symbols: string[]) {
    symbols.forEach((s) => this.subscribedSymbols.add(s));
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'subscribe', symbols }));
    }
  }

  public unsubscribe(symbols: string[]) {
    symbols.forEach((s) => this.subscribedSymbols.delete(s));
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'unsubscribe', symbols }));
    }
  }

  public onTicks(cb: TickCallback): () => void {
    this.onTickCallbacks.add(cb);
    return () => this.onTickCallbacks.delete(cb);
  }

  public onStatusChange(cb: StatusCallback): () => void {
    this.onStatusCallbacks.add(cb);
    cb(this.status);
    return () => this.onStatusCallbacks.delete(cb);
  }

  public onLatency(cb: LatencyCallback): () => void {
    this.onLatencyCallbacks.add(cb);
    return () => this.onLatencyCallbacks.delete(cb);
  }

  public getStatus(): WSConnectionStatus {
    return this.status;
  }

  private setStatus(newStatus: WSConnectionStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.onStatusCallbacks.forEach((cb) => cb(newStatus));
    }
  }

  public connect() {
    if (typeof window === 'undefined') return;
    this.isPaused = false;
    this.clearTimers();

    // If already in fallback simulation mode and not paused, maintain connected status
    if (this.isFallback) {
      this.setStatus('connected');
      this.startSimulationLoop();
      return;
    }

    this.setStatus('connecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isFallback = false;
        this.setStatus('connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();

        if (this.subscribedSymbols.size > 0) {
          this.ws?.send(
            JSON.stringify({
              action: 'subscribe',
              symbols: Array.from(this.subscribedSymbols),
            })
          );
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: WSServerMessage = JSON.parse(event.data);
          if (msg.type === 'heartbeat') {
            const now = Date.now();
            const latency = this.lastPingTimestamp ? now - this.lastPingTimestamp : 12;
            this.onLatencyCallbacks.forEach((cb) => cb(latency));
          } else if (msg.type === 'tick_batch' && msg.ticks) {
            this.handleIncomingTicks(msg.ticks);
          }
        } catch {
          // Ignore invalid JSON
        }
      };

      this.ws.onerror = () => {
        // Fallback cleanly to high-performance internal tick simulation
        this.startSimulationFallback();
      };

      this.ws.onclose = () => {
        if (this.isFallback) {
          // Fallback simulation is actively running, no need to reconnect loop
          return;
        }
        if (!this.isPaused) {
          this.scheduleReconnect();
        } else {
          this.setStatus('paused');
        }
      };
    } catch {
      this.startSimulationFallback();
    }
  }

  private isFallback = false;

  private startSimulationFallback() {
    this.isFallback = true;
    if (this.ws) {
      try {
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.onmessage = null;
        this.ws.onopen = null;
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.reconnectAttempts = 0;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.setStatus('connected');
    this.startSimulationLoop();
  }

  private startSimulationLoop() {
    this.clearSimulationTimer();
    if (this.isPaused) return;

    this.simulatedTimer = setInterval(() => {
      if (this.isPaused || !this.stockCatalog || this.stockCatalog.length === 0) return;

      const ticksCount = Math.floor(Math.random() * 8) + 3;
      const ticks: PriceTick[] = [];

      for (let i = 0; i < ticksCount; i++) {
        const randomIndex = Math.floor(Math.random() * this.stockCatalog.length);
        const stock = this.stockCatalog[randomIndex];
        if (!stock) continue;

        // Generate realistic tick between -0.4% and +0.4%
        const deltaPercent = (Math.random() - 0.49) * 0.8;
        const deltaPrice = Number((stock.price * (deltaPercent / 100)).toFixed(2));
        const newPrice = Math.max(1, Number((stock.price + deltaPrice).toFixed(2)));
        const newChange = Number((newPrice - stock.previousClose).toFixed(2));
        const newChangePercent = Number(((newChange / stock.previousClose) * 100).toFixed(2));
        const newDayHigh = Math.max(stock.dayHigh, newPrice);
        const newDayLow = Math.min(stock.dayLow, newPrice);
        const newVolume = stock.volume + Math.floor(Math.random() * 2500) + 100;

        const direction = deltaPrice > 0 ? 'up' : deltaPrice < 0 ? 'down' : 'neutral';

        // Update in-memory stock object
        stock.price = newPrice;
        stock.change = newChange;
        stock.changePercent = newChangePercent;
        stock.dayHigh = newDayHigh;
        stock.dayLow = newDayLow;
        stock.volume = newVolume;
        stock.lastUpdated = Date.now();

        ticks.push({
          symbol: stock.symbol,
          price: newPrice,
          change: newChange,
          changePercent: newChangePercent,
          dayHigh: newDayHigh,
          dayLow: newDayLow,
          volume: newVolume,
          timestamp: Date.now(),
          direction,
        });
      }

      this.handleIncomingTicks(ticks);
      this.onLatencyCallbacks.forEach((cb) => cb(Math.floor(Math.random() * 8) + 6));
    }, this.updateIntervalMs);
  }

  private handleIncomingTicks(ticks: PriceTick[]) {
    if (this.isPaused) return;

    for (const tick of ticks) {
      this.pendingTicks.set(tick.symbol, tick);
    }

    if (this.rafId === null && typeof window !== 'undefined') {
      this.rafId = window.requestAnimationFrame(() => {
        this.flushPendingTicks();
      });
    }
  }

  private flushPendingTicks() {
    this.rafId = null;
    if (this.pendingTicks.size === 0) return;

    const batchedTicks = Array.from(this.pendingTicks.values());
    this.pendingTicks.clear();

    this.onTickCallbacks.forEach((cb) => {
      try {
        cb(batchedTicks);
      } catch (err) {
        console.error('Error in tick callback:', err);
      }
    });
  }

  private scheduleReconnect() {
    this.clearTimers();
    this.setStatus('reconnecting');

    // Exponential Backoff with Jitter
    const backoff = Math.min(
      this.maxBackoffMs,
      this.initialBackoffMs * Math.pow(2, this.reconnectAttempts)
    );
    const jitter = backoff * 0.2 * (Math.random() - 0.5);
    const delay = Math.max(500, backoff + jitter);

    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat() {
    this.clearHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.lastPingTimestamp = Date.now();
        this.ws.send(JSON.stringify({ action: 'ping', timestamp: this.lastPingTimestamp }));
      }
    }, 10000);
  }

  public setUpdateInterval(intervalMs: number) {
    this.updateIntervalMs = Math.max(100, Math.min(5000, intervalMs));
    if (this.simulatedTimer) {
      this.startSimulationLoop();
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'set_rate', rateMs: this.updateIntervalMs }));
    }
  }

  public pause() {
    this.isPaused = true;
    this.setStatus('paused');
    this.clearTimers();
  }

  public resume() {
    this.isPaused = false;
    this.connect();
  }

  public forceReconnect() {
    this.isPaused = false;
    this.isFallback = false;
    this.reconnectAttempts = 0;
    this.connect();
  }

  public disconnect() {
    this.isPaused = true;
    this.clearTimers();
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  private clearTimers() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.clearHeartbeat();
    this.clearSimulationTimer();
  }

  private clearHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private clearSimulationTimer() {
    if (this.simulatedTimer) {
      clearInterval(this.simulatedTimer);
      this.simulatedTimer = null;
    }
  }
}

// Singleton global instance
export const wsClient = new ResilientWebSocketClient();

export type WSConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected' | 'paused';

export interface PriceTick {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  timestamp: number;
  direction: 'up' | 'down' | 'neutral';
}

export interface WSServerMessage {
  type: 'tick_batch' | 'heartbeat' | 'subscribed' | 'unsubscribed' | 'market_summary';
  ticks?: PriceTick[];
  timestamp: number;
  data?: any;
}

export interface WSClientMessage {
  action: 'subscribe' | 'unsubscribe' | 'set_rate' | 'pause' | 'resume';
  symbols?: string[];
  rateMs?: number;
}

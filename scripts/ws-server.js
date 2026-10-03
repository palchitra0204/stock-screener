/**
 * Standalone High-Frequency WebSocket Mock Server for Indian Stock Screener
 * Run via: npm run ws-server
 */

const { WebSocketServer, WebSocket } = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`[WebSocket Server] Indian Equities Real-Time Tick Server running on ws://localhost:${PORT}`);

const SEED_SYMBOLS = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'BHARTIARTL', 'SBIN', 'ITC', 'LT', 'HINDUNILVR',
  'TATAMOTORS', 'SUNPHARMA', 'MARUTI', 'AXISBANK', 'KOTAKBANK', 'TITAN', 'BAJFINANCE', 'NTPC', 'ONGC', 'TATASTEEL',
  'HAL', 'BEL', 'ZOMATO', 'DIXON', 'MAZDOCK', 'SUZLON', 'CDSL', 'KAYNES', 'TRENT', 'POLYCAB'
];

// Active client subscriptions
const clientSubscriptions = new Map();

wss.on('connection', (ws) => {
  console.log('[WebSocket Server] Client connected');
  clientSubscriptions.set(ws, { symbols: new Set(SEED_SYMBOLS), rateMs: 500 });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.action === 'ping') {
        ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
      } else if (data.action === 'subscribe' && Array.isArray(data.symbols)) {
        const sub = clientSubscriptions.get(ws);
        if (sub) {
          data.symbols.forEach((s) => sub.symbols.add(s));
          ws.send(JSON.stringify({ type: 'subscribed', count: sub.symbols.size }));
        }
      } else if (data.action === 'set_rate' && typeof data.rateMs === 'number') {
        const sub = clientSubscriptions.get(ws);
        if (sub) {
          sub.rateMs = Math.max(100, Math.min(5000, data.rateMs));
        }
      }
    } catch (err) {
      console.error('[WebSocket Server] Error parsing message', err);
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket Server] Client disconnected');
    clientSubscriptions.delete(ws);
  });
});

// Broadcast tick loop
setInterval(() => {
  if (wss.clients.size === 0) return;

  const sampleSize = Math.floor(Math.random() * 8) + 4;
  const sampleSymbols = [...SEED_SYMBOLS].sort(() => 0.5 - Math.random()).slice(0, sampleSize);

  const ticks = sampleSymbols.map((sym) => {
    const deltaPercent = (Math.random() - 0.48) * 0.7;
    const direction = deltaPercent > 0 ? 'up' : deltaPercent < 0 ? 'down' : 'neutral';
    const basePrice = Math.floor(Math.random() * 4000) + 100;
    const price = Number((basePrice * (1 + deltaPercent / 100)).toFixed(2));
    const change = Number((price * (deltaPercent / 100)).toFixed(2));

    return {
      symbol: sym,
      price,
      change,
      changePercent: Number(deltaPercent.toFixed(2)),
      dayHigh: Number((price * 1.02).toFixed(2)),
      dayLow: Number((price * 0.98).toFixed(2)),
      volume: Math.floor(Math.random() * 500000) + 10000,
      timestamp: Date.now(),
      direction,
    };
  });

  const message = JSON.stringify({
    type: 'tick_batch',
    ticks,
    timestamp: Date.now(),
  });

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}, 500);

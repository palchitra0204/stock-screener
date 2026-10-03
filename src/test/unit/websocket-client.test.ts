import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ResilientWebSocketClient } from '@/lib/websocket-client';
import { generateRealisticStockQuotes } from '@/lib/mock-generator';

describe('ResilientWebSocketClient', () => {
  let client: ResilientWebSocketClient;
  const mockStocks = generateRealisticStockQuotes(10);

  beforeEach(() => {
    vi.useFakeTimers();
    client = new ResilientWebSocketClient({
      updateIntervalMs: 200,
      initialBackoffMs: 500,
      maxBackoffMs: 5000,
    });
    client.setStockCatalog(mockStocks);
  });

  afterEach(() => {
    client.disconnect();
    vi.restoreAllMocks();
  });

  it('initializes in disconnected state', () => {
    expect(client.getStatus()).toBe('disconnected');
  });

  it('notifies status listeners on connection state changes', () => {
    const statusSpy = vi.fn();
    const unsub = client.onStatusChange(statusSpy);

    expect(statusSpy).toHaveBeenCalledWith('disconnected');
    client.connect();
    expect(statusSpy).toHaveBeenCalledWith('connecting');

    unsub();
  });

  it('supports pause and resume flows', () => {
    client.connect();
    client.pause();
    expect(client.getStatus()).toBe('paused');

    client.resume();
    expect(['connected', 'connecting']).toContain(client.getStatus());
  });

  it('allows subscription and unsubscription of symbols', () => {
    expect(() => {
      client.subscribe(['RELIANCE', 'TCS']);
      client.unsubscribe(['TCS']);
    }).not.toThrow();
  });
});

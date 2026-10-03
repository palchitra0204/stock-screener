import { create } from 'zustand';
import { WSConnectionStatus } from '@/types/websocket';
import { wsClient } from '@/lib/websocket-client';

interface WebSocketStoreState {
  status: WSConnectionStatus;
  latencyMs: number;
  ticksReceivedTotal: number;
  ticksPerSecond: number;
  updateIntervalMs: number;
  isStreaming: boolean;

  // Actions
  setStatus: (status: WSConnectionStatus) => void;
  setLatency: (latencyMs: number) => void;
  incrementTicks: (count: number) => void;
  setUpdateInterval: (intervalMs: number) => void;
  toggleStreaming: () => void;
  reconnect: () => void;
}

export const useWebSocketStore = create<WebSocketStoreState>((set, get) => ({
  status: 'disconnected',
  latencyMs: 12,
  ticksReceivedTotal: 0,
  ticksPerSecond: 0,
  updateIntervalMs: 500,
  isStreaming: true,

  setStatus: (status) => set({ status }),

  setLatency: (latencyMs) => set({ latencyMs }),

  incrementTicks: (count) => {
    set((state) => ({
      ticksReceivedTotal: state.ticksReceivedTotal + count,
      ticksPerSecond: count,
    }));
  },

  setUpdateInterval: (updateIntervalMs) => {
    wsClient.setUpdateInterval(updateIntervalMs);
    set({ updateIntervalMs });
  },

  toggleStreaming: () => {
    const isStreaming = get().isStreaming;
    if (isStreaming) {
      wsClient.pause();
      set({ isStreaming: false, status: 'paused' });
    } else {
      wsClient.resume();
      set({ isStreaming: true });
    }
  },

  reconnect: () => {
    wsClient.forceReconnect();
    set({ isStreaming: true });
  },
}));

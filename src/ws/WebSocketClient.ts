import type { Channel } from './Channel.js';
import type { Frame } from './Frame.js';

export interface WebSocketClient {
  connect(): Promise<void>;
  close(): void;
  frames(): AsyncGenerator<Frame, void, unknown>;
  quotes(tickers: string[]): Promise<void>;
  orderbook(tickers: string[]): Promise<void>;
  orders(): Promise<void>;
  portfolio(): Promise<void>;
  markets(): Promise<void>;
  sessionsChannel(): Promise<void>;
  subscribe(channel: Channel, tickers?: string[]): Promise<void>;
}

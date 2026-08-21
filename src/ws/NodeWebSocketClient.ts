import type { SessionManager } from '../auth/SessionManager.js';
import type { ClientConfig } from '../config/ClientConfig.js';
import { ConfigurationError } from '../errors/ConfigurationError.js';
import {
  type Channel,
  channelSubscribePayload,
} from './Channel.js';
import { Frame } from './Frame.js';
import type { WebSocketClient } from './WebSocketClient.js';

type WsLike = {
  on(event: string, listener: (...args: unknown[]) => void): void;
  send(data: string): void;
  close(): void;
  readyState: number;
};

/**
 * Node WebSocket client using optional peer dependency `ws`.
 *
 * Auth is SID-only (`?SID=...`). Demo mode without SID is available when
 * `requireSid` is false.
 */
export class NodeWebSocketClient implements WebSocketClient {
  private closedByCaller = false;
  private connection: WsLike | null = null;
  private reconnectAttempt = 0;
  private stableFrames = 0;
  private readonly subscriptions: Array<{ channel: Channel; tickers?: string[] }> =
    [];
  private readonly queue: Frame[] = [];
  private waiters: Array<(frame: Frame | null) => void> = [];
  private receiveError: Error | null = null;

  constructor(
    private readonly config: ClientConfig,
    private readonly sessions: SessionManager,
    private readonly requireSid = true,
    private readonly maxReconnects = 10,
  ) {}

  close(): void {
    this.closedByCaller = true;
    this.connection?.close();
    this.connection = null;
    for (const waiter of this.waiters) waiter(null);
    this.waiters = [];
  }

  async connect(): Promise<void> {
    this.closedByCaller = false;
    this.connection = await this.openConnection();
    this.reconnectAttempt = 0;
    this.stableFrames = 0;
    await this.resubscribe();
  }

  async *frames(): AsyncGenerator<Frame, void, unknown> {
    if (this.connection === null) {
      await this.connect();
    }

    while (!this.closedByCaller) {
      try {
        const frame = await this.nextFrame();
        if (frame === null) {
          if (this.closedByCaller) return;
          if (this.reconnectAttempt >= this.maxReconnects) {
            throw new ConfigurationError('WebSocket closed after max reconnects');
          }
          await this.reconnect();
          continue;
        }

        this.stableFrames++;
        if (this.stableFrames >= 3) {
          this.reconnectAttempt = 0;
        }

        if (
          frame.event === 'userData' &&
          this.requireSid &&
          this.looksLikeDemo(frame.data)
        ) {
          if (this.reconnectAttempt >= this.maxReconnects) {
            throw new ConfigurationError(
              'WebSocket stayed in demo mode after max reconnects',
            );
          }
          await this.sessions.invalidate();
          await this.sessions.ensureSession(true);
          await this.reconnect();
          continue;
        }

        yield frame;
      } catch (e) {
        if (this.closedByCaller) return;
        if (
          e instanceof ConfigurationError ||
          (e instanceof Error && e.name === 'AuthenticationError') ||
          (e instanceof Error && e.name === 'ReauthBlockedError')
        ) {
          throw e;
        }
        if (this.reconnectAttempt >= this.maxReconnects) throw e;
        await this.reconnect();
      }
    }
  }

  async markets(): Promise<void> {
    await this.subscribe('markets');
  }

  async orderbook(tickers: string[]): Promise<void> {
    await this.subscribe('orderbook', tickers);
  }

  async orders(): Promise<void> {
    await this.subscribe('orders');
  }

  async portfolio(): Promise<void> {
    await this.subscribe('portfolio');
  }

  async quotes(tickers: string[]): Promise<void> {
    await this.subscribe('quotes', tickers);
  }

  async sessionsChannel(): Promise<void> {
    await this.subscribe('sessions');
  }

  async subscribe(channel: Channel, tickers?: string[]): Promise<void> {
    this.subscriptions.push(
      tickers === undefined ? { channel } : { channel, tickers },
    );
    if (this.connection !== null) {
      await this.sendSubscribe(channel, tickers);
    }
  }

  private async openConnection(): Promise<WsLike> {
    let WebSocketCtor: new (url: string, options?: Record<string, unknown>) => WsLike;
    try {
      const mod = await import('ws');
      WebSocketCtor = (mod.default ?? mod.WebSocket) as typeof WebSocketCtor;
    } catch {
      throw new ConfigurationError(
        'WebSocket support requires the optional peer dependency `ws`. ' +
          'Install it with: npm install ws',
      );
    }

    let url = this.config.websocketUrl();
    if (this.requireSid) {
      const session = await this.sessions.ensureSession(true);
      if (session === null) {
        throw new ConfigurationError('SID is required for WebSocket account streams');
      }
      url += `?${encodeURIComponent(session.sidName)}=${encodeURIComponent(session.sid)}`;
    }

    return await new Promise<WsLike>((resolve, reject) => {
      const ws = new WebSocketCtor(url, {
        headers: { 'User-Agent': this.config.userAgent },
      });

      const onOpen = () => {
        cleanup();
        this.attachHandlers(ws);
        resolve(ws);
      };
      const onError = (err: unknown) => {
        cleanup();
        reject(err instanceof Error ? err : new Error(String(err)));
      };
      const cleanup = () => {
        ws.on('open', () => undefined);
        ws.on('error', () => undefined);
      };

      ws.on('open', onOpen);
      ws.on('error', onError);
    });
  }

  private attachHandlers(ws: WsLike): void {
    ws.on('message', (data: unknown) => {
      try {
        const text = typeof data === 'string' ? data : Buffer.from(data as Buffer).toString('utf8');
        const parsed = JSON.parse(text) as unknown;
        if (Array.isArray(parsed) && parsed.length >= 2) {
          this.pushFrame(new Frame(String(parsed[0]), parsed[1], parsed));
        } else {
          this.pushFrame(new Frame('message', parsed, parsed));
        }
      } catch (e) {
        this.receiveError = e instanceof Error ? e : new Error(String(e));
        for (const waiter of this.waiters) waiter(null);
        this.waiters = [];
      }
    });

    ws.on('close', () => {
      this.connection = null;
      for (const waiter of this.waiters) waiter(null);
      this.waiters = [];
    });

    ws.on('error', (err: unknown) => {
      this.receiveError = err instanceof Error ? err : new Error(String(err));
      for (const waiter of this.waiters) waiter(null);
      this.waiters = [];
    });
  }

  private pushFrame(frame: Frame): void {
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter(frame);
      return;
    }
    this.queue.push(frame);
  }

  private nextFrame(): Promise<Frame | null> {
    if (this.receiveError) {
      const err = this.receiveError;
      this.receiveError = null;
      return Promise.reject(err);
    }
    const queued = this.queue.shift();
    if (queued) return Promise.resolve(queued);
    if (this.connection === null) return Promise.resolve(null);
    return new Promise((resolve) => {
      this.waiters.push(resolve);
    });
  }

  private async reconnect(): Promise<void> {
    this.reconnectAttempt++;
    this.stableFrames = 0;
    this.connection?.close();
    this.connection = null;
    const delay = Math.min(30, 2 ** Math.min(this.reconnectAttempt, 4)) * 1000;
    const jitter = Math.floor(Math.random() * 250);
    await new Promise((r) => setTimeout(r, delay + jitter));
    this.connection = await this.openConnection();
    await this.resubscribe();
  }

  private async resubscribe(): Promise<void> {
    for (const sub of this.subscriptions) {
      await this.sendSubscribe(sub.channel, sub.tickers);
    }
  }

  private async sendSubscribe(channel: Channel, tickers?: string[]): Promise<void> {
    if (this.connection === null) return;
    const payload = channelSubscribePayload(channel, tickers);
    this.connection.send(JSON.stringify(payload));
  }

  private looksLikeDemo(data: unknown): boolean {
    if (typeof data !== 'object' || data === null) return false;
    const obj = data as Record<string, unknown>;
    return Boolean(obj.isDemo) || obj.mode === 'demo';
  }
}

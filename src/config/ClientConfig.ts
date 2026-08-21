import type { AuthMode } from './AuthMode.js';
import { normalizeDomain } from './Domain.js';

export const DEFAULT_SID_TTL_SECONDS = 1_209_600; // 14 days
export const DEFAULT_USER_AGENT = 'tradernet-node-sdk/0.1.0';

export interface ClientConfigInit {
  domain?: string;
  lang?: string;
  authMode?: AuthMode;
  sidTtlSeconds?: number;
  sessionPath?: string | null;
  sidCookieName?: string;
  timeoutMs?: number;
  reauthMaxAttempts?: number;
  reauthWindowSeconds?: number;
  reauthOpenSeconds?: number;
  userAgent?: string;
}

export class ClientConfig {
  readonly domain: string;
  readonly lang: string;
  readonly authMode: AuthMode;
  readonly sidTtlSeconds: number;
  readonly sessionPath: string | null;
  readonly sidCookieName: string;
  readonly timeoutMs: number;
  readonly reauthMaxAttempts: number;
  readonly reauthWindowSeconds: number;
  readonly reauthOpenSeconds: number;
  readonly userAgent: string;

  constructor(init: ClientConfigInit = {}) {
    this.domain = normalizeDomain(init.domain ?? 'https://tradernet.com');
    this.lang = init.lang ?? 'en';
    this.authMode = init.authMode ?? 'sid_lazy';
    this.sidTtlSeconds = init.sidTtlSeconds ?? DEFAULT_SID_TTL_SECONDS;
    this.sessionPath = init.sessionPath ?? null;
    this.sidCookieName = init.sidCookieName ?? 'SID';
    this.timeoutMs = init.timeoutMs ?? 30_000;
    this.reauthMaxAttempts = init.reauthMaxAttempts ?? 3;
    this.reauthWindowSeconds = init.reauthWindowSeconds ?? 900;
    this.reauthOpenSeconds = init.reauthOpenSeconds ?? 900;
    this.userAgent = init.userAgent ?? DEFAULT_USER_AGENT;
  }

  host(): string {
    return new URL(this.domain).hostname;
  }

  websocketUrl(): string {
    return `wss://wss.${this.host()}/`;
  }
}

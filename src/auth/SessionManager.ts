import { createHash } from 'node:crypto';
import type { Clock } from '../clock/Clock.js';
import type { ClientConfig } from '../config/ClientConfig.js';
import type { Credentials } from '../config/Credentials.js';
import { AuthenticationError } from '../errors/AuthenticationError.js';
import { ConfigurationError } from '../errors/ConfigurationError.js';
import { HttpMethod } from '../transport/HttpMethod.js';
import type { Transport } from '../transport/Transport.js';
import { ReauthGuard } from './ReauthGuard.js';
import { Session } from './Session.js';
import type { SessionStorage } from './SessionStorage.js';

function asInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^-?\d+$/.test(value)) return Number(value);
  return null;
}

export class SessionManager {
  private current: Session | null = null;

  constructor(
    private readonly credentials: Credentials,
    private readonly config: ClientConfig,
    private readonly transport: Transport,
    private readonly storage: SessionStorage,
    private readonly reauthGuard: ReauthGuard,
    private readonly clock: Clock,
  ) {}

  async adopt(session: Session): Promise<void> {
    this.current = session;
    await this.storage.save(this.storageKeyFor(session), session);
  }

  async adoptFromResponse(
    response: Record<string, unknown>,
    login: string,
  ): Promise<Session> {
    const sid = this.extractSid(response);
    if (sid === null || sid === '') {
      throw new AuthenticationError(
        'Auth response did not return SID',
        AuthenticationError.CODE_PERMANENT,
      );
    }

    const nowTs = this.clock.now();
    const session = new Session(
      sid,
      this.config.sidCookieName,
      asInt(response.userId),
      login,
      new Date(nowTs * 1000),
      new Date((nowTs + this.config.sidTtlSeconds) * 1000),
      this.config.domain,
    );

    await this.adopt(session);
    return session;
  }

  async authenticate(): Promise<Session> {
    if (!this.credentials.hasLoginPassword()) {
      throw new ConfigurationError('Login and password are required to obtain SID');
    }

    const key = this.storageKey();
    const lock = await this.storage.lock(key);
    try {
      return await this.authenticateLocked(key);
    } finally {
      await lock.unlock();
    }
  }

  canReauthenticate(): boolean {
    return (
      this.credentials.hasLoginPassword() && this.config.authMode !== 'keys_only'
    );
  }

  configuredLogin(): string | null {
    const login = this.credentials.login();
    return login !== null && login !== '' ? login : null;
  }

  async currentSession(): Promise<Session | null> {
    return this.current ?? (await this.loadValidSession());
  }

  async ensureSession(required = true): Promise<Session | null> {
    if (this.config.authMode === 'keys_only') {
      if (required) {
        throw new ConfigurationError('SID is required but auth mode is keys_only');
      }
      return null;
    }

    if (!required && this.config.authMode === 'sid_lazy') {
      return this.loadValidSession();
    }

    const session = await this.loadValidSession();
    if (session !== null) return session;
    return this.authenticate();
  }

  async invalidate(): Promise<void> {
    if (this.current !== null) {
      await this.storage.delete(
        createHash('sha256')
          .update(`${this.current.domain}|${this.current.login}`)
          .digest('hex'),
      );
      await this.storage.delete(this.storageKeyFor(this.current));
    }
    await this.storage.delete(this.storageKey());
    this.current = null;
  }

  async loginWithPassword(
    login: string,
    password: string,
    rememberMe = 1,
  ): Promise<Record<string, unknown>> {
    if (login === '' || password === '') {
      throw new ConfigurationError('Login and password are required');
    }

    const key = this.lockKeyForLogin(login);
    const lock = await this.storage.lock(key);
    try {
      return await this.performPasswordLogin(key, login, password, rememberMe);
    } finally {
      await lock.unlock();
    }
  }

  storageKey(): string {
    const login = this.credentials.login() ?? '';
    return createHash('sha256')
      .update(`${this.config.domain}|${login}`)
      .digest('hex');
  }

  private async authenticateLocked(key: string): Promise<Session> {
    const existing = await this.loadValidSession();
    if (existing !== null) return existing;

    await this.reauthGuard.allow(key);
    this.reauthGuard.begin();
    try {
      await this.reauthGuard.recordAttempt(key);
      const session = await this.loginAndPersist();
      await this.reauthGuard.reset(key);
      this.current = session;
      return session;
    } catch (e) {
      if (e instanceof AuthenticationError && e.isPermanent()) {
        await this.reauthGuard.recordAttempt(key, true);
      }
      throw e;
    } finally {
      this.reauthGuard.end();
    }
  }

  private extractSid(response: Record<string, unknown>): string | null {
    for (const field of ['SID', 'sid', 'sessionId'] as const) {
      const value = response[field];
      if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
      }
    }
    return null;
  }

  private async loadValidSession(): Promise<Session | null> {
    const now = new Date(this.clock.now() * 1000);
    if (this.current !== null) {
      if (!this.current.isExpired(now)) return this.current;
      this.current = null;
    }

    const session = await this.storage.load(this.storageKey());
    if (session === null) return null;
    if (session.isExpired(now)) {
      await this.storage.delete(this.storageKey());
      return null;
    }

    this.current = session;
    return session;
  }

  private lockKeyForLogin(login: string): string {
    const configured = this.credentials.login();
    if (configured !== null && configured !== '') {
      return this.storageKey();
    }
    return createHash('sha256')
      .update(`${this.config.domain}|${login}`)
      .digest('hex');
  }

  private async loginAndPersist(): Promise<Session> {
    const login = String(this.credentials.login());
    const password = this.credentials.password();

    try {
      const response = await this.transport.request(
        'authByLogin',
        { login, password, rememberMe: 1 },
        HttpMethod.POST,
        null,
        false,
      );
      return this.adoptFromResponse(response, login);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      const permanent = this.looksPermanent(message);
      throw new AuthenticationError(
        `authByLogin failed: ${message}`,
        permanent
          ? AuthenticationError.CODE_PERMANENT
          : AuthenticationError.CODE_TRANSIENT,
        { cause: e },
      );
    }
  }

  private looksPermanent(message: string): boolean {
    const lower = message.toLowerCase();
    return (
      /\b(invalid|wrong|incorrect)\b.*\bpassword\b/.test(lower) ||
      /\bpassword\b.*\b(invalid|wrong|incorrect)\b/.test(lower) ||
      lower.includes('invalid login') ||
      lower.includes('wrong login') ||
      /\b2fa\b/.test(lower) ||
      lower.includes('two-factor') ||
      lower.includes('blocked') ||
      lower.includes('disabled')
    );
  }

  private async performPasswordLogin(
    key: string,
    login: string,
    password: string,
    rememberMe: number,
  ): Promise<Record<string, unknown>> {
    await this.reauthGuard.allow(key);
    this.reauthGuard.begin();

    let response: Record<string, unknown>;
    try {
      await this.reauthGuard.recordAttempt(key);
      try {
        response = await this.transport.request(
          'authByLogin',
          { login, password, rememberMe },
          HttpMethod.POST,
          null,
          false,
        );
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const permanent = this.looksPermanent(message);
        if (permanent) {
          await this.reauthGuard.recordAttempt(key, true);
        }
        throw new AuthenticationError(
          `authByLogin failed: ${message}`,
          permanent
            ? AuthenticationError.CODE_PERMANENT
            : AuthenticationError.CODE_TRANSIENT,
          { cause: e },
        );
      }

      await this.adoptFromResponse(response, login);
      await this.reauthGuard.reset(key);
    } finally {
      this.reauthGuard.end();
    }

    return response;
  }

  private storageKeyFor(session: Session): string {
    const configured = this.credentials.login();
    if (configured !== null && configured !== '') {
      return createHash('sha256')
        .update(`${this.config.domain}|${configured}`)
        .digest('hex');
    }
    return createHash('sha256')
      .update(`${session.domain}|${session.login}`)
      .digest('hex');
  }
}

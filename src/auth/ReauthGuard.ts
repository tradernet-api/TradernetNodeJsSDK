import type { Clock } from '../clock/Clock.js';
import type { ClientConfig } from '../config/ClientConfig.js';
import { ReauthBlockedError } from '../errors/ReauthBlockedError.js';
import type { SessionStorage } from './SessionStorage.js';

/**
 * Persistent circuit breaker for authByLogin attempts.
 */
export class ReauthGuard {
  private authenticating = false;

  constructor(
    private readonly storage: SessionStorage,
    private readonly config: ClientConfig,
    private readonly clock: Clock,
  ) {}

  async allow(key: string): Promise<void> {
    const now = this.clock.now();
    const meta = (await this.storage.loadMeta(key)) ?? {};
    const openUntil = Number(meta.openUntil ?? 0);
    if (openUntil > now) {
      throw new ReauthBlockedError(
        `Re-authentication circuit is open until ${new Date(openUntil * 1000).toISOString()}`,
      );
    }

    const windowStart = Number(meta.windowStart ?? 0);
    const attempts = Number(meta.attempts ?? 0);
    if (windowStart === 0 || now - windowStart > this.config.reauthWindowSeconds) {
      return;
    }

    if (attempts >= this.config.reauthMaxAttempts) {
      throw new ReauthBlockedError(
        `Re-authentication limit exceeded (${this.config.reauthMaxAttempts} attempts / ${this.config.reauthWindowSeconds} seconds)`,
      );
    }
  }

  begin(): void {
    if (this.authenticating) {
      throw new ReauthBlockedError('Nested re-authentication is not allowed');
    }
    this.authenticating = true;
  }

  end(): void {
    this.authenticating = false;
  }

  async recordAttempt(key: string, openImmediately = false): Promise<void> {
    const now = this.clock.now();
    const meta = (await this.storage.loadMeta(key)) ?? {};
    let windowStart = Number(meta.windowStart ?? 0);
    let attempts = Number(meta.attempts ?? 0);

    if (windowStart === 0 || now - windowStart > this.config.reauthWindowSeconds) {
      windowStart = now;
      attempts = 0;
    }

    attempts++;
    const next: Record<string, unknown> = {
      windowStart,
      attempts,
      openUntil: Number(meta.openUntil ?? 0),
    };

    if (openImmediately || attempts >= this.config.reauthMaxAttempts) {
      next.openUntil = now + this.config.reauthOpenSeconds;
    }

    await this.storage.saveMeta(key, next);
  }

  async reset(key: string): Promise<void> {
    await this.storage.saveMeta(key, {
      windowStart: 0,
      attempts: 0,
      openUntil: 0,
    });
  }
}

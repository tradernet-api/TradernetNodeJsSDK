import type { Session } from '../auth/Session.js';
import type { SessionManager } from '../auth/SessionManager.js';
import type { ClientConfig } from '../config/ClientConfig.js';
import { ApiError } from '../errors/ApiError.js';
import { ConfigurationError } from '../errors/ConfigurationError.js';
import { RateLimitError } from '../errors/RateLimitError.js';
import type { HttpMethod } from '../transport/HttpMethod.js';
import { HttpMethod as HM } from '../transport/HttpMethod.js';
import type { Transport } from '../transport/Transport.js';

const NON_IDEMPOTENT_COMMANDS = new Set([
  'putTradeOrder',
  'delTradeOrder',
  'putStopLoss',
  'putPacketTradeOrder',
  'authByLogin',
  'authBySms',
  'submitCps',
]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Base resource with SID-aware request helper.
 */
export abstract class BaseResource {
  constructor(
    protected readonly transport: Transport,
    protected readonly sessions: SessionManager,
    protected readonly config: ClientConfig,
  ) {}

  protected abstract requiresSid(): boolean;

  protected async call(
    command: string,
    data: Record<string, unknown> = {},
    method: HttpMethod = HM.POST,
    requiresSid: boolean | null = null,
  ): Promise<Record<string, unknown>> {
    const needsSid = requiresSid ?? this.requiresSid();
    let lastException: ApiError | null = null;
    let rateLimitRetried = false;

    for (let attempt = 0; attempt <= 1; attempt++) {
      const session = await this.resolveSession(needsSid, attempt > 0);

      try {
        return await this.transport.request(
          command,
          data,
          method,
          session,
          session !== null,
        );
      } catch (e) {
        if (e instanceof RateLimitError) {
          if (
            !rateLimitRetried &&
            !NON_IDEMPOTENT_COMMANDS.has(command) &&
            e.retryAfterSeconds !== null &&
            e.retryAfterSeconds <= 5
          ) {
            rateLimitRetried = true;
            await sleep(e.retryAfterSeconds * 1000);
            attempt--;
            continue;
          }
          throw e;
        }

        if (e instanceof ApiError) {
          lastException = e;
          if (
            attempt === 0 &&
            needsSid &&
            session !== null &&
            e.isSessionDead() &&
            this.config.authMode !== 'keys_only' &&
            this.sessions.canReauthenticate() &&
            !NON_IDEMPOTENT_COMMANDS.has(command)
          ) {
            await this.sessions.invalidate();
            continue;
          }
          throw e;
        }

        throw e;
      }
    }

    throw lastException ?? new ApiError('Request failed after re-authentication');
  }

  private async resolveSession(
    needsSid: boolean,
    forceRefresh: boolean,
  ): Promise<Session | null> {
    if (this.config.authMode === 'keys_only') {
      if (needsSid) {
        throw new ConfigurationError('SID is required but auth mode is keys_only');
      }
      return null;
    }

    if (!needsSid) {
      return null;
    }

    if (forceRefresh) {
      return this.sessions.authenticate();
    }

    return this.sessions.ensureSession(true);
  }
}

import { TradernetError } from './TradernetError.js';

/**
 * HTTP 429 / rate-limit response from the Tradernet API.
 */
export class RateLimitError extends TradernetError {
  readonly retryAfterSeconds: number | null;

  constructor(message: string, retryAfterSeconds: number | null = null) {
    super(message);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

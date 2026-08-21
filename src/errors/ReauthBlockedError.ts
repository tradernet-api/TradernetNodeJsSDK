import { TradernetError } from './TradernetError.js';

/**
 * Re-authentication circuit breaker is open (too many authByLogin attempts).
 */
export class ReauthBlockedError extends TradernetError {}

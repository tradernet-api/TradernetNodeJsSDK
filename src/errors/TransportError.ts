import { TradernetError } from './TradernetError.js';

/**
 * Network / HTTP-client failure talking to Tradernet.
 */
export class TransportError extends TradernetError {}

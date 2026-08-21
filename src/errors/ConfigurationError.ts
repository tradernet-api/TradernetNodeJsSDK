import { TradernetError } from './TradernetError.js';

/**
 * Misconfigured credentials, domain, auth mode, or missing optional package.
 */
export class ConfigurationError extends TradernetError {}

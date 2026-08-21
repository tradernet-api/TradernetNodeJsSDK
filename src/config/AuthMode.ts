import { ConfigurationError } from '../errors/ConfigurationError.js';

/**
 * Tradernet API auth modes.
 *
 * - keys_only: HMAC only — SID is never obtained
 * - sid_lazy: SID only when a command requires it (default)
 * - sid_eager: SID obtained at client construction / init()
 */
export type AuthMode = 'keys_only' | 'sid_lazy' | 'sid_eager';

export const AuthMode = {
  KEYS_ONLY: 'keys_only',
  SID_LAZY: 'sid_lazy',
  SID_EAGER: 'sid_eager',
} as const satisfies Record<string, AuthMode>;

export function parseAuthMode(value: string): AuthMode {
  if (value === 'keys_only' || value === 'sid_lazy' || value === 'sid_eager') {
    return value;
  }
  throw new ConfigurationError(`Invalid auth_mode: ${value}`);
}

/** @deprecated Prefer parseAuthMode */
export function authModeFrom(value: string): AuthMode | null {
  try {
    return parseAuthMode(value);
  } catch {
    return null;
  }
}

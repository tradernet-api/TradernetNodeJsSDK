import { ConfigurationError } from '../errors/ConfigurationError.js';

const ALLOWED_HOST_SUFFIXES = [
  'tradernet.com',
  'tradernet.global',
  'tradernet.kz',
  'freedom24.com',
] as const;

export function isAllowedHost(host: string): boolean {
  const normalized = host.toLowerCase();
  return ALLOWED_HOST_SUFFIXES.some(
    (suffix) => normalized === suffix || normalized.endsWith(`.${suffix}`),
  );
}

/**
 * Validates and normalizes Tradernet API base URLs.
 */
export function normalizeDomain(domain: string): string {
  const trimmed = domain.trim().replace(/\/+$/, '');
  if (trimmed === '') {
    throw new ConfigurationError('API domain must not be empty');
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new ConfigurationError('API domain must be an absolute HTTPS URL');
  }

  if (url.protocol !== 'https:') {
    throw new ConfigurationError('API domain must use HTTPS');
  }

  if (url.username || url.password) {
    throw new ConfigurationError('API domain must not contain credentials');
  }

  if (url.search || url.hash) {
    throw new ConfigurationError('API domain must not contain query or fragment');
  }

  if (url.pathname !== '/' && url.pathname !== '') {
    throw new ConfigurationError('API domain must not contain a path');
  }

  const host = url.hostname.toLowerCase();
  if (host === '' || host.includes('..')) {
    throw new ConfigurationError('API domain host is invalid');
  }

  if (!isAllowedHost(host)) {
    throw new ConfigurationError(
      `API domain host is not in the Tradernet allowlist: ${host}`,
    );
  }

  return `https://${host}`;
}

export const Domain = {
  ALLOWED_HOST_SUFFIXES,
  isAllowedHost,
  normalize: normalizeDomain,
} as const;

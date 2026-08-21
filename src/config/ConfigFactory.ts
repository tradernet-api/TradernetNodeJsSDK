import { readFileSync } from 'node:fs';
import { ConfigurationError } from '../errors/ConfigurationError.js';
import type { AuthMode } from './AuthMode.js';
import { parseAuthMode } from './AuthMode.js';
import { ClientConfig } from './ClientConfig.js';
import { Credentials } from './Credentials.js';
import { loadDotEnv } from './loadDotEnv.js';

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function asStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = asString(value);
  return s === '' ? null : s;
}

function parseIni(content: string): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  let section = '';
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith(';') || line.startsWith('#')) continue;
    const sectionMatch = /^\[([^\]]+)]$/.exec(line);
    if (sectionMatch) {
      section = sectionMatch[1]!.trim();
      result[section] ??= {};
      continue;
    }
    const eq = line.indexOf('=');
    if (eq === -1 || !section) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    result[section]![key] = value;
  }
  return result;
}

export type ConfigPair = [Credentials, ClientConfig];

export class ConfigFactory {
  static fromArray(data: Record<string, unknown>): ConfigPair {
    const apiKey = asString(data.api_key ?? data.public ?? '');
    const apiSecret = asString(data.api_secret ?? data.private ?? '');
    const credentials = new Credentials(
      apiKey,
      apiSecret,
      asStringOrNull(data.login),
      asStringOrNull(data.password),
    );

    let authMode: AuthMode = 'sid_lazy';
    if (data.auth_mode !== undefined) {
      try {
        authMode = parseAuthMode(asString(data.auth_mode));
      } catch {
        throw new ConfigurationError('Invalid auth_mode');
      }
    }

    const config = new ClientConfig({
      domain: asString(data.domain ?? 'https://tradernet.com', 'https://tradernet.com'),
      lang: asString(data.lang ?? 'en', 'en'),
      authMode,
      sessionPath: asStringOrNull(data.session_path),
      sidCookieName: asString(data.sid_cookie ?? 'SID', 'SID'),
    });

    return [credentials, config];
  }

  static fromEnv(env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env): ConfigPair {
    // When reading the live process env, hydrate from `.env` in cwd (no override).
    if (env === process.env) {
      loadDotEnv();
    }

    const get = (key: string): string | null => {
      const value = env[key];
      if (value === undefined || value === '') return null;
      return value;
    };

    const apiKey = get('TRADERNET_API_KEY');
    const apiSecret = get('TRADERNET_API_SECRET');
    if (apiKey === null || apiSecret === null) {
      throw new ConfigurationError(
        'TRADERNET_API_KEY and TRADERNET_API_SECRET are required. ' +
          'Put them in `.env` (see `.env.example`), export them in the shell, ' +
          'or use Tradernet.fromIni().',
      );
    }

    const credentials = new Credentials(
      apiKey,
      apiSecret,
      get('TRADERNET_LOGIN'),
      get('TRADERNET_PASSWORD'),
    );

    const authModeRaw = get('TRADERNET_AUTH_MODE') ?? 'sid_lazy';
    let authMode: AuthMode;
    try {
      authMode = parseAuthMode(authModeRaw);
    } catch {
      throw new ConfigurationError(`Invalid TRADERNET_AUTH_MODE: ${authModeRaw}`);
    }

    const config = new ClientConfig({
      domain: get('TRADERNET_DOMAIN') ?? 'https://tradernet.com',
      lang: get('TRADERNET_LANG') ?? 'en',
      authMode,
      sessionPath: get('TRADERNET_SESSION_PATH'),
      sidCookieName: get('TRADERNET_SID_COOKIE') ?? 'SID',
    });

    return [credentials, config];
  }

  static fromIni(path: string): ConfigPair {
    let content: string;
    try {
      content = readFileSync(path, 'utf8');
    } catch {
      throw new ConfigurationError(`Config file not found: ${path}`);
    }

    const parsed = parseIni(content);
    const auth = parsed.auth ?? {};
    const pub = asString(auth.public ?? '');
    const priv = asString(auth.private ?? '');
    if (pub === '' || priv === '') {
      throw new ConfigurationError('INI [auth] requires public and private keys');
    }

    const credentials = new Credentials(
      pub,
      priv,
      asStringOrNull(auth.login),
      asStringOrNull(auth.password),
    );

    let authMode: AuthMode = 'sid_lazy';
    if (auth.auth_mode !== undefined) {
      try {
        authMode = parseAuthMode(auth.auth_mode);
      } catch {
        throw new ConfigurationError('Invalid auth_mode in INI');
      }
    }

    const config = new ClientConfig({
      domain: asStringOrNull(auth.domain) ?? 'https://tradernet.com',
      lang: asString(auth.lang ?? 'en', 'en'),
      authMode,
      sessionPath: asStringOrNull(auth.session_path),
      sidCookieName: asString(auth.sid_cookie ?? 'SID', 'SID'),
    });

    return [credentials, config];
  }
}

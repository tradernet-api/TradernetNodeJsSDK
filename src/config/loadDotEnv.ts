import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Parses a dotenv-style file into key/value pairs.
 * Supports optional quotes and `#` / `;` comments. Does not expand variables.
 */
export function parseDotEnv(content: string): Record<string, string> {
  const result: Record<string, string> = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith(';')) {
      continue;
    }

    const eq = line.indexOf('=');
    if (eq === -1) {
      continue;
    }

    const key = line.slice(0, eq).trim();
    if (!key || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      continue;
    }

    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

export interface LoadDotEnvOptions {
  /** Absolute or relative path. Default: `.env` in `process.cwd()`. */
  path?: string;
  /**
   * When true (default), keys already present in `process.env` are not overwritten.
   */
  override?: boolean;
}

/**
 * Loads `.env` into `process.env` when the file exists.
 * Missing file is a no-op (returns false).
 */
export function loadDotEnv(options: LoadDotEnvOptions = {}): boolean {
  const path = resolve(options.path ?? '.env');
  if (!existsSync(path)) {
    return false;
  }

  const parsed = parseDotEnv(readFileSync(path, 'utf8'));
  const override = options.override === true;

  for (const [key, value] of Object.entries(parsed)) {
    if (!override && process.env[key] !== undefined && process.env[key] !== '') {
      continue;
    }
    process.env[key] = value;
  }

  return true;
}

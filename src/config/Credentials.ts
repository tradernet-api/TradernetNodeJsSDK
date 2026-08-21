import { ConfigurationError } from '../errors/ConfigurationError.js';
import { inspect } from 'node:util';

type PasswordProvider = () => string;

/**
 * API credentials and optional login/password for SID.
 */
export class Credentials {
  readonly #apiKey: string;
  readonly #apiSecret: string;
  readonly #login: string | null;
  readonly #passwordProvider: PasswordProvider | null;

  constructor(
    apiKey: string,
    apiSecret: string,
    login: string | null = null,
    password: string | PasswordProvider | null = null,
  ) {
    if (apiKey === '' || apiSecret === '') {
      throw new ConfigurationError('API key and secret are required');
    }

    this.#apiKey = apiKey;
    this.#apiSecret = apiSecret;
    this.#login = login;

    if (typeof password === 'function') {
      this.#passwordProvider = password;
    } else if (typeof password === 'string') {
      const value = password;
      this.#passwordProvider = () => value;
    } else {
      this.#passwordProvider = null;
    }
  }

  apiKey(): string {
    return this.#apiKey;
  }

  apiSecret(): string {
    return this.#apiSecret;
  }

  login(): string | null {
    return this.#login;
  }

  hasLoginPassword(): boolean {
    return this.#login !== null && this.#login !== '' && this.#passwordProvider !== null;
  }

  password(): string {
    if (this.#passwordProvider === null) {
      throw new ConfigurationError('Password is not configured');
    }
    const password = this.#passwordProvider();
    if (typeof password !== 'string' || password === '') {
      throw new ConfigurationError('Password provider returned an empty string');
    }
    return password;
  }

  toJSON(): Record<string, string | null> {
    return {
      apiKey: '***',
      apiSecret: '***',
      login: this.#login,
      password: this.#passwordProvider !== null ? '***' : null,
    };
  }

  [inspect.custom](): Record<string, string | null> {
    return this.toJSON();
  }
}

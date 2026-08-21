import { TradernetError } from './TradernetError.js';

export class AuthenticationError extends TradernetError {
  override readonly name = 'AuthenticationError';

  static readonly CODE_TRANSIENT = 0;
  static readonly CODE_PERMANENT = 1;

  constructor(
    message: string,
    readonly authCode: number = AuthenticationError.CODE_TRANSIENT,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }

  isPermanent(): boolean {
    return this.authCode === AuthenticationError.CODE_PERMANENT;
  }
}

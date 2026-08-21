import { TradernetError } from './TradernetError.js';

/**
 * Business-level API error (`error` / `errMsg` in the JSON body).
 */
export class ApiError extends TradernetError {
  readonly errorCode: number | string | null;
  readonly payload: Record<string, unknown>;
  readonly httpStatus: number | null;

  constructor(
    message: string,
    errorCode: number | string | null = null,
    payload: Record<string, unknown> = {},
    httpStatus: number | null = null,
  ) {
    super(message);
    this.errorCode = errorCode;
    this.payload = payload;
    this.httpStatus = httpStatus;
  }

  /**
   * Whether the error indicates an expired or invalid SID.
   *
   * Heuristics are best-effort: server messages are localized. Prefer explicit
   * SID / session wording. Bare HTTP 401 is treated as a dead SID only when the
   * message is empty or generic ("access denied"); API-key and security-session
   * errors are never treated as a dead SID.
   */
  isSessionDead(): boolean {
    const message = this.message.toLowerCase();

    if (
      message.includes('api key') ||
      message.includes('signature') ||
      message.includes('security session')
    ) {
      return false;
    }

    if (/\bsid\b/.test(message)) {
      return true;
    }

    if (
      /\bsession\b.*\b(expired|invalid|dead)\b/.test(message) ||
      /\b(expired|invalid|dead)\b.*\bsession\b/.test(message)
    ) {
      return true;
    }

    if (this.httpStatus === 401) {
      return (
        message === '' ||
        message.includes('access denied') ||
        message.includes('not authorized') ||
        message.includes('unauthorized')
      );
    }

    return message.includes('not authorized') || message.includes('unauthorized');
  }
}

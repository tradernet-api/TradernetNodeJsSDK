import { ApiError } from '../errors/ApiError.js';
import { InvalidResponseError } from '../errors/InvalidResponseError.js';
import { RateLimitError } from '../errors/RateLimitError.js';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Parses HTTP body into object and maps business errors to exceptions.
 */
export class ResponseParser {
  assertNoBusinessError(
    payload: Record<string, unknown>,
    statusCode: number | null = null,
  ): void {
    if (Object.prototype.hasOwnProperty.call(payload, 'error')) {
      const error = payload.error;
      // Falsy / empty "error" means success on several Tradernet endpoints.
      if (error !== false && error !== null && error !== '' && error !== 0 && error !== '0') {
        if (typeof error === 'string') {
          const code = payload.code;
          throw new ApiError(
            error,
            typeof code === 'number' || typeof code === 'string' ? code : null,
            payload,
            statusCode,
          );
        }
        if (Array.isArray(error) && error.length > 0) {
          const code = payload.code;
          throw new ApiError(
            JSON.stringify(error),
            typeof code === 'number' || typeof code === 'string' ? code : null,
            payload,
            statusCode,
          );
        }
      }
    }

    if (typeof payload.errMsg === 'string' && payload.errMsg !== '') {
      const code = payload.code;
      throw new ApiError(
        payload.errMsg,
        typeof code === 'number' || typeof code === 'string' ? code : null,
        payload,
        statusCode,
      );
    }
  }

  parse(
    raw: string,
    statusCode: number,
    headers: Headers | Record<string, string | string[] | undefined> = {},
  ): Record<string, unknown> {
    if (statusCode === 429) {
      throw new RateLimitError(
        'Tradernet API rate limit exceeded',
        this.retryAfterSeconds(headers),
      );
    }

    if (raw === '') {
      return {};
    }

    let decoded: unknown;
    try {
      decoded = JSON.parse(raw) as unknown;
    } catch {
      throw new InvalidResponseError(
        `Tradernet API returned non-JSON response (HTTP ${statusCode}): ${raw.slice(0, 200)}`,
        statusCode,
      );
    }

    if (!isPlainObject(decoded) && !Array.isArray(decoded)) {
      throw new InvalidResponseError(
        'Tradernet API returned JSON that is not an object/array',
        statusCode,
      );
    }

    const payload = (
      Array.isArray(decoded) ? { result: decoded } : decoded
    ) as Record<string, unknown>;

    this.assertNoBusinessError(payload, statusCode);
    return payload;
  }

  throwForErrorResponse(raw: string, statusCode: number): never {
    try {
      const decoded = JSON.parse(raw) as unknown;
      if (isPlainObject(decoded)) {
        this.assertNoBusinessError(decoded, statusCode);
        throw new ApiError(
          `Tradernet API returned HTTP ${statusCode}`,
          null,
          decoded,
          statusCode,
        );
      }
    } catch (e) {
      if (e instanceof ApiError || e instanceof InvalidResponseError) {
        throw e;
      }
    }

    throw new InvalidResponseError(
      `Tradernet API returned HTTP ${statusCode}: ${raw.slice(0, 200)}`,
      statusCode,
    );
  }

  private retryAfterSeconds(
    headers: Headers | Record<string, string | string[] | undefined>,
  ): number | null {
    let raw: string | undefined;
    if (headers instanceof Headers) {
      raw = headers.get('Retry-After') ?? undefined;
    } else {
      for (const [name, value] of Object.entries(headers)) {
        if (name.toLowerCase() !== 'retry-after') continue;
        raw = Array.isArray(value) ? value[0] : value;
        break;
      }
    }

    if (raw === undefined || raw === '') {
      return null;
    }

    const trimmed = String(raw).trim();
    if (/^\d+$/.test(trimmed)) {
      return Number(trimmed);
    }

    const timestamp = Date.parse(trimmed);
    if (Number.isNaN(timestamp)) {
      return null;
    }
    return Math.max(0, Math.floor((timestamp - Date.now()) / 1000));
  }
}

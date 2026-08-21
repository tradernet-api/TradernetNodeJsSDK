import { TradernetError } from './TradernetError.js';

/**
 * Response body was not valid JSON or had an unexpected shape.
 */
export class InvalidResponseError extends TradernetError {
  readonly httpStatus: number | null;

  constructor(message: string, httpStatus: number | null = null) {
    super(message);
    this.httpStatus = httpStatus;
  }
}

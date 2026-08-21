/**
 * Base class for every error thrown by the SDK.
 *
 * Mirrors `Tradernet\Sdk\Exception\TradernetExceptionInterface`: catching
 * `TradernetError` catches all SDK failures regardless of category.
 */
export class TradernetError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

import { createHmac } from 'node:crypto';

/**
 * HMAC-SHA256 request signer for Tradernet API V3.
 */
export class Signer {
  constructor(private readonly secretKey: string) {}

  sign(signatureData: string): string {
    return createHmac('sha256', this.secretKey).update(signatureData, 'utf8').digest('hex');
  }

  /**
   * Compact JSON used for request body and signature input.
   * Empty object → empty string (PHP parity).
   */
  stringify(data: Record<string, unknown>): string {
    if (Object.keys(data).length === 0) {
      return '';
    }
    return JSON.stringify(data);
  }
}

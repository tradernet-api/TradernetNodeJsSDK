import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { Signer } from '../../src/transport/Signer.js';

describe('Signer', () => {
  const signer = new Signer('secret');

  it('signs HMAC-SHA256 hex', () => {
    const data = 'payload1234567890';
    expect(signer.sign(data)).toBe(
      createHmac('sha256', 'secret').update(data, 'utf8').digest('hex'),
    );
  });

  it('stringifies empty object as empty string', () => {
    expect(signer.stringify({})).toBe('');
  });

  it('stringifies compact JSON', () => {
    expect(signer.stringify({ a: 1, b: 'x' })).toBe('{"a":1,"b":"x"}');
  });
});

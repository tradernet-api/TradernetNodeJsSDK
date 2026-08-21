import { describe, expect, it } from 'vitest';
import { parseDotEnv } from '../../src/config/loadDotEnv.js';

describe('parseDotEnv', () => {
  it('parses keys, quotes, and comments', () => {
    const parsed = parseDotEnv(`
# comment
TRADERNET_API_KEY=abc
TRADERNET_API_SECRET="sec ret"
TRADERNET_LOGIN='user@example.com'
; ignored
EMPTY=
`);
    expect(parsed.TRADERNET_API_KEY).toBe('abc');
    expect(parsed.TRADERNET_API_SECRET).toBe('sec ret');
    expect(parsed.TRADERNET_LOGIN).toBe('user@example.com');
    expect(parsed.EMPTY).toBe('');
  });
});

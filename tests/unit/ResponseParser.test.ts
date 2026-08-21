import { describe, expect, it } from 'vitest';
import { ResponseParser } from '../../src/transport/ResponseParser.js';
import { ApiError } from '../../src/errors/ApiError.js';
import { RateLimitError } from '../../src/errors/RateLimitError.js';

describe('ResponseParser', () => {
  const parser = new ResponseParser();

  it('treats falsy error as success', () => {
    for (const error of [false, null, '', 0, '0']) {
      expect(() =>
        parser.assertNoBusinessError({ error, ok: true }),
      ).not.toThrow();
    }
  });

  it('throws on errMsg', () => {
    expect(() => parser.assertNoBusinessError({ errMsg: 'boom' })).toThrow(ApiError);
  });

  it('parses rate limit', () => {
    expect(() => parser.parse('{}', 429, { 'Retry-After': '3' })).toThrow(
      RateLimitError,
    );
  });
});

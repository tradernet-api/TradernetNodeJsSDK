import { describe, expect, it } from 'vitest';
import { Domain } from '../../src/config/Domain.js';
import { ConfigurationError } from '../../src/errors/ConfigurationError.js';

describe('Domain', () => {
  it('normalizes allowlisted hosts', () => {
    expect(Domain.normalize('https://tradernet.com/')).toBe('https://tradernet.com');
    expect(Domain.normalize('https://wss.freedom24.com')).toBe(
      'https://wss.freedom24.com',
    );
  });

  it('rejects non-https and unknown hosts', () => {
    expect(() => Domain.normalize('http://tradernet.com')).toThrow(ConfigurationError);
    expect(() => Domain.normalize('https://evil.example')).toThrow(ConfigurationError);
    expect(() => Domain.normalize('https://tradernet.com/api')).toThrow(
      ConfigurationError,
    );
  });
});

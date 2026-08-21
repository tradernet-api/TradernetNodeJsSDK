import { describe, expect, it } from 'vitest';
import {
  OrderExpiration,
  orderExpirationFromName,
} from '../../src/enums/OrderExpiration.js';

describe('OrderExpiration', () => {
  it('maps names', () => {
    expect(orderExpirationFromName('day')).toBe(OrderExpiration.DAY);
    expect(orderExpirationFromName('EXT')).toBe(OrderExpiration.EXT);
    expect(orderExpirationFromName('gtc')).toBe(OrderExpiration.GTC);
  });

  it('rejects unknown', () => {
    expect(() => orderExpirationFromName('ioc')).toThrow(/Unknown duration/);
  });
});

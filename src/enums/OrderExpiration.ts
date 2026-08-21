export const OrderExpiration = {
  DAY: 1,
  EXT: 2,
  GTC: 3,
} as const;

export type OrderExpiration = (typeof OrderExpiration)[keyof typeof OrderExpiration];

export function orderExpirationFromName(name: string): OrderExpiration {
  switch (name.toLowerCase()) {
    case 'day':
      return OrderExpiration.DAY;
    case 'ext':
      return OrderExpiration.EXT;
    case 'gtc':
      return OrderExpiration.GTC;
    default:
      throw new Error(`Unknown duration: ${name}`);
  }
}

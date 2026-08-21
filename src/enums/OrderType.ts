export const OrderType = {
  MARKET: 1,
  LIMIT: 2,
} as const;

export type OrderType = (typeof OrderType)[keyof typeof OrderType];

export const OrderAction = {
  BUY: 1,
  BUY_MARGIN: 2,
  SELL: 3,
  SELL_SHORT: 4,
} as const;

export type OrderAction = (typeof OrderAction)[keyof typeof OrderAction];

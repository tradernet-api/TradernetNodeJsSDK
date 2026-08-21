export type Channel =
  | 'markets'
  | 'orderbook'
  | 'orders'
  | 'portfolio'
  | 'quotes'
  | 'sessions';

export const Channel = {
  MARKETS: 'markets',
  ORDERBOOK: 'orderbook',
  ORDERS: 'orders',
  PORTFOLIO: 'portfolio',
  QUOTES: 'quotes',
  SESSIONS: 'sessions',
} as const satisfies Record<string, Channel>;

export function channelEventName(channel: Channel): string {
  switch (channel) {
    case 'quotes':
      return 'q';
    case 'orderbook':
      return 'b';
    case 'portfolio':
      return 'portfolio';
    case 'orders':
      return 'orders';
    case 'markets':
      return 'markets';
    case 'sessions':
      return 'sessions';
  }
}

export function channelSubscribePayload(
  channel: Channel,
  tickers?: string[],
): unknown[] {
  switch (channel) {
    case 'quotes':
      return ['quotes', tickers ?? []];
    case 'orderbook':
      return ['orderBook', tickers ?? []];
    case 'portfolio':
      return ['portfolio'];
    case 'orders':
      return ['orders'];
    case 'markets':
      return ['markets'];
    case 'sessions':
      return ['sessions'];
  }
}

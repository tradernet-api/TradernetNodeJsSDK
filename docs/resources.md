# API resources

| Docs section | Accessor |
|---|---|
| Authorization | `tn.auth()` |
| User data | `tn.user()` |
| Quotes | `tn.quotes()` |
| Orders | `tn.orders()` |
| Portfolio | `tn.portfolio()` |
| Price alerts | `tn.alerts()` |
| Watchlists | `tn.stockLists()` |
| Security sessions | `tn.securitySessions()` |
| Currencies | `tn.currency()` |
| Reference | `tn.reference()` |
| Requests (CPS) | `tn.cps()` |
| Broker reports | `tn.reports()` |
| News | `tn.news()` |
| Shop | `tn.shop()` |
| Tariffs | `tn.tariff()` |
| WebSocket | `tn.websocket()` |

## Orders

```ts
await tn.orders().buy('AAPL.US', 1, 0); // market — LIVE TRADE
await tn.orders().sell('AAPL.US', 1, 0);
await tn.orders().short('AAPL.US', 1, 0); // explicit short
```

`sell()` never sends `SELL_SHORT`. Use `short()` to open a short.

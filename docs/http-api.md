# HTTP API

Every V3 command is a signed HTTP request to `/api/{command}`.

```ts
const quotes = await tn.quotes().get(['AAPL.US']);

const raw = await tn.request('getStockQuotesJson', {
  tickers: 'AAPL.US',
});
```

## Errors

| Error | Meaning |
|---|---|
| `ApiError` | Business error / `errMsg` |
| `AuthenticationError` | Login / SID failure |
| `ReauthBlockedError` | Circuit breaker open |
| `RateLimitError` | HTTP 429 |
| `TransportError` | Network failure |
| `InvalidResponseError` | Non-JSON / unparsable |
| `ConfigurationError` | Bad domain, missing keys, missing `ws` |

Idempotent helpers may auto-retry once when `Retry-After` ≤ 5 seconds. Trade / write commands are never auto-retried.

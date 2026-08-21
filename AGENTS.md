# AGENTS.md

Registry of modules and significant functionality for the Tradernet Node.js SDK.

## Package

- **tradernet-sdk** `0.1.0` (npm: `tradernet-sdk`, MIT) — TypeScript SDK for Tradernet public API V3.
  Entry: `import { Tradernet } from 'tradernet-sdk'`.

## Core

| Module | Purpose |
|---|---|
| `src/Tradernet.ts` | Facade: factories, lazy resources, `request()`, `websocket()` |
| `src/config/*` | `Credentials`, `ClientConfig`, `AuthMode`, `Domain`, `ConfigFactory`, `loadDotEnv` |
| `src/transport/*` | HMAC `Signer`, `PublicApiClient` (fetch), `FakeTransport`, `ResponseParser` |
| `src/auth/*` | `SessionManager`, `ReauthGuard`, file/memory session storage |
| `src/api/*` | Resource clients mirroring public API sections |
| `src/ws/*` | `NodeWebSocketClient` (optional `ws`), channels, frames |
| `src/enums/*` | `OrderAction`, `OrderType`, `OrderExpiration` |
| `src/errors/*` | Typed error hierarchy rooted at `TradernetError` |

## Docs

English only under `docs/` (installation, authentication, http-api, resources, websocket, security, development).

## Examples

`examples/` — quotes, portfolio, orders (live-trade warning), websocket_quotes.
Credentials: copy `.env.example` → `.env` (gitignored); `fromEnv()` loads it.

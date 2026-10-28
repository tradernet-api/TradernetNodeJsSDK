# Tradernet Node.js SDK

[![npm](https://img.shields.io/npm/v/tradernet-sdk.svg)](https://www.npmjs.com/package/tradernet-sdk)
[![Node](https://img.shields.io/badge/Node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

TypeScript / Node.js client for the [Tradernet public API V3](https://tradernet.com/tradernet-api/).

Typed, session-aware HTTP commands and optional WebSocket streams for server-side integrations.

| | |
|---|---|
| **Package** | [`tradernet-sdk`](https://www.npmjs.com/package/tradernet-sdk) |
| **npm** | https://www.npmjs.com/package/tradernet-sdk |
| **Runtime** | Node.js `>= 20` |
| **HTTP** | native `fetch` |
| **Realtime** | optional peer `ws` |

## Features

- Signed requests to `/api/{command}` (HMAC-SHA256 API key pair)
- Optional SID sessions via login/password with local persistence (~2 weeks)
- Circuit breaker against re-authentication storms
- Resource clients mapped to public API sections
- Escape hatch for any V3 command: `tn.request()`
- WebSocket quotes / account channels via `ws`

## Installation

Published on npm: [tradernet-sdk](https://www.npmjs.com/package/tradernet-sdk)

```bash
npm install tradernet-sdk
```

For realtime streams:

```bash
npm install ws
```

## Quick start

```ts
import { Tradernet } from 'tradernet-sdk';

const tn = await Tradernet.fromEnv().init();

const quotes = await tn.quotes().get(['AAPL.US']);
const portfolio = await tn.portfolio().get();

// WARNING: orders().buy() places a real trade.
```

### Credentials

**`.env` file** (recommended locally):

```bash
cp .env.example .env
# fill TRADERNET_API_KEY / TRADERNET_API_SECRET
```

`Tradernet.fromEnv()` loads `.env` from the working directory (does not override existing shell vars).

**Environment variables** (containers / CI):

```bash
export TRADERNET_API_KEY='your_public_key'
export TRADERNET_API_SECRET='your_private_key'
export TRADERNET_LOGIN='user@example.com'      # optional, for SID
export TRADERNET_PASSWORD='secret'             # optional, for SID
export TRADERNET_DOMAIN='https://tradernet.com'
```

```ts
const tn = await Tradernet.fromEnv().init();
```

**INI file** (Python / PHP SDK parity):

```ini
[auth]
public   = YOUR_PUBLIC_KEY
private  = YOUR_PRIVATE_KEY
login    = user@example.com
password = secret
domain   = https://tradernet.com
```

```ts
const tn = await Tradernet.fromIni('./tradernet.ini').init();
```

## Auth modes

| Mode | Behavior |
|---|---|
| `keys_only` | HMAC only — SID is never obtained |
| `sid_lazy` | SID only when a command requires it (**default**) |
| `sid_eager` | SID obtained at `init()` (still attached only when needed) |

API keys are **per cabinet / domain**. A key from `tradernet.com` will not work on `tradernet.kz` or `freedom24.com` — match `TRADERNET_DOMAIN` to the cabinet that issued the key.

## Resources

```ts
tn.auth()
tn.user()
tn.quotes()
tn.orders()
tn.portfolio()
tn.alerts()
tn.stockLists()
tn.securitySessions()
tn.currency()
tn.reference()
tn.cps()
tn.reports()
tn.news()
tn.shop()
tn.tariff()
tn.websocket()
```

## Documentation

- [docs/index.md](docs/index.md) — documentation hub
- [Authentication](docs/authentication.md)
- [HTTP API](docs/http-api.md)
- [Resources](docs/resources.md)
- [WebSocket](docs/websocket.md)
- [Security](docs/security.md)
- [Publishing to npm](docs/publishing.md) — maintainers

## License

MIT

# Authentication

## Modes

| Mode | Behavior |
|---|---|
| `keys_only` | HMAC only |
| `sid_lazy` | SID when a command sets `requiresSid` (default) |
| `sid_eager` | SID at `init()` |

## Signing (V3)

- POST/PUT: `HMAC-SHA256(secret, body + timestamp)`
- GET: `HMAC-SHA256(secret, timestamp)`
- Headers: `X-NtApi-PublicKey`, `X-NtApi-Timestamp`, `X-NtApi-Sig`

Empty request body is signed as empty string + timestamp.

## SID attachment rule

SID is attached **only** when the resource/command requires it. Attaching a cached SID to orders/security-session commands would switch identity away from the API key (`tryBySid() ?: tryByApiKey()` on the server).

Resources that require SID by default: `user`, `cps`, `reports`.

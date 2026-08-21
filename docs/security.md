# Security

- Keep secrets in `.env` (gitignored). Commit only `.env.example`.
- Secrets are never printed by `Credentials` (`toJSON` / `inspect` mask values).
- Session files use mode `0600` under `~/.tradernet/sessions` (or `TRADERNET_SESSION_PATH`).
- The SDK refuses to store SID under `/tmp` when `HOME` is unset.
- Domain allowlist prevents signing requests to unexpected hosts.
- Reauth circuit breaker limits `authByLogin` storms.
- Non-idempotent trade commands are never auto-retried after re-auth or rate limits.

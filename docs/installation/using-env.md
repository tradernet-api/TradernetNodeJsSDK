# Using environment variables / `.env`

## `.env` file (recommended locally)

```bash
cp .env.example .env
# edit .env — fill TRADERNET_API_KEY / TRADERNET_API_SECRET
```

`Tradernet.fromEnv()` automatically loads `.env` from the current working directory.
Existing shell variables are **not** overwritten.

```ts
import { Tradernet } from 'tradernet-sdk';

const tn = await Tradernet.fromEnv().init();
```

## Shell export

```bash
export TRADERNET_API_KEY='...'
export TRADERNET_API_SECRET='...'
export TRADERNET_LOGIN='user@example.com'   # optional
export TRADERNET_PASSWORD='...'             # optional
export TRADERNET_DOMAIN='https://tradernet.com'
export TRADERNET_AUTH_MODE='sid_lazy'       # keys_only | sid_lazy | sid_eager
```

## Variables

| Variable | Required | Default |
|---|---|---|
| `TRADERNET_API_KEY` | yes | — |
| `TRADERNET_API_SECRET` | yes | — |
| `TRADERNET_LOGIN` | no | — |
| `TRADERNET_PASSWORD` | no | — |
| `TRADERNET_DOMAIN` | no | `https://tradernet.com` |
| `TRADERNET_AUTH_MODE` | no | `sid_lazy` |
| `TRADERNET_LANG` | no | `en` |
| `TRADERNET_SESSION_PATH` | no | `~/.tradernet/sessions` |
| `TRADERNET_SID_COOKIE` | no | `SID` |

Never commit `.env`. Commit `.env.example` only.

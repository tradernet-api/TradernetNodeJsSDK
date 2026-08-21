# Development

```bash
npm install
npm run build
npm test
```

## Examples

Requires `npm run build` and a `.env` file first.

```bash
npm start                          # main.js
npm run example:quotes
npm run example:portfolio
npm run example:orders
npm run example:ws                 # demo quotes
TRADERNET_WS_SID=1 npm run example:ws   # real account (login/password)
```

Or directly:

```bash
node examples/websocket_quotes.js
```

- TypeScript strict / NodeNext
- Unit tests: Vitest (`tests/unit`)
- Do not commit `tradernet.ini` or `.env`

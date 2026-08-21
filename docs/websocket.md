# WebSocket

Realtime streams over `wss://wss.{domain}/`. Authentication is **SID only**.

| Mode | URL | Data |
|---|---|---|
| `requireSid: false` | `wss://wss.{domain}/` | Demo quotes / order book |
| `requireSid: true` | `wss://wss.{domain}/?SID=...` | Real account data |

```ts
import { Tradernet } from 'tradernet-sdk';

const tn = await Tradernet.fromEnv().init();
const ws = tn.websocket(true);
await ws.connect();
await ws.quotes(['AAPL.US']);

for await (const frame of ws.frames()) {
  console.log(frame.event, frame.data);
}
```

Install peer: `npm install ws`.

Run the bundled example (after `npm run build`):

```bash
npm run example:ws
# or
node examples/websocket_quotes.js

TRADERNET_WS_SID=1 npm run example:ws   # real account streams
```


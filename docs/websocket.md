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

Cloudflare rejects well-known HTTP library User-Agents. The SDK sends `tradernet-node-sdk/0.1.0`.

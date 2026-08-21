import { createClient } from './bootstrap.js';

const tn = await createClient();
const requireSid = process.env.TRADERNET_WS_SID === '1';
const ws = tn.websocket(requireSid);
await ws.connect();
await ws.quotes(['AAPL.US']);

for await (const frame of ws.frames()) {
  console.log(frame.event, frame.data);
}
